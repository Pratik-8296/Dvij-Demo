import { Event, Registration } from '../models';
import * as eventService from '../services/event.service';
import { AppError } from '../middlewares/error.middleware';

jest.mock('../models', () => {
  return {
    Event: {
      findByPk: jest.fn(),
    },
    Registration: {
      findOne: jest.fn(),
    },
  };
});

describe('EventService - deleteEvent Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully soft delete an event if it exists and has no active or waitlisted registrations', async () => {
    const mockEvent = {
      id: 1,
      eventName: 'Tech Summit 2026',
      destroy: jest.fn().mockResolvedValue(true),
    };

    (Event.findByPk as jest.Mock).mockResolvedValue(mockEvent);
    (Registration.findOne as jest.Mock).mockResolvedValue(null);

    await eventService.deleteEvent(1);

    expect(Event.findByPk).toHaveBeenCalledWith(1);
    expect(Registration.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          eventId: 1,
        }),
      })
    );
    expect(mockEvent.destroy).toHaveBeenCalled();
  });

  it('should throw AppError 404 if the event does not exist', async () => {
    (Event.findByPk as jest.Mock).mockResolvedValue(null);

    await expect(eventService.deleteEvent(999)).rejects.toThrow(
      new AppError('Event not found', 404)
    );

    expect(Event.findByPk).toHaveBeenCalledWith(999);
    expect(Registration.findOne).not.toHaveBeenCalled();
  });

  it('should throw AppError 400 if the event has active registrations', async () => {
    const mockEvent = {
      id: 1,
      eventName: 'Tech Summit 2026',
      destroy: jest.fn(),
    };

    const mockRegistration = {
      id: 101,
      status: 'REGISTERED',
    };

    (Event.findByPk as jest.Mock).mockResolvedValue(mockEvent);
    (Registration.findOne as jest.Mock).mockResolvedValue(mockRegistration);

    await expect(eventService.deleteEvent(1)).rejects.toThrow(
      new AppError('Cannot delete an event that has active or waitlisted registrations', 400)
    );

    expect(Event.findByPk).toHaveBeenCalledWith(1);
    expect(Registration.findOne).toHaveBeenCalled();
    expect(mockEvent.destroy).not.toHaveBeenCalled();
  });

  it('should throw AppError 400 if the event has waitlisted registrations', async () => {
    const mockEvent = {
      id: 1,
      eventName: 'Tech Summit 2026',
      destroy: jest.fn(),
    };

    const mockRegistration = {
      id: 102,
      status: 'WAITLIST',
    };

    (Event.findByPk as jest.Mock).mockResolvedValue(mockEvent);
    (Registration.findOne as jest.Mock).mockResolvedValue(mockRegistration);

    await expect(eventService.deleteEvent(1)).rejects.toThrow(
      new AppError('Cannot delete an event that has active or waitlisted registrations', 400)
    );

    expect(Event.findByPk).toHaveBeenCalledWith(1);
    expect(Registration.findOne).toHaveBeenCalled();
    expect(mockEvent.destroy).not.toHaveBeenCalled();
  });
});
