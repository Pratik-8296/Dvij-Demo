import { Op } from 'sequelize';
import { sequelize, Event, Registration, AuditLog } from '../models';
import { AppError } from '../middlewares/error.middleware';
import { getPagination, getPagingData, getSorting } from '../utils/query.utils';
import { generateRegistrationNumber } from '../utils/helpers';

/**
 * Register for an event.
 * Handles capacity validation, waitlisting, seat decrement, and audit logging using a transaction.
 */
export async function createRegistration(data: {
  eventId: number;
  fullName: string;
  email: string;
  tickets: number;
}) {
  const { eventId, fullName, email, tickets } = data;

  // Use a Sequelize transaction for safety and atomicity
  const result = await sequelize.transaction(async (t) => {
    // 1. Fetch Event with lock to prevent race conditions on capacity/available seats
    const event = await Event.findByPk(eventId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    if (event.status !== 'ACTIVE') {
      throw new AppError('Event is not active', 400);
    }

    // 2. Check if this email is already registered (either registered or waitlisted)
    const existingRegistration = await Registration.findOne({
      where: {
        eventId,
        email,
        status: { [Op.in]: ['REGISTERED', 'WAITLIST'] },
      },
      transaction: t,
    });

    if (existingRegistration) {
      throw new AppError('Email is already registered for this event', 400);
    }

    // 3. Determine registration status (Waitlist if seats are insufficient)
    let status: 'REGISTERED' | 'WAITLIST' = 'REGISTERED';
    if (tickets > event.availableSeats) {
      status = 'WAITLIST';
    }

    // 4. Calculate total amount
    const totalAmount = tickets * event.ticketPrice;

    // 5. Generate unique registration number
    const registrationNumber = generateRegistrationNumber();

    // 6. Create Registration record
    const registration = await Registration.create(
      {
        registrationNumber,
        eventId,
        fullName,
        email,
        tickets,
        totalAmount,
        status,
      },
      { transaction: t }
    );

    // 7. Update Event availableSeats if not waitlisted
    if (status === 'REGISTERED') {
      event.availableSeats -= tickets;
      await event.save({ transaction: t });
    }

    // 8. Create Audit Log entry
    await AuditLog.create(
      {
        registrationId: registration.id,
        oldStatus: null,
        newStatus: status,
      },
      { transaction: t }
    );

    return { registration, event };
  });

  return result;
}

/**
 * Cancel an existing registration.
 * Restores event available seats and creates an audit log.
 */
export async function cancelRegistration(registrationId: number) {
  const result = await sequelize.transaction(async (t) => {
    // 1. Fetch registration with lock
    const registration = await Registration.findByPk(registrationId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!registration) {
      throw new AppError('Registration not found', 404);
    }

    // 2. Check if already cancelled
    if (registration.status === 'CANCELLED') {
      throw new AppError('Registration is already cancelled', 400);
    }

    const oldStatus = registration.status;

    // 3. Update registration status
    registration.status = 'CANCELLED';
    await registration.save({ transaction: t });

    // 4. Restore available seats if it was REGISTERED
    if (oldStatus === 'REGISTERED') {
      const event = await Event.findByPk(registration.eventId, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (event) {
        event.availableSeats += registration.tickets;
        // Ensure availableSeats does not exceed capacity
        if (event.availableSeats > event.capacity) {
          event.availableSeats = event.capacity;
        }
        await event.save({ transaction: t });
      }
    }

    // 5. Log status change in Audit Logs
    await AuditLog.create(
      {
        registrationId: registration.id,
        oldStatus,
        newStatus: 'CANCELLED',
      },
      { transaction: t }
    );

    return registration;
  });

  return result;
}

/**
 * List registrations with filters, sorting, and pagination.
 */
export async function getRegistrations(query: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  eventId?: number;
  status?: 'REGISTERED' | 'CANCELLED' | 'WAITLIST';
  registrationDate?: string;
}) {
  const { page = 1, limit = 10, search, sortBy, sortOrder, eventId, status, registrationDate } = query;

  const whereClause: any = {};

  // Search by registrationNumber, fullName, email
  if (search) {
    whereClause[Op.or] = [
      { registrationNumber: { [Op.like]: `%${search}%` } },
      { fullName: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
    ];
  }

  // Filter by eventId
  if (eventId) {
    whereClause.eventId = eventId;
  }

  // Filter by status
  if (status) {
    whereClause.status = status;
  }

  // Filter by registration date
  if (registrationDate) {
    // Compare only date part of createdAt
    whereClause[Op.and] = [
      sequelize.where(
        sequelize.fn('DATE', sequelize.col('createdAt')),
        '=',
        registrationDate
      ),
    ];
  }

  const { limit: parsedLimit, offset } = getPagination(page, limit);
  const order = getSorting(sortBy, sortOrder, ['registrationNumber', 'fullName', 'email', 'createdAt']);

  const registrations = await Registration.findAndCountAll({
    where: whereClause,
    limit: parsedLimit,
    offset,
    order,
    include: [
      {
        model: Event,
        as: 'event',
        attributes: ['id', 'eventName', 'location', 'eventDate'],
      },
    ],
  });

  return getPagingData(registrations, page, parsedLimit);
}
