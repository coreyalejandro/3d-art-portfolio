
import { db } from '../db';
import { collaborationSessionsTable } from '../db/schema';
import { type CreateCollaborationSessionInput, type CollaborationSession } from '../schema';

export const createCollaborationSession = async (input: CreateCollaborationSessionInput): Promise<CollaborationSession> => {
  try {
    // Insert collaboration session record
    const result = await db.insert(collaborationSessionsTable)
      .values({
        portfolio_id: input.portfolio_id,
        host_user_id: input.host_user_id,
        title: input.title,
        max_participants: input.max_participants
      })
      .returning()
      .execute();

    const session = result[0];
    return session;
  } catch (error) {
    console.error('Collaboration session creation failed:', error);
    throw error;
  }
};
