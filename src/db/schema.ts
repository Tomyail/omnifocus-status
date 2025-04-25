import { pgTable, serial, text, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  primaryKey: text('primary_key').unique().notNull(), // OmniFocus primary key
  name: text('name').notNull(),
  status: text('status'), // 'completed', 'active', etc.
  taskStatus: text('task_status'), // Alternative status field
  active: boolean('active'),
  added: timestamp('added', { withTimezone: true }),
  modified: timestamp('modified', { withTimezone: true }),
  completed: timestamp('completed', { withTimezone: true }),
  completionDate: timestamp('completion_date', { withTimezone: true }),
  dueDate: timestamp('due_date', { withTimezone: true }),
  note: text('note'),
  tags: jsonb('tags'), // Store tags as JSONB
  rawData: jsonb('raw_data').notNull(), // Store the full original task object
  importedAt: timestamp('imported_at', { withTimezone: true }).defaultNow().notNull(),
});
