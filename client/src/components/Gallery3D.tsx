
import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Portfolio, Artifact, CollaborationSession, User } from '../../../server/src/schema';

interface Gallery3DProps {
  portfolio: Portfolio;
  artifacts: Artifact[];
  onArtifactSelect: (artifact: Artifact) => void;
  currentSession: CollaborationSession | null;
  currentUser: User;
}

interface Camera {
  x: number;
  y: number;
  z: number;
  rotationY: number;
  rotationX: number;
}

interface DrawingStroke {
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

interface ProjectedPoint {
  x: number;
  y: number;
  visible: boolean;
  distance?: number;
}

interface ArtifactWithProjection extends Artifact {
  projected: ProjectedPoint;
  clickArea?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface CanvasWithArtifacts extends HTMLCanvasElement {
  sortedArtifacts?: ArtifactWithProjection[];
}

export function Gallery3D({ 
  portfolio, 
  artifacts, 
  onArtifactSelect, 
  currentSession
}: Gallery3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [camera, setCamera] = useState<Camera>({
    x: 0,
    y: 2,
    z: 10,
    rotationY: 0,
    rotationX: 0
  });
  const [selectedArtifactId, setSelectedArtifactId] = useState<number | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingStrokes, setDrawingStrokes] = useState<DrawingStroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<DrawingStroke | null>(null);
  const [drawingMode, setDrawingMode] = useState(false);
  const [drawingColor, setDrawingColor] = useState('#ff6b6b');

  const keysPressed = useRef<Set<string>>(new Set());
  const mouseState = useRef({ isDown: false, lastX: 0, lastY: 0 });

  // 3D projection function
  const project3D = useCallback((x: number, y: number, z: number): ProjectedPoint => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, visible: false };

    // Apply camera transformations
    const dx = x - camera.x;
    const dy = y - camera.y;
    const dz = z - camera.z;

    // Rotate around Y axis
    const cosY = Math.cos(camera.rotationY);
    const sinY = Math.sin(camera.rotationY);
    const rotatedX = dx * cosY - dz * sinY;
    const rotatedZ = dx * sinY + dz * cosY;

    // Rotate around X axis
    const cosX = Math.cos(camera.rotationX);
    const sinX = Math.sin(camera.rotationX);
    const finalY = dy * cosX - rotatedZ * sinX;
    const finalZ = dy * sinX + rotatedZ * cosX;

    if (finalZ <= 0.1) return { x: 0, y: 0, visible: false };

    const perspective = 800;
    const screenX = (rotatedX * perspective) / finalZ + canvas.width / 2;
    const screenY = (finalY * perspective) / finalZ + canvas.height / 2;

