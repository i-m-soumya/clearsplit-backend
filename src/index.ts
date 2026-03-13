import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
// Routes
import authRoutes from './routes/auth';
import groupRoutes from './routes/groups';
import expenseRoutes from './routes/expenses';
import preferenceRoutes from './routes/preferences';
import { info } from './utils/logger';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
// request logging
app.use(morgan('combined', { stream: { write: (msg) => info(msg.trim()) } }));

// Main Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/preferences', preferenceRoutes);

import { sendSuccess } from './utils/response';

app.get('/health', (req, res) => {
  sendSuccess(res, 200, { message: 'ClearSplit API is running' });
});

// handle unknown routes
import { AppError } from './utils/appError';
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

// global error handling should come after all routes
import { globalErrorHandler } from './middleware/errorHandler';

app.use(globalErrorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    info(`Server is running on port ${port}`);
  });
}

export default app;
