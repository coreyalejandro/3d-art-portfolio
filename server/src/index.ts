
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

import { 
  createUserInputSchema,
  createPortfolioInputSchema,
  createArtifactInputSchema,
  updateArtifactPositionInputSchema,
  createCollaborationSessionInputSchema,
  joinSessionInputSchema,
  createDrawingStrokeInputSchema,
  getUserPortfoliosInputSchema,
  getPortfolioArtifactsInputSchema,
  getSessionParticipantsInputSchema,
  getSessionDrawingStrokesInputSchema
} from './schema';

import { createUser } from './handlers/create_user';
import { getUserPortfolios } from './handlers/get_user_portfolios';
import { createPortfolio } from './handlers/create_portfolio';
import { getPortfolioArtifacts } from './handlers/get_portfolio_artifacts';
import { createArtifact } from './handlers/create_artifact';
import { updateArtifactPosition } from './handlers/update_artifact_position';
import { createCollaborationSession } from './handlers/create_collaboration_session';
import { joinSession } from './handlers/join_session';
import { getSessionParticipants } from './handlers/get_session_participants';
import { createDrawingStroke } from './handlers/create_drawing_stroke';
import { getSessionDrawingStrokes } from './handlers/get_session_drawing_strokes';
import { getPublicPortfolios } from './handlers/get_public_portfolios';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // User management
  createUser: publicProcedure
    .input(createUserInputSchema)
    .mutation(({ input }) => createUser(input)),
  
  // Portfolio management
  getUserPortfolios: publicProcedure
    .input(getUserPortfoliosInputSchema)
    .query(({ input }) => getUserPortfolios(input)),
  
  createPortfolio: publicProcedure
    .input(createPortfolioInputSchema)
    .mutation(({ input }) => createPortfolio(input)),
  
  getPublicPortfolios: publicProcedure
    .query(() => getPublicPortfolios()),
  
  // Artifact management
  getPortfolioArtifacts: publicProcedure
    .input(getPortfolioArtifactsInputSchema)
    .query(({ input }) => getPortfolioArtifacts(input)),
  
  createArtifact: publicProcedure
    .input(createArtifactInputSchema)
    .mutation(({ input }) => createArtifact(input)),
  
  updateArtifactPosition: publicProcedure
    .input(updateArtifactPositionInputSchema)
    .mutation(({ input }) => updateArtifactPosition(input)),
  
  // Collaboration sessions
  createCollaborationSession: publicProcedure
    .input(createCollaborationSessionInputSchema)
    .mutation(({ input }) => createCollaborationSession(input)),
  
  joinSession: publicProcedure
    .input(joinSessionInputSchema)
    .mutation(({ input }) => joinSession(input)),
  
  getSessionParticipants: publicProcedure
    .input(getSessionParticipantsInputSchema)
    .query(({ input }) => getSessionParticipants(input)),
  
  // Drawing functionality
  createDrawingStroke: publicProcedure
    .input(createDrawingStrokeInputSchema)
    .mutation(({ input }) => createDrawingStroke(input)),
  
  getSessionDrawingStrokes: publicProcedure
    .input(getSessionDrawingStrokesInputSchema)
    .query(({ input }) => getSessionDrawingStrokes(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
