
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { portfoliosTable, usersTable } from '../db/schema';
import { type CreatePortfolioInput } from '../schema';
import { createPortfolio } from '../handlers/create_portfolio';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreatePortfolioInput = {
  user_id: 1,
  title: 'My Test Portfolio',
  description: 'A portfolio for testing purposes',
  is_public: true
};

describe('createPortfolio', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a portfolio', async () => {
    // Create prerequisite user first
    await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        username: 'testuser',
        display_name: 'Test User'
      })
      .execute();

    const result = await createPortfolio(testInput);

    // Basic field validation
    expect(result.user_id).toEqual(1);
    expect(result.title).toEqual('My Test Portfolio');
    expect(result.description).toEqual('A portfolio for testing purposes');
    expect(result.is_public).toEqual(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save portfolio to database', async () => {
    // Create prerequisite user first
    await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        username: 'testuser',
        display_name: 'Test User'
      })
      .execute();

    const result = await createPortfolio(testInput);

    // Query using proper drizzle syntax
    const portfolios = await db.select()
      .from(portfoliosTable)
      .where(eq(portfoliosTable.id, result.id))
      .execute();

    expect(portfolios).toHaveLength(1);
    expect(portfolios[0].user_id).toEqual(1);
    expect(portfolios[0].title).toEqual('My Test Portfolio');
    expect(portfolios[0].description).toEqual('A portfolio for testing purposes');
    expect(portfolios[0].is_public).toEqual(true);
    expect(portfolios[0].created_at).toBeInstanceOf(Date);
    expect(portfolios[0].updated_at).toBeInstanceOf(Date);
  });

  it('should create portfolio with default is_public false', async () => {
    // Create prerequisite user first
    await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        username: 'testuser',
        display_name: 'Test User'
      })
      .execute();

    const inputWithDefaults: CreatePortfolioInput = {
      user_id: 1,
      title: 'Private Portfolio',
      description: null,
      is_public: false // Include the field with default value
    };

    const result = await createPortfolio(inputWithDefaults);

    expect(result.title).toEqual('Private Portfolio');
    expect(result.description).toBeNull();
    expect(result.is_public).toEqual(false);
  });

  it('should throw error for non-existent user', async () => {
    // Don't create user - test foreign key constraint
    await expect(createPortfolio(testInput)).rejects.toThrow(/violates foreign key constraint/i);
  });
});
