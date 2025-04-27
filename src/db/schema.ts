import { pgTable, serial, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  primaryKey: text('primary_key').unique().notNull(), // OmniFocus primary key
  name: text('name').notNull(),
  status: text('status'), // 'completed', 'active', etc.
  added: timestamp('added', { withTimezone: true }),
  modified: timestamp('modified', { withTimezone: true }),
  completed: timestamp('completed', { withTimezone: true }),
  completionDate: timestamp('completion_date', { withTimezone: true }),
  importedAt: timestamp('imported_at', { withTimezone: true }).defaultNow().notNull(),
});
