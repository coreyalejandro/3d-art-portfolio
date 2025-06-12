
import { db } from '../db';
import { sessionParticipantsTable } from '../db/schema';
import { type GetSessionParticipantsInput, type SessionParticipant } from '../schema';
import { eq } from 'drizzle-orm';

export const getSessionParticipants = async (input: GetSessionParticipantsInput): Promise<SessionParticipant[]> => {
  try {
    const results = await db.select()
      .from(sessionParticipantsTable)
      .where(eq(sessionParticipantsTable.session_id, input.session_id))
      .execute();

    return results.map(participant => ({
      ...participant,
      // Convert timestamp fields back to Date objects (already handled by Drizzle)
      joined_at: participant.joined_at,
      left_at: participant.left_at
    }));
  } catch (error) {
    console.error('Get session participants failed:', error);
    throw error;
  }
};
