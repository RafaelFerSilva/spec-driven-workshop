import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger'
import { CreateTaskUseCase } from '../../../domain/usecase/create-task.usecase'
import { ErrorResponseDto } from '../../../shared/dto/error-response.dto'
import { CreateTaskDto } from '../dto/create-task.dto'
import { TaskResponseDto } from '../dto/task-response.dto'

@ApiTags('tasks')
@ApiSecurity('ApiKeyAuth')
@Controller('tasks')
export class TasksController {
  constructor(private readonly createTaskUseCase: CreateTaskUseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar uma nova tarefa' })
  @ApiResponse({
    status: 201,
    description: 'Tarefa criada com sucesso',
    type: TaskResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro de validação nos dados de entrada',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado — header x-api-key ausente',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Proibido — API Key inválida',
    type: ErrorResponseDto,
  })
  async create(@Body() dto: CreateTaskDto): Promise<TaskResponseDto> {
    const task = await this.createTaskUseCase.execute({
      title: dto.title,
      description: dto.description,
      status: dto.status,
    })

    return TaskResponseDto.fromDomain(task)
  }
}
