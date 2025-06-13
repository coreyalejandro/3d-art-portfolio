
import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { trpc } from '@/utils/trpc';
import { toast } from 'sonner';
import type { Portfolio, Artifact, CollaborationSession, User, DrawingStroke as DBDrawingStroke } from '../../../server/src/schema';

interface Gallery3DProps {
  portfolio: Portfolio;
  artifacts: Artifact[];
  onArtifactSelect: (artifact: Artifact) => void;
  currentSession: CollaborationSession | null;
  currentUser: User;
  isARModeActive?: boolean;
  onFlyToArtifact?: (artifactId: number) => void;
  onBackToGallery?: () => void;
  flyToArtifactId?: number | null;
}

interface Camera {
  x: number;
  y: number;
  z: number;
  rotationY: number;
  rotationX: number;
}

interface TargetCamera extends Camera {
  isAnimating: boolean;
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
  currentSession,
  currentUser,
  isARModeActive = false,
  onFlyToArtifact,
  onBackToGallery,
  flyToArtifactId
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
  const [targetCamera, setTargetCamera] = useState<TargetCamera | null>(null);
  const [selectedArtifactId, setSelectedArtifactId] = useState<number | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingStrokes, setDrawingStrokes] = useState<DrawingStroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<DrawingStroke | null>(null);
  const [drawingMode, setDrawingMode] = useState(false);
  const [drawingColor, setDrawingColor] = useState('#ff6b6b');
  const [asmrMode, setAsmrMode] = useState(false);
  const [isViewingArtifactDetail, setIsViewingArtifactDetail] = useState(false);

  const keysPressed = useRef<Set<string>>(new Set());
  const mouseState = useRef({ isDown: false, lastX: 0, lastY: 0 });

  // Load existing drawing strokes when session starts
  const loadSessionDrawingStrokes = useCallback(async () => {
    if (currentSession) {
      try {
        const strokes = await trpc.getSessionDrawingStrokes.query({ session_id: currentSession.id });
        const clientStrokes: DrawingStroke[] = strokes.map((stroke: DBDrawingStroke) => ({
          points: JSON.parse(stroke.stroke_data),
          color: stroke.color,
          width: stroke.width
        }));
        setDrawingStrokes(clientStrokes);
      } catch (error) {
        console.error('Failed to load drawing strokes:', error);
        toast.error('Failed to load drawing strokes');
      }
    }
  }, [currentSession]);

  useEffect(() => {
    if (currentSession) {
      loadSessionDrawingStrokes();
    } else {
      setDrawingStrokes([]);
    }
  }, [currentSession, loadSessionDrawingStrokes]);

  // Linear interpolation helper
  const lerp = (start: number, end: number, factor: number): number => {
    return start + (end - start) * factor;
  };

  // Smooth camera movement
  useEffect(() => {
    if (!targetCamera) return;

    const animateCamera = () => {
      setCamera((prevCamera: Camera) => {
        const lerpFactor = 0.1; // Adjust for smoother/faster animation
        const newCamera = {
          x: lerp(prevCamera.x, targetCamera.x, lerpFactor),
          y: lerp(prevCamera.y, targetCamera.y, lerpFactor),
          z: lerp(prevCamera.z, targetCamera.z, lerpFactor),
          rotationY: lerp(prevCamera.rotationY, targetCamera.rotationY, lerpFactor),
          rotationX: lerp(prevCamera.rotationX, targetCamera.rotationX, lerpFactor)
        };

        // Check if we're close enough to the target
        const distance = Math.sqrt(
          Math.pow(newCamera.x - targetCamera.x, 2) +
          Math.pow(newCamera.y - targetCamera.y, 2) +
          Math.pow(newCamera.z - targetCamera.z, 2)
        );

        if (distance < 0.1) {
          setTargetCamera(null);
          return targetCamera;
        }

        return newCamera;
      });
    };

    const interval = setInterval(animateCamera, 16);
    return () => clearInterval(interval);
  }, [targetCamera]);

  // Fly-to animation for artifacts
  const flyToArtifact = useCallback((artifact: Artifact) => {
    const targetX = artifact.position_x;
    const targetY = artifact.position_y + 1;
    const targetZ = artifact.position_z + 3;

    setTargetCamera({
      x: targetX,
      y: targetY,
      z: targetZ,
      rotationY: 0,
      rotationX: -0.1,
      isAnimating: true
    });

    setIsViewingArtifactDetail(true);
    if (onFlyToArtifact) {
      onFlyToArtifact(artifact.id);
    }
  }, [onFlyToArtifact]);

  // Back to gallery view
  const backToGallery = useCallback(() => {
    setTargetCamera({
      x: 0,
      y: 2,
      z: 10,
      rotationY: 0,
      rotationX: 0,
      isAnimating: true
    });

    setIsViewingArtifactDetail(false);
    setSelectedArtifactId(null);
    if (onBackToGallery) {
      onBackToGallery();
    }
  }, [onBackToGallery]);

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

  // Render 3D cuboid/panel for artifacts
  const renderArtifact3D = useCallback((ctx: CanvasRenderingContext2D, artifact: ArtifactWithProjection) => {
    const { x, y } = artifact.projected;
    const size = 100 * artifact.scale;
    const isSelected = selectedArtifactId === artifact.id;

    // Calculate 3D panel corners
    const corners = {
      topLeft: project3D(artifact.position_x - size/200, artifact.position_y + size/200, artifact.position_z),
      topRight: project3D(artifact.position_x + size/200, artifact.position_y + size/200, artifact.position_z),
      bottomLeft: project3D(artifact.position_x - size/200, artifact.position_y - size/200, artifact.position_z),
      bottomRight: project3D(artifact.position_x + size/200, artifact.position_y - size/200, artifact.position_z),
      // Back face for depth
      topLeftBack: project3D(artifact.position_x - size/200, artifact.position_y + size/200, artifact.position_z - 0.1),
      topRightBack: project3D(artifact.position_x + size/200, artifact.position_y + size/200, artifact.position_z - 0.1),
      bottomLeftBack: project3D(artifact.position_x - size/200, artifact.position_y - size/200, artifact.position_z - 0.1),
      bottomRightBack: project3D(artifact.position_x + size/200, artifact.position_y - size/200, artifact.position_z - 0.1)
    };

    // Draw 3D panel sides (depth)
    if (corners.topLeft.visible && corners.topLeftBack.visible) {
      ctx.fillStyle = isSelected ? 'rgba(138, 43, 226, 0.4)' : 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.moveTo(corners.topLeft.x, corners.topLeft.y);
      ctx.lineTo(corners.topLeftBack.x, corners.topLeftBack.y);
      ctx.lineTo(corners.bottomLeftBack.x, corners.bottomLeftBack.y);
      ctx.lineTo(corners.bottomLeft.x, corners.bottomLeft.y);
      ctx.closePath();
      ctx.fill();
    }

    // Draw main artifact face
    ctx.fillStyle = isSelected ? 'rgba(138, 43, 226, 0.9)' : 'rgba(255, 255, 255, 0.95)';
    ctx.fillRect(x - size/2, y - size/2, size, size);

    // Draw artifact content with thumbnail if available
    if (artifact.thumbnail_url) {
      // Create image element for thumbnail (in real app, you'd cache these)
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.save();
        ctx.globalAlpha = 0.8;
        ctx.drawImage(img, x - size/2 + 5, y - size/2 + 5, size - 10, size - 10);
        ctx.restore();
      };
      img.src = artifact.thumbnail_url;
    } else {
      // Draw content placeholder with icon
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(x - size/2 + 5, y - size/2 + 5, size - 10, size - 10);

      // Draw artifact type icon
      ctx.fillStyle = 'white';
      ctx.font = `${size/4}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const typeIcon = getArtifactIcon(artifact.type);
      ctx.fillText(typeIcon, x, y - size/6);
    }

    // Draw artifact title
    ctx.fillStyle = 'white';
    ctx.font = `${Math.max(10, size/10)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(artifact.title, x, y + size/3);

    // Draw selection highlight with glow effect
    if (isSelected) {
      ctx.strokeStyle = '#8a2be2';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#8a2be2';
      ctx.shadowBlur = 10;
      ctx.strokeRect(x - size/2 - 2, y - size/2 - 2, size + 4, size + 4);
      ctx.shadowBlur = 0;
    }

    // Store clickable area
    artifact.clickArea = {
      x: x - size/2,
      y: y - size/2,
      width: size,
      height: size
    };
  }, [project3D, getArtifactIcon]);

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

    // AR Mode visual feedback
    if (isARModeActive) {
      // Pulsing translucent overlay
      const pulseIntensity = Math.sin(Date.now() / 500) * 0.1 + 0.1;
      ctx.fillStyle = `rgba(138, 43, 226, ${pulseIntensity})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // AR scanning line effect
      const scanLineY = (Date.now() / 10) % canvas.height;
      ctx.fillStyle = 'rgba(138, 43, 226, 0.3)';
      ctx.fillRect(0, scanLineY - 2, canvas.width, 4);
      
      // AR overlay text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('AR MODE ACTIVE', canvas.width / 2, 50);
    }

    // Enhanced floor grid with better visual scale
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    
    // Major grid lines
    for (let i = -20; i <= 20; i += 5) {
      ctx.strokeStyle = i === 0 ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = i === 0 ? 2 : 1;
      
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

    // Minor grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = -20; i <= 20; i += 1) {
      if (i % 5 !== 0) { // Skip major grid lines
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
    }

    // Sort artifacts by distance for proper rendering order
    const sortedArtifacts: ArtifactWithProjection[] = artifacts.map((artifact: Artifact) => ({
      ...artifact,
      projected: project3D(artifact.position_x, artifact.position_y, artifact.position_z)
    })).filter(a => a.projected.visible)
      .sort((a, b) => (b.projected.distance || 0) - (a.projected.distance || 0));

    // Draw artifacts as 3D panels
    sortedArtifacts.forEach((artifact: ArtifactWithProjection) => {
      renderArtifact3D(ctx, artifact);
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
    ctx.fillRect(10, 10, 280, 120);
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Portfolio: ${portfolio.title}`, 20, 30);
    ctx.fillText(`Artifacts: ${artifacts.length}`, 20, 50);
    ctx.fillText(`Camera: (${camera.x.toFixed(1)}, ${camera.y.toFixed(1)}, ${camera.z.toFixed(1)})`, 20, 70);
    
    if (asmrMode) {
      ctx.fillStyle = '#4ecdc4';
      ctx.fillText('🎵 ASMR Mode Active', 20, 90);
    }
    
    if (targetCamera) {
      ctx.fillStyle = '#ff6b6b';
      ctx.fillText('📹 Camera Animation', 20, 110);
    }

    // Store reference to sorted artifacts for click detection
    (canvas as CanvasWithArtifacts).sortedArtifacts = sortedArtifacts;
  }, [artifacts, portfolio, camera, selectedArtifactId, drawingStrokes, currentStroke, project3D, renderArtifact3D, isARModeActive, asmrMode, targetCamera]);

  // Handle fly-to effect when flyToArtifactId changes
  useEffect(() => {
    if (flyToArtifactId) {
      const artifact = artifacts.find(a => a.id === flyToArtifactId);
      if (artifact) {
        flyToArtifact(artifact);
      }
    }
  }, [flyToArtifactId, artifacts, flyToArtifact]);

  // Periodically refresh drawing strokes during collaboration session
  useEffect(() => {
    if (currentSession && !drawingMode) {
      const interval = setInterval(() => {
        loadSessionDrawingStrokes();
      }, 5000); // Refresh every 5 seconds

      return () => clearInterval(interval);
    }
  }, [currentSession, drawingMode, loadSessionDrawingStrokes]);

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
        
        // Trigger fly-to animation
        flyToArtifact(artifact);
        
        // Delay opening modal to allow animation
        setTimeout(() => {
          onArtifactSelect(artifact);
        }, 500);
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

  const handleMouseUp = async () => {
    if (isDrawing && currentStroke && currentSession) {
      // Save stroke to database
      try {
        const strokeData = JSON.stringify(currentStroke.points);
        await trpc.createDrawingStroke.mutate({
          session_id: currentSession.id,
          user_id: currentUser.id,
          stroke_data: strokeData,
          color: currentStroke.color,
          width: currentStroke.width
        });
        
        setDrawingStrokes((prev: DrawingStroke[]) => [...prev, currentStroke]);
        toast.success('Drawing stroke saved');
      } catch (error) {
        console.error('Failed to save drawing stroke:', error);
        toast.error('Failed to save drawing stroke');
      }
      
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
    <div className="relative w-full h-full gallery-3d">
      <canvas
        ref={canvasRef}
        className={`w-full h-full ${drawingMode ? 'cursor-crosshair drawing-canvas' : 'cursor-move'}`}
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
          
          {/* ASMR Mode Toggle */}
          <div className="border-t border-white/20 pt-3">
            <Button
              size="sm"
              variant={asmrMode ? "default" : "outline"}
              onClick={() => setAsmrMode(!asmrMode)}
              className="w-full mb-2"
            >
              🎵 {asmrMode ? "ASMR Active" : "ASMR Mode"}
            </Button>
          </div>

          {/* Back to Gallery Button */}
          {isViewingArtifactDetail && (
            <div className="border-t border-white/20 pt-3">
              <Button
                size="sm"
                onClick={backToGallery}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                🏛️ Back to Gallery
              </Button>
            </div>
          )}
          
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
                <div className="flex flex-wrap gap-1">
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
        <Card className={`absolute bottom-4 left-4 p-3 bg-black/70 backdrop-blur-sm border-white/20 ${asmrMode ? 'asmr-active' : ''}`}>
          <div className="text-white text-sm">
            <div className="font-semibold">👥 {currentSession.title}</div>
            <div className="text-xs text-gray-300">Collaborative Session Active</div>
            {drawingMode && (
              <div className="text-xs text-yellow-300 mt-1">🎨 Drawing Mode</div>
            )}
          </div>
        </Card>
      )}

      {/* ASMR Mode Indicator */}
      {asmrMode && (
        <Card className="absolute bottom-4 right-4 p-3 bg-teal-600/70 backdrop-blur-sm border-teal-400/20">
          <div className="text-white text-sm text-center">
            <div className="font-semibold">🎵 ASMR Active</div>
            <div className="text-xs text-teal-200">Ambient sounds enabled</div>
          </div>
        </Card>
      )}
    </div>
  );
}
