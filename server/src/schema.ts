
import { z } from 'zod';

// User schema
export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  username: z.string(),
  display_name: z.string(),
  avatar_url: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type User = z.infer<typeof userSchema>;

// Portfolio schema
export const portfolioSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  is_public: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Portfolio = z.infer<typeof portfolioSchema>;

// Artifact types enum
export const artifactTypeSchema = z.enum(['data_visualization', 'ml_notebook', 'web_application', 'image', 'document']);
export type ArtifactType = z.infer<typeof artifactTypeSchema>;

// Artifact schema
export const artifactSchema = z.object({
  id: z.number(),
  portfolio_id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  type: artifactTypeSchema,
  file_url: z.string(),
  thumbnail_url: z.string().nullable(),
  position_x: z.number(),
  position_y: z.number(),
  position_z: z.number(),
  rotation_x: z.number(),
  rotation_y: z.number(),
  rotation_z: z.number(),
  scale: z.number(),
  ar_enabled: z.boolean(),
  metadata: z.record(z.unknown()).nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Artifact = z.infer<typeof artifactSchema>;

// Collaboration session schema
export const collaborationSessionSchema = z.object({
  id: z.number(),
  portfolio_id: z.number(),
  host_user_id: z.number(),
  title: z.string(),
  is_active: z.boolean(),
  max_participants: z.number(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type CollaborationSession = z.infer<typeof collaborationSessionSchema>;

// Session participant schema
export const sessionParticipantSchema = z.object({
  id: z.number(),
  session_id: z.number(),
  user_id: z.number(),
  joined_at: z.coerce.date(),
  left_at: z.coerce.date().nullable(),
  is_active: z.boolean()
});

export type SessionParticipant = z.infer<typeof sessionParticipantSchema>;

// Drawing stroke schema
export const drawingStrokeSchema = z.object({
  id: z.number(),
  session_id: z.number(),
  user_id: z.number(),
  stroke_data: z.string(), // JSON string containing stroke points
  color: z.string(),
  width: z.number(),
  created_at: z.coerce.date()
});

export type DrawingStroke = z.infer<typeof drawingStrokeSchema>;

// Input schemas
export const createUserInputSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50),
  display_name: z.string().min(1).max(100),
  avatar_url: z.string().url().optional()
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;

export const createPortfolioInputSchema = z.object({
  user_id: z.number(),
  title: z.string().min(1).max(200),
  description: z.string().nullable().optional(),
  is_public: z.boolean().default(false)
});

export type CreatePortfolioInput = z.infer<typeof createPortfolioInputSchema>;

export const createArtifactInputSchema = z.object({
  portfolio_id: z.number(),
  title: z.string().min(1).max(200),
  description: z.string().nullable().optional(),
  type: artifactTypeSchema,
  file_url: z.string().url(),
  thumbnail_url: z.string().url().optional(),
  position_x: z.number().default(0),
  position_y: z.number().default(0),
  position_z: z.number().default(0),
  rotation_x: z.number().default(0),
  rotation_y: z.number().default(0),
  rotation_z: z.number().default(0),
  scale: z.number().positive().default(1),
  ar_enabled: z.boolean().default(false),
  metadata: z.record(z.unknown()).nullable().optional()
});

export type CreateArtifactInput = z.infer<typeof createArtifactInputSchema>;

export const updateArtifactPositionInputSchema = z.object({
  id: z.number(),
  position_x: z.number(),
  position_y: z.number(),
  position_z: z.number(),
  rotation_x: z.number(),
  rotation_y: z.number(),
  rotation_z: z.number(),
  scale: z.number().positive()
});

export type UpdateArtifactPositionInput = z.infer<typeof updateArtifactPositionInputSchema>;

export const createCollaborationSessionInputSchema = z.object({
  portfolio_id: z.number(),
  host_user_id: z.number(),
  title: z.string().min(1).max(200),
  max_participants: z.number().int().min(2).max(50).default(10)
});

export type CreateCollaborationSessionInput = z.infer<typeof createCollaborationSessionInputSchema>;

export const joinSessionInputSchema = z.object({
  session_id: z.number(),
  user_id: z.number()
});

export type JoinSessionInput = z.infer<typeof joinSessionInputSchema>;

export const createDrawingStrokeInputSchema = z.object({
  session_id: z.number(),
  user_id: z.number(),
  stroke_data: z.string(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  width: z.number().positive().min(1).max(50)
});

export type CreateDrawingStrokeInput = z.infer<typeof createDrawingStrokeInputSchema>;

export const getUserPortfoliosInputSchema = z.object({
  user_id: z.number()
});

export type GetUserPortfoliosInput = z.infer<typeof getUserPortfoliosInputSchema>;

export const getPortfolioArtifactsInputSchema = z.object({
  portfolio_id: z.number()
});

export type GetPortfolioArtifactsInput = z.infer<typeof getPortfolioArtifactsInputSchema>;

export const getSessionParticipantsInputSchema = z.object({
  session_id: z.number()
});

export type GetSessionParticipantsInput = z.infer<typeof getSessionParticipantsInputSchema>;

export const getSessionDrawingStrokesInputSchema = z.object({
  session_id: z.number()
});

export type GetSessionDrawingStrokesInput = z.infer<typeof getSessionDrawingStrokesInputSchema>;
