import { Request, Response, NextFunction } from 'express';
import * as eventService from '../services/event.service';

/**
 * POST /events
 * Creates a new event.
 */
export async function createEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const event = await eventService.createEvent(req.body);
    return res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /events
 * Returns a filtered, sorted, and paginated list of events.
 */
export async function getEvents(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await eventService.getEvents(req.query as any);
    return res.status(200).json({
      success: true,
      message: 'Events retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /events/:id/summary
 * Returns the registration summary of a specific event.
 */
export async function getEventSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const eventId = parseInt(req.params.id, 10);
    const summary = await eventService.getEventSummary(eventId);
    return res.status(200).json({
      success: true,
      message: 'Event summary retrieved successfully',
      data: summary,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /events/:id
 * Soft deletes an event.
 */
export async function deleteEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const eventId = parseInt(req.params.id, 10);
    await eventService.deleteEvent(eventId);
    return res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
