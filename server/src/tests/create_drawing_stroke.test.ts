
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, portfoliosTable, collaborationSessionsTable, drawingStrokesTable } from '../db/schema';
import { type CreateDrawingStrokeInput } from '../schema';
import { createDrawingStroke } from '../handlers/create_drawing_stroke';
import { eq } from 'drizzle-orm';

// Test data
const testUser = {
  email: 'test@example.com',
  username: 'testuser',
  display_name: 'Test User'
};

const testPortfolio = {
  title: 'Test Portfolio',
  description: 'A portfolio for testing',
  is_public: false
};

const testSession = {
  title: 'Test Session',
  max_participants: 10
};

const testInput: CreateDrawingStrokeInput = {
  session_id: 1,
  user_id: 1,
  stroke_data: '{"points":[{"x":10,"y":20},{"x":30,"y":40}]}',
  color: '#FF0000',
  width: 5.5
};

describe('createDrawingStroke', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a drawing stroke', async () => {
    // Create prerequisite data
    const user = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();

    const portfolio = await db.insert(portfoliosTable)
      .values({
        ...testPortfolio,
        user_id: user[0].id
      })
      .returning()
      .execute();

    const session = await db.insert(collaborationSessionsTable)
      .values({
        ...testSession,
        portfolio_id: portfolio[0].id,
        host_user_id: user[0].id
      })
      .returning()
      .execute();

    const input = {
      ...testInput,
      session_id: session[0].id,
      user_id: user[0].id
    };

    const result = await createDrawingStroke(input);

    // Basic field validation
    expect(result.session_id).toEqual(session[0].id);
    expect(result.user_id).toEqual(user[0].id);
    expect(result.stroke_data).toEqual('{"points":[{"x":10,"y":20},{"x":30,"y":40}]}');
    expect(result.color).toEqual('#FF0000');
    expect(result.width).toEqual(5.5);
    expect(typeof result.width).toBe('number');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save drawing stroke to database', async () => {
    // Create prerequisite data
    const user = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();

    const portfolio = await db.insert(portfoliosTable)
      .values({
        ...testPortfolio,
        user_id: user[0].id
      })
      .returning()
      .execute();

    const session = await db.insert(collaborationSessionsTable)
      .values({
        ...testSession,
        portfolio_id: portfolio[0].id,
        host_user_id: user[0].id
      })
      .returning()
      .execute();

    const input = {
      ...testInput,
      session_id: session[0].id,
      user_id: user[0].id
    };

    const result = await createDrawingStroke(input);

    // Query from database to verify
    const strokes = await db.select()
      .from(drawingStrokesTable)
      .where(eq(drawingStrokesTable.id, result.id))
      .execute();

    expect(strokes).toHaveLength(1);
    expect(strokes[0].session_id).toEqual(session[0].id);
    expect(strokes[0].user_id).toEqual(user[0].id);
    expect(strokes[0].stroke_data).toEqual('{"points":[{"x":10,"y":20},{"x":30,"y":40}]}');
    expect(strokes[0].color).toEqual('#FF0000');
    expect(parseFloat(strokes[0].width)).toEqual(5.5);
    expect(strokes[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle different color formats', async () => {
    // Create prerequisite data
    const user = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();

    const portfolio = await db.insert(portfoliosTable)
      .values({
        ...testPortfolio,
        user_id: user[0].id
      })
      .returning()
      .execute();

    const session = await db.insert(collaborationSessionsTable)
      .values({
        ...testSession,
        portfolio_id: portfolio[0].id,
        host_user_id: user[0].id
      })
      .returning()
      .execute();

    const blueStroke = {
      ...testInput,
      session_id: session[0].id,
      user_id: user[0].id,
      color: '#0066FF',
      width: 2.25
    };

    const result = await createDrawingStroke(blueStroke);

    expect(result.color).toEqual('#0066FF');
    expect(result.width).toEqual(2.25);
    expect(typeof result.width).toBe('number');
  });

  it('should throw error for non-existent session', async () => {
    const invalidInput = {
      ...testInput,
      session_id: 999999
    };

    await expect(createDrawingStroke(invalidInput)).rejects.toThrow(/violates foreign key constraint/i);
  });

  it('should throw error for non-existent user', async () => {
    // Create prerequisite data
    const user = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();

    const portfolio = await db.insert(portfoliosTable)
      .values({
        ...testPortfolio,
        user_id: user[0].id
      })
      .returning()
      .execute();

    const session = await db.insert(collaborationSessionsTable)
      .values({
        ...testSession,
        portfolio_id: portfolio[0].id,
        host_user_id: user[0].id
      })
      .returning()
      .execute();

    const invalidInput = {
      ...testInput,
      session_id: session[0].id,
      user_id: 999999
    };

    await expect(createDrawingStroke(invalidInput)).rejects.toThrow(/violates foreign key constraint/i);
  });
});
