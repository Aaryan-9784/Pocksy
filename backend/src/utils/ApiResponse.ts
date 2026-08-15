/**
 * Consistent API response helper
 */

import { Response } from 'express';

export class ApiResponse {
  static success<T>(
    res: Response,
    message: string,
    data?: T,
    statusCode: number = 200
  ): Response {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static created<T>(res: Response, message: string, data?: T): Response {
    return ApiResponse.success(res, message, data, 201);
  }

  static error(
    res: Response,
    message: string,
    statusCode: number = 500
  ): Response {
    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
}
