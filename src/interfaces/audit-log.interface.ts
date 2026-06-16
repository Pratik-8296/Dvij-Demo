import { Optional } from 'sequelize';

export interface AuditLogAttributes {
  id: number;
  registrationId: number;
  oldStatus: 'REGISTERED' | 'CANCELLED' | 'WAITLIST' | null;
  newStatus: 'REGISTERED' | 'CANCELLED' | 'WAITLIST';
  changedAt: Date;
}

export interface AuditLogCreationAttributes extends Optional<AuditLogAttributes, 'id' | 'changedAt'> {}
