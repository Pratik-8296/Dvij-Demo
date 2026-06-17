import { Op, fn, col } from 'sequelize';
import { Event, Registration } from '../models';
import { AppError } from '../middlewares/error.middleware';
import { getPagination, getPagingData, getSorting } from '../utils/query.utils';

/**
 * Create a new event.
 */
export async function createEvent(data: {
  eventName: string;
  location: string;
  eventDate: string | Date;
  capacity: number;
  ticketPrice: number;
  status?: 'ACTIVE' | 'INACTIVE';
}) {
  const { eventName, location, eventDate, capacity, ticketPrice, status } = data;

  // Business Rule: Event date cannot be in the past
  const inputDate = new Date(eventDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (inputDate < today) {
    throw new AppError('Event date cannot be in the past', 400);
  }

  // Business Rule: Event name must be unique for the same date
  const existingEvent = await Event.findOne({
    where: {
      eventName,
      eventDate: inputDate.toISOString().slice(0, 10), // date-only format YYYY-MM-DD
    },
  });

  if (existingEvent) {
    throw new AppError('An event with this name already exists on this date', 400);
  }

  // Create event, setting availableSeats initially equal to capacity
  const event = await Event.create({
    eventName,
    location,
    eventDate: inputDate,
    capacity,
    availableSeats: capacity,
    ticketPrice,
    status: status || 'ACTIVE',
  });

  return event;
}

/**
 * Get filtered, sorted, paginated list of events.
 */
export async function getEvents(query: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  location?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  minPrice?: number;
  maxPrice?: number;
  eventDate?: string;
}) {
  const { page = 1, limit = 10, search, sortBy, sortOrder, location, status, minPrice, maxPrice, eventDate } = query;

  const whereClause: any = {};

  // Search by eventName and location
  if (search) {
    whereClause[Op.or] = [
      { eventName: { [Op.like]: `%${search}%` } },
      { location: { [Op.like]: `%${search}%` } },
    ];
  }

  // Filter by location
  if (location) {
    whereClause.location = location;
  }

  // Filter by status
  if (status) {
    whereClause.status = status;
  }

  // Filter by eventDate
  if (eventDate) {
    whereClause.eventDate = eventDate;
  }

  // Filter by ticket price range
  if (minPrice !== undefined || maxPrice !== undefined) {
    whereClause.ticketPrice = {};
    if (minPrice !== undefined) {
      whereClause.ticketPrice[Op.gte] = minPrice;
    }
    if (maxPrice !== undefined) {
      whereClause.ticketPrice[Op.lte] = maxPrice;
    }
  }

  const { limit: parsedLimit, offset } = getPagination(page, limit);
  const order = getSorting(sortBy, sortOrder, ['eventName', 'eventDate', 'ticketPrice', 'createdAt']);

  const events = await Event.findAndCountAll({
    where: whereClause,
    limit: parsedLimit,
    offset,
    order,
  });

  return getPagingData(events, page, parsedLimit);
}

/**
 * Get summary for a specific event.
 */
export async function getEventSummary(eventId: number) {
  const event = await Event.findByPk(eventId);
  if (!event) {
    throw new AppError('Event not found', 404);
  }

  // Calculate registeredSeats and totalRevenue using aggregate queries
  const registrations = await Registration.findAll({
    where: {
      eventId,
      status: 'REGISTERED',
    },
    attributes: [
      [fn('SUM', col('tickets')), 'totalTickets'],
      [fn('SUM', col('totalAmount')), 'totalRevenue'],
    ],
    raw: true,
  });

  const stats = registrations[0] as any;
  const registeredSeats = stats && stats.totalTickets ? parseInt(stats.totalTickets, 10) : 0;
  const totalRevenue = stats && stats.totalRevenue ? parseFloat(stats.totalRevenue) : 0.0;
  const availableSeats = event.capacity - registeredSeats;

  return {
    eventId: event.id,
    eventName: event.eventName,
    capacity: event.capacity,
    registeredSeats,
    availableSeats,
    totalRevenue,
  };
}

/**
 * Soft delete an event by ID.
 * Prevents deletion if the event has active (REGISTERED) or WAITLIST registrations.
 */
export async function deleteEvent(eventId: number): Promise<void> {
  const event = await Event.findByPk(eventId);
  if (!event) {
    throw new AppError('Event not found', 404);
  }

  // Check for active or waitlisted registrations
  const activeRegistrations = await Registration.findOne({
    where: {
      eventId,
      status: {
        [Op.in]: ['REGISTERED', 'WAITLIST'],
      },
    },
  });

  if (activeRegistrations) {
    throw new AppError('Cannot delete an event that has active or waitlisted registrations', 400);
  }

  // Perform soft delete
  await event.destroy();
}
