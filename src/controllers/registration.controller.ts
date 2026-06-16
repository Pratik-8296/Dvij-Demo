import { Request, Response, NextFunction } from 'express';
import * as registrationService from '../services/registration.service';

/**
 * POST /registrations
 * Registers a user for an event.
 */
export async function createRegistration(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await registrationService.createRegistration(req.body);
    const isWaitlist = result.registration.status === 'WAITLIST';

    return res.status(201).json({
      success: true,
      message: isWaitlist
        ? 'Registration placed on the waitlist'
        : 'Event registration successful',
      data: result.registration,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /registrations/:id/cancel
 * Cancels a registration.
 */
export async function cancelRegistration(req: Request, res: Response, next: NextFunction) {
  try {
    const registrationId = parseInt(req.params.id, 10);
    const registration = await registrationService.cancelRegistration(registrationId);

    return res.status(200).json({
      success: true,
      message: 'Registration cancelled successfully',
      data: registration,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /registrations
 * Returns a filtered and paginated list of registrations.
 */
export async function getRegistrations(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await registrationService.getRegistrations(req.query as any);
    return res.status(200).json({
      success: true,
      message: 'Registrations retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
