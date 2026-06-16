import { Optional } from 'sequelize';

export interface RegistrationAttributes {
  id: number;
  registrationNumber: string;
  eventId: number;
  fullName: string;
  email: string;
  tickets: number;
  totalAmount: number;
  status: 'REGISTERED' | 'CANCELLED' | 'WAITLIST';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RegistrationCreationAttributes
  extends Optional<RegistrationAttributes, 'id' | 'status' | 'createdAt' | 'updatedAt'> {}
