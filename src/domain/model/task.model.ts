import { randomUUID } from 'node:crypto'
import { ErrorCode } from '../constants/error-code.enum'
import { TaskStatus } from '../constants/task-status.enum'
import { DomainException } from '../exception/domain.exception'

export interface TaskProps {
  id?: string
  title: string
  description?: string | null
  status?: TaskStatus
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date | null
}

export interface CreateTaskProps {
  title: string
  description?: string | null
  status?: TaskStatus
}

export interface RestoreTaskProps {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
}

export class Task {
  private readonly _id: string
  private _title: string
  private _description: string | null
  private _status: TaskStatus
  private readonly _createdAt: Date
  private _updatedAt: Date
  private _deletedAt: Date | null

  constructor(props: TaskProps) {
    this.validate(props)

    this._id = props.id ?? randomUUID()
    this._title = props.title.trim()
    this._description = props.description !== undefined && props.description !== null ? props.description.trim() : null
    this._status = props.status ?? TaskStatus.PENDING
    this._createdAt = props.createdAt ?? new Date()
    this._updatedAt = props.updatedAt ?? new Date()
    this._deletedAt = props.deletedAt ?? null
  }

  static create(props: CreateTaskProps): Task {
    return new Task(props)
  }

  static restore(props: RestoreTaskProps): Task {
    return new Task(props)
  }

  get id(): string {
    return this._id
  }

  get title(): string {
    return this._title
  }

  get description(): string | null {
    return this._description
  }

  get status(): TaskStatus {
    return this._status
  }

  get createdAt(): Date {
    return this._createdAt
  }

  get updatedAt(): Date {
    return this._updatedAt
  }

  get deletedAt(): Date | null {
    return this._deletedAt
  }

  private validate(props: TaskProps): void {
    this.validateTitle(props.title)
    this.validateDescription(props.description)
    this.validateStatus(props.status)
  }

  private validateTitle(title: unknown): void {
    if (!title || typeof title !== 'string') {
      throw new DomainException(ErrorCode.VALIDATION_ERROR, 'Title is required', 400)
    }

    const trimmed = title.trim()
    if (trimmed.length < 3 || trimmed.length > 100) {
      throw new DomainException(ErrorCode.VALIDATION_ERROR, 'Title must be between 3 and 100 characters', 400)
    }
  }

  private validateDescription(description: unknown): void {
    if (description === undefined || description === null) {
      return
    }

    if (typeof description !== 'string') {
      throw new DomainException(ErrorCode.VALIDATION_ERROR, 'Description must be a string', 400)
    }

    if (description.length > 2000) {
      throw new DomainException(ErrorCode.VALIDATION_ERROR, 'Description cannot exceed 2000 characters', 400)
    }
  }

  private validateStatus(status: unknown): void {
    if (status === undefined || status === null) {
      return
    }

    if (!Object.values(TaskStatus).includes(status as TaskStatus)) {
      throw new DomainException(ErrorCode.VALIDATION_ERROR, 'Invalid status', 400)
    }
  }
}
