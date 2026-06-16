import express, { Application } from 'express';
import cors from 'cors';
import requestLogger from './middlewares/logger.middleware';
import errorHandler from './middlewares/error.middleware';
import apiRouter from './routes';
import { serveSwagger, swaggerUiSetup } from './docs/swagger';

const app: Application = express();

// Standard Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// API Documentation (Swagger)
app.use('/api-docs', serveSwagger, swaggerUiSetup);

// API Routes
app.use('/', apiRouter);

// Global Error Handler
app.use(errorHandler);

export default app;
export { app };
