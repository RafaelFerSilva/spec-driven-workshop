import { Inject, Injectable } from '@nestjs/common'
import { TaskStatus } from '../../domain/constants/task-status.enum'
import { Task } from '../../domain/model/task.model'
import { TaskRepository } from '../../domain/port/repositories/task.repository.interface'
import { DRIZZLE, DrizzleDB } from '../database/drizzle/drizzle.module'
import { tasks } from '../database/drizzle/schema'

@Injectable()
export class DrizzleTaskRepository implements TaskRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB
  ) {}

  async create(task: Task): Promise<Task> {
    const [inserted] = await this.db
      .insert(tasks)
      .values({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        deletedAt: task.deletedAt,
      })
      .returning()

    return Task.restore({
      id: inserted.id,
      title: inserted.title,
      description: inserted.description,
      status: inserted.status as TaskStatus,
      createdAt: inserted.createdAt,
      updatedAt: inserted.updatedAt,
      deletedAt: inserted.deletedAt,
    })
  }
}
