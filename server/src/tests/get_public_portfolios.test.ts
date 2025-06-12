
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, portfoliosTable } from '../db/schema';
import { type CreateUserInput, type CreatePortfolioInput } from '../schema';
import { getPublicPortfolios } from '../handlers/get_public_portfolios';

// Test users
const testUser1: CreateUserInput = {
  email: 'user1@example.com',
  username: 'user1',
  display_name: 'User One'
};

const testUser2: CreateUserInput = {
  email: 'user2@example.com',
  username: 'user2',
  display_name: 'User Two'
};

describe('getPublicPortfolios', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no public portfolios exist', async () => {
    const result = await getPublicPortfolios();
    expect(result).toEqual([]);
  });

  it('should return only public portfolios', async () => {
    // Create test users
    const [user1, user2] = await db.insert(usersTable)
      .values([testUser1, testUser2])
      .returning()
      .execute();

    // Create portfolios - mix of public and private
    const publicPortfolio1: CreatePortfolioInput = {
      user_id: user1.id,
      title: 'Public Portfolio 1',
      description: 'A public portfolio',
      is_public: true
    };

    const privatePortfolio: CreatePortfolioInput = {
      user_id: user1.id,
      title: 'Private Portfolio',
      description: 'A private portfolio',
      is_public: false
    };

    const publicPortfolio2: CreatePortfolioInput = {
      user_id: user2.id,
      title: 'Public Portfolio 2',
      description: 'Another public portfolio',
      is_public: true
    };

    await db.insert(portfoliosTable)
      .values([publicPortfolio1, privatePortfolio, publicPortfolio2])
      .execute();

    const result = await getPublicPortfolios();

    // Should return only the 2 public portfolios
    expect(result).toHaveLength(2);
    
    // Verify all returned portfolios are public
    result.forEach(portfolio => {
      expect(portfolio.is_public).toBe(true);
    });

    // Check titles of public portfolios
    const titles = result.map(p => p.title).sort();
    expect(titles).toEqual(['Public Portfolio 1', 'Public Portfolio 2']);
  });

  it('should return portfolios with all required fields', async () => {
    // Create test user
    const [user] = await db.insert(usersTable)
      .values([testUser1])
      .returning()
      .execute();

    // Create public portfolio
    const portfolioInput: CreatePortfolioInput = {
      user_id: user.id,
      title: 'Test Public Portfolio',
      description: 'Test description',
      is_public: true
    };

    await db.insert(portfoliosTable)
      .values([portfolioInput])
      .execute();

    const result = await getPublicPortfolios();

    expect(result).toHaveLength(1);
    const portfolio = result[0];

    // Verify all required fields are present
    expect(portfolio.id).toBeDefined();
    expect(portfolio.user_id).toEqual(user.id);
    expect(portfolio.title).toEqual('Test Public Portfolio');
    expect(portfolio.description).toEqual('Test description');
    expect(portfolio.is_public).toBe(true);
    expect(portfolio.created_at).toBeInstanceOf(Date);
    expect(portfolio.updated_at).toBeInstanceOf(Date);
  });

  it('should handle portfolios with null descriptions', async () => {
    // Create test user
    const [user] = await db.insert(usersTable)
      .values([testUser1])
      .returning()
      .execute();

    // Create public portfolio with null description
    const portfolioInput: CreatePortfolioInput = {
      user_id: user.id,
      title: 'Portfolio with No Description',
      description: null,
      is_public: true
    };

    await db.insert(portfoliosTable)
      .values([portfolioInput])
      .execute();

    const result = await getPublicPortfolios();

    expect(result).toHaveLength(1);
    expect(result[0].description).toBe(null);
    expect(result[0].title).toEqual('Portfolio with No Description');
  });
});
