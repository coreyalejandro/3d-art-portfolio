
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, portfoliosTable, artifactsTable } from '../db/schema';
import { type UpdateArtifactPositionInput } from '../schema';
import { updateArtifactPosition } from '../handlers/update_artifact_position';
import { eq } from 'drizzle-orm';

describe('updateArtifactPosition', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update artifact position and spatial properties', async () => {
    // Create prerequisite user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        username: 'testuser',
        display_name: 'Test User'
      })
      .returning()
      .execute();
    const userId = userResult[0].id;

    // Create prerequisite portfolio
    const portfolioResult = await db.insert(portfoliosTable)
      .values({
        user_id: userId,
        title: 'Test Portfolio',
        description: 'A test portfolio',
        is_public: false
      })
      .returning()
      .execute();
    const portfolioId = portfolioResult[0].id;

    // Create artifact to update
    const artifactResult = await db.insert(artifactsTable)
      .values({
        portfolio_id: portfolioId,
        title: 'Test Artifact',
        description: 'A test artifact',
        type: 'data_visualization',
        file_url: 'https://example.com/file.png',
        thumbnail_url: 'https://example.com/thumb.png',
        position_x: '0',
        position_y: '0',
        position_z: '0',
        rotation_x: '0',
        rotation_y: '0',
        rotation_z: '0',
        scale: '1',
        ar_enabled: false,
        metadata: null
      })
      .returning()
      .execute();
    const artifactId = artifactResult[0].id;

    const updateInput: UpdateArtifactPositionInput = {
      id: artifactId,
      position_x: 10.5,
      position_y: -5.25,
      position_z: 2.75,
      rotation_x: 45.0,
      rotation_y: 90.0,
      rotation_z: 180.0,
      scale: 1.5
    };

    const result = await updateArtifactPosition(updateInput);

    // Verify updated position and spatial properties
    expect(result.id).toEqual(artifactId);
    expect(result.position_x).toEqual(10.5);
    expect(result.position_y).toEqual(-5.25);
    expect(result.position_z).toEqual(2.75);
    expect(result.rotation_x).toEqual(45.0);
    expect(result.rotation_y).toEqual(90.0);
    expect(result.rotation_z).toEqual(180.0);
    expect(result.scale).toEqual(1.5);
    expect(result.updated_at).toBeInstanceOf(Date);

    // Verify other fields remain unchanged
    expect(result.title).toEqual('Test Artifact');
    expect(result.type).toEqual('data_visualization');
    expect(result.file_url).toEqual('https://example.com/file.png');
  });

  it('should save updated position to database', async () => {
    // Create prerequisite user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        username: 'testuser',
        display_name: 'Test User'
      })
      .returning()
      .execute();
    const userId = userResult[0].id;

    // Create prerequisite portfolio
    const portfolioResult = await db.insert(portfoliosTable)
      .values({
        user_id: userId,
        title: 'Test Portfolio',
        description: 'A test portfolio',
        is_public: false
      })
      .returning()
      .execute();
    const portfolioId = portfolioResult[0].id;

    // Create artifact to update
    const artifactResult = await db.insert(artifactsTable)
      .values({
        portfolio_id: portfolioId,
        title: 'Test Artifact',
        description: 'A test artifact',
        type: 'image',
        file_url: 'https://example.com/image.jpg',
        position_x: '0',
        position_y: '0',
        position_z: '0',
        rotation_x: '0',
        rotation_y: '0',
        rotation_z: '0',
        scale: '1',
        ar_enabled: true,
        metadata: '{"key": "value"}'
      })
      .returning()
      .execute();
    const artifactId = artifactResult[0].id;

    const updateInput: UpdateArtifactPositionInput = {
      id: artifactId,
      position_x: 3.14,
      position_y: 2.71,
      position_z: 1.41,
      rotation_x: 30.0,
      rotation_y: 60.0,
      rotation_z: 120.0,
      scale: 0.8
    };

    await updateArtifactPosition(updateInput);

    // Query database to verify changes were persisted
    const artifacts = await db.select()
      .from(artifactsTable)
      .where(eq(artifactsTable.id, artifactId))
      .execute();

    expect(artifacts).toHaveLength(1);
    const savedArtifact = artifacts[0];
    
    expect(parseFloat(savedArtifact.position_x)).toEqual(3.14);
    expect(parseFloat(savedArtifact.position_y)).toEqual(2.71);
    expect(parseFloat(savedArtifact.position_z)).toEqual(1.41);
    expect(parseFloat(savedArtifact.rotation_x)).toEqual(30.0);
    expect(parseFloat(savedArtifact.rotation_y)).toEqual(60.0);
    expect(parseFloat(savedArtifact.rotation_z)).toEqual(120.0);
    expect(parseFloat(savedArtifact.scale)).toEqual(0.8);
    expect(savedArtifact.updated_at).toBeInstanceOf(Date);
  });

  it('should throw error when artifact does not exist', async () => {
    const updateInput: UpdateArtifactPositionInput = {
      id: 999999, // Non-existent artifact ID
      position_x: 1.0,
      position_y: 1.0,
      position_z: 1.0,
      rotation_x: 0.0,
      rotation_y: 0.0,
      rotation_z: 0.0,
      scale: 1.0
    };

    await expect(updateArtifactPosition(updateInput)).rejects.toThrow(/artifact with id.*not found/i);
  });

  it('should handle edge case values correctly', async () => {
    // Create prerequisite user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        username: 'testuser',
        display_name: 'Test User'
      })
      .returning()
      .execute();
    const userId = userResult[0].id;

    // Create prerequisite portfolio
    const portfolioResult = await db.insert(portfoliosTable)
      .values({
        user_id: userId,
        title: 'Test Portfolio',
        description: 'A test portfolio',
        is_public: false
      })
      .returning()
      .execute();
    const portfolioId = portfolioResult[0].id;

    // Create artifact to update
    const artifactResult = await db.insert(artifactsTable)
      .values({
        portfolio_id: portfolioId,
        title: 'Test Artifact',
        description: 'A test artifact',
        type: 'ml_notebook',
        file_url: 'https://example.com/notebook.ipynb',
        position_x: '10',
        position_y: '20',
        position_z: '30',
        rotation_x: '45',
        rotation_y: '90',
        rotation_z: '135',
        scale: '2',
        ar_enabled: false,
        metadata: null
      })
      .returning()
      .execute();
    const artifactId = artifactResult[0].id;

    // Test with negative values and very small scale
    const updateInput: UpdateArtifactPositionInput = {
      id: artifactId,
      position_x: -100.123456,
      position_y: -50.654321,
      position_z: -25.987654,
      rotation_x: -45.0,
      rotation_y: -90.0,
      rotation_z: -180.0,
      scale: 0.01
    };

    const result = await updateArtifactPosition(updateInput);

    // Verify edge case values are handled correctly
    expect(result.position_x).toEqual(-100.123456);
    expect(result.position_y).toEqual(-50.654321);
    expect(result.position_z).toEqual(-25.987654);
    expect(result.rotation_x).toEqual(-45.0);
    expect(result.rotation_y).toEqual(-90.0);
    expect(result.rotation_z).toEqual(-180.0);
    expect(result.scale).toEqual(0.01);

    // Verify numeric type conversions
    expect(typeof result.position_x).toBe('number');
    expect(typeof result.position_y).toBe('number');
    expect(typeof result.position_z).toBe('number');
    expect(typeof result.rotation_x).toBe('number');
    expect(typeof result.rotation_y).toBe('number');
    expect(typeof result.rotation_z).toBe('number');
    expect(typeof result.scale).toBe('number');
  });
});
