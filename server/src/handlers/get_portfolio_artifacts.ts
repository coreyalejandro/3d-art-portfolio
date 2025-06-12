
import { db } from '../db';
import { artifactsTable } from '../db/schema';
import { type GetPortfolioArtifactsInput, type Artifact } from '../schema';
import { eq } from 'drizzle-orm';

export const getPortfolioArtifacts = async (input: GetPortfolioArtifactsInput): Promise<Artifact[]> => {
  try {
    const results = await db.select()
      .from(artifactsTable)
      .where(eq(artifactsTable.portfolio_id, input.portfolio_id))
      .execute();

    // Convert numeric fields back to numbers
    return results.map(artifact => ({
      ...artifact,
      position_x: parseFloat(artifact.position_x),
      position_y: parseFloat(artifact.position_y),
      position_z: parseFloat(artifact.position_z),
      rotation_x: parseFloat(artifact.rotation_x),
      rotation_y: parseFloat(artifact.rotation_y),
      rotation_z: parseFloat(artifact.rotation_z),
      scale: parseFloat(artifact.scale),
      metadata: artifact.metadata ? JSON.parse(artifact.metadata) : null
    }));
  } catch (error) {
    console.error('Get portfolio artifacts failed:', error);
    throw error;
  }
};
