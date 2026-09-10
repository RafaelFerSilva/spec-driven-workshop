import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'
import { ErrorCode } from '../../../domain/constants/error-code.enum'
import { DomainException } from '../../../domain/exception/domain.exception'
import { IS_PUBLIC_KEY } from './public.decorator'

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (isPublic) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const apiKey = request.headers?.['x-api-key']

    if (!apiKey) {
      throw new DomainException(ErrorCode.UNAUTHORIZED, 'API key is required', 401)
    }

    const expectedApiKey = this.configService.get<string>('API_KEY')

    if (apiKey !== expectedApiKey) {
      throw new DomainException(ErrorCode.INVALID_API_KEY, 'API key is invalid', 403)
    }

    return true
  }
}
