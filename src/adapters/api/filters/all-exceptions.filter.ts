import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'
import { ErrorCode } from '../../../domain/constants/error-code.enum'
import { DomainException } from '../../../domain/exception/domain.exception'
import {
  ErrorDetailDto,
  ErrorResponseDto,
} from '../../../shared/dto/error-response.dto'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()

    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR
    let errorResponse: ErrorResponseDto

    if (exception instanceof DomainException) {
      httpStatus = exception.httpStatus
      errorResponse = {
        code: exception.code,
        message: exception.message,
        ...(exception.details && exception.details.length > 0
          ? { details: exception.details }
          : {}),
      }
    } else if (exception instanceof HttpException) {
      httpStatus = exception.getStatus()
      const res = exception.getResponse()

      let code = ErrorCode.INTERNAL_SERVER_ERROR
      let message = exception.message
      let details: ErrorDetailDto[] | undefined

      if (httpStatus === HttpStatus.BAD_REQUEST) {
        code = ErrorCode.VALIDATION_ERROR
      } else if (httpStatus === HttpStatus.UNAUTHORIZED) {
        code = ErrorCode.UNAUTHORIZED
      } else if (httpStatus === HttpStatus.NOT_FOUND) {
        code = ErrorCode.TASK_NOT_FOUND
      }

      if (typeof res === 'string') {
        message = res
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, unknown>

        if (
          typeof resObj.code === 'string' &&
          Object.values(ErrorCode).includes(resObj.code as ErrorCode)
        ) {
          code = resObj.code as ErrorCode
        }

        if (typeof resObj.message === 'string') {
          message = resObj.message
        } else if (Array.isArray(resObj.message)) {
          message = 'Validation failed'
          details = resObj.message.map((item: unknown) => {
            if (typeof item === 'string') {
              const parts = item.split(' ')
              return { field: parts[0], message: item }
            }
            if (typeof item === 'object' && item !== null) {
              const obj = item as Record<string, unknown>
              return {
                field: typeof obj.field === 'string' ? obj.field : undefined,
                message: String(obj.message ?? item),
              }
            }
            return { message: String(item) }
          })
        }

        if (Array.isArray(resObj.details)) {
          details = resObj.details as ErrorDetailDto[]
        }
      }

      errorResponse = {
        code,
        message,
        ...(details && details.length > 0 ? { details } : {}),
      }
    } else {
      this.logger.error(
        'Unhandled exception caught by AllExceptionsFilter',
        exception instanceof Error ? exception.stack : exception,
      )

      httpStatus = HttpStatus.INTERNAL_SERVER_ERROR
      errorResponse = {
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      }
    }

    httpAdapter.reply(response, errorResponse, httpStatus)
  }
}
