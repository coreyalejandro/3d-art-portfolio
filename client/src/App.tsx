
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/utils/trpc';
import { Gallery3D } from '@/components/Gallery3D';
import { PortfolioManager } from '@/components/PortfolioManager';
import { CollaborationPanel } from '@/components/CollaborationPanel';
import { AuthPanel } from '@/components/AuthPanel';
import { ArtifactDetailModal } from '@/components/ArtifactDetailModal';
import type { User, Portfolio, Artifact, CollaborationSession } from '../../server/src/schema';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [portfolioArtifacts, setPortfolioArtifacts] = useState<Artifact[]>([]);
  const [publicPortfolios, setPublicPortfolios] = useState<Portfolio[]>([]);
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
  const [currentSession, setCurrentSession] = useState<CollaborationSession | null>(null);
  const [view3DMode, setView3DMode] = useState(false);

  const loadPublicPortfolios = useCallback(async () => {
    try {
      const portfolios = await trpc.getPublicPortfolios.query();
      setPublicPortfolios(portfolios);
    } catch (error) {
      console.error('Failed to load public portfolios:', error);
    }
  }, []);

  const loadPortfolioArtifacts = useCallback(async (portfolioId: number) => {
    try {
      const artifacts = await trpc.getPortfolioArtifacts.query({ portfolio_id: portfolioId });
      setPortfolioArtifacts(artifacts);
    } catch (error) {
      console.error('Failed to load portfolio artifacts:', error);
    }
  }, []);

  useEffect(() => {
    loadPublicPortfolios();
  }, [loadPublicPortfolios]);

  useEffect(() => {
    if (selectedPortfolio) {
      loadPortfolioArtifacts(selectedPortfolio.id);
    }
  }, [selectedPortfolio, loadPortfolioArtifacts]);

  const handlePortfolioSelect = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio);
    setView3DMode(true);
  };

  const handleArtifactSelect = (artifact: Artifact) => {
    setSelectedArtifact(artifact);
  };

  const handleJoinSession = (session: CollaborationSession) => {
    setCurrentSession(session);
  };

  const handleUserLogin = (user: User) => {
    setCurrentUser(user);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">🎨 ArtSpace 3D</h1>
            <p className="text-blue-200">Immersive 3D Art Gallery & Collaborative Studio</p>
          </div>
          <AuthPanel onUserLogin={handleUserLogin} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white">🎨 ArtSpace 3D</h1>
            <div className="text-blue-300">
              Welcome, {currentUser.display_name}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {selectedPortfolio && (
              <Button
                variant={view3DMode ? "default" : "outline"}
                onClick={() => setView3DMode(!view3DMode)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {view3DMode ? "📋 Portfolio View" : "🌐 3D Gallery"}
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className="w-80 bg-black/30 backdrop-blur-sm border-r border-white/10 overflow-y-auto">
          <Tabs defaultValue="browse" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-black/20">
              <TabsTrigger value="browse">🏛️ Browse</TabsTrigger>
              <TabsTrigger value="portfolio">📁 My Work</TabsTrigger>
              <TabsTrigger value="collaborate">👥 Collab</TabsTrigger>
            </TabsList>
            
            <TabsContent value="browse" className="p-4 space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Public Galleries</h3>
              <div className="space-y-2">
                {publicPortfolios.map((portfolio: Portfolio) => (
                  <Card 
                    key={portfolio.id}
                    className="p-3 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors border-white/20"
                    onClick={() => handlePortfolioSelect(portfolio)}
                  >
                    <h4 className="font-medium text-white">{portfolio.title}</h4>
                    {portfolio.description && (
                      <p className="text-sm text-gray-300 mt-1">{portfolio.description}</p>
                    )}
                    <p className="text-xs text-blue-300 mt-2">
                      Created: {portfolio.created_at.toLocaleDateString()}
                    </p>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="portfolio" className="p-4">
              <PortfolioManager 
                user={currentUser}
                onPortfolioSelect={handlePortfolioSelect}
              />
            </TabsContent>
            
            <TabsContent value="collaborate" className="p-4">
              <CollaborationPanel
                user={currentUser}
                selectedPortfolio={selectedPortfolio}
                onJoinSession={handleJoinSession}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Content */}
        <div className="flex-1 relative">
          {selectedPortfolio && view3DMode ? (
            <Gallery3D
              portfolio={selectedPortfolio}
              artifacts={portfolioArtifacts}
              onArtifactSelect={handleArtifactSelect}
              currentSession={currentSession}
              currentUser={currentUser}
            />
          ) : selectedPortfolio ? (
            <div className="p-6 overflow-y-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">{selectedPortfolio.title}</h2>
                {selectedPortfolio.description && (
                  <p className="text-gray-300 mb-4">{selectedPortfolio.description}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolioArtifacts.map((artifact: Artifact) => (
                  <Card 
                    key={artifact.id}
                    className="bg-white/5 border-white/20 hover:bg-white/10 cursor-pointer transition-colors"
                    onClick={() => handleArtifactSelect(artifact)}
                  >
                    <div className="p-4">
                      {artifact.thumbnail_url && (
                        <img 
                          src={artifact.thumbnail_url} 
                          alt={artifact.title}
                          className="w-full h-32 object-cover rounded mb-3"
                        />
                      )}
                      <h3 className="font-semibold text-white mb-2">{artifact.title}</h3>
                      {artifact.description && (
                        <p className="text-sm text-gray-300 mb-2">{artifact.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                          {artifact.type.replace('_', ' ')}
                        </span>
                        {artifact.ar_enabled && (
                          <span className="text-xs text-purple-300">📱 AR Ready</span>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-white">
                <div className="text-6xl mb-4">🏛️</div>
                <h2 className="text-2xl font-bold mb-2">Welcome to ArtSpace 3D</h2>
                <p className="text-gray-300 mb-6">Select a portfolio to explore in immersive 3D</p>
                <div className="space-y-2 text-sm text-gray-400">
                  <p>🌐 Navigate 3D galleries</p>
                  <p>👥 Collaborate in real-time</p>
                  <p>📱 Experience AR artifacts</p>
                  <p>🎨 Create and share your work</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Artifact Detail Modal */}
      {selectedArtifact && (
        <ArtifactDetailModal
          artifact={selectedArtifact}
          onClose={() => setSelectedArtifact(null)}
        />
      )}
    </div>
  );
}

export default App;
