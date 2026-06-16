import { sequelize } from '../config/database';
import { Event } from './Event';
import { Registration } from './Registration';
import { AuditLog } from './AuditLog';

// Define associations
Event.hasMany(Registration, {
  foreignKey: 'eventId',
  as: 'registrations',
  onDelete: 'RESTRICT',
});

Registration.belongsTo(Event, {
  foreignKey: 'eventId',
  as: 'event',
});

Registration.hasMany(AuditLog, {
  foreignKey: 'registrationId',
  as: 'auditLogs',
  onDelete: 'CASCADE',
});

AuditLog.belongsTo(Registration, {
  foreignKey: 'registrationId',
  as: 'registration',
});

export {
  sequelize,
  Event,
  Registration,
  AuditLog,
};
