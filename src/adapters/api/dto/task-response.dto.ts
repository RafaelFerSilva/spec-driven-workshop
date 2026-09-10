import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { TaskStatus } from '../../../domain/constants/task-status.enum'
import { Task } from '../../../domain/model/task.model'

export class TaskResponseDto {
  @ApiProperty({
    description: 'Identificador único da tarefa',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string

  @ApiProperty({
    description: 'Título da tarefa',
    minLength: 3,
    maxLength: 100,
    example: 'Comprar leite e pão',
  })
  title!: string

  @ApiPropertyOptional({
    description: 'Descrição detalhada da tarefa',
    maxLength: 2000,
    nullable: true,
    example: 'Ir ao mercado da esquina e comprar leite desnatado e pão integral',
  })
  description!: string | null

  @ApiProperty({
    description: 'Status atual da tarefa',
    enum: TaskStatus,
    example: TaskStatus.PENDING,
  })
  status!: TaskStatus

  @ApiProperty({
    description: 'Data e hora de criação da tarefa',
    format: 'date-time',
    example: '2026-03-09T10:30:00.000Z',
  })
  createdAt!: string

  @ApiProperty({
    description: 'Data e hora da última atualização',
    format: 'date-time',
    example: '2026-03-09T10:30:00.000Z',
  })
  updatedAt!: string

  static fromDomain(task: Task): TaskResponseDto {
    const dto = new TaskResponseDto()
    dto.id = task.id
    dto.title = task.title
    dto.description = task.description
    dto.status = task.status
    dto.createdAt = task.createdAt.toISOString()
    dto.updatedAt = task.updatedAt.toISOString()
    return dto
  }
}
