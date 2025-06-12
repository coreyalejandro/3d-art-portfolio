
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, portfoliosTable, artifactsTable } from '../db/schema';
import { type GetPortfolioArtifactsInput } from '../schema';
import { getPortfolioArtifacts } from '../handlers/get_portfolio_artifacts';

describe('getPortfolioArtifacts', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return artifacts for a portfolio', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        username: 'testuser',
        display_name: 'Test User'
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    // Create test portfolio
    const portfolioResult = await db.insert(portfoliosTable)
      .values({
        user_id: userId,
        title: 'Test Portfolio',
        description: 'A test portfolio',
        is_public: true
      })
      .returning()
      .execute();

    const portfolioId = portfolioResult[0].id;

    // Create test artifacts
    await db.insert(artifactsTable)
      .values([
        {
          portfolio_id: portfolioId,
          title: 'First Artifact',
          description: 'First test artifact',
          type: 'data_visualization',
          file_url: 'https://example.com/file1.png',
          thumbnail_url: 'https://example.com/thumb1.png',
          position_x: '1.5',
          position_y: '2.0',
          position_z: '0.5',
          rotation_x: '0.0',
          rotation_y: '90.0',
          rotation_z: '45.0',
          scale: '1.2',
          ar_enabled: true,
          metadata: JSON.stringify({ tags: ['visualization', 'chart'] })
        },
        {
          portfolio_id: portfolioId,
          title: 'Second Artifact',
          description: 'Second test artifact',
          type: 'ml_notebook',
          file_url: 'https://example.com/file2.ipynb',
          position_x: '0.0',
          position_y: '0.0',
          position_z: '0.0',
          rotation_x: '0.0',
          rotation_y: '0.0',
          rotation_z: '0.0',
          scale: '1.0',
          ar_enabled: false,
          metadata: null
        }
      ])
      .execute();

    const input: GetPortfolioArtifactsInput = {
      portfolio_id: portfolioId
    };

    const result = await getPortfolioArtifacts(input);

    expect(result).toHaveLength(2);

    // Verify first artifact
    const firstArtifact = result.find(a => a.title === 'First Artifact');
    expect(firstArtifact).toBeDefined();
    expect(firstArtifact!.title).toEqual('First Artifact');
    expect(firstArtifact!.description).toEqual('First test artifact');
    expect(firstArtifact!.type).toEqual('data_visualization');
    expect(firstArtifact!.file_url).toEqual('https://example.com/file1.png');
    expect(firstArtifact!.thumbnail_url).toEqual('https://example.com/thumb1.png');
    expect(firstArtifact!.position_x).toEqual(1.5);
    expect(firstArtifact!.position_y).toEqual(2.0);
    expect(firstArtifact!.position_z).toEqual(0.5);
    expect(firstArtifact!.rotation_x).toEqual(0.0);
    expect(firstArtifact!.rotation_y).toEqual(90.0);
    expect(firstArtifact!.rotation_z).toEqual(45.0);
    expect(firstArtifact!.scale).toEqual(1.2);
    expect(firstArtifact!.ar_enabled).toEqual(true);
    expect(firstArtifact!.metadata).toEqual({ tags: ['visualization', 'chart'] });
    expect(firstArtifact!.id).toBeDefined();
    expect(firstArtifact!.created_at).toBeInstanceOf(Date);
    expect(firstArtifact!.updated_at).toBeInstanceOf(Date);

    // Verify second artifact
    const secondArtifact = result.find(a => a.title === 'Second Artifact');
    expect(secondArtifact).toBeDefined();
    expect(secondArtifact!.title).toEqual('Second Artifact');
    expect(secondArtifact!.description).toEqual('Second test artifact');
    expect(secondArtifact!.type).toEqual('ml_notebook');
    expect(secondArtifact!.file_url).toEqual('https://example.com/file2.ipynb');
    expect(secondArtifact!.thumbnail_url).toBeNull();
    expect(secondArtifact!.position_x).toEqual(0.0);
    expect(secondArtifact!.position_y).toEqual(0.0);
    expect(secondArtifact!.position_z).toEqual(0.0);
    expect(secondArtifact!.rotation_x).toEqual(0.0);
    expect(secondArtifact!.rotation_y).toEqual(0.0);
    expect(secondArtifact!.rotation_z).toEqual(0.0);
    expect(secondArtifact!.scale).toEqual(1.0);
    expect(secondArtifact!.ar_enabled).toEqual(false);
    expect(secondArtifact!.metadata).toBeNull();
    expect(secondArtifact!.id).toBeDefined();
    expect(secondArtifact!.created_at).toBeInstanceOf(Date);
    expect(secondArtifact!.updated_at).toBeInstanceOf(Date);

    // Verify numeric types
    result.forEach(artifact => {
      expect(typeof artifact.position_x).toBe('number');
      expect(typeof artifact.position_y).toBe('number');
      expect(typeof artifact.position_z).toBe('number');
      expect(typeof artifact.rotation_x).toBe('number');
      expect(typeof artifact.rotation_y).toBe('number');
      expect(typeof artifact.rotation_z).toBe('number');
      expect(typeof artifact.scale).toBe('number');
    });
  });

  it('should return empty array for portfolio with no artifacts', async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        username: 'testuser',
        display_name: 'Test User'
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    // Create test portfolio without artifacts
    const portfolioResult = await db.insert(portfoliosTable)
      .values({
        user_id: userId,
        title: 'Empty Portfolio',
        description: 'A portfolio with no artifacts',
        is_public: true
      })
      .returning()
      .execute();

    const portfolioId = portfolioResult[0].id;

    const input: GetPortfolioArtifactsInput = {
      portfolio_id: portfolioId
    };

    const result = await getPortfolioArtifacts(input);

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should return empty array for non-existent portfolio', async () => {
    const input: GetPortfolioArtifactsInput = {
      portfolio_id: 999999
    };

    const result = await getPortfolioArtifacts(input);

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });
});
