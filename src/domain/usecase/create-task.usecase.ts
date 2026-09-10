import { Inject, Injectable } from '@nestjs/common'
import { TaskStatus } from '../constants/task-status.enum'
import { Task } from '../model/task.model'
import { TASK_REPOSITORY, TaskRepository } from '../port/repositories/task.repository.interface'

export interface CreateTaskCommand {
  title: string
  description?: string | null
  status?: TaskStatus
}

@Injectable()
export class CreateTaskUseCase {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepository
  ) {}

  async execute(command: CreateTaskCommand): Promise<Task> {
    const task = Task.create({
      title: command.title,
      description: command.description,
      status: command.status,
    })

    return this.taskRepository.create(task)
  }
}
