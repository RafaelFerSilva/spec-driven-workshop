import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class ErrorDetailDto {
  @ApiPropertyOptional({
    description: 'Campo que causou o erro',
    example: 'title',
  })
  field?: string

  @ApiProperty({
    description: 'Descrição do erro no campo',
    example: 'title must be between 3 and 100 characters',
  })
  message!: string
}

export class ErrorResponseDto {
  @ApiProperty({
    description: 'Código de erro padronizado (UPPER_SNAKE_CASE)',
    example: 'VALIDATION_ERROR',
  })
  code!: string

  @ApiProperty({
    description: 'Mensagem legível do erro',
    example: 'Validation failed',
  })
  message!: string

  @ApiPropertyOptional({
    description: 'Detalhes adicionais sobre o erro (campos de validação, etc.)',
    type: [ErrorDetailDto],
  })
  details?: ErrorDetailDto[]
}
