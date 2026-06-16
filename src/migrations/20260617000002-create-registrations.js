'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('registrations', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      registrationNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      eventId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'events',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      fullName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      tickets: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      totalAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('REGISTERED', 'CANCELLED', 'WAITLIST'),
        allowNull: false,
        defaultValue: 'REGISTERED',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('registrations', ['eventId', 'email'], {
      name: 'idx_registrations_event_email',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('registrations', 'idx_registrations_event_email');
    await queryInterface.dropTable('registrations');
  },
};
