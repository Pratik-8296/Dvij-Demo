'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('registrations', null, {});
    return queryInterface.bulkInsert('registrations', [
      {
        id: 1,
        registrationNumber: 'REG-20260617-1001',
        eventId: 1,
        fullName: 'John Doe',
        email: 'john@example.com',
        tickets: 2,
        totalAmount: 300.00,
        status: 'REGISTERED',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        registrationNumber: 'REG-20260617-1002',
        eventId: 1,
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        tickets: 1,
        totalAmount: 150.00,
        status: 'REGISTERED',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        registrationNumber: 'REG-20260617-1003',
        eventId: 3,
        fullName: 'Alice Johnson',
        email: 'alice@example.com',
        tickets: 5,
        totalAmount: 995.00,
        status: 'REGISTERED',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('registrations', null, {});
  },
};
