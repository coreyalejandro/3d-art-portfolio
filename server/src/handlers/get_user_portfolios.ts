
import { db } from '../db';
import { portfoliosTable } from '../db/schema';
import { type GetUserPortfoliosInput, type Portfolio } from '../schema';
import { eq, desc } from 'drizzle-orm';

export const getUserPortfolios = async (input: GetUserPortfoliosInput): Promise<Portfolio[]> => {
  try {
    const results = await db.select()
      .from(portfoliosTable)
      .where(eq(portfoliosTable.user_id, input.user_id))
      .orderBy(desc(portfoliosTable.created_at))
      .execute();

    return results;
  } catch (error) {
    console.error('Get user portfolios failed:', error);
    throw error;
  }
};
