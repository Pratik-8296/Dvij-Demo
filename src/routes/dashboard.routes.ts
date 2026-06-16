import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';

const router = Router();

router.get('/', dashboardController.getDashboardStats);

export default router;
