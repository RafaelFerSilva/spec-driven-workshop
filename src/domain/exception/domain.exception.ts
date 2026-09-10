import { ErrorCode } from '../constants/error-code.enum'

export interface DomainErrorDetail {
  field?: string
  message: string
}

export class DomainException extends Error {
  public readonly code: ErrorCode
  public readonly httpStatus: number
  public readonly details?: DomainErrorDetail[]

  constructor(
    code: ErrorCode,
    message: string,
    httpStatus = 400,
    details?: DomainErrorDetail[],
  ) {
    super(message)
    this.name = 'DomainException'
    this.code = code
    this.httpStatus = httpStatus
    this.details = details

    Object.setPrototypeOf(this, DomainException.prototype)
  }
}
