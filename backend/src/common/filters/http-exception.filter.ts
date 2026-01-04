/**
 * Global HTTP Exception Filter
 * Transforms all exceptions into user-friendly error responses
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        // Handle structured error responses
        const errorObj = exceptionResponse as any;
        message = errorObj.message || errorObj.error || message;

        // If there's a nested message (from providers), use it
        if (Array.isArray(errorObj.message)) {
          message = errorObj.message[0];
        } else if (typeof errorObj.message === 'string') {
          message = errorObj.message;
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Transform technical error messages into user-friendly ones
    const userFriendlyMessage = this.transformMessage(status, message);

    response.status(status).json({
      statusCode: status,
      message: userFriendlyMessage,
      timestamp: new Date().toISOString(),
    });
  }

  private transformMessage(status: number, message: string): string {
    // Connection errors
    if (message.includes('ECONNREFUSED') || message.includes('connect')) {
      return 'Unable to connect to the data provider. Please try again later.';
    }

    // Network errors
    if (message.includes('timeout') || message.includes('ETIMEDOUT')) {
      return 'The request timed out. Please try again.';
    }

    // Status code specific messages
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return message || 'Invalid request. Please check your input.';
      case HttpStatus.UNAUTHORIZED:
        return 'Authentication required. Please check your credentials.';
      case HttpStatus.FORBIDDEN:
        return 'Access denied. You do not have permission to access this resource.';
      case HttpStatus.NOT_FOUND:
        return message || 'The requested resource was not found.';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'Too many requests. Please try again later.';
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 'An internal server error occurred. Please try again later.';
      case HttpStatus.BAD_GATEWAY:
        return 'The data provider is temporarily unavailable. Please try again later.';
      case HttpStatus.SERVICE_UNAVAILABLE:
        return 'The service is temporarily unavailable. Please try again later.';
      case HttpStatus.GATEWAY_TIMEOUT:
        return 'The request took too long. Please try again.';
      default:
        return message || 'An unexpected error occurred. Please try again.';
    }
  }
}

