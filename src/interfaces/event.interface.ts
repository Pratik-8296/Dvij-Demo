import { Optional } from 'sequelize';

export interface EventAttributes {
  id: number;
  eventName: string;
  location: string;
  eventDate: Date;
  capacity: number;
  availableSeats: number;
  ticketPrice: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface EventCreationAttributes extends Optional<EventAttributes, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}
