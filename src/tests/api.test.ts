import request from 'supertest';
import app from '../app';
import { sequelize, Event, Registration, AuditLog } from '../models';

// Mock the models to prevent actual database connections/calls
jest.mock('../models', () => {
  const mockTransaction = jest.fn((callback) =>
    callback({
      LOCK: { UPDATE: 'UPDATE' },
    })
  );
  return {
    sequelize: {
      transaction: mockTransaction,
    },
    Event: {
      findByPk: jest.fn(),
      findOne: jest.fn(),
    },
    Registration: {
      findOne: jest.fn(),
      create: jest.fn(),
      findByPk: jest.fn(),
    },
    AuditLog: {
      create: jest.fn(),
    },
  };
});

describe('API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (sequelize.transaction as jest.Mock).mockImplementation((callback) =>
      callback({
        LOCK: { UPDATE: 'UPDATE' },
      })
    );
  });

  describe('POST /registrations (Event Registration & Capacity Validation)', () => {
    it('should return 400 validation error if body parameters are invalid', async () => {
      const response = await request(app)
        .post('/registrations')
        .send({
          eventId: 'not-a-number', // invalid type
          fullName: '', // should not be empty
          email: 'invalid-email', // invalid format
          tickets: 0, // must be at least 1
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should successfully register for an event when capacity allows', async () => {
      const mockEvent = {
        id: 1,
        eventName: 'Interview Prep Seminar',
        capacity: 100,
        availableSeats: 50,
        ticketPrice: 0.00,
        status: 'ACTIVE',
        save: jest.fn().mockResolvedValue(true),
      };

      const mockReg = {
        id: 10,
        registrationNumber: 'REG-20260617-9999',
        eventId: 1,
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        tickets: 2,
        totalAmount: 0.00,
        status: 'REGISTERED',
      };

      (Event.findByPk as jest.Mock).mockResolvedValue(mockEvent);
      (Registration.findOne as jest.Mock).mockResolvedValue(null); // No previous registration
      (Registration.create as jest.Mock).mockResolvedValue(mockReg);
      (AuditLog.create as jest.Mock).mockResolvedValue({});

      const response = await request(app)
        .post('/registrations')
        .send({
          eventId: 1,
          fullName: 'Jane Doe',
          email: 'jane@example.com',
          tickets: 2,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('REGISTERED');
      expect(response.body.data.registrationNumber).toBe('REG-20260617-9999');
      expect(mockEvent.availableSeats).toBe(48); // 50 - 2
      expect(mockEvent.save).toHaveBeenCalled();
    });

    it('should place registration on WAITLIST status if tickets request exceeds available seats', async () => {
      const mockEvent = {
        id: 1,
        eventName: 'Interview Prep Seminar',
        capacity: 100,
        availableSeats: 1, // Only 1 seat left
        ticketPrice: 0.00,
        status: 'ACTIVE',
        save: jest.fn().mockResolvedValue(true),
      };

      const mockReg = {
        id: 11,
        registrationNumber: 'REG-20260617-1111',
        eventId: 1,
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        tickets: 3, // Requesting 3 tickets
        totalAmount: 0.00,
        status: 'WAITLIST',
      };

      (Event.findByPk as jest.Mock).mockResolvedValue(mockEvent);
      (Registration.findOne as jest.Mock).mockResolvedValue(null);
      (Registration.create as jest.Mock).mockResolvedValue(mockReg);
      (AuditLog.create as jest.Mock).mockResolvedValue({});

      const response = await request(app)
        .post('/registrations')
        .send({
          eventId: 1,
          fullName: 'Jane Doe',
          email: 'jane@example.com',
          tickets: 3,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('WAITLIST');
      // Available seats should NOT change
      expect(mockEvent.availableSeats).toBe(1);
      expect(mockEvent.save).not.toHaveBeenCalled();
    });
  });

  describe('PATCH /registrations/:id/cancel (Registration Cancellation)', () => {
    it('should successfully cancel a REGISTERED registration and restore available seats', async () => {
      const mockReg = {
        id: 10,
        eventId: 1,
        tickets: 2,
        status: 'REGISTERED',
        save: jest.fn().mockResolvedValue(true),
      };

      const mockEvent = {
        id: 1,
        capacity: 100,
        availableSeats: 48,
        save: jest.fn().mockResolvedValue(true),
      };

      (Registration.findByPk as jest.Mock).mockResolvedValue(mockReg);
      (Event.findByPk as jest.Mock).mockResolvedValue(mockEvent);
      (AuditLog.create as jest.Mock).mockResolvedValue({});

      const response = await request(app)
        .patch('/registrations/10/cancel')
        .send();

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Registration cancelled successfully');
      expect(response.body.data.status).toBe('CANCELLED');
      
      // Seats should be restored: 48 + 2 = 50
      expect(mockEvent.availableSeats).toBe(50);
      expect(mockEvent.save).toHaveBeenCalled();
    });

    it('should return 400 if trying to cancel an already cancelled registration', async () => {
      const mockReg = {
        id: 12,
        status: 'CANCELLED',
      };

      (Registration.findByPk as jest.Mock).mockResolvedValue(mockReg);

      const response = await request(app)
        .patch('/registrations/12/cancel')
        .send();

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Registration is already cancelled');
    });

    it('should return 404 if registration to cancel is not found', async () => {
      (Registration.findByPk as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .patch('/registrations/999/cancel')
        .send();

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Registration not found');
    });
  });

  describe('DELETE /events/:id (Event Soft Deletion)', () => {
    it('should successfully soft delete an event if it has no active registrations', async () => {
      const mockEvent = {
        id: 1,
        eventName: 'Test Event',
        destroy: jest.fn().mockResolvedValue(true),
      };

      (Event.findByPk as jest.Mock).mockResolvedValue(mockEvent);
      (Registration.findOne as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .delete('/events/1')
        .send();

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Event deleted successfully');
      expect(mockEvent.destroy).toHaveBeenCalled();
    });

    it('should return 404 if the event to delete is not found', async () => {
      (Event.findByPk as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .delete('/events/999')
        .send();

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Event not found');
    });

    it('should return 400 if the event has active registrations', async () => {
      const mockEvent = {
        id: 2,
        eventName: 'Active Event',
        destroy: jest.fn(),
      };

      (Event.findByPk as jest.Mock).mockResolvedValue(mockEvent);
      (Registration.findOne as jest.Mock).mockResolvedValue({ id: 10, status: 'REGISTERED' });

      const response = await request(app)
        .delete('/events/2')
        .send();

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Cannot delete an event that has active or waitlisted registrations');
      expect(mockEvent.destroy).not.toHaveBeenCalled();
    });
  });
});
