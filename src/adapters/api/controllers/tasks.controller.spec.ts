import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TaskStatus } from '../../../domain/constants/task-status.enum'
import { Task } from '../../../domain/model/task.model'
import { CreateTaskUseCase } from '../../../domain/usecase/create-task.usecase'
import { CreateTaskDto } from '../dto/create-task.dto'
import { TasksController } from './tasks.controller'

describe('TasksController', () => {
  let controller: TasksController
  let mockUseCase: CreateTaskUseCase

  const mockDomainTask = Task.restore({
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Controller Task Test',
    description: 'Controller Description',
    status: TaskStatus.PENDING,
    createdAt: new Date('2026-01-01T10:00:00.000Z'),
    updatedAt: new Date('2026-01-01T10:00:00.000Z'),
    deletedAt: null,
  })

  beforeEach(() => {
    mockUseCase = {
      execute: vi.fn().mockResolvedValue(mockDomainTask),
    } as unknown as CreateTaskUseCase

    controller = new TasksController(mockUseCase)
  })

  it('should call usecase with DTO values and return serialized response', async () => {
    const dto: CreateTaskDto = {
      title: 'Controller Task Test',
      description: 'Controller Description',
      status: TaskStatus.PENDING,
    }

    const response = await controller.create(dto)

    expect(mockUseCase.execute).toHaveBeenCalledWith({
      title: dto.title,
      description: dto.description,
      status: dto.status,
    })

    expect(response).toEqual({
      id: mockDomainTask.id,
      title: mockDomainTask.title,
      description: mockDomainTask.description,
      status: mockDomainTask.status,
      createdAt: mockDomainTask.createdAt.toISOString(),
      updatedAt: mockDomainTask.updatedAt.toISOString(),
    })
  })
})
