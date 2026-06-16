import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { AuditLogAttributes, AuditLogCreationAttributes } from '../interfaces/audit-log.interface';

class AuditLog extends Model<AuditLogAttributes, AuditLogCreationAttributes> implements AuditLogAttributes {
  public id!: number;
  public registrationId!: number;
  public oldStatus!: 'REGISTERED' | 'CANCELLED' | 'WAITLIST' | null;
  public newStatus!: 'REGISTERED' | 'CANCELLED' | 'WAITLIST';
  public changedAt!: Date;
}

AuditLog.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    registrationId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    oldStatus: {
      type: DataTypes.ENUM('REGISTERED', 'CANCELLED', 'WAITLIST'),
      allowNull: true,
    },
    newStatus: {
      type: DataTypes.ENUM('REGISTERED', 'CANCELLED', 'WAITLIST'),
      allowNull: false,
    },
    changedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'audit_logs',
    timestamps: false, // only changedAt is needed, we map changedAt as standard
  }
);

export default AuditLog;
export { AuditLog };
