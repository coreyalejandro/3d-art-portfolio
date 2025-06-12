
import { db } from '../db';
import { portfoliosTable } from '../db/schema';
import { type CreatePortfolioInput, type Portfolio } from '../schema';

export const createPortfolio = async (input: CreatePortfolioInput): Promise<Portfolio> => {
  try {
    // Insert portfolio record
    const result = await db.insert(portfoliosTable)
      .values({
        user_id: input.user_id,
        title: input.title,
        description: input.description,
        is_public: input.is_public
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Portfolio creation failed:', error);
    throw error;
  }
};
