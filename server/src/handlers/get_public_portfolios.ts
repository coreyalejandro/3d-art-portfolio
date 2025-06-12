
import { db } from '../db';
import { portfoliosTable } from '../db/schema';
import { type Portfolio } from '../schema';
import { eq } from 'drizzle-orm';

export const getPublicPortfolios = async (): Promise<Portfolio[]> => {
  try {
    const results = await db.select()
      .from(portfoliosTable)
      .where(eq(portfoliosTable.is_public, true))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to get public portfolios:', error);
    throw error;
  }
};
