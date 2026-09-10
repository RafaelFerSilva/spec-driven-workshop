import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TaskStatus } from '../constants/task-status.enum'
import { DomainException } from '../exception/domain.exception'
import { Task } from '../model/task.model'
import { TaskRepository } from '../port/repositories/task.repository.interface'
import { CreateTaskUseCase } from './create-task.usecase'

describe('CreateTaskUseCase', () => {
  let useCase: CreateTaskUseCase
  let taskRepository: TaskRepository

  beforeEach(() => {
    taskRepository = {
      create: vi.fn().mockImplementation(async (task: Task) => task),
    }

    useCase = new CreateTaskUseCase(taskRepository)
  })

  it('should successfully create and persist a task', async () => {
    const result = await useCase.execute({
      title: 'Valid Task Title',
      description: 'Optional description',
      status: TaskStatus.IN_PROGRESS,
    })

    expect(result).toBeDefined()
    expect(result.title).toBe('Valid Task Title')
    expect(result.description).toBe('Optional description')
    expect(result.status).toBe(TaskStatus.IN_PROGRESS)
    expect(taskRepository.create).toHaveBeenCalledTimes(1)
  })

  it('should create a task with default PENDING status if not provided', async () => {
    const result = await useCase.execute({
      title: 'Task without status',
    })

    expect(result.status).toBe(TaskStatus.PENDING)
    expect(taskRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Task without status',
        status: TaskStatus.PENDING,
      })
    )
  })

  it('should abort side effects and NOT call repository when input is invalid', async () => {
    await expect(
      useCase.execute({
        title: 'a', // invalid: < 3 chars
      })
    ).rejects.toThrow(DomainException)

    expect(taskRepository.create).not.toHaveBeenCalled()
  })

  it('should propagate errors thrown by repository without masking', async () => {
    vi.mocked(taskRepository.create).mockRejectedValueOnce(new Error('Database connection failed'))

    await expect(
      useCase.execute({
        title: 'Valid Task Title',
      })
    ).rejects.toThrow('Database connection failed')
  })
})
