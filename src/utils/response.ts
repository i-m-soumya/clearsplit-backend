import { Response } from 'express';

interface SuccessPayload {
  message?: string;
  data?: any;
}

interface ErrorPayload {
  message: string;
  details?: any;
}

export const sendSuccess = (
  res: Response,
  statusCode: number,
  payload: SuccessPayload = {}
) => {
  res.status(statusCode).json({
    success: true,
    status: statusCode,
    message: payload.message || null,
    data: payload.data || null,
  });
};

export const sendError = (
  res: Response,
  statusCode: number,
  payload: ErrorPayload
) => {
  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: payload.message,
    details: payload.details || null,
  });
};
