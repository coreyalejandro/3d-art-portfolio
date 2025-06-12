
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, portfoliosTable, collaborationSessionsTable, drawingStrokesTable } from '../db/schema';
import { type GetSessionDrawingStrokesInput } from '../schema';
import { getSessionDrawingStrokes } from '../handlers/get_session_drawing_strokes';

describe('getSessionDrawingStrokes', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return drawing strokes for a session', async () => {
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
        is_public: false
      })
      .returning()
      .execute();
    const portfolioId = portfolioResult[0].id;

    // Create test collaboration session
    const sessionResult = await db.insert(collaborationSessionsTable)
      .values({
        portfolio_id: portfolioId,
        host_user_id: userId,
        title: 'Test Session',
        is_active: true,
        max_participants: 10
      })
      .returning()
      .execute();
    const sessionId = sessionResult[0].id;

    // Create test drawing strokes
    await db.insert(drawingStrokesTable)
      .values([
        {
          session_id: sessionId,
          user_id: userId,
          stroke_data: '{"points": [{"x": 0, "y": 0}, {"x": 10, "y": 10}]}',
          color: '#FF0000',
          width: '2.5'
        },
        {
          session_id: sessionId,
          user_id: userId,
          stroke_data: '{"points": [{"x": 20, "y": 20}, {"x": 30, "y": 30}]}',
          color: '#00FF00',
          width: '3.0'
        }
      ])
      .execute();

    const input: GetSessionDrawingStrokesInput = {
      session_id: sessionId
    };

    const result = await getSessionDrawingStrokes(input);

    expect(result).toHaveLength(2);
    
    // Check first stroke
    expect(result[0].session_id).toEqual(sessionId);
    expect(result[0].user_id).toEqual(userId);
    expect(result[0].stroke_data).toEqual('{"points": [{"x": 0, "y": 0}, {"x": 10, "y": 10}]}');
    expect(result[0].color).toEqual('#FF0000');
    expect(result[0].width).toEqual(2.5);
    expect(typeof result[0].width).toBe('number');
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);

    // Check second stroke
    expect(result[1].session_id).toEqual(sessionId);
    expect(result[1].user_id).toEqual(userId);
    expect(result[1].stroke_data).toEqual('{"points": [{"x": 20, "y": 20}, {"x": 30, "y": 30}]}');
    expect(result[1].color).toEqual('#00FF00');
    expect(result[1].width).toEqual(3.0);
    expect(typeof result[1].width).toBe('number');
  });

  it('should return empty array for session with no strokes', async () => {
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
        is_public: false
      })
      .returning()
      .execute();
    const portfolioId = portfolioResult[0].id;

    // Create test collaboration session
    const sessionResult = await db.insert(collaborationSessionsTable)
      .values({
        portfolio_id: portfolioId,
        host_user_id: userId,
        title: 'Test Session',
        is_active: true,
        max_participants: 10
      })
      .returning()
      .execute();
    const sessionId = sessionResult[0].id;

    const input: GetSessionDrawingStrokesInput = {
      session_id: sessionId
    };

    const result = await getSessionDrawingStrokes(input);

    expect(result).toHaveLength(0);
  });

  it('should return empty array for non-existent session', async () => {
    const input: GetSessionDrawingStrokesInput = {
      session_id: 999999
    };

    const result = await getSessionDrawingStrokes(input);

    expect(result).toHaveLength(0);
  });

  it('should only return strokes for the specified session', async () => {
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
        is_public: false
      })
      .returning()
      .execute();
    const portfolioId = portfolioResult[0].id;

    // Create two test collaboration sessions
    const sessionResults = await db.insert(collaborationSessionsTable)
      .values([
        {
          portfolio_id: portfolioId,
          host_user_id: userId,
          title: 'Test Session 1',
          is_active: true,
          max_participants: 10
        },
        {
          portfolio_id: portfolioId,
          host_user_id: userId,
          title: 'Test Session 2',
          is_active: true,
          max_participants: 10
        }
      ])
      .returning()
      .execute();
    const session1Id = sessionResults[0].id;
    const session2Id = sessionResults[1].id;

    // Create drawing strokes for both sessions
    await db.insert(drawingStrokesTable)
      .values([
        {
          session_id: session1Id,
          user_id: userId,
          stroke_data: '{"points": [{"x": 0, "y": 0}]}',
          color: '#FF0000',
          width: '2.0'
        },
        {
          session_id: session2Id,
          user_id: userId,
          stroke_data: '{"points": [{"x": 10, "y": 10}]}',
          color: '#00FF00',
          width: '3.0'
        }
      ])
      .execute();

    const input: GetSessionDrawingStrokesInput = {
      session_id: session1Id
    };

    const result = await getSessionDrawingStrokes(input);

    expect(result).toHaveLength(1);
    expect(result[0].session_id).toEqual(session1Id);
    expect(result[0].color).toEqual('#FF0000');
  });
});
