import {
  ArgumentsHost,
  BadRequestException,
  HttpException,
  HttpStatus,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ErrorCode } from '../../../domain/constants/error-code.enum'
import { DomainException } from '../../../domain/exception/domain.exception'
import { AllExceptionsFilter } from './all-exceptions.filter'

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter
  let replyMock: ReturnType<typeof vi.fn>
  let mockHttpAdapterHost: HttpAdapterHost
  let mockArgumentsHost: ArgumentsHost
  const mockResponse = { id: 'mock-response' }

  beforeEach(() => {
    replyMock = vi.fn()
    mockHttpAdapterHost = {
      httpAdapter: {
        reply: replyMock,
      },
    } as unknown as HttpAdapterHost

    mockArgumentsHost = {
      switchToHttp: vi.fn().mockReturnValue({
        getResponse: vi.fn().mockReturnValue(mockResponse),
        getRequest: vi.fn().mockReturnValue({}),
      }),
    } as unknown as ArgumentsHost

    filter = new AllExceptionsFilter(mockHttpAdapterHost)
  })

  describe('DomainException handling', () => {
    it('should format DomainException with default 400 status', () => {
      const exception = new DomainException(
        ErrorCode.VALIDATION_ERROR,
        'Invalid input',
      )

      filter.catch(exception, mockArgumentsHost)

      expect(replyMock).toHaveBeenCalledWith(
        mockResponse,
        {
          code: ErrorCode.VALIDATION_ERROR,
          message: 'Invalid input',
        },
        400,
      )
    })

    it('should format DomainException with 404 TASK_NOT_FOUND', () => {
      const exception = new DomainException(
        ErrorCode.TASK_NOT_FOUND,
        'Task not found',
        HttpStatus.NOT_FOUND,
      )

      filter.catch(exception, mockArgumentsHost)

      expect(replyMock).toHaveBeenCalledWith(
        mockResponse,
        {
          code: ErrorCode.TASK_NOT_FOUND,
          message: 'Task not found',
        },
        404,
      )
    })

    it('should format DomainException with 401 UNAUTHORIZED', () => {
      const exception = new DomainException(
        ErrorCode.UNAUTHORIZED,
        'Header x-api-key is missing',
        HttpStatus.UNAUTHORIZED,
      )

      filter.catch(exception, mockArgumentsHost)

      expect(replyMock).toHaveBeenCalledWith(
        mockResponse,
        {
          code: ErrorCode.UNAUTHORIZED,
          message: 'Header x-api-key is missing',
        },
        401,
      )
    })

    it('should format DomainException with 401 INVALID_API_KEY', () => {
      const exception = new DomainException(
        ErrorCode.INVALID_API_KEY,
        'Provided API key is invalid',
        HttpStatus.UNAUTHORIZED,
      )

      filter.catch(exception, mockArgumentsHost)

      expect(replyMock).toHaveBeenCalledWith(
        mockResponse,
        {
          code: ErrorCode.INVALID_API_KEY,
          message: 'Provided API key is invalid',
        },
        401,
      )
    })

    it('should include details when provided in DomainException', () => {
      const details = [{ field: 'title', message: 'Title is too short' }]
      const exception = new DomainException(
        ErrorCode.VALIDATION_ERROR,
        'Validation failed',
        HttpStatus.BAD_REQUEST,
        details,
      )

      filter.catch(exception, mockArgumentsHost)

      expect(replyMock).toHaveBeenCalledWith(
        mockResponse,
        {
          code: ErrorCode.VALIDATION_ERROR,
          message: 'Validation failed',
          details,
        },
        400,
      )
    })
  })

  describe('HttpException handling', () => {
    it('should map BadRequestException to VALIDATION_ERROR', () => {
      const exception = new BadRequestException('Bad request message')

      filter.catch(exception, mockArgumentsHost)

      expect(replyMock).toHaveBeenCalledWith(
        mockResponse,
        expect.objectContaining({
          code: ErrorCode.VALIDATION_ERROR,
          message: 'Bad request message',
        }),
        400,
      )
    })

    it('should map NotFoundException to TASK_NOT_FOUND', () => {
      const exception = new NotFoundException('Resource not found')

      filter.catch(exception, mockArgumentsHost)

      expect(replyMock).toHaveBeenCalledWith(
        mockResponse,
        expect.objectContaining({
          code: ErrorCode.TASK_NOT_FOUND,
          message: 'Resource not found',
        }),
        404,
      )
    })

    it('should map UnauthorizedException to UNAUTHORIZED', () => {
      const exception = new UnauthorizedException('Unauthorized access')

      filter.catch(exception, mockArgumentsHost)

      expect(replyMock).toHaveBeenCalledWith(
        mockResponse,
        expect.objectContaining({
          code: ErrorCode.UNAUTHORIZED,
          message: 'Unauthorized access',
        }),
        401,
      )
    })

    it('should preserve explicit ErrorCode in HttpException object response', () => {
      const exception = new HttpException(
        { code: ErrorCode.INVALID_API_KEY, message: 'API key rejected' },
        HttpStatus.UNAUTHORIZED,
      )

      filter.catch(exception, mockArgumentsHost)

      expect(replyMock).toHaveBeenCalledWith(
        mockResponse,
        {
          code: ErrorCode.INVALID_API_KEY,
          message: 'API key rejected',
        },
        401,
      )
    })

    it('should extract details from validation array of strings', () => {
      const exception = new BadRequestException({
        statusCode: 400,
        message: [
          'title must be between 3 and 100 characters',
          'status must be a valid enum value',
        ],
        error: 'Bad Request',
      })

      filter.catch(exception, mockArgumentsHost)

      expect(replyMock).toHaveBeenCalledWith(
        mockResponse,
        {
          code: ErrorCode.VALIDATION_ERROR,
          message: 'Validation failed',
          details: [
            {
              field: 'title',
              message: 'title must be between 3 and 100 characters',
            },
            {
              field: 'status',
              message: 'status must be a valid enum value',
            },
          ],
        },
        400,
      )
    })

    it('should extract details from validation array of objects', () => {
      const exception = new BadRequestException({
        message: 'Validation failed',
        details: [{ field: 'page', message: 'must not be negative' }],
      })

      filter.catch(exception, mockArgumentsHost)

      expect(replyMock).toHaveBeenCalledWith(
        mockResponse,
        {
          code: ErrorCode.VALIDATION_ERROR,
          message: 'Validation failed',
          details: [{ field: 'page', message: 'must not be negative' }],
        },
        400,
      )
    })
  })

  describe('Generic / Unexpected error handling', () => {
    it('should catch generic Error and return 500 INTERNAL_SERVER_ERROR', () => {
      const exception = new Error('Database connection lost')

      filter.catch(exception, mockArgumentsHost)

      expect(replyMock).toHaveBeenCalledWith(
        mockResponse,
        {
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
        },
        500,
      )
    })

    it('should catch non-Error thrown objects and return 500 INTERNAL_SERVER_ERROR', () => {
      const exception = 'Unexpected string exception'

      filter.catch(exception, mockArgumentsHost)

      expect(replyMock).toHaveBeenCalledWith(
        mockResponse,
        {
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
        },
        500,
      )
    })
  })
})
