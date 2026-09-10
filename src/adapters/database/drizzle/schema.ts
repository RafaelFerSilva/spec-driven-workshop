import { pgEnum, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'

export const taskStatusEnum = pgEnum('task_status', ['PENDING', 'IN_PROGRESS', 'DONE'])

export const tasks = pgTable('tasks', {
  id: text('id').primaryKey(),
  title: varchar('title', { length: 100 }).notNull(),
  description: text('description'),
  status: taskStatusEnum('status').notNull().default('PENDING'),
  createdAt: timestamp('created_at', { precision: 3, mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { precision: 3, mode: 'date' }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { precision: 3, mode: 'date' }),
})

export type TaskSelect = typeof tasks.$inferSelect
export type TaskInsert = typeof tasks.$inferInsert
