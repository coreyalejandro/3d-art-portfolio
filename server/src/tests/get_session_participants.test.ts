
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, portfoliosTable, collaborationSessionsTable, sessionParticipantsTable } from '../db/schema';
import { type CreateUserInput, type CreatePortfolioInput, type CreateCollaborationSessionInput, type JoinSessionInput } from '../schema';
import { getSessionParticipants } from '../handlers/get_session_participants';

describe('getSessionParticipants', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return participants for a session', async () => {
    // Create test user
    const userData: CreateUserInput = {
      email: 'host@example.com',
      username: 'hostuser',
      display_name: 'Host User'
    };

    const userResult = await db.insert(usersTable)
      .values(userData)
      .returning()
      .execute();
    const hostUser = userResult[0];

    // Create test portfolio
    const portfolioData: CreatePortfolioInput = {
      user_id: hostUser.id,
      title: 'Test Portfolio',
      is_public: true
    };

    const portfolioResult = await db.insert(portfoliosTable)
      .values(portfolioData)
      .returning()
      .execute();
    const portfolio = portfolioResult[0];

    // Create collaboration session
    const sessionData: CreateCollaborationSessionInput = {
      portfolio_id: portfolio.id,
      host_user_id: hostUser.id,
      title: 'Test Session',
      max_participants: 5
    };

    const sessionResult = await db.insert(collaborationSessionsTable)
      .values(sessionData)
      .returning()
      .execute();
    const session = sessionResult[0];

    // Create another user to join session
    const participantData: CreateUserInput = {
      email: 'participant@example.com',
      username: 'participant1',
      display_name: 'Participant User'
    };

    const participantResult = await db.insert(usersTable)
      .values(participantData)
      .returning()
      .execute();
    const participant = participantResult[0];

    // Add participants to session
    const joinData: JoinSessionInput = {
      session_id: session.id,
      user_id: participant.id
    };

    await db.insert(sessionParticipantsTable)
      .values({
        session_id: joinData.session_id,
        user_id: joinData.user_id,
        is_active: true
      })
      .execute();

    // Test the handler
    const result = await getSessionParticipants({ session_id: session.id });

    expect(result).toHaveLength(1);
    expect(result[0].session_id).toEqual(session.id);
    expect(result[0].user_id).toEqual(participant.id);
    expect(result[0].is_active).toBe(true);
    expect(result[0].joined_at).toBeInstanceOf(Date);
    expect(result[0].left_at).toBeNull();
    expect(result[0].id).toBeDefined();
  });

  it('should return empty array for session with no participants', async () => {
    // Create test user
    const userData: CreateUserInput = {
      email: 'host@example.com',
      username: 'hostuser',
      display_name: 'Host User'
    };

    const userResult = await db.insert(usersTable)
      .values(userData)
      .returning()
      .execute();
    const hostUser = userResult[0];

    // Create test portfolio
    const portfolioData: CreatePortfolioInput = {
      user_id: hostUser.id,
      title: 'Test Portfolio',
      is_public: true
    };

    const portfolioResult = await db.insert(portfoliosTable)
      .values(portfolioData)
      .returning()
      .execute();
    const portfolio = portfolioResult[0];

    // Create collaboration session
    const sessionData: CreateCollaborationSessionInput = {
      portfolio_id: portfolio.id,
      host_user_id: hostUser.id,
      title: 'Empty Session',
      max_participants: 10
    };

    const sessionResult = await db.insert(collaborationSessionsTable)
      .values(sessionData)
      .returning()
      .execute();
    const session = sessionResult[0];

    // Test the handler
    const result = await getSessionParticipants({ session_id: session.id });

    expect(result).toHaveLength(0);
  });

  it('should return multiple participants for session', async () => {
    // Create host user
    const hostData: CreateUserInput = {
      email: 'host@example.com',
      username: 'hostuser',
      display_name: 'Host User'
    };

    const hostResult = await db.insert(usersTable)
      .values(hostData)
      .returning()
      .execute();
    const host = hostResult[0];

    // Create portfolio
    const portfolioData: CreatePortfolioInput = {
      user_id: host.id,
      title: 'Test Portfolio',
      is_public: true
    };

    const portfolioResult = await db.insert(portfoliosTable)
      .values(portfolioData)
      .returning()
      .execute();
    const portfolio = portfolioResult[0];

    // Create session
    const sessionData: CreateCollaborationSessionInput = {
      portfolio_id: portfolio.id,
      host_user_id: host.id,
      title: 'Multi-user Session',
      max_participants: 10
    };

    const sessionResult = await db.insert(collaborationSessionsTable)
      .values(sessionData)
      .returning()
      .execute();
    const session = sessionResult[0];

    // Create multiple participants
    const participant1Data: CreateUserInput = {
      email: 'participant1@example.com',
      username: 'participant1',
      display_name: 'First Participant'
    };

    const participant2Data: CreateUserInput = {
      email: 'participant2@example.com',
      username: 'participant2',
      display_name: 'Second Participant'
    };

    const participant1Result = await db.insert(usersTable)
      .values(participant1Data)
      .returning()
      .execute();
    const participant1 = participant1Result[0];

    const participant2Result = await db.insert(usersTable)
      .values(participant2Data)
      .returning()
      .execute();
    const participant2 = participant2Result[0];

    // Add both participants to session
    await db.insert(sessionParticipantsTable)
      .values([
        {
          session_id: session.id,
          user_id: participant1.id,
          is_active: true
        },
        {
          session_id: session.id,
          user_id: participant2.id,
          is_active: false // One inactive participant
        }
      ])
      .execute();

    // Test the handler
    const result = await getSessionParticipants({ session_id: session.id });

    expect(result).toHaveLength(2);
    
    // Find each participant in results
    const p1Result = result.find(p => p.user_id === participant1.id);
    const p2Result = result.find(p => p.user_id === participant2.id);

    expect(p1Result).toBeDefined();
    expect(p1Result!.is_active).toBe(true);
    expect(p1Result!.joined_at).toBeInstanceOf(Date);

    expect(p2Result).toBeDefined();
    expect(p2Result!.is_active).toBe(false);
    expect(p2Result!.joined_at).toBeInstanceOf(Date);
  });
});
