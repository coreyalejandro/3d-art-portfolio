
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Artifact } from '../../../server/src/schema';

interface ArtifactDetailModalProps {
  artifact: Artifact;
  onClose: () => void;
  onBackToGallery?: () => void;
  isARMode?: boolean;
  setIsARMode?: (value: boolean) => void;
}

export function ArtifactDetailModal({ 
  artifact, 
  onClose, 
  onBackToGallery,
  isARMode = false,
  setIsARMode
}: ArtifactDetailModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getArtifactTypeInfo = (type: string) => {
    switch (type) {
      case 'data_visualization':
        return { icon: '📊', label: 'Data Visualization', color: 'bg-blue-600' };
      case 'ml_notebook':
        return { icon: '🤖', label: 'ML Notebook', color: 'bg-purple-600' };
      case 'web_application':
        return { icon: '🌐', label: 'Web Application', color: 'bg-green-600' };
      case 'image':
        return { icon: '🖼️', label: 'Image', color: 'bg-yellow-600' };
      case 'document':
        return { icon: '📄', label: 'Document', color: 'bg-gray-600' };
      default:
        return { icon: '📋', label: 'Unknown', color: 'bg-gray-600' };
    }
  };

  const typeInfo = getArtifactTypeInfo(artifact.type);

  const handleARToggle = () => {
    if (artifact.ar_enabled && setIsARMode) {
      const newARMode = !isARMode;
      setIsARMode(newARMode);
      // In a real app, this would trigger AR functionality
      if (newARMode) {
        console.log('Starting AR mode for artifact:', artifact.id);
        // Simulate AR initialization delay
        setTimeout(() => {
          console.log('AR mode initialized');
        }, 1000);
      } else {
        console.log('Stopping AR mode');
      }
    }
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    // In a real app, this would open the artifact in fullscreen
    if (!isFullscreen) {
      window.open(artifact.file_url, '_blank');
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center space-x-3">
            <span className="text-2xl">{typeInfo.icon}</span>
            <div>
              <div>{artifact.title}</div>
              <Badge className={`${typeInfo.color} text-white mt-1`}>
                {typeInfo.label}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Artifact Preview */}
          <Card className="bg-slate-800 border-slate-700 overflow-hidden">
            <div className="relative">
              {artifact.thumbnail_url ? (
                <img 
                  src={artifact.thumbnail_url} 
                  alt={artifact.title}
                  className="w-full h-64 object-cover"
                />
              ) : (
                <div className="w-full h-64 bg-slate-700 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <div className="text-4xl mb-2">{typeInfo.icon}</div>
                    <div>No preview available</div>
                  </div>
                </div>
              )}
              
              {isARMode && (
                <div className="absolute inset-0 ar-mode-overlay border-2 border-purple-400 flex items-center justify-center">
                  <div className="text-white text-center relative">
                    <div className="absolute inset-0 bg-purple-600/10 rounded-lg animate-ping"></div>
                    <div className="relative z-10">
                      <div className="text-3xl mb-3">📱</div>
                      <div className="text-lg font-semibold mb-2">AR Mode Active</div>
                      <div className="text-sm opacity-75 mb-2">Point your device at a surface</div>
                      <div className="text-xs bg-purple-600/50 px-3 py-1 rounded-full">
                        🔍 Scanning environment...
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced AR scanning lines */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent ar-scan-line"></div>
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent ar-scan-line"></div>
                    <div className="absolute top-0 left-0 w-0.5 h-full bg-gradient-to-b from-transparent via-purple-400 to-transparent ar-scan-line"></div>
                    <div className="absolute top-0 right-0 w-0.5 h-full bg-gradient-to-b from-transparent via-purple-400 to-transparent ar-scan-line"></div>
                    
                    {/* Additional scanning effect */}
                    <div 
                      className="absolute w-full h-1 bg-gradient-to-r from-transparent via-purple-300 to-transparent opacity-60"
                      style={{
                        top: `${(Math.sin(Date.now() / 500) + 1) * 50}%`,
                        transition: 'top 0.1s ease-in-out'
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Description */}
          {artifact.description && (
            <div>
              <h3 className="text-white font-semibold mb-2">Description</h3>
              <p className="text-gray-300">{artifact.description}</p>
            </div>
          )}

          {/* Properties */}
          <div>
            <h3 className="text-white font-semibold mb-3">Properties</h3>
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-slate-800 border-slate-700 p-3">
                <div className="text-sm text-gray-400">Position</div>
                <div className="text-white">
                  X: {artifact.position_x.toFixed(1)}, 
                  Y: {artifact.position_y.toFixed(1)}, 
                  Z: {artifact.position_z.toFixed(1)}
                </div>
              </Card>
              
              <Card className="bg-slate-800 border-slate-700 p-3">
                <div className="text-sm text-gray-400">Rotation</div>
                <div className="text-white">
                  X: {artifact.rotation_x.toFixed(1)}°, 
                  Y: {artifact.rotation_y.toFixed(1)}°, 
                  Z: {artifact.rotation_z.toFixed(1)}°
                </div>
              </Card>
              
              <Card className="bg-slate-800 border-slate-700 p-3">
                <div className="text-sm text-gray-400">Scale</div>
                <div className="text-white">{artifact.scale}x</div>
              </Card>
              
              <Card className="bg-slate-800 border-slate-700 p-3">
                <div className="text-sm text-gray-400">AR Enabled</div>
                <div className="text-white">
                  {artifact.ar_enabled ? '✅ Yes' : '❌ No'}
                </div>
              </Card>
            </div>
          </div>

          {/* Metadata */}
          {artifact.metadata && Object.keys(artifact.metadata).length > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-3">Metadata</h3>
              <Card className="bg-slate-800 border-slate-700 p-3">
                <pre className="text-sm text-gray-300 overflow-x-auto">
                  {JSON.stringify(artifact.metadata, null, 2)}
                </pre>
              </Card>
            </div>
          )}

          <Separator className="bg-slate-700" />

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleFullscreen}
              className="bg-blue-600 hover:bg-blue-700"
            >
              🔍 View Full Content
            </Button>
            
            {artifact.ar_enabled && (
              <Button
                onClick={handleARToggle}
                variant={isARMode ? "default" : "outline"}
                className={isARMode ? "bg-purple-600 hover:bg-purple-700 animate-pulse" : "border-purple-400 text-purple-300 hover:bg-purple-600/20"}
              >
                📱 {isARMode ? 'Stop AR Mode' : 'Start AR Mode'}
              </Button>
            )}
            
            {onBackToGallery && (
              <Button
                onClick={() => {
                  onBackToGallery();
                  onClose();
                }}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                🏛️ Back to Gallery
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={() => navigator.clipboard.writeText(artifact.file_url)}
              className="border-gray-600 text-gray-300"
            >
              📋 Copy URL
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.open(artifact.file_url, '_blank')}
              className="border-gray-600 text-gray-300"
            >
              🔗 Open Link
            </Button>
          </div>

          {/* Timestamps */}
          <div className="text-xs text-gray-500 space-y-1">
            <div>Created: {artifact.created_at.toLocaleString()}</div>
            <div>Updated: {artifact.updated_at.toLocaleString()}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
