
import { serial, text, pgTable, timestamp, numeric, integer, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enum for artifact types
export const artifactTypeEnum = pgEnum('artifact_type', ['data_visualization', 'ml_notebook', 'web_application', 'image', 'document']);

// Users table
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  display_name: text('display_name').notNull(),
  avatar_url: text('avatar_url'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Portfolios table
export const portfoliosTable = pgTable('portfolios', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => usersTable.id),
  title: text('title').notNull(),
  description: text('description'),
  is_public: boolean('is_public').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Artifacts table
export const artifactsTable = pgTable('artifacts', {
  id: serial('id').primaryKey(),
  portfolio_id: integer('portfolio_id').notNull().references(() => portfoliosTable.id),
  title: text('title').notNull(),
  description: text('description'),
  type: artifactTypeEnum('type').notNull(),
  file_url: text('file_url').notNull(),
  thumbnail_url: text('thumbnail_url'),
  position_x: numeric('position_x', { precision: 10, scale: 6 }).notNull().default('0'),
  position_y: numeric('position_y', { precision: 10, scale: 6 }).notNull().default('0'),
  position_z: numeric('position_z', { precision: 10, scale: 6 }).notNull().default('0'),
  rotation_x: numeric('rotation_x', { precision: 10, scale: 6 }).notNull().default('0'),
  rotation_y: numeric('rotation_y', { precision: 10, scale: 6 }).notNull().default('0'),
  rotation_z: numeric('rotation_z', { precision: 10, scale: 6 }).notNull().default('0'),
  scale: numeric('scale', { precision: 10, scale: 6 }).notNull().default('1'),
  ar_enabled: boolean('ar_enabled').notNull().default(false),
  metadata: text('metadata'), // JSON string
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Collaboration sessions table
export const collaborationSessionsTable = pgTable('collaboration_sessions', {
  id: serial('id').primaryKey(),
  portfolio_id: integer('portfolio_id').notNull().references(() => portfoliosTable.id),
  host_user_id: integer('host_user_id').notNull().references(() => usersTable.id),
  title: text('title').notNull(),
  is_active: boolean('is_active').notNull().default(true),
  max_participants: integer('max_participants').notNull().default(10),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Session participants table
export const sessionParticipantsTable = pgTable('session_participants', {
  id: serial('id').primaryKey(),
  session_id: integer('session_id').notNull().references(() => collaborationSessionsTable.id),
  user_id: integer('user_id').notNull().references(() => usersTable.id),
  joined_at: timestamp('joined_at').defaultNow().notNull(),
  left_at: timestamp('left_at'),
  is_active: boolean('is_active').notNull().default(true)
});

// Drawing strokes table
export const drawingStrokesTable = pgTable('drawing_strokes', {
  id: serial('id').primaryKey(),
  session_id: integer('session_id').notNull().references(() => collaborationSessionsTable.id),
  user_id: integer('user_id').notNull().references(() => usersTable.id),
  stroke_data: text('stroke_data').notNull(), // JSON string containing stroke points
  color: text('color').notNull(),
  width: numeric('width', { precision: 5, scale: 2 }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Relations
export const usersRelations = relations(usersTable, ({ many }) => ({
  portfolios: many(portfoliosTable),
  hostedSessions: many(collaborationSessionsTable),
  sessionParticipations: many(sessionParticipantsTable),
  drawingStrokes: many(drawingStrokesTable)
}));

export const portfoliosRelations = relations(portfoliosTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [portfoliosTable.user_id],
    references: [usersTable.id]
  }),
  artifacts: many(artifactsTable),
  collaborationSessions: many(collaborationSessionsTable)
}));

export const artifactsRelations = relations(artifactsTable, ({ one }) => ({
  portfolio: one(portfoliosTable, {
    fields: [artifactsTable.portfolio_id],
    references: [portfoliosTable.id]
  })
}));

export const collaborationSessionsRelations = relations(collaborationSessionsTable, ({ one, many }) => ({
  portfolio: one(portfoliosTable, {
    fields: [collaborationSessionsTable.portfolio_id],
    references: [portfoliosTable.id]
  }),
  host: one(usersTable, {
    fields: [collaborationSessionsTable.host_user_id],
    references: [usersTable.id]
  }),
  participants: many(sessionParticipantsTable),
  drawingStrokes: many(drawingStrokesTable)
}));

export const sessionParticipantsRelations = relations(sessionParticipantsTable, ({ one }) => ({
  session: one(collaborationSessionsTable, {
    fields: [sessionParticipantsTable.session_id],
    references: [collaborationSessionsTable.id]
  }),
  user: one(usersTable, {
    fields: [sessionParticipantsTable.user_id],
    references: [usersTable.id]
  })
}));

export const drawingStrokesRelations = relations(drawingStrokesTable, ({ one }) => ({
  session: one(collaborationSessionsTable, {
    fields: [drawingStrokesTable.session_id],
    references: [collaborationSessionsTable.id]
  }),
  user: one(usersTable, {
    fields: [drawingStrokesTable.user_id],
    references: [usersTable.id]
  })
}));

// Export all tables for relation queries
export const tables = {
  users: usersTable,
  portfolios: portfoliosTable,
  artifacts: artifactsTable,
  collaborationSessions: collaborationSessionsTable,
  sessionParticipants: sessionParticipantsTable,
  drawingStrokes: drawingStrokesTable
};
