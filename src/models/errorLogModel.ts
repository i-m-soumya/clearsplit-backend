import pool from '../db';
import { RowDataPacket } from 'mysql2';

export interface ErrorLogRecord extends RowDataPacket {
  id: string;
  occurred_at: Date;
  message: string;
  stack?: string;
  user_id?: string;
  path?: string;
  method?: string;
  body?: any;
  query_params?: any;
  route_params?: any;
}

export class ErrorLogModel {
  static async create(log: {
    id: string;
    message: string;
    stack?: string;
    user_id?: string;
    path?: string;
    method?: string;
    body?: any;
    query_params?: any;
    route_params?: any;
  }) {
    const {
      id,
      message,
      stack,
      user_id,
      path,
      method,
      body,
      query_params,
      route_params,
    } = log;
    await pool.query(
      `INSERT INTO error_logs 
      (id, message, stack, user_id, path, method, body, query_params, route_params)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        message,
        stack || null,
        user_id || null,
        path || null,
        method || null,
        body ? JSON.stringify(body) : null,
        query_params ? JSON.stringify(query_params) : null,
        route_params ? JSON.stringify(route_params) : null,
      ]
    );
  }
}
