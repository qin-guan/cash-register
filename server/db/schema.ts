import type { InferSelectModel } from 'drizzle-orm'
import { blob, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  name: text('name'),
})

export type Users = InferSelectModel<typeof users>

export const sessions = sqliteTable('user_sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  activeExpires: blob('active_expires', {
    mode: 'bigint',
  }).notNull(),
  idleExpires: blob('idle_expires', {
    mode: 'bigint',
  }).notNull(),
})

export type Sessions = InferSelectModel<typeof sessions>

export const keys = sqliteTable('user_keys', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  hashedPassword: text('hashed_password'),
})

export type Keys = InferSelectModel<typeof keys>

export const entries = sqliteTable('entries', {
  id: text('id').primaryKey(),
  date: text('date'),
  category: text('category'),
  amount: text('amount'),
  description: text('description'),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
})

export type Entries = InferSelectModel<typeof entries>
