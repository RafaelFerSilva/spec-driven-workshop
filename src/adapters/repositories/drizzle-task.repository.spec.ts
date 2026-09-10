import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TaskStatus } from '../../domain/constants/task-status.enum'
import { Task } from '../../domain/model/task.model'
import { DrizzleDB } from '../database/drizzle/drizzle.module'
import { DrizzleTaskRepository } from './drizzle-task.repository'

describe('DrizzleTaskRepository', () => {
  let repository: DrizzleTaskRepository
  let mockDb: DrizzleDB

  const mockDbRow = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test Drizzle Task',
    description: 'Test Description',
    status: TaskStatus.PENDING,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    deletedAt: null,
  }

  beforeEach(() => {
    mockDb = {
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockDbRow]),
        }),
      }),
    } as unknown as DrizzleDB

    repository = new DrizzleTaskRepository(mockDb)
  })

  it('should insert task and return restored domain entity', async () => {
    const domainTask = Task.restore({
      id: mockDbRow.id,
      title: mockDbRow.title,
      description: mockDbRow.description,
      status: mockDbRow.status,
      createdAt: mockDbRow.createdAt,
      updatedAt: mockDbRow.updatedAt,
      deletedAt: null,
    })

    const result = await repository.create(domainTask)

    expect(result).toBeInstanceOf(Task)
    expect(result.id).toBe(mockDbRow.id)
    expect(result.title).toBe(mockDbRow.title)
    expect(result.description).toBe(mockDbRow.description)
    expect(result.status).toBe(TaskStatus.PENDING)
    expect(mockDb.insert).toHaveBeenCalledTimes(1)
  })
})
