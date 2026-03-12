import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import { sendError } from '../utils/response';
import { error as logError } from '../utils/logger';

// global error handling middleware
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logError(err);

  // attempt to persist error details for later investigation
  try {
    const logEntry = {
      id: require('uuid').v4(),
      message: err.message || String(err),
      stack: err.stack || null,
      user_id: (req as any).user?.userId || null,
      path: req.originalUrl,
      method: req.method,
      body: req.body,
      query_params: req.query,
      route_params: req.params,
    };
    // import dynamically to avoid circular deps
    const { ErrorLogModel } = require('../models/errorLogModel');
    ErrorLogModel.create(logEntry).catch((e: any) => logError('Failed to write error log:', e));
  } catch (e) {
    logError('Error while attempting to record log entry:', e);
  }

  if (err instanceof AppError) {
    return sendError(res, err.statusCode, { message: err.message });
  }

  // handle some SQL errors gracefully
  if (err && err.code) {
    switch (err.code) {
      case 'ER_NO_REFERENCED_ROW_2':
        return sendError(res, 400, { message: 'Invalid reference value' });
      case 'ER_DUP_ENTRY':
        return sendError(res, 409, { message: 'Duplicate entry' });
      case 'ER_BAD_FIELD_ERROR':
        return sendError(res, 400, { message: 'Invalid database field' });
      default:
        break;
    }
  }

  // unknown/unexpected error
  sendError(res, 500, { message: 'Internal server error' });
};
