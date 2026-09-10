import { Task } from '../../model/task.model'

export const TASK_REPOSITORY = Symbol('TASK_REPOSITORY')

export interface TaskRepository {
  create(task: Task): Promise<Task>
}