    return {
      x: screenX,
      y: screenY,
      visible: finalZ > 0.1,
      distance: Math.sqrt(dx * dx + dy * dy + dz * dz)
    };
  }, [camera]);

  const getArtifactIcon = useCallback((type: string): string => {
    switch (type) {
      case 'data_visualization': return '📊';
      case 'ml_notebook': return '🤖';
      case 'web_application': return '🌐';
      case 'image': return '🖼️';
      case 'document': return '📄';
      default: return '📋';
    }
  }, []);

  // Render the 3D scene
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f3460');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw floor grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = -20; i <= 20; i += 2) {
      const start1 = project3D(i, 0, -20);
      const end1 = project3D(i, 0, 20);
      const start2 = project3D(-20, 0, i);
      const end2 = project3D(20, 0, i);

      if (start1.visible && end1.visible) {
        ctx.beginPath();
        ctx.moveTo(start1.x, start1.y);
        ctx.lineTo(end1.x, end1.y);
        ctx.stroke();
      }

      if (start2.visible && end2.visible) {
        ctx.beginPath();
        ctx.moveTo(start2.x, start2.y);
        ctx.lineTo(end2.x, end2.y);
        ctx.stroke();
      }
    }

    // Sort artifacts by distance for proper rendering order
    const sortedArtifacts: ArtifactWithProjection[] = artifacts.map((artifact: Artifact) => ({
      ...artifact,
      projected: project3D(artifact.position_x, artifact.position_y, artifact.position_z)
    })).filter(a => a.projected.visible)
      .sort((a, b) => (b.projected.distance || 0) - (a.projected.distance || 0));

    // Draw artifacts
    sortedArtifacts.forEach((artifact: ArtifactWithProjection) => {
      const { x, y } = artifact.projected;
      const size = 100 * artifact.scale;
      const isSelected = selectedArtifactId === artifact.id;

      // Draw artifact frame
      ctx.fillStyle = isSelected ? 'rgba(138, 43, 226, 0.8)' : 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(x - size/2, y - size/2, size, size);

      // Draw artifact content placeholder
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(x - size/2 + 5, y - size/2 + 5, size - 10, size - 10);

      // Draw artifact type icon
      ctx.fillStyle = 'white';
      ctx.font = `${size/4}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const typeIcon = getArtifactIcon(artifact.type);
      ctx.fillText(typeIcon, x, y - size/4);

      // Draw artifact title
      ctx.font = `${size/8}px Arial`;
      ctx.fillText(artifact.title, x, y + size/6);

      // Draw selection highlight
      if (isSelected) {
        ctx.strokeStyle = '#8a2be2';
        ctx.lineWidth = 3;
        ctx.strokeRect(x - size/2 - 2, y - size/2 - 2, size + 4, size + 4);
      }

      // Store clickable area
      artifact.clickArea = {
        x: x - size/2,
        y: y - size/2,
        width: size,
        height: size
      };
    });

    // Draw collaborative drawing strokes
    drawingStrokes.forEach((stroke: DrawingStroke) => {
      if (stroke.points.length > 1) {
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();
      }
    });

    // Draw current stroke being drawn
    if (currentStroke && currentStroke.points.length > 1) {
      ctx.strokeStyle = currentStroke.color;
      ctx.lineWidth = currentStroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(currentStroke.points[0].x, currentStroke.points[0].y);
      for (let i = 1; i < currentStroke.points.length; i++) {
        ctx.lineTo(currentStroke.points[i].x, currentStroke.points[i].y);
      }
      ctx.stroke();
    }

    // Draw UI elements
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 250, 80);
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Portfolio: ${portfolio.title}`, 20, 30);
    ctx.fillText(`Artifacts: ${artifacts.length}`, 20, 50);
    ctx.fillText(`Camera: (${camera.x.toFixed(1)}, ${camera.y.toFixed(1)}, ${camera.z.toFixed(1)})`, 20, 70);

    // Store reference to sorted artifacts for click detection
    (canvas as CanvasWithArtifacts).sortedArtifacts = sortedArtifacts;
  }, [artifacts, portfolio, camera, selectedArtifactId, drawingStrokes, currentStroke, project3D, getArtifactIcon]);

  // Handle keyboard input for camera movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase());
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Camera movement update loop
  useEffect(() => {
    const updateCamera = () => {
      const moveSpeed = 0.2;
      const rotSpeed = 0.03;

      setCamera((prev: Camera) => {
        const newCamera = { ...prev };

        if (keysPressed.current.has('w')) {
          newCamera.x -= Math.sin(prev.rotationY) * moveSpeed;
          newCamera.z -= Math.cos(prev.rotationY) * moveSpeed;
        }
        if (keysPressed.current.has('s')) {
          newCamera.x += Math.sin(prev.rotationY) * moveSpeed;
          newCamera.z += Math.cos(prev.rotationY) * moveSpeed;
        }
        if (keysPressed.current.has('a')) {
          newCamera.x -= Math.cos(prev.rotationY) * moveSpeed;
          newCamera.z += Math.sin(prev.rotationY) * moveSpeed;
        }
        if (keysPressed.current.has('d')) {
          newCamera.x += Math.cos(prev.rotationY) * moveSpeed;
          newCamera.z -= Math.sin(prev.rotationY) * moveSpeed;
        }
        if (keysPressed.current.has(' ')) {
          newCamera.y += moveSpeed;
        }
        if (keysPressed.current.has('shift')) {
          newCamera.y -= moveSpeed;
        }
        if (keysPressed.current.has('arrowleft')) {
          newCamera.rotationY -= rotSpeed;
        }
        if (keysPressed.current.has('arrowright')) {
          newCamera.rotationY += rotSpeed;
        }
        if (keysPressed.current.has('arrowup')) {
          newCamera.rotationX -= rotSpeed;
        }
        if (keysPressed.current.has('arrowdown')) {
          newCamera.rotationX += rotSpeed;
        }

        return newCamera;
      });
    };

    const interval = setInterval(updateCamera, 16); // ~60 FPS
    return () => clearInterval(interval);
  }, []);

  // Mouse interactions
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (drawingMode && currentSession) {
      setIsDrawing(true);
      setCurrentStroke({
        points: [{ x, y }],
        color: drawingColor,
        width: 3
      });
      return;
    }

    // Check for artifact clicks
    const sortedArtifacts: ArtifactWithProjection[] = (canvas as CanvasWithArtifacts).sortedArtifacts || [];
    for (const artifact of sortedArtifacts) {
      if (artifact.clickArea && 
          x >= artifact.clickArea.x && 
          x <= artifact.clickArea.x + artifact.clickArea.width &&
          y >= artifact.clickArea.y && 
          y <= artifact.clickArea.y + artifact.clickArea.height) {
        setSelectedArtifactId(artifact.id);
        onArtifactSelect(artifact);
        return;
      }
    }

    // Camera rotation
    mouseState.current = { isDown: true, lastX: x, lastY: y };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDrawing && currentStroke) {
      setCurrentStroke((prev: DrawingStroke | null) => {
        if (!prev) return null;
        return {
          ...prev,
          points: [...prev.points, { x, y }]
        };
      });
      return;
    }

    if (mouseState.current.isDown && !drawingMode) {
      const deltaX = x - mouseState.current.lastX;
      const deltaY = y - mouseState.current.lastY;

      setCamera((prev: Camera) => ({
        ...prev,
        rotationY: prev.rotationY + deltaX * 0.01,
        rotationX: Math.max(-Math.PI/2, Math.min(Math.PI/2, prev.rotationX - deltaY * 0.01))
      }));

      mouseState.current.lastX = x;
      mouseState.current.lastY = y;
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && currentStroke) {
      setDrawingStrokes((prev: DrawingStroke[]) => [...prev, currentStroke]);
      setCurrentStroke(null);
      setIsDrawing(false);
    }
    mouseState.current.isDown = false;
  };

  // Animation loop
  useEffect(() => {
    const animate = () => {
      render();
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      if (animationRef.current !== undefined) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [render]);

  // Canvas resize handler
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      
      {/* Controls Panel */}
      <Card className="absolute top-4 right-4 p-4 bg-black/70 backdrop-blur-sm border-white/20">
        <div className="space-y-3">
          <div className="text-white text-sm font-semibold">🎮 Controls</div>
          <div className="text-xs text-gray-300 space-y-1">
            <div>WASD: Move camera</div>
            <div>Arrow Keys: Look around</div>
            <div>Space/Shift: Up/Down</div>
            <div>Click: Select artifact</div>
            <div>Mouse drag: Rotate view</div>
          </div>
          
          {currentSession && (
            <div className="border-t border-white/20 pt-3">
              <div className="text-white text-sm font-semibold mb-2">🎨 Collaboration</div>
              <Button
                size="sm"
                variant={drawingMode ? "default" : "outline"}
                onClick={() => setDrawingMode(!drawingMode)}
                className="w-full mb-2"
              >
                {drawingMode ? "Exit Drawing" : "Start Drawing"}
              </Button>
              {drawingMode && (
                <div className="flex space-x-1">
                  {['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'].map((color: string) => (
                    <button
                      key={color}
                      className={`w-6 h-6 rounded border-2 ${drawingColor === color ? 'border-white' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setDrawingColor(color)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Session Info */}
      {currentSession && (
        <Card className="absolute bottom-4 left-4 p-3 bg-black/70 backdrop-blur-sm border-white/20">
          <div className="text-white text-sm">
            <div className="font-semibold">👥 {currentSession.title}</div>
            <div className="text-xs text-gray-300">Collaborative Session Active</div>
          </div>
        </Card>
      )}
    </div>
  );
}
