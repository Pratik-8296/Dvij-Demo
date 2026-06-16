import { Router } from 'express';
import * as registrationController from '../controllers/registration.controller';
import { validate } from '../middlewares/validation.middleware';
import { createRegistrationSchema, queryRegistrationsSchema } from '../validations/registration.validation';

const router = Router();

router.post(
  '/',
  validate(createRegistrationSchema, 'body'),
  registrationController.createRegistration
);

router.patch(
  '/:id/cancel',
  registrationController.cancelRegistration
);

router.get(
  '/',
  validate(queryRegistrationsSchema, 'query'),
  registrationController.getRegistrations
);

export default router;
