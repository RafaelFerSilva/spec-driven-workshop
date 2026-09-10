import { Module } from '@nestjs/common'
import { TASK_REPOSITORY } from '../../domain/port/repositories/task.repository.interface'
import { CreateTaskUseCase } from '../../domain/usecase/create-task.usecase'
import { TasksController } from '../api/controllers/tasks.controller'
import { DrizzleTaskRepository } from '../repositories/drizzle-task.repository'

@Module({
  controllers: [TasksController],
  providers: [
    CreateTaskUseCase,
    {
      provide: TASK_REPOSITORY,
      useClass: DrizzleTaskRepository,
    },
  ],
  exports: [CreateTaskUseCase],
})
export class TasksModule {}
