
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/utils/trpc';
import type { 
  User, 
  Portfolio, 
  CollaborationSession,
  CreateCollaborationSessionInput,
  JoinSessionInput 
} from '../../../server/src/schema';

interface CollaborationPanelProps {
  user: User;
  selectedPortfolio: Portfolio | null;
  onJoinSession: (session: CollaborationSession) => void;
}

export function CollaborationPanel({ 
  user, 
  selectedPortfolio, 
  onJoinSession 
}: CollaborationPanelProps) {
  const [activeSessions, setActiveSessions] = useState<CollaborationSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [sessionForm, setSessionForm] = useState<CreateCollaborationSessionInput>({
    portfolio_id: 0,
    host_user_id: user.id,
    title: '',
    max_participants: 10
  });

  // Load active sessions from database
  const loadActiveSessions = useCallback(async () => {
    try {
      // For now, we'll start with empty sessions since we don't have a specific endpoint
      // In a real implementation, you would fetch active sessions from the server
      setActiveSessions([]);
    } catch (error) {
      console.error('Failed to load active sessions:', error);
      setActiveSessions([]);
    }
  }, []);

  useEffect(() => {
    loadActiveSessions();
  }, [loadActiveSessions]);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPortfolio) return;

    setIsLoading(true);
    
    try {
      const sessionData = {
        ...sessionForm,
        portfolio_id: selectedPortfolio.id
      };
      
      const newSession = await trpc.createCollaborationSession.mutate(sessionData);
      setActiveSessions((prev: CollaborationSession[]) => [...prev, newSession]);
      onJoinSession(newSession);
      
      setSessionForm({
        portfolio_id: selectedPortfolio.id,
        host_user_id: user.id,
        title: '',
        max_participants: 10
      });
      setShowCreateSession(false);
    } catch (error) {
      console.error('Failed to create collaboration session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinSession = async (session: CollaborationSession) => {
    setIsLoading(true);
    
    try {
      const joinData: JoinSessionInput = {
        session_id: session.id,
        user_id: user.id
      };
      
      await trpc.joinSession.mutate(joinData);
      onJoinSession(session);
    } catch (error) {
      console.error('Failed to join session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">👥 Collaboration</h3>
        {selectedPortfolio && (
          <Dialog open={showCreateSession} onOpenChange={setShowCreateSession}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                🚀 Host Session
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Create Collaboration Session</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateSession} className="space-y-4">
                <Input
                  placeholder="Session title"
                  value={sessionForm.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSessionForm((prev: CreateCollaborationSessionInput) => ({ 
                      ...prev, 
                      title: e.target.value 
                    }))
                  }
                  className="bg-slate-800 border-slate-600 text-white"
                  required
                />
                <Input
                  type="number"
                  placeholder="Max participants"
                  value={sessionForm.max_participants}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSessionForm((prev: CreateCollaborationSessionInput) => ({ 
                      ...prev, 
                      max_participants: parseInt(e.target.value) || 10 
                    }))
                  }
                  min="2"
                  max="50"
                  className="bg-slate-800 border-slate-600 text-white"
                  required
                />
                <div className="text-sm text-gray-400">
                  Portfolio: {selectedPortfolio.title}
                </div>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? 'Creating...' : 'Create Session'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!selectedPortfolio && (
        <div className="text-center text-gray-400 py-6">
          <div className="text-4xl mb-2">👥</div>
          <p>Select a portfolio to start collaborating</p>
        </div>
      )}

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-300">Active Sessions</h4>
        
        {activeSessions.length === 0 ? (
          <div className="text-center text-gray-400 py-4">
            <div className="text-2xl mb-2">🔍</div>
            <p className="text-sm">No active sessions</p>
            <p className="text-xs">Create one to get started!</p>
          </div>
        ) : (
          activeSessions.map((session: CollaborationSession) => (
            <Card key={session.id} className="bg-white/5 border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-white">{session.title}</h4>
                      <Badge variant="secondary" className="bg-green-600/20 text-green-300">
                        🟢 Live
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <span>🏛️ Portfolio #{session.portfolio_id}</span>
                      <span>👤 Host: User #{session.host_user_id}</span>
                      <span>👥 Max: {session.max_participants}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleJoinSession(session)}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? '...' : '🚪 Join'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="border-t border-white/20 pt-4">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Collaboration Features</h4>
        <div className="space-y-2 text-xs text-gray-400">
          <div className="flex items-center space-x-2">
            <span>🎨</span>
            <span>Real-time collaborative drawing</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>👀</span>
            <span>Shared 3D gallery navigation</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>💬</span>
            <span>Live participant tracking</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>📱</span>
            <span>AR artifact sharing</span>
          </div>
        </div>
      </div>
    </div>
  );
}
