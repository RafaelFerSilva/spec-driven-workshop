import { describe, expect, it } from 'vitest'
import { ErrorCode } from '../constants/error-code.enum'
import { DomainException } from './domain.exception'

describe('DomainException', () => {
  it('should create an instance with default status 400', () => {
    const exception = new DomainException(ErrorCode.VALIDATION_ERROR, 'Invalid data')

    expect(exception).toBeInstanceOf(Error)
    expect(exception).toBeInstanceOf(DomainException)
    expect(exception.name).toBe('DomainException')
    expect(exception.code).toBe(ErrorCode.VALIDATION_ERROR)
    expect(exception.message).toBe('Invalid data')
    expect(exception.httpStatus).toBe(400)
    expect(exception.details).toBeUndefined()
  })

  it('should create an instance with custom http status', () => {
    const exception = new DomainException(ErrorCode.TASK_NOT_FOUND, 'Task not found', 404)

    expect(exception.code).toBe(ErrorCode.TASK_NOT_FOUND)
    expect(exception.message).toBe('Task not found')
    expect(exception.httpStatus).toBe(404)
  })

  it('should support details with field and message', () => {
    const details = [
      { field: 'title', message: 'title is required' },
      { field: 'status', message: 'status is invalid' },
    ]
    const exception = new DomainException(ErrorCode.VALIDATION_ERROR, 'Validation failed', 400, details)

    expect(exception.details).toEqual(details)
    expect(exception.details).toHaveLength(2)
  })

  it('should work with UNAUTHORIZED and INVALID_API_KEY error codes', () => {
    const unauth = new DomainException(ErrorCode.UNAUTHORIZED, 'API key is required', 401)
    const invalidKey = new DomainException(ErrorCode.INVALID_API_KEY, 'API key is invalid', 401)

    expect(unauth.code).toBe(ErrorCode.UNAUTHORIZED)
    expect(unauth.httpStatus).toBe(401)
    expect(invalidKey.code).toBe(ErrorCode.INVALID_API_KEY)
    expect(invalidKey.httpStatus).toBe(401)
  })
})
