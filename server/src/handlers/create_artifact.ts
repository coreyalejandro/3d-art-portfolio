
import { db } from '../db';
import { artifactsTable } from '../db/schema';
import { type CreateArtifactInput, type Artifact } from '../schema';

export const createArtifact = async (input: CreateArtifactInput): Promise<Artifact> => {
  try {
    // Insert artifact record
    const result = await db.insert(artifactsTable)
      .values({
        portfolio_id: input.portfolio_id,
        title: input.title,
        description: input.description,
        type: input.type,
        file_url: input.file_url,
        thumbnail_url: input.thumbnail_url,
        position_x: input.position_x.toString(),
        position_y: input.position_y.toString(),
        position_z: input.position_z.toString(),
        rotation_x: input.rotation_x.toString(),
        rotation_y: input.rotation_y.toString(),
        rotation_z: input.rotation_z.toString(),
        scale: input.scale.toString(),
        ar_enabled: input.ar_enabled,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null
      })
      .returning()
      .execute();

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
    console.error('Artifact creation failed:', error);
    throw error;
  }
};
