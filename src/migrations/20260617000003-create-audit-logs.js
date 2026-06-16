'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('audit_logs', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      registrationId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'registrations',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      oldStatus: {
        type: Sequelize.ENUM('REGISTERED', 'CANCELLED', 'WAITLIST'),
        allowNull: true,
      },
      newStatus: {
        type: Sequelize.ENUM('REGISTERED', 'CANCELLED', 'WAITLIST'),
        allowNull: false,
      },
      changedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('audit_logs', ['registrationId'], {
      name: 'idx_audit_logs_registration_id',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('audit_logs', 'idx_audit_logs_registration_id');
    await queryInterface.dropTable('audit_logs');
  },
};
