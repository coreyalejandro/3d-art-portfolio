
import { db } from '../db';
import { artifactsTable } from '../db/schema';
import { type UpdateArtifactPositionInput, type Artifact } from '../schema';
import { eq } from 'drizzle-orm';

export const updateArtifactPosition = async (input: UpdateArtifactPositionInput): Promise<Artifact> => {
  try {
    // Update artifact position and spatial properties
    const result = await db.update(artifactsTable)
      .set({
        position_x: input.position_x.toString(),
        position_y: input.position_y.toString(),
        position_z: input.position_z.toString(),
        rotation_x: input.rotation_x.toString(),
        rotation_y: input.rotation_y.toString(),
        rotation_z: input.rotation_z.toString(),
        scale: input.scale.toString(),
        updated_at: new Date()
      })
      .where(eq(artifactsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Artifact with id ${input.id} not found`);
    }

    // Convert numeric fields back to numbers before returning
    const artifact = result[0];
    return {
      ...artifact,
      position_x: parseFloat(artifact.position_x),
      position_y: parseFloat(artifact.position_y),
      position_z: parseFloat(artifact.position_z),
      rotation_x: parseFloat(artifact.rotation_x),
      rotation_y: parseFloat(artifact.rotation_y),
      rotation_z: parseFloat(artifact.rotation_z),
      scale: parseFloat(artifact.scale),
      metadata: artifact.metadata ? JSON.parse(artifact.metadata) : null
    };
  } catch (error) {
    console.error('Artifact position update failed:', error);
    throw error;
  }
};
