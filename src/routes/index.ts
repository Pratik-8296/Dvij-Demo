import { Router } from 'express';
import eventRouter from './event.routes';
import registrationRouter from './registration.routes';
import dashboardRouter from './dashboard.routes';

const apiRouter = Router();

apiRouter.use('/events', eventRouter);
apiRouter.use('/registrations', registrationRouter);
apiRouter.use('/dashboard', dashboardRouter);

export default apiRouter;
export { apiRouter };
