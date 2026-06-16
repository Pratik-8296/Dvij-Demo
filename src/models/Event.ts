import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { EventAttributes, EventCreationAttributes } from '../interfaces/event.interface';

class Event extends Model<EventAttributes, EventCreationAttributes> implements EventAttributes {
  public id!: number;
  public eventName!: string;
  public location!: string;
  public eventDate!: Date;
  public capacity!: number;
  public availableSeats!: number;
  public ticketPrice!: number;
  public status!: 'ACTIVE' | 'INACTIVE';

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;
}

Event.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    eventName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    eventDate: {
      type: DataTypes.DATEONLY, // Date-only comparison is cleaner for "same date" checks
      allowNull: false,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    availableSeats: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ticketPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get() {
        const rawValue = this.getDataValue('ticketPrice');
        return rawValue ? parseFloat(rawValue as unknown as string) : 0;
      },
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
      allowNull: false,
      defaultValue: 'ACTIVE',
    },
  },
  {
    sequelize,
    tableName: 'events',
    paranoid: true, // soft delete
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['eventName', 'eventDate'],
        name: 'unique_event_name_date',
      },
    ],
  }
);

export default Event;
export { Event };
