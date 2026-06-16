'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('audit_logs', null, {});
    return queryInterface.bulkInsert('audit_logs', [
      {
        id: 1,
        registrationId: 1,
        oldStatus: null,
        newStatus: 'REGISTERED',
        changedAt: new Date(),
      },
      {
        id: 2,
        registrationId: 2,
        oldStatus: null,
        newStatus: 'REGISTERED',
        changedAt: new Date(),
      },
      {
        id: 3,
        registrationId: 3,
        oldStatus: null,
        newStatus: 'REGISTERED',
        changedAt: new Date(),
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('audit_logs', null, {});
  },
};
