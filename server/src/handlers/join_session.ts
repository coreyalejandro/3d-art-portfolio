
import { db } from '../db';
import { sessionParticipantsTable, collaborationSessionsTable } from '../db/schema';
import { type JoinSessionInput, type SessionParticipant } from '../schema';
import { eq, and } from 'drizzle-orm';

export const joinSession = async (input: JoinSessionInput): Promise<SessionParticipant> => {
  try {
    // First verify the session exists and is active
    const session = await db.select()
      .from(collaborationSessionsTable)
      .where(eq(collaborationSessionsTable.id, input.session_id))
      .execute();

    if (session.length === 0) {
      throw new Error('Collaboration session not found');
    }

    if (!session[0].is_active) {
      throw new Error('Collaboration session is not active');
    }

    // Check if user is already an active participant
    const existingParticipant = await db.select()
      .from(sessionParticipantsTable)
      .where(and(
        eq(sessionParticipantsTable.session_id, input.session_id),
        eq(sessionParticipantsTable.user_id, input.user_id),
        eq(sessionParticipantsTable.is_active, true)
      ))
      .execute();

    if (existingParticipant.length > 0) {
      // Return existing active participant
      return existingParticipant[0];
    }

    // Insert new session participant
    const result = await db.insert(sessionParticipantsTable)
      .values({
        session_id: input.session_id,
        user_id: input.user_id,
        is_active: true
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Join session failed:', error);
    throw error;
  }
};
