import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'
import { TaskStatus } from '../../../domain/constants/task-status.enum'

export class CreateTaskDto {
  @ApiProperty({
    description: 'Título da tarefa',
    minLength: 3,
    maxLength: 100,
    example: 'Comprar leite e pão',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  title!: string

  @ApiPropertyOptional({
    description: 'Descrição detalhada da tarefa',
    maxLength: 2000,
    example: 'Ir ao mercado da esquina e comprar leite desnatado e pão integral',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string

  @ApiPropertyOptional({
    description: 'Status atual da tarefa',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
    example: TaskStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus
}
