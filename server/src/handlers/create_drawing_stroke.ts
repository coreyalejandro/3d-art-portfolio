
import { db } from '../db';
import { drawingStrokesTable } from '../db/schema';
import { type CreateDrawingStrokeInput, type DrawingStroke } from '../schema';

export const createDrawingStroke = async (input: CreateDrawingStrokeInput): Promise<DrawingStroke> => {
  try {
    // Insert drawing stroke record
    const result = await db.insert(drawingStrokesTable)
      .values({
        session_id: input.session_id,
        user_id: input.user_id,
        stroke_data: input.stroke_data,
        color: input.color,
        width: input.width.toString() // Convert number to string for numeric column
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const stroke = result[0];
    return {
      ...stroke,
      width: parseFloat(stroke.width) // Convert string back to number
    };
  } catch (error) {
    console.error('Drawing stroke creation failed:', error);
    throw error;
  }
};
