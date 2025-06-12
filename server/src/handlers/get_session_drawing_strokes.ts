
import { db } from '../db';
import { drawingStrokesTable } from '../db/schema';
import { type GetSessionDrawingStrokesInput, type DrawingStroke } from '../schema';
import { eq } from 'drizzle-orm';

export const getSessionDrawingStrokes = async (input: GetSessionDrawingStrokesInput): Promise<DrawingStroke[]> => {
  try {
    const results = await db.select()
      .from(drawingStrokesTable)
      .where(eq(drawingStrokesTable.session_id, input.session_id))
      .execute();

    // Convert numeric fields back to numbers
    return results.map(stroke => ({
      ...stroke,
      width: parseFloat(stroke.width)
    }));
  } catch (error) {
    console.error('Get session drawing strokes failed:', error);
    throw error;
  }
};
