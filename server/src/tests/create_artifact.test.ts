
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { artifactsTable, usersTable, portfoliosTable } from '../db/schema';
import { type CreateArtifactInput } from '../schema';
import { createArtifact } from '../handlers/create_artifact';
import { eq } from 'drizzle-orm';

describe('createArtifact', () => {
  let testUserId: number;
  let testPortfolioId: number;

  beforeEach(async () => {
    await createDB();
    
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        username: 'testuser',
        display_name: 'Test User'
      })
      .returning()
      .execute();
    testUserId = userResult[0].id;

    // Create test portfolio
    const portfolioResult = await db.insert(portfoliosTable)
      .values({
        user_id: testUserId,
        title: 'Test Portfolio',
        description: 'A portfolio for testing',
        is_public: true
      })
      .returning()
      .execute();
    testPortfolioId = portfolioResult[0].id;
  });

  afterEach(resetDB);

  it('should create an artifact with default values', async () => {
    const testInput: CreateArtifactInput = {
      portfolio_id: testPortfolioId,
      title: 'Test Artifact',
      description: 'A test artifact',
      type: 'data_visualization',
      file_url: 'https://example.com/file.jpg',
      thumbnail_url: 'https://example.com/thumb.jpg',
      position_x: 0,
      position_y: 0,
      position_z: 0,
      rotation_x: 0,
      rotation_y: 0,
      rotation_z: 0,
      scale: 1,
      ar_enabled: false,
      metadata: null
    };

    const result = await createArtifact(testInput);

    // Basic field validation
    expect(result.portfolio_id).toEqual(testPortfolioId);
    expect(result.title).toEqual('Test Artifact');
    expect(result.description).toEqual('A test artifact');
    expect(result.type).toEqual('data_visualization');
    expect(result.file_url).toEqual('https://example.com/file.jpg');
    expect(result.thumbnail_url).toEqual('https://example.com/thumb.jpg');
    expect(result.position_x).toEqual(0);
    expect(result.position_y).toEqual(0);
    expect(result.position_z).toEqual(0);
    expect(result.rotation_x).toEqual(0);
    expect(result.rotation_y).toEqual(0);
    expect(result.rotation_z).toEqual(0);
    expect(result.scale).toEqual(1);
    expect(result.ar_enabled).toEqual(false);
    expect(result.metadata).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create an artifact with custom position and rotation values', async () => {
    const testInput: CreateArtifactInput = {
      portfolio_id: testPortfolioId,
      title: 'Positioned Artifact',
      description: 'An artifact with custom positioning',
      type: 'ml_notebook',
      file_url: 'https://example.com/notebook.ipynb',
      thumbnail_url: 'https://example.com/notebook-thumb.jpg',
      position_x: 10.5,
      position_y: -5.25,
      position_z: 2.75,
      rotation_x: 45.0,
      rotation_y: 90.0,
      rotation_z: 135.0,
      scale: 2.5,
      ar_enabled: true,
      metadata: { author: 'test', version: '1.0' }
    };

    const result = await createArtifact(testInput);

    // Verify numeric fields are properly converted
    expect(typeof result.position_x).toBe('number');
    expect(typeof result.position_y).toBe('number');
    expect(typeof result.position_z).toBe('number');
    expect(typeof result.rotation_x).toBe('number');
    expect(typeof result.rotation_y).toBe('number');
    expect(typeof result.rotation_z).toBe('number');
    expect(typeof result.scale).toBe('number');

    expect(result.position_x).toEqual(10.5);
    expect(result.position_y).toEqual(-5.25);
    expect(result.position_z).toEqual(2.75);
    expect(result.rotation_x).toEqual(45.0);
    expect(result.rotation_y).toEqual(90.0);
    expect(result.rotation_z).toEqual(135.0);
    expect(result.scale).toEqual(2.5);
    expect(result.ar_enabled).toEqual(true);
    expect(result.metadata).toEqual({ author: 'test', version: '1.0' });
  });

  it('should save artifact to database', async () => {
    const testInput: CreateArtifactInput = {
      portfolio_id: testPortfolioId,
      title: 'Database Test Artifact',
      description: 'Testing database persistence',
      type: 'web_application',
      file_url: 'https://example.com/app.html',
      thumbnail_url: 'https://example.com/app-thumb.jpg',
      position_x: 1.5,
      position_y: 2.5,
      position_z: 3.5,
      rotation_x: 15.0,
      rotation_y: 25.0,
      rotation_z: 35.0,
      scale: 1.75,
      ar_enabled: true,
      metadata: { framework: 'react', version: '18.0' }
    };

    const result = await createArtifact(testInput);

    // Query database to verify persistence
    const artifacts = await db.select()
      .from(artifactsTable)
      .where(eq(artifactsTable.id, result.id))
      .execute();

    expect(artifacts).toHaveLength(1);
    const savedArtifact = artifacts[0];
    
    expect(savedArtifact.portfolio_id).toEqual(testPortfolioId);
    expect(savedArtifact.title).toEqual('Database Test Artifact');
    expect(savedArtifact.description).toEqual('Testing database persistence');
    expect(savedArtifact.type).toEqual('web_application');
    expect(savedArtifact.file_url).toEqual('https://example.com/app.html');
    expect(savedArtifact.thumbnail_url).toEqual('https://example.com/app-thumb.jpg');
    expect(parseFloat(savedArtifact.position_x)).toEqual(1.5);
    expect(parseFloat(savedArtifact.position_y)).toEqual(2.5);
    expect(parseFloat(savedArtifact.position_z)).toEqual(3.5);
    expect(parseFloat(savedArtifact.rotation_x)).toEqual(15.0);
    expect(parseFloat(savedArtifact.rotation_y)).toEqual(25.0);
    expect(parseFloat(savedArtifact.rotation_z)).toEqual(35.0);
    expect(parseFloat(savedArtifact.scale)).toEqual(1.75);
    expect(savedArtifact.ar_enabled).toEqual(true);
    expect(JSON.parse(savedArtifact.metadata!)).toEqual({ framework: 'react', version: '18.0' });
    expect(savedArtifact.created_at).toBeInstanceOf(Date);
    expect(savedArtifact.updated_at).toBeInstanceOf(Date);
  });

  it('should handle different artifact types', async () => {
    const artifactTypes = ['data_visualization', 'ml_notebook', 'web_application', 'image', 'document'] as const;
    
    for (const type of artifactTypes) {
      const testInput: CreateArtifactInput = {
        portfolio_id: testPortfolioId,
        title: `Test ${type}`,
        description: `Testing ${type} artifact`,
        type: type,
        file_url: `https://example.com/${type}.file`,
        thumbnail_url: `https://example.com/${type}-thumb.jpg`,
        position_x: 0,
        position_y: 0,
        position_z: 0,
        rotation_x: 0,
        rotation_y: 0,
        rotation_z: 0,
        scale: 1,
        ar_enabled: false,
        metadata: null
      };

      const result = await createArtifact(testInput);
      expect(result.type).toEqual(type);
    }
  });

  it('should handle null optional fields', async () => {
    const testInput: CreateArtifactInput = {
      portfolio_id: testPortfolioId,
      title: 'Minimal Artifact',
      type: 'image',
      file_url: 'https://example.com/image.jpg',
      position_x: 0,
      position_y: 0,
      position_z: 0,
      rotation_x: 0,
      rotation_y: 0,
      rotation_z: 0,
      scale: 1,
      ar_enabled: false
    };

    const result = await createArtifact(testInput);

    expect(result.description).toBeNull();
    expect(result.thumbnail_url).toBeNull();
    expect(result.metadata).toBeNull();
  });
});
