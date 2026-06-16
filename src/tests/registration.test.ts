import { sequelize, Event, Registration, AuditLog } from '../models';
import * as registrationService from '../services/registration.service';
import { AppError } from '../middlewares/error.middleware';

// Mock the entire models index module
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
      create: jest.fn(),
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

describe('RegistrationService Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (sequelize.transaction as jest.Mock).mockImplementation((callback) =>
      callback({
        LOCK: { UPDATE: 'UPDATE' },
      })
    );
  });

  describe('createRegistration', () => {
    it('should successfully register for an event when seats are available', async () => {
      // Mock Event data
      const mockEvent = {
        id: 1,
        eventName: 'Tech Summit 2026',
        capacity: 100,
        availableSeats: 50,
        ticketPrice: 150.00,
        status: 'ACTIVE',
        save: jest.fn().mockResolvedValue(true),
      };

      // Mock Registration data
      const mockRegInput = {
        eventId: 1,
        fullName: 'John Doe',
        email: 'john@example.com',
        tickets: 2,
      };

      const mockCreatedReg = {
        id: 101,
        registrationNumber: 'REG-20260617-XXXX',
        eventId: 1,
        fullName: 'John Doe',
        email: 'john@example.com',
        tickets: 2,
        totalAmount: 300.00,
        status: 'REGISTERED',
      };

      // Setup mock behavior
      (Event.findByPk as jest.Mock).mockResolvedValue(mockEvent);
      (Registration.findOne as jest.Mock).mockResolvedValue(null); // No existing registration
      (Registration.create as jest.Mock).mockResolvedValue(mockCreatedReg);
      (AuditLog.create as jest.Mock).mockResolvedValue({});

      // Execute service call
      const result = await registrationService.createRegistration(mockRegInput);

      // Verify outcomes
      expect(Event.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
      expect(Registration.findOne).toHaveBeenCalled();
      expect(Registration.create).toHaveBeenCalledWith(
        expect.objectContaining({
          eventId: 1,
          email: 'john@example.com',
          tickets: 2,
          totalAmount: 300.00,
          status: 'REGISTERED',
        }),
        expect.any(Object)
      );

      // Event seats should decrement
      expect(mockEvent.availableSeats).toBe(48); // 50 - 2
      expect(mockEvent.save).toHaveBeenCalled();

      // Audit Log should be generated
      expect(AuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          registrationId: 101,
          oldStatus: null,
          newStatus: 'REGISTERED',
        }),
        expect.any(Object)
      );

      expect(result.registration.status).toBe('REGISTERED');
    });

    it('should place registration on WAITLIST status if tickets exceed availableSeats', async () => {
      const mockEvent = {
        id: 1,
        eventName: 'Tech Summit 2026',
        capacity: 100,
        availableSeats: 2, // Only 2 seats left
        ticketPrice: 150.00,
        status: 'ACTIVE',
        save: jest.fn().mockResolvedValue(true),
      };

      const mockRegInput = {
        eventId: 1,
        fullName: 'John Doe',
        email: 'john@example.com',
        tickets: 5, // Requesting 5 tickets
      };

      const mockCreatedReg = {
        id: 102,
        registrationNumber: 'REG-20260617-XXXX',
        eventId: 1,
        fullName: 'John Doe',
        email: 'john@example.com',
        tickets: 5,
        totalAmount: 750.00,
        status: 'WAITLIST',
      };

      (Event.findByPk as jest.Mock).mockResolvedValue(mockEvent);
      (Registration.findOne as jest.Mock).mockResolvedValue(null);
      (Registration.create as jest.Mock).mockResolvedValue(mockCreatedReg);
      (AuditLog.create as jest.Mock).mockResolvedValue({});

      const result = await registrationService.createRegistration(mockRegInput);

      expect(result.registration.status).toBe('WAITLIST');
      // Available seats should NOT decrement
      expect(mockEvent.availableSeats).toBe(2);
      expect(mockEvent.save).not.toHaveBeenCalled();

      // Audit Log should state WAITLIST
      expect(AuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          registrationId: 102,
          oldStatus: null,
          newStatus: 'WAITLIST',
        }),
        expect.any(Object)
      );
    });

    it('should throw AppError if email is already registered for this event', async () => {
      const mockEvent = {
        id: 1,
        eventName: 'Tech Summit 2026',
        capacity: 100,
        availableSeats: 50,
        status: 'ACTIVE',
      };

      const mockRegInput = {
        eventId: 1,
        fullName: 'John Doe',
        email: 'john@example.com',
        tickets: 2,
      };

      const mockExistingReg = {
        id: 99,
        email: 'john@example.com',
        status: 'REGISTERED',
      };

      (Event.findByPk as jest.Mock).mockResolvedValue(mockEvent);
      (Registration.findOne as jest.Mock).mockResolvedValue(mockExistingReg);

      await expect(registrationService.createRegistration(mockRegInput)).rejects.toThrow(
        new AppError('Email is already registered for this event', 400)
      );

      expect(Registration.create).not.toHaveBeenCalled();
    });
  });

  describe('cancelRegistration', () => {
    it('should successfully cancel a registration and restore event seats', async () => {
      const mockReg = {
        id: 201,
        registrationNumber: 'REG-20260617-1001',
        eventId: 1,
        tickets: 3,
        status: 'REGISTERED',
        save: jest.fn().mockResolvedValue(true),
      };

      const mockEvent = {
        id: 1,
        capacity: 100,
        availableSeats: 50,
        save: jest.fn().mockResolvedValue(true),
      };

      (Registration.findByPk as jest.Mock).mockResolvedValue(mockReg);
      (Event.findByPk as jest.Mock).mockResolvedValue(mockEvent);
      (AuditLog.create as jest.Mock).mockResolvedValue({});

      const result = await registrationService.cancelRegistration(201);

      expect(result.status).toBe('CANCELLED');
      expect(mockReg.save).toHaveBeenCalled();

      // Seats restored: 50 + 3 = 53
      expect(mockEvent.availableSeats).toBe(53);
      expect(mockEvent.save).toHaveBeenCalled();

      expect(AuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          registrationId: 201,
          oldStatus: 'REGISTERED',
          newStatus: 'CANCELLED',
        }),
        expect.any(Object)
      );
    });

    it('should cancel a WAITLIST registration without restoring event seats', async () => {
      const mockReg = {
        id: 202,
        registrationNumber: 'REG-20260617-1002',
        eventId: 1,
        tickets: 5,
        status: 'WAITLIST',
        save: jest.fn().mockResolvedValue(true),
      };

      const mockEvent = {
        id: 1,
        capacity: 100,
        availableSeats: 50,
        save: jest.fn().mockResolvedValue(true),
      };

      (Registration.findByPk as jest.Mock).mockResolvedValue(mockReg);
      (Event.findByPk as jest.Mock).mockResolvedValue(mockEvent);
      (AuditLog.create as jest.Mock).mockResolvedValue({});

      const result = await registrationService.cancelRegistration(202);

      expect(result.status).toBe('CANCELLED');
      expect(mockReg.save).toHaveBeenCalled();

      // Seats should remain unchanged
      expect(mockEvent.availableSeats).toBe(50);
      expect(mockEvent.save).not.toHaveBeenCalled();

      expect(AuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          registrationId: 202,
          oldStatus: 'WAITLIST',
          newStatus: 'CANCELLED',
        }),
        expect.any(Object)
      );
    });

    it('should throw AppError if trying to cancel an already CANCELLED registration', async () => {
      const mockReg = {
        id: 203,
        status: 'CANCELLED',
      };

      (Registration.findByPk as jest.Mock).mockResolvedValue(mockReg);

      await expect(registrationService.cancelRegistration(203)).rejects.toThrow(
        new AppError('Registration is already cancelled', 400)
      );

      expect(AuditLog.create).not.toHaveBeenCalled();
    });
  });
});
