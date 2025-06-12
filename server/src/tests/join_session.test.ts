
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, portfoliosTable, collaborationSessionsTable, sessionParticipantsTable } from '../db/schema';
import { type JoinSessionInput } from '../schema';
import { joinSession } from '../handlers/join_session';
import { eq, and } from 'drizzle-orm';

// Test data
const testUser = {
  email: 'test@example.com',
  username: 'testuser',
  display_name: 'Test User'
};

const testHost = {
  email: 'host@example.com',
  username: 'hostuser',
  display_name: 'Host User'
};

const testPortfolio = {
  title: 'Test Portfolio',
  description: 'A portfolio for testing',
  is_public: true
};

const testSession = {
  title: 'Test Session',
  max_participants: 10
};

describe('joinSession', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should add user to active collaboration session', async () => {
    // Create host user
    const [host] = await db.insert(usersTable)
      .values(testHost)
      .returning()
      .execute();

    // Create participant user
    const [user] = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();

    // Create portfolio
    const [portfolio] = await db.insert(portfoliosTable)
      .values({
        ...testPortfolio,
        user_id: host.id
      })
      .returning()
      .execute();

    // Create collaboration session
    const [session] = await db.insert(collaborationSessionsTable)
      .values({
        ...testSession,
        portfolio_id: portfolio.id,
        host_user_id: host.id
      })
      .returning()
      .execute();

    const input: JoinSessionInput = {
      session_id: session.id,
      user_id: user.id
    };

    const result = await joinSession(input);

    // Verify participant record
    expect(result.session_id).toEqual(session.id);
    expect(result.user_id).toEqual(user.id);
    expect(result.is_active).toBe(true);
    expect(result.joined_at).toBeInstanceOf(Date);
    expect(result.left_at).toBeNull();
    expect(result.id).toBeDefined();
  });

  it('should save participant to database', async () => {
    // Create host user
    const [host] = await db.insert(usersTable)
      .values(testHost)
      .returning()
      .execute();

    // Create participant user
    const [user] = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();

    // Create portfolio
    const [portfolio] = await db.insert(portfoliosTable)
      .values({
        ...testPortfolio,
        user_id: host.id
      })
      .returning()
      .execute();

    // Create collaboration session
    const [session] = await db.insert(collaborationSessionsTable)
      .values({
        ...testSession,
        portfolio_id: portfolio.id,
        host_user_id: host.id
      })
      .returning()
      .execute();

    const input: JoinSessionInput = {
      session_id: session.id,
      user_id: user.id
    };

    const result = await joinSession(input);

    // Query database to verify participant was saved
    const participants = await db.select()
      .from(sessionParticipantsTable)
      .where(eq(sessionParticipantsTable.id, result.id))
      .execute();

    expect(participants).toHaveLength(1);
    expect(participants[0].session_id).toEqual(session.id);
    expect(participants[0].user_id).toEqual(user.id);
    expect(participants[0].is_active).toBe(true);
  });

  it('should return existing participant if user already joined', async () => {
    // Create host user
    const [host] = await db.insert(usersTable)
      .values(testHost)
      .returning()
      .execute();

    // Create participant user
    const [user] = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();

    // Create portfolio
    const [portfolio] = await db.insert(portfoliosTable)
      .values({
        ...testPortfolio,
        user_id: host.id
      })
      .returning()
      .execute();

    // Create collaboration session
    const [session] = await db.insert(collaborationSessionsTable)
      .values({
        ...testSession,
        portfolio_id: portfolio.id,
        host_user_id: host.id
      })
      .returning()
      .execute();

    const input: JoinSessionInput = {
      session_id: session.id,
      user_id: user.id
    };

    // Join session first time
    const firstResult = await joinSession(input);

    // Join session second time
    const secondResult = await joinSession(input);

    // Should return the same participant record
    expect(secondResult.id).toEqual(firstResult.id);
    expect(secondResult.session_id).toEqual(session.id);
    expect(secondResult.user_id).toEqual(user.id);
    expect(secondResult.is_active).toBe(true);
  });

  it('should throw error for non-existent session', async () => {
    // Create user
    const [user] = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();

    const input: JoinSessionInput = {
      session_id: 999999, // Non-existent session ID
      user_id: user.id
    };

    await expect(joinSession(input)).rejects.toThrow(/session not found/i);
  });

  it('should throw error for inactive session', async () => {
    // Create host user
    const [host] = await db.insert(usersTable)
      .values(testHost)
      .returning()
      .execute();

    // Create participant user
    const [user] = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();

    // Create portfolio
    const [portfolio] = await db.insert(portfoliosTable)
      .values({
        ...testPortfolio,
        user_id: host.id
      })
      .returning()
      .execute();

    // Create inactive collaboration session
    const [session] = await db.insert(collaborationSessionsTable)
      .values({
        ...testSession,
        portfolio_id: portfolio.id,
        host_user_id: host.id,
        is_active: false
      })
      .returning()
      .execute();

    const input: JoinSessionInput = {
      session_id: session.id,
      user_id: user.id
    };

    await expect(joinSession(input)).rejects.toThrow(/session is not active/i);
  });
});
