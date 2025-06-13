
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { trpc } from '@/utils/trpc';
import { toast } from 'sonner';
import type { 
  User, 
  Portfolio, 
  Artifact,
  CreatePortfolioInput, 
  CreateArtifactInput,
  ArtifactType 
} from '../../../server/src/schema';

interface PortfolioManagerProps {
  user: User;
  onPortfolioSelect: (portfolio: Portfolio) => void;
}

export function PortfolioManager({ user, onPortfolioSelect }: PortfolioManagerProps) {
  const [userPortfolios, setUserPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [portfolioArtifacts, setPortfolioArtifacts] = useState<Artifact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreatePortfolio, setShowCreatePortfolio] = useState(false);
  const [showCreateArtifact, setShowCreateArtifact] = useState(false);

  const [portfolioForm, setPortfolioForm] = useState<CreatePortfolioInput>({
    user_id: user.id,
    title: '',
    description: null,
    is_public: false
  });

  const [artifactForm, setArtifactForm] = useState<CreateArtifactInput>({
    portfolio_id: 0,
    title: '',
    description: null,
    type: 'data_visualization',
    file_url: '',
    thumbnail_url: undefined,
    position_x: 0,
    position_y: 2,
    position_z: 0,
    rotation_x: 0,
    rotation_y: 0,
    rotation_z: 0,
    scale: 1,
    ar_enabled: false,
    metadata: null
  });

  const loadUserPortfolios = useCallback(async () => {
    try {
      const portfolios = await trpc.getUserPortfolios.query({ user_id: user.id });
      setUserPortfolios(portfolios);
      if (portfolios.length > 0) {
        toast.success(`Loaded ${portfolios.length} portfolios`);
      }
    } catch (error) {
      console.error('Failed to load user portfolios:', error);
      toast.error('Failed to load user portfolios');
    }
  }, [user.id]);

  const loadPortfolioArtifacts = useCallback(async (portfolioId: number) => {
    try {
      const artifacts = await trpc.getPortfolioArtifacts.query({ portfolio_id: portfolioId });
      setPortfolioArtifacts(artifacts);
      toast.success(`Loaded ${artifacts.length} artifacts`);
    } catch (error) {
      console.error('Failed to load portfolio artifacts:', error);
      toast.error('Failed to load portfolio artifacts');
    }
  }, []);

  useEffect(() => {
    loadUserPortfolios();
  }, [loadUserPortfolios]);

  useEffect(() => {
    if (selectedPortfolio) {
      loadPortfolioArtifacts(selectedPortfolio.id);
    }
  }, [selectedPortfolio, loadPortfolioArtifacts]);

  const handleCreatePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const newPortfolio = await trpc.createPortfolio.mutate(portfolioForm);
      setUserPortfolios((prev: Portfolio[]) => [...prev, newPortfolio]);
      setPortfolioForm({
        user_id: user.id,
        title: '',
        description: null,
        is_public: false
      });
      setShowCreatePortfolio(false);
      toast.success(`Created portfolio: ${newPortfolio.title}`);
    } catch (error) {
      console.error('Failed to create portfolio:', error);
      toast.error('Failed to create portfolio');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateArtifact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPortfolio) return;
    
    setIsLoading(true);
    
    try {
      const artifactData = {
        ...artifactForm,
        portfolio_id: selectedPortfolio.id,
        // Generate random position in gallery space
        position_x: (Math.random() - 0.5) * 20,
        position_z: (Math.random() - 0.5) * 20
      };
      
      const newArtifact = await trpc.createArtifact.mutate(artifactData);
      setPortfolioArtifacts((prev: Artifact[]) => [...prev, newArtifact]);
      setArtifactForm({
        portfolio_id: selectedPortfolio.id,
        title: '',
        description: null,
        type: 'data_visualization',
        file_url: '',
        thumbnail_url: undefined,
        position_x: 0,
        position_y: 2,
        position_z: 0,
        rotation_x: 0,
        rotation_y: 0,
        rotation_z: 0,
        scale: 1,
        ar_enabled: false,
        metadata: null
      });
      setShowCreateArtifact(false);
      toast.success(`Added artifact: ${newArtifact.title}`);
    } catch (error) {
      console.error('Failed to create artifact:', error);
      toast.error('Failed to create artifact');
    } finally {
      setIsLoading(false);
    }
  };

  const artifactTypes: ArtifactType[] = [
    'data_visualization',
    'ml_notebook', 
    'web_application',
    'image',
    'document'
  ];

  const getArtifactTypeLabel = (type: ArtifactType): string => {
    switch (type) {
      case 'data_visualization': return '📊 Data Visualization';
      case 'ml_notebook': return '🤖 ML Notebook';
      case 'web_application': return '🌐 Web Application';
      case 'image': return '🖼️ Image';
      case 'document': return '📄 Document';
      default: return type;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">My Portfolios</h3>
        <Dialog open={showCreatePortfolio} onOpenChange={setShowCreatePortfolio}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
              ➕ New Portfolio
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Portfolio</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreatePortfolio} className="space-y-4">
              <Input
                placeholder="Portfolio title"
                value={portfolioForm.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPortfolioForm((prev: CreatePortfolioInput) => ({ ...prev, title: e.target.value }))
                }
                className="bg-slate-800 border-slate-600 text-white"
                required
              />
              <Textarea
                placeholder="Description (optional)"
                value={portfolioForm.description || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setPortfolioForm((prev: CreatePortfolioInput) => ({ 
                    ...prev, 
                    description: e.target.value || null 
                  }))
                }
                className="bg-slate-800 border-slate-600 text-white"
              />
              <div className="flex items-center space-x-2">
                <Switch
                  id="public"
                  checked={portfolioForm.is_public}
                  onCheckedChange={(checked: boolean) =>
                    setPortfolioForm((prev: CreatePortfolioInput) => ({ ...prev, is_public: checked }))
                  }
                />
                <Label htmlFor="public" className="text-white">Make portfolio public</Label>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Creating...' : 'Create Portfolio'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {userPortfolios.map((portfolio: Portfolio) => (
          <Card 
            key={portfolio.id}
            className={`p-3 cursor-pointer transition-colors border-white/20 ${
              selectedPortfolio?.id === portfolio.id 
                ? 'bg-purple-600/20 border-purple-400' 
                : 'bg-white/5 hover:bg-white/10'
            }`}
            onClick={() => setSelectedPortfolio(portfolio)}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-white">{portfolio.title}</h4>
                {portfolio.description && (
                  <p className="text-sm text-gray-300 mt-1">{portfolio.description}</p>
                )}
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    portfolio.is_public ? 'bg-green-600' : 'bg-gray-600'
                  }`}>
                    {portfolio.is_public ? '🌐 Public' : '🔒 Private'}
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onPortfolioSelect(portfolio);
                }}
                className="border-white/30 text-white hover:bg-white/10"
              >
                🌐 View 3D
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {selectedPortfolio && (
        <div className="border-t border-white/20 pt-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-white">
              Artifacts in "{selectedPortfolio.title}"
            </h4>
            <Dialog open={showCreateArtifact} onOpenChange={setShowCreateArtifact}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="border-white/30 text-white">
                  ➕ Add Artifact
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Add New Artifact</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateArtifact} className="space-y-4">
                  <Input
                    placeholder="Artifact title"
                    value={artifactForm.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setArtifactForm((prev: CreateArtifactInput) => ({ ...prev, title: e.target.value }))
                    }
                    className="bg-slate-800 border-slate-600 text-white"
                    required
                  />
                  <Textarea
                    placeholder="Description (optional)"
                    value={artifactForm.description || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setArtifactForm((prev: CreateArtifactInput) => ({ 
                        ...prev, 
                        description: e.target.value || null 
                      }))
                    }
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                  <Select
                    value={artifactForm.type || 'data_visualization'}
                    onValueChange={(value: ArtifactType) =>
                      setArtifactForm((prev: CreateArtifactInput) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      {artifactTypes.map((type: ArtifactType) => (
                        <SelectItem key={type} value={type} className="text-white">
                          {getArtifactTypeLabel(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="url"
                    placeholder="File URL"
                    value={artifactForm.file_url}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setArtifactForm((prev: CreateArtifactInput) => ({ ...prev, file_url: e.target.value }))
                    }
                    className="bg-slate-800 border-slate-600 text-white"
                    required
                  />
                  <Input
                    type="url"
                    placeholder="Thumbnail URL (optional)"
                    value={artifactForm.thumbnail_url || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setArtifactForm((prev: CreateArtifactInput) => ({ 
                        ...prev, 
                        thumbnail_url: e.target.value || undefined 
                      }))
                    }
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="ar-enabled"
                      checked={artifactForm.ar_enabled}
                      onCheckedChange={(checked: boolean) =>
                        setArtifactForm((prev: CreateArtifactInput) => ({ ...prev, ar_enabled: checked }))
                      }
                    />
                    <Label htmlFor="ar-enabled" className="text-white">Enable AR projection</Label>
                  </div>
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? 'Adding...' : 'Add Artifact'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {portfolioArtifacts.map((artifact: Artifact) => (
              <div key={artifact.id} className="bg-white/5 p-3 rounded border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{getArtifactTypeLabel(artifact.type).split(' ')[0]}</span>
                      <span className="text-white font-medium">{artifact.title}</span>
                      {artifact.ar_enabled && (
                        <span className="text-xs text-purple-300">📱 AR</span>
                      )}
                    </div>
                    {artifact.description && (
                      <p className="text-xs text-gray-400 mt-1">{artifact.description}</p>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    Scale: {artifact.scale}x
                  </div>
                </div>
              </div>
            ))}
            
            {portfolioArtifacts.length === 0 && (
              <div className="text-center text-gray-400 py-4">
                No artifacts yet. Add your first artifact to get started!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
