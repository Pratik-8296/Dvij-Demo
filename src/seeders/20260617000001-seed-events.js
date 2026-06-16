'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('audit_logs', null, {});
    await queryInterface.bulkDelete('registrations', null, {});
    await queryInterface.bulkDelete('events', null, {});
    return queryInterface.bulkInsert('events', [
      {
        id: 1,
        eventName: 'Tech Summit 2026',
        location: 'San Francisco',
        eventDate: '2026-08-15',
        capacity: 500,
        availableSeats: 497, // 500 - 3 (from seeded registrations)
        ticketPrice: 150.00,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        eventName: 'Music Festival 2026',
        location: 'Los Angeles',
        eventDate: '2026-09-20',
        capacity: 1000,
        availableSeats: 1000,
        ticketPrice: 75.00,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        eventName: 'React Workshop',
        location: 'Chicago',
        eventDate: '2026-07-10',
        capacity: 50,
        availableSeats: 45, // 50 - 5 (from seeded registrations)
        ticketPrice: 199.00,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 4,
        eventName: 'AI Dev Conference',
        location: 'Boston',
        eventDate: '2026-11-12',
        capacity: 150,
        availableSeats: 150,
        ticketPrice: 299.00,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 5,
        eventName: 'Design Meetup',
        location: 'Denver',
        eventDate: '2026-10-05',
        capacity: 200,
        availableSeats: 200,
        ticketPrice: 0.00,
        status: 'INACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('events', null, {});
  },
};
