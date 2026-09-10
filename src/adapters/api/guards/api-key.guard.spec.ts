import { ExecutionContext } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ErrorCode } from '../../../domain/constants/error-code.enum'
import { DomainException } from '../../../domain/exception/domain.exception'
import { ApiKeyGuard } from './api-key.guard'
import { IS_PUBLIC_KEY } from './public.decorator'

describe('ApiKeyGuard', () => {
  let guard: ApiKeyGuard
  let reflector: Reflector
  let configService: ConfigService
  const VALID_API_KEY = 'valid-test-key-123'

  beforeEach(() => {
    reflector = {
      getAllAndOverride: vi.fn(),
    } as unknown as Reflector

    configService = {
      get: vi.fn().mockImplementation((key: string) => {
        if (key === 'API_KEY') return VALID_API_KEY
        return undefined
      }),
    } as unknown as ConfigService

    guard = new ApiKeyGuard(reflector, configService)
  })

  function createMockContext(headers: Record<string, string | undefined> = {}): ExecutionContext {
    return {
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: vi.fn().mockReturnValue({ headers }),
        getResponse: vi.fn().mockReturnValue({}),
      }),
    } as unknown as ExecutionContext
  }

  it('should allow access if route is marked as public', () => {
    vi.mocked(reflector.getAllAndOverride).mockReturnValue(true)
    const context = createMockContext({})

    const canActivate = guard.canActivate(context)

    expect(canActivate).toBe(true)
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
      IS_PUBLIC_KEY,
      expect.any(Array),
    )
  })

  it('should allow access when a valid x-api-key header is provided', () => {
    vi.mocked(reflector.getAllAndOverride).mockReturnValue(false)
    const context = createMockContext({ 'x-api-key': VALID_API_KEY })

    const canActivate = guard.canActivate(context)

    expect(canActivate).toBe(true)
  })

  it('should throw DomainException with UNAUTHORIZED (401) when x-api-key is missing', () => {
    vi.mocked(reflector.getAllAndOverride).mockReturnValue(false)
    const context = createMockContext({})

    expect(() => guard.canActivate(context)).toThrow(DomainException)

    try {
      guard.canActivate(context)
    } catch (error) {
      expect(error).toBeInstanceOf(DomainException)
      const domainError = error as DomainException
      expect(domainError.code).toBe(ErrorCode.UNAUTHORIZED)
      expect(domainError.httpStatus).toBe(401)
      expect(domainError.message).toBe('API key is required')
    }
  })

  it('should throw DomainException with INVALID_API_KEY (403) when x-api-key is incorrect', () => {
    vi.mocked(reflector.getAllAndOverride).mockReturnValue(false)
    const context = createMockContext({ 'x-api-key': 'invalid-key' })

    expect(() => guard.canActivate(context)).toThrow(DomainException)

    try {
      guard.canActivate(context)
    } catch (error) {
      expect(error).toBeInstanceOf(DomainException)
      const domainError = error as DomainException
      expect(domainError.code).toBe(ErrorCode.INVALID_API_KEY)
      expect(domainError.httpStatus).toBe(403)
      expect(domainError.message).toBe('API key is invalid')
    }
  })
})
