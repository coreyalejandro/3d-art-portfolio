
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, portfoliosTable } from '../db/schema';
import { type GetUserPortfoliosInput, type CreateUserInput, type CreatePortfolioInput } from '../schema';
import { getUserPortfolios } from '../handlers/get_user_portfolios';

const testUser: CreateUserInput = {
  email: 'test@example.com',
  username: 'testuser',
  display_name: 'Test User'
};

const testPortfolio1: Omit<CreatePortfolioInput, 'user_id'> = {
  title: 'Portfolio 1',
  description: 'First portfolio',
  is_public: true
};

const testPortfolio2: Omit<CreatePortfolioInput, 'user_id'> = {
  title: 'Portfolio 2',
  description: 'Second portfolio',
  is_public: false
};

describe('getUserPortfolios', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array for user with no portfolios', async () => {
    // Create user
    const userResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();

    const userId = userResult[0].id;
    const input: GetUserPortfoliosInput = { user_id: userId };

    const result = await getUserPortfolios(input);

    expect(result).toEqual([]);
  });

  it('should return portfolios for user', async () => {
    // Create user
    const userResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();

    const userId = userResult[0].id;

    // Create portfolios
    await db.insert(portfoliosTable)
      .values([
        { ...testPortfolio1, user_id: userId },
        { ...testPortfolio2, user_id: userId }
      ])
      .execute();

    const input: GetUserPortfoliosInput = { user_id: userId };
    const result = await getUserPortfolios(input);

    expect(result).toHaveLength(2);
    
    // Check all fields are present
    result.forEach(portfolio => {
      expect(portfolio.id).toBeDefined();
      expect(portfolio.user_id).toEqual(userId);
      expect(portfolio.title).toBeDefined();
      expect(portfolio.description).toBeDefined();
      expect(typeof portfolio.is_public).toBe('boolean');
      expect(portfolio.created_at).toBeInstanceOf(Date);
      expect(portfolio.updated_at).toBeInstanceOf(Date);
    });

    // Check titles are correct
    const titles = result.map(p => p.title);
    expect(titles).toContain('Portfolio 1');
    expect(titles).toContain('Portfolio 2');
  });

  it('should return portfolios ordered by created_at descending', async () => {
    // Create user
    const userResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();

    const userId = userResult[0].id;

    // Create first portfolio
    const firstPortfolio = await db.insert(portfoliosTable)
      .values({ ...testPortfolio1, user_id: userId })
      .returning()
      .execute();

    // Wait a bit to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    // Create second portfolio
    const secondPortfolio = await db.insert(portfoliosTable)
      .values({ ...testPortfolio2, user_id: userId })
      .returning()
      .execute();

    const input: GetUserPortfoliosInput = { user_id: userId };
    const result = await getUserPortfolios(input);

    expect(result).toHaveLength(2);
    
    // Should be ordered by created_at descending (newest first)
    expect(result[0].created_at >= result[1].created_at).toBe(true);
    expect(result[0].title).toEqual('Portfolio 2'); // Second created should be first
    expect(result[1].title).toEqual('Portfolio 1'); // First created should be last
  });

  it('should not return portfolios from other users', async () => {
    // Create first user
    const userResult1 = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();

    // Create second user
    const userResult2 = await db.insert(usersTable)
      .values({
        email: 'other@example.com',
        username: 'otheruser',
        display_name: 'Other User'
      })
      .returning()
      .execute();

    const userId1 = userResult1[0].id;
    const userId2 = userResult2[0].id;

    // Create portfolios for both users
    await db.insert(portfoliosTable)
      .values([
        { ...testPortfolio1, user_id: userId1 },
        { ...testPortfolio2, user_id: userId2 }
      ])
      .execute();

    const input: GetUserPortfoliosInput = { user_id: userId1 };
    const result = await getUserPortfolios(input);

    expect(result).toHaveLength(1);
    expect(result[0].user_id).toEqual(userId1);
    expect(result[0].title).toEqual('Portfolio 1');
  });
});
