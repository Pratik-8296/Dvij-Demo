import { Router } from 'express';
import * as eventController from '../controllers/event.controller';
import { validate } from '../middlewares/validation.middleware';
import { createEventSchema, queryEventsSchema } from '../validations/event.validation';

const router = Router();

router.post(
  '/',
  validate(createEventSchema, 'body'),
  eventController.createEvent
);

router.get(
  '/',
  validate(queryEventsSchema, 'query'),
  eventController.getEvents
);

router.get(
  '/:id/summary',
  eventController.getEventSummary
);

router.delete(
  '/:id',
  eventController.deleteEvent
);

export default router;
