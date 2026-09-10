import { describe, expect, it } from 'vitest'
import { ErrorCode } from '../constants/error-code.enum'
import { TaskStatus } from '../constants/task-status.enum'
import { DomainException } from '../exception/domain.exception'
import { Task } from './task.model'

describe('Task Model (Rich Domain Entity)', () => {
  it('should create a valid task with default status PENDING', () => {
    const task = Task.create({
      title: 'Buy milk and eggs',
    })

    expect(task.id).toBeDefined()
    expect(task.id.length).toBeGreaterThan(0)
    expect(task.title).toBe('Buy milk and eggs')
    expect(task.description).toBeNull()
    expect(task.status).toBe(TaskStatus.PENDING)
    expect(task.createdAt).toBeInstanceOf(Date)
    expect(task.updatedAt).toBeInstanceOf(Date)
    expect(task.deletedAt).toBeNull()
  })

  it('should create a task with description and custom status', () => {
    const task = Task.create({
      title: 'Prepare presentation',
      description: 'Slide deck for Monday meeting',
      status: TaskStatus.IN_PROGRESS,
    })

    expect(task.title).toBe('Prepare presentation')
    expect(task.description).toBe('Slide deck for Monday meeting')
    expect(task.status).toBe(TaskStatus.IN_PROGRESS)
  })

  it('should restore an existing task with all attributes', () => {
    const fixedDate = new Date('2026-01-01T00:00:00Z')
    const task = Task.restore({
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Existing task',
      description: 'Restored from database',
      status: TaskStatus.DONE,
      createdAt: fixedDate,
      updatedAt: fixedDate,
      deletedAt: null,
    })

    expect(task.id).toBe('123e4567-e89b-12d3-a456-426614174000')
    expect(task.title).toBe('Existing task')
    expect(task.description).toBe('Restored from database')
    expect(task.status).toBe(TaskStatus.DONE)
    expect(task.createdAt).toEqual(fixedDate)
    expect(task.updatedAt).toEqual(fixedDate)
    expect(task.deletedAt).toBeNull()
  })

  it('should throw DomainException if title is missing or empty', () => {
    expect(() => Task.create({ title: '' })).toThrow(DomainException)
    try {
      Task.create({ title: '   ' })
    } catch (err) {
      expect(err).toBeInstanceOf(DomainException)
      const domainErr = err as DomainException
      expect(domainErr.code).toBe(ErrorCode.VALIDATION_ERROR)
      expect(domainErr.httpStatus).toBe(400)
      expect(domainErr.message).toContain('Title must be between 3 and 100 characters')
    }
  })

  it('should throw DomainException if title is shorter than 3 characters', () => {
    expect(() => Task.create({ title: 'ab' })).toThrow(DomainException)
    try {
      Task.create({ title: 'ab' })
    } catch (err) {
      expect(err).toBeInstanceOf(DomainException)
      const domainErr = err as DomainException
      expect(domainErr.code).toBe(ErrorCode.VALIDATION_ERROR)
      expect(domainErr.httpStatus).toBe(400)
    }
  })

  it('should throw DomainException if title is longer than 100 characters', () => {
    const longTitle = 'a'.repeat(101)
    expect(() => Task.create({ title: longTitle })).toThrow(DomainException)
    try {
      Task.create({ title: longTitle })
    } catch (err) {
      expect(err).toBeInstanceOf(DomainException)
      const domainErr = err as DomainException
      expect(domainErr.code).toBe(ErrorCode.VALIDATION_ERROR)
      expect(domainErr.httpStatus).toBe(400)
    }
  })

  it('should throw DomainException if description exceeds 2000 characters', () => {
    const longDesc = 'd'.repeat(2001)
    expect(() =>
      Task.create({
        title: 'Valid title',
        description: longDesc,
      })
    ).toThrow(DomainException)

    try {
      Task.create({
        title: 'Valid title',
        description: longDesc,
      })
    } catch (err) {
      expect(err).toBeInstanceOf(DomainException)
      const domainErr = err as DomainException
      expect(domainErr.code).toBe(ErrorCode.VALIDATION_ERROR)
      expect(domainErr.httpStatus).toBe(400)
      expect(domainErr.message).toContain('Description cannot exceed 2000 characters')
    }
  })

  it('should throw DomainException if status is invalid', () => {
    expect(() =>
      Task.create({
        title: 'Valid title',
        status: 'INVALID_STATUS' as TaskStatus,
      })
    ).toThrow(DomainException)

    try {
      Task.create({
        title: 'Valid title',
        status: 'UNKNOWN' as TaskStatus,
      })
    } catch (err) {
      expect(err).toBeInstanceOf(DomainException)
      const domainErr = err as DomainException
      expect(domainErr.code).toBe(ErrorCode.VALIDATION_ERROR)
      expect(domainErr.httpStatus).toBe(400)
      expect(domainErr.message).toBe('Invalid status')
    }
  })
})
