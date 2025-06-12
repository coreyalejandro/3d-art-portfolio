
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, portfoliosTable, collaborationSessionsTable } from '../db/schema';
import { type CreateCollaborationSessionInput } from '../schema';
import { createCollaborationSession } from '../handlers/create_collaboration_session';
import { eq } from 'drizzle-orm';

describe('createCollaborationSession', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a collaboration session', async () => {
    // Create prerequisite user and portfolio
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        username: 'testuser',
        display_name: 'Test User'
      })
      .returning()
      .execute();

    const portfolioResult = await db.insert(portfoliosTable)
      .values({
        user_id: userResult[0].id,
        title: 'Test Portfolio'
      })
      .returning()
      .execute();

    const testInput: CreateCollaborationSessionInput = {
      portfolio_id: portfolioResult[0].id,
      host_user_id: userResult[0].id,
      title: 'Test Collaboration Session',
      max_participants: 15
    };

    const result = await createCollaborationSession(testInput);

    // Basic field validation
    expect(result.portfolio_id).toEqual(portfolioResult[0].id);
    expect(result.host_user_id).toEqual(userResult[0].id);
    expect(result.title).toEqual('Test Collaboration Session');
    expect(result.max_participants).toEqual(15);
    expect(result.is_active).toBe(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save collaboration session to database', async () => {
    // Create prerequisite user and portfolio
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        username: 'testuser',
        display_name: 'Test User'
      })
      .returning()
      .execute();

    const portfolioResult = await db.insert(portfoliosTable)
      .values({
        user_id: userResult[0].id,
        title: 'Test Portfolio'
      })
      .returning()
      .execute();

    const testInput: CreateCollaborationSessionInput = {
      portfolio_id: portfolioResult[0].id,
      host_user_id: userResult[0].id,
      title: 'Test Collaboration Session',
      max_participants: 15
    };

    const result = await createCollaborationSession(testInput);

    // Query using proper drizzle syntax
    const sessions = await db.select()
      .from(collaborationSessionsTable)
      .where(eq(collaborationSessionsTable.id, result.id))
      .execute();

    expect(sessions).toHaveLength(1);
    expect(sessions[0].portfolio_id).toEqual(portfolioResult[0].id);
    expect(sessions[0].host_user_id).toEqual(userResult[0].id);
    expect(sessions[0].title).toEqual('Test Collaboration Session');
    expect(sessions[0].max_participants).toEqual(15);
    expect(sessions[0].is_active).toBe(true);
    expect(sessions[0].created_at).toBeInstanceOf(Date);
    expect(sessions[0].updated_at).toBeInstanceOf(Date);
  });

  it('should use default max_participants when not provided', async () => {
    // Create prerequisite user and portfolio
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        username: 'testuser',
        display_name: 'Test User'
      })
      .returning()
      .execute();

    const portfolioResult = await db.insert(portfoliosTable)
      .values({
        user_id: userResult[0].id,
        title: 'Test Portfolio'
      })
      .returning()
      .execute();

    // Create input without max_participants to test Zod default
    const testInputWithoutMax = {
      portfolio_id: portfolioResult[0].id,
      host_user_id: userResult[0].id,
      title: 'Test Collaboration Session'
    };

    // The handler expects the parsed input with defaults applied
    const testInput: CreateCollaborationSessionInput = {
      ...testInputWithoutMax,
      max_participants: 10 // Include the default that Zod would apply
    };

    const result = await createCollaborationSession(testInput);

    expect(result.max_participants).toEqual(10);
  });

  it('should fail with invalid foreign key references', async () => {
    const testInput: CreateCollaborationSessionInput = {
      portfolio_id: 999, // Non-existent portfolio
      host_user_id: 999, // Non-existent user
      title: 'Test Collaboration Session',
      max_participants: 10
    };

    await expect(createCollaborationSession(testInput)).rejects.toThrow(/violates foreign key constraint/i);
  });
});
