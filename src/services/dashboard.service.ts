import { sequelize, Event, Registration } from '../models';
import { fn, col, literal } from 'sequelize';

/**
 * Fetch aggregate data for the system dashboard.
 */
export async function getDashboardStats() {
  // 1. Total and Active Events
  const totalEvents = await Event.count();
  const activeEvents = await Event.count({ where: { status: 'ACTIVE' } });

  // 2. Registrations counts (Registered/Waitlisted vs Cancelled)
  const totalRegistrations = await Registration.count({
    where: { status: ['REGISTERED', 'WAITLIST'] },
  });
  const cancelledRegistrations = await Registration.count({
    where: { status: 'CANCELLED' },
  });

  // 3. Total Revenue (sum of totalAmount for REGISTERED status only)
  const totalRevenueResult = await Registration.sum('totalAmount', {
    where: { status: 'REGISTERED' },
  });
  const totalRevenue = totalRevenueResult ? parseFloat(totalRevenueResult as unknown as string) : 0.0;

  // 4. Top Events (by registered ticket sales)
  const topEvents = await Event.findAll({
    attributes: [
      'id',
      'eventName',
      'location',
      'eventDate',
      'capacity',
      'availableSeats',
      [fn('COALESCE', fn('SUM', col('registrations.tickets')), 0), 'registeredSeats'],
      [fn('COALESCE', fn('SUM', col('registrations.totalAmount')), 0.0), 'revenue'],
    ],
    include: [
      {
        model: Registration,
        as: 'registrations',
        attributes: [],
        where: { status: 'REGISTERED' },
        required: false, // LEFT JOIN so we don't exclude events with 0 registrations
      },
    ],
    group: ['Event.id'],
    order: [[literal('registeredSeats'), 'DESC']],
    limit: 5,
    subQuery: false, // Ensures limit and grouping are executed correctly in a single SQL query
  });

  // Format top events output
  const formattedTopEvents = topEvents.map((evt: any) => {
    const data = evt.get({ plain: true });
    return {
      eventId: data.id,
      eventName: data.eventName,
      location: data.location,
      eventDate: data.eventDate,
      capacity: data.capacity,
      availableSeats: data.availableSeats,
      registeredSeats: parseInt(data.registeredSeats, 10),
      revenue: parseFloat(data.revenue),
    };
  });

  return {
    totalEvents,
    activeEvents,
    totalRegistrations,
    cancelledRegistrations,
    totalRevenue,
    topEvents: formattedTopEvents,
  };
}
