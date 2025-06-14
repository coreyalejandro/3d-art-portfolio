# All-in-One PRD + Implementation Plan

VISION STATEMENT

Transform the juvenile "ArtSpace3D" into a sophisticated, cinematic 3D portfolio environment that embodies:

Tron Legacy: Neon-lit geometric precision, dark environments with electric accents
John Wick: Sleek, professional, dangerous elegance with perfect attention to detail
Haute Couture: Minimalist luxury, every element purposeful and refined
PART 1: DESIGN SYSTEM SPECIFICATION
Color Palette (Tron + John Wick Fusion)
/*Primary Palette*/
--void-black: #0a0a0a
--carbon-black: #1a1a1a  
--steel-gray: #2a2a2a
--platinum: #e8e8e8
--ice-white: #ffffff

/*Accent Palette*/
--electric-cyan: #00ffff
--neon-blue: #0080ff
--danger-red: #ff0040
--warning-amber: #ffaa00
--success-green: #00ff80

/*Gradients*/
--tron-gradient: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #00ffff 100%)
--wick-gradient: linear-gradient(180deg, #0a0a0a 0%, #2a2a2a 100%)

Typography System
/*Primary Font: Orbitron (Futuristic, Technical) */
--font-primary: 'Orbitron', monospace
/* Secondary Font: Inter (Clean, Professional) */  
--font-secondary: 'Inter', sans-serif
/* Code Font: JetBrains Mono*/
--font-code: 'JetBrains Mono', monospace

/*Scale */
--text-xs: 0.75rem    /* 12px */
--text-sm: 0.875rem   /* 14px */
--text-base: 1rem     /* 16px */
--text-lg: 1.125rem   /* 18px */
--text-xl: 1.25rem    /* 20px */
--text-2xl: 1.5rem    /* 24px */
--text-3xl: 1.875rem  /* 30px */
--text-4xl: 2.25rem   /* 36px*/

Animation System
/*Easing Functions*/
--ease-tron: cubic-bezier(0.25, 0.46, 0.45, 0.94)
--ease-wick: cubic-bezier(0.4, 0, 0.2, 1)
--ease-elastic: cubic-bezier(0.68, -0.55, 0.265, 1.55)

/*Durations*/
--duration-fast: 150ms
--duration-normal: 300ms
--duration-slow: 500ms
--duration-cinematic: 1000ms

PART 2: COMPONENT ARCHITECTURE
Core Components Structure
src/
├── components/
│   ├── core/
│   │   ├── TronLayout.tsx          # Main layout with neon borders
│   │   ├── WickNavigation.tsx      # Sleek sidebar navigation
│   │   └── HolographicLoader.tsx   # Sophisticated loading states
│   ├── 3d/
│   │   ├── CinematicGallery.tsx    # Main 3D space
│   │   ├── ArtifactHologram.tsx    # Individual portfolio pieces
│   │   ├── CameraDirector.tsx      # Smooth cinematic transitions
│   │   └── ParticleSystem.tsx      # Ambient effects
│   ├── ai/
│   │   ├── CuratorAgent.tsx        # AI guide interface
│   │   ├── VoiceInterface.tsx      # Speech controls
│   │   └── ContextualTour.tsx      # Adaptive navigation
│   └── accessibility/
│       ├── MultiModalFeedback.tsx  # Neurodivergent-friendly features
│       └── ClearInstructions.tsx   # Step-by-step guidance

PART 3: STEP-BY-STEP IMPLEMENTATION PLAN
PHASE 1: FOUNDATION TRANSFORMATION (Days 1-3)
Step 1.1: Install Required Dependencies

# Navigate to your project directory

cd /path/to/3d-art-portfolio

# Install design system dependencies

npm install @react-three/fiber @react-three/drei three
npm install framer-motion lucide-react
npm install @radix-ui/react-dialog @radix-ui/react-select
npm install class-variance-authority clsx tailwind-merge

# Install fonts

npm install @fontsource/orbitron @fontsource/inter @fontsource/jetbrains-mono

Step 1.2: Update Tailwind Configuration

Create/update tailwind.config.js:

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        void: { black: '#0a0a0a' },
        carbon: { black: '#1a1a1a' },
        steel: { gray: '#2a2a2a' },
        platinum: '#e8e8e8',
        ice: { white: '#ffffff' },
        electric: { cyan: '#00ffff' },
        neon: { blue: '#0080ff' },
        danger: { red: '#ff0040' },
        warning: { amber: '#ffaa00' },
        success: { green: '#00ff80' }
      },
      fontFamily: {
        'tron': ['Orbitron', 'monospace'],
        'wick': ['Inter', 'sans-serif'],
        'code': ['JetBrains Mono', 'monospace']
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite alternate',
        'slide-in-tron': 'slide-in-tron 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'hologram-flicker': 'hologram-flicker 3s ease-in-out infinite'
      },
      keyframes: {
        'glow-pulse': {
          '0%': { boxShadow: '0 0 5px #00ffff, 0 0 10px #00ffff, 0 0 15px #00ffff' },
          '100%': { boxShadow: '0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 30px #00ffff' }
        },
        'slide-in-tron': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        'hologram-flicker': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' }
        }
      }
    }
  },
  plugins: []
}

Step 1.3: Create Base Layout Component

Create src/components/core/TronLayout.tsx:

import React from 'react';
import { motion } from 'framer-motion';

interface TronLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const TronLayout: React.FC<TronLayoutProps> = ({ children, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className={`
min-h-screen bg-gradient-to-br from-void-black via-carbon-black to-steel-gray
        relative overflow-hidden font-tron
        ${className}
      `}
    >
      {/*Tron Grid Background*/}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Neon Border Frame */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-electric-cyan to-transparent animate-glow-pulse" />
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-electric-cyan to-transparent animate-glow-pulse" />
        <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-transparent via-electric-cyan to-transparent animate-glow-pulse" />
        <div className="absolute top-0 right-0 w-[2px] h-full bg-gradient-to-b from-transparent via-electric-cyan to-transparent animate-glow-pulse" />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Ambient Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-electric-cyan rounded-full opacity-30"
            animate={{
              x: [0, Math.random() * window.innerWidth],
              y: [0, Math.random() * window.innerHeight],
              opacity: [0, 0.5, 0]
            }}
            transition={{
              duration: Math.random() * 10 + 5,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
            style={{
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%'
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

PHASE 2: NAVIGATION SYSTEM (Days 4-5)
Step 2.1: Create Wick-Style Navigation

Create src/components/core/WickNavigation.tsx:

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  User,
  Briefcase,
  MessageSquare,
  Settings,
  ChevronRight,
  Zap
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
  description: string;
}

const navigationItems: NavigationItem[] = [
  { id: 'gallery', label: 'Gallery', icon: Home, path: '/gallery', description: 'Immersive 3D Portfolio' },
  { id: 'about', label: 'About', icon: User, path: '/about', description: 'Corey Alejandro' },
  { id: 'work', label: 'Work', icon: Briefcase, path: '/work', description: 'Projects & Case Studies' },
  { id: 'curator', label: 'AI Curator', icon: Zap, path: '/curator', description: 'Intelligent Guide' },
  { id: 'contact', label: 'Contact', icon: MessageSquare, path: '/contact', description: 'Connect & Collaborate' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings', description: 'Preferences' }
];

export const WickNavigation: React.FC = () => {
  const [activeItem, setActiveItem] = useState('gallery');
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.nav
      className="fixed left-0 top-0 h-full z-50 bg-carbon-black/90 backdrop-blur-md border-r border-electric-cyan/20"
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <motion.div
        className="flex flex-col h-full"
        animate={{ width: isExpanded ? 280 : 80 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        {/*Logo/Brand*/}
        <div className="p-6 border-b border-steel-gray/30">
          <motion.div
            className="flex items-center space-x-3"
            animate={{ opacity: isExpanded ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-electric-cyan to-neon-blue rounded-lg flex items-center justify-center">
              <span className="text-void-black font-bold text-sm">CA</span>
            </div>
            {isExpanded && (
              <div>
                <h1 className="text-ice-white font-tron text-lg font-bold">COREY</h1>
                <p className="text-platinum/60 text-xs">AI Engineer</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-6">
          {navigationItems.map((item) => (
            <motion.button
              key={item.id}
              className={`
                w-full flex items-center px-6 py-4 text-left transition-all duration-200
                hover:bg-steel-gray/30 group relative
                ${activeItem === item.id ? 'bg-electric-cyan/10 border-r-2 border-electric-cyan' : ''}
              `}
              onClick={() => setActiveItem(item.id)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <item.icon 
                className={`
                  w-6 h-6 transition-colors duration-200
                  ${activeItem === item.id ? 'text-electric-cyan' : 'text-platinum/70 group-hover:text-ice-white'}
                `} 
              />
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    className="ml-4 flex-1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={`
                      font-wick font-medium transition-colors duration-200
                      ${activeItem === item.id ? 'text-electric-cyan' : 'text-ice-white group-hover:text-ice-white'}
                    `}>
                      {item.label}
                    </div>
                    <div className="text-platinum/50 text-xs mt-1">
                      {item.description}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {activeItem === item.id && (
                <motion.div
                  className="absolute right-0 top-1/2 transform -translate-y-1/2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="w-4 h-4 text-electric-cyan" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Status Indicator */}
        <div className="p-6 border-t border-steel-gray/30">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-success-green rounded-full animate-pulse" />
            {isExpanded && (
              <motion.span
                className="text-platinum/70 text-sm font-wick"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                System Online
              </motion.span>
            )}
          </div>
        </div>
      </motion.div>
    </motion.nav>
  );
};

PHASE 3: 3D GALLERY TRANSFORMATION (Days 6-8)
Step 3.1: Create Cinematic 3D Gallery

Create src/components/3d/CinematicGallery.tsx:

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  Environment,
  Text,
  Float,
  Sparkles,
  useTexture
} from '@react-three/drei';
import { motion } from 'framer-motion-3d';
import * as THREE from 'three';

interface Artifact {
  id: number;
  title: string;
  type: string;
  position_x: number;
  position_y: number;
  position_z: number;
  rotation_x: number;
  rotation_y: number;
  rotation_z: number;
  scale: number;
  thumbnail_url?: string;
  description: string;
}

interface ArtifactHologramProps {
  artifact: Artifact;
  isSelected: boolean;
  onSelect: (artifact: Artifact) => void;
}

const ArtifactHologram: React.FC<ArtifactHologramProps> = ({
  artifact,
  isSelected,
  onSelect
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  // Load texture if available
  const texture = artifact.thumbnail_url ? useTexture(artifact.thumbnail_url) : null;

  useFrame((state) => {
    if (meshRef.current) {
      // Subtle floating animation
      meshRef.current.position.y = artifact.position_y + Math.sin(state.clock.elapsedTime *0.5)* 0.1;

      // Hologram flicker effect
      if (meshRef.current.material) {
        (meshRef.current.material as THREE.MeshStandardMaterial).opacity = 
          0.8 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      }
    }
  });

  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
      <group
        position={[artifact.position_x, artifact.position_y, artifact.position_z]}
        rotation={[
          artifact.rotation_x *Math.PI / 180,
          artifact.rotation_y* Math.PI / 180,
          artifact.rotation_z *Math.PI / 180
        ]}
        scale={artifact.scale}
      >
        {/* Main Hologram Panel */}
        <mesh
          ref={meshRef}
          onClick={() => onSelect(artifact)}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <planeGeometry args={[4, 3]} />
          <meshStandardMaterial
            map={texture}
            transparent
            opacity={isSelected ? 1 : 0.8}
            emissive={isSelected ? new THREE.Color(0x00ffff) : new THREE.Color(0x004444)}
            emissiveIntensity={isSelected ? 0.3 : 0.1}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Neon Frame */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[4.2, 3.2]} />
          <meshBasicMaterial
            color={isSelected ? 0x00ffff : 0x004444}
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Title Text */}
        <Text
          position={[0, -2, 0.1]}
          fontSize={0.3}
          color={isSelected ? '#00ffff' : '#ffffff'}
          anchorX="center"
          anchorY="middle"
          font="/fonts/orbitron-regular.woff"
        >
          {artifact.title}
        </Text>

        {/* Type Badge */}
        <Text
          position={[1.8, 1.3, 0.1]}
          fontSize={0.15}
          color="#ffaa00"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter-regular.woff"
        >
          {artifact.type.toUpperCase()}
        </Text>

        {/* Selection Glow */}
        {isSelected && (
          <Sparkles
            count={50}
            scale={[6, 4, 1]}
            size={2}
            speed={0.4}
            color="#00ffff"
          />
        )}

        {/* Hover Effect */}
        {hovered && !isSelected && (
          <mesh position={[0, 0, 0.05]}>
            <planeGeometry args={[4.4, 3.4]} />
            <meshBasicMaterial
              color={0x00ffff}
              transparent
              opacity={0.1}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
      </group>
    </Float>
  );
};

const CameraController: React.FC<{ selectedArtifact: Artifact | null }> = ({
  selectedArtifact
}) => {
  const { camera } = useThree();
  
  useEffect(() => {
    if (selectedArtifact) {
      // Smooth camera transition to selected artifact
      const targetPosition = new THREE.Vector3(
        selectedArtifact.position_x + 5,
        selectedArtifact.position_y + 2,
        selectedArtifact.position_z + 5
      );

      // Animate camera position
      const startPosition = camera.position.clone();
      const duration = 2000; // 2 seconds
      const startTime = Date.now();
      
      const animateCamera = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Smooth easing
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        camera.position.lerpVectors(startPosition, targetPosition, easeProgress);
        camera.lookAt(
          selectedArtifact.position_x,
          selectedArtifact.position_y,
          selectedArtifact.position_z
        );
        
        if (progress < 1) {
          requestAnimationFrame(animateCamera);
        }
      };
      
      animateCamera();
    }
  }, [selectedArtifact, camera]);
  
  return null;
};

interface CinematicGalleryProps {
  artifacts: Artifact[];
  onArtifactSelect: (artifact: Artifact) => void;
}

export const CinematicGallery: React.FC<CinematicGalleryProps> = ({
  artifacts,
  onArtifactSelect
}) => {
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);

  const handleArtifactSelect = (artifact: Artifact) => {
    setSelectedArtifact(artifact);
    onArtifactSelect(artifact);
  };

  return (
    <div className="w-full h-screen bg-void-black">
      <Canvas
        camera={{
          position: [0, 5, 10],
          fov: 60,
          near: 0.1,
          far: 1000
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        {/*Lighting Setup*/}
        <ambientLight intensity={0.2} color="#004444" />
        <directionalLight
          position={[10, 10, 5]}
          intensity={0.5}
          color="#00ffff"
          castShadow
        />
        <pointLight
          position={[-10, -10, -5]}
          intensity={0.3}
          color="#ff0040"
        />

        {/* Environment */}
        <Environment preset="night" />
        
        {/* Tron Grid Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
          <planeGeometry args={[100, 100]} />
          <meshBasicMaterial
            color="#001122"
            transparent
            opacity={0.3}
            wireframe
          />
        </mesh>

        {/* Artifacts */}
        {artifacts.map((artifact) => (
          <ArtifactHologram
            key={artifact.id}
            artifact={artifact}
            isSelected={selectedArtifact?.id === artifact.id}
            onSelect={handleArtifactSelect}
          />
        ))}

        {/* Camera Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={50}
          maxPolarAngle={Math.PI / 2}
        />
        
        <CameraController selectedArtifact={selectedArtifact} />
      </Canvas>
    </div>
  );
};

PHASE 4: AI CURATOR SYSTEM (Days 9-10)
Step 4.1: Create AI Curator Interface

Create src/components/ai/CuratorAgent.tsx:

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Zap,
  Brain,
  Eye
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'curator';
  content: string;
  timestamp: Date;
  context?: string;
}

interface CuratorAgentProps {
  currentArtifact?: any;
  onNavigateToArtifact?: (artifactId: number) => void;
}

export const CuratorAgent: React.FC<CuratorAgentProps> = ({
  currentArtifact,
  onNavigateToArtifact
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        handleSendMessage(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    synthesisRef.current = window.speechSynthesis;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting: Message = {
        id: Date.now().toString(),
        type: 'curator',
        content: `Welcome to Corey's portfolio. I'm your AI curator, intimately familiar with every aspect of his work. I can discuss his projects with the same critical eye and technical depth that Corey himself would. What would you like to explore?`,
        timestamp: new Date(),
        context: 'greeting'
      };
      setMessages([greeting]);
      speakMessage(greeting.content);
    }
  }, [isOpen]);

  const handleSendMessage = async (content: string = inputValue) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsThinking(true);

    // Simulate AI processing
    setTimeout(() => {
      const curatorResponse = generateCuratorResponse(content, currentArtifact);
      const curatorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'curator',
        content: curatorResponse,
        timestamp: new Date(),
        context: currentArtifact?.id?.toString()
      };

      setMessages(prev => [...prev, curatorMessage]);
      setIsThinking(false);
      speakMessage(curatorResponse);
    }, 1500);
  };

  const generateCuratorResponse = (userInput: string, artifact?: any): string => {
    const input = userInput.toLowerCase();

    // Context-aware responses based on current artifact
    if (artifact) {
      if (input.includes('this') || input.includes('current')) {
        return `You're viewing "${artifact.title}", a ${artifact.type} that demonstrates Corey's expertise in ${getExpertiseArea(artifact.type)}. This piece showcases his neurodivergent approach to problem-solving, where attention to detail and systematic thinking create innovative solutions. The technical implementation here reflects his trauma-informed design philosophy - notice how every interaction is predictable and clear.`;
      }
    }

    // General responses about Corey's work
    if (input.includes('style') || input.includes('aesthetic')) {
      return `Corey's aesthetic is "haute couture for PMs" - sophisticated, purposeful, never juvenile. Think Tron meets John Wick: dark, precise, with electric accents. Every design choice serves both function and emotional resonance. His neurodivergent perspective brings unique clarity to complex systems.`;
    }

    if (input.includes('ai') || input.includes('machine learning')) {
      return `Corey specializes in trauma-informed, human-aware ML systems. His work bridges generative UI, voice-interactive agents, and real-time perceptual feedback. He doesn't just build AI that responds - he crafts systems that resonate. His neurodivergent traits actually enhance his ability to create more inclusive, accessible AI experiences.`;
    }

    if (input.includes('neurodivergent') || input.includes('autism') || input.includes('bipolar')) {
      return `Corey's neurodivergence isn't a limitation - it's his superpower. His autistic traits bring systematic thinking and attention to detail that creates more robust systems. His bipolar experience gives him deep empathy for emotional states, informing his trauma-aware design approach. He designs for himself first, which makes his work more accessible for everyone.`;
    }

    if (input.includes('tour') || input.includes('show me') || input.includes('guide')) {
      return `I'd love to guide you through Corey's work. His portfolio spans data science visualizations, ML notebooks, and full-stack applications. Each piece demonstrates his philosophy of making AI personal, safe, and embodied. Where would you like to start - his technical projects or his design philosophy?`;
    }

    // Default response
    return `That's a fascinating question about Corey's work. His approach combines technical excellence with deep human understanding. As someone with both autism and bipolar disorder, he brings unique perspectives to AI and UX design. His systems don't just function - they feel right. What specific aspect would you like to explore deeper?`;
  };

  const getExpertiseArea = (type: string): string => {
    const areas: { [key: string]: string } = {
      'data-visualization': 'data storytelling and perceptual psychology',
      'ml-notebook': 'machine learning and algorithmic thinking',
      'web-app': 'full-stack development and user experience design',
      'ai-system': 'artificial intelligence and human-computer interaction'
    };
    return areas[type] || 'innovative problem-solving';
  };

  const speakMessage = (text: string) => {
    if (synthesisRef.current && !isSpeaking) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;

      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      synthesisRef.current.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const toggleSpeaking = () => {
    if (isSpeaking) {
      synthesisRef.current?.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <>
      {/*Curator Toggle Button*/}
      <motion.button
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-electric-cyan to-neon-blue rounded-full shadow-lg z-50 flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        animate={{
          boxShadow: isOpen
            ? '0 0 20px rgba(0, 255, 255, 0.5)'
            : '0 0 10px rgba(0, 255, 255, 0.3)'
        }}
      >
        <Brain className="w-8 h-8 text-void-black" />
      </motion.button>

      {/* Curator Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-8 w-96 h-[600px] bg-carbon-black/95 backdrop-blur-md border border-electric-cyan/30 rounded-lg shadow-2xl z-40 flex flex-col"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="p-4 border-b border-steel-gray/30 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-electric-cyan to-neon-blue rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-void-black" />
                </div>
                <div>
                  <h3 className="text-ice-white font-tron font-bold">AI Curator</h3>
                  <p className="text-platinum/60 text-xs">Corey's Digital Twin</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleSpeaking}
                  className={`p-2 rounded-lg transition-colors ${
                    isSpeaking 
                      ? 'bg-danger-red/20 text-danger-red' 
                      : 'bg-steel-gray/30 text-platinum/70 hover:text-ice-white'
                  }`}
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-neon-blue/20 text-ice-white'
                        : 'bg-steel-gray/30 text-platinum'
                    }`}
                  >
                    <p className="text-sm font-wick leading-relaxed">{message.content}</p>
                    <p className="text-xs text-platinum/50 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              ))}
              
              {isThinking && (
                <motion.div
                  className="flex justify-start"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="bg-steel-gray/30 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-electric-cyan animate-pulse" />
                      <span className="text-platinum/70 text-sm">Analyzing...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-steel-gray/30">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about Corey's work..."
                  className="flex-1 bg-steel-gray/30 text-ice-white placeholder-platinum/50 px-3 py-2 rounded-lg border border-steel-gray/50 focus:border-electric-cyan/50 focus:outline-none font-wick text-sm"
                />
                
                <button
                  onClick={toggleListening}
                  className={`p-2 rounded-lg transition-colors ${
                    isListening 
                      ? 'bg-danger-red/20 text-danger-red animate-pulse' 
                      : 'bg-steel-gray/30 text-platinum/70 hover:text-ice-white'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                
                <button
                  onClick={() => handleSendMessage()}
                  className="p-2 bg-electric-cyan/20 text-electric-cyan rounded-lg hover:bg-electric-cyan/30 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

PHASE 5: INTEGRATION & TESTING (Days 11-12)
Step 5.1: Update Main App Component

Update src/App.tsx:

import React, { useState, useEffect } from 'react';
import { TronLayout } from './components/core/TronLayout';
import { WickNavigation } from './components/core/WickNavigation';
import { CinematicGallery } from './components/3d/CinematicGallery';
import { CuratorAgent } from './components/ai/CuratorAgent';
import '@fontsource/orbitron/400.css';
import '@fontsource/orbitron/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/jetbrains-mono/400.css';

// Mock data - replace with your actual data
const mockArtifacts = [
  {
    id: 1,
    title: "Neural Network Visualization",
    type: "data-visualization",
    position_x: -5,
    position_y: 2,
    position_z: 0,
    rotation_x: 0,
    rotation_y: 15,
    rotation_z: 0,
    scale: 1,
    description: "Interactive visualization of deep learning architectures",
    thumbnail_url: "/images/neural-viz.jpg"
  },
  {
    id: 2,
    title: "Sentiment Analysis Engine",
    type: "ml-notebook",
    position_x: 0,
    position_y: 2,
    position_z: -3,
    rotation_x: 0,
    rotation_y: 0,
    rotation_z: 0,
    scale: 1.2,
    description: "Real-time emotion detection for trauma-informed AI",
    thumbnail_url: "/images/sentiment-engine.jpg"
  },
  {
    id: 3,
    title: "TalkingCanvas Interface",
    type: "web-app",
    position_x: 5,
    position_y: 1,
    position_z: 2,
    rotation_x: 0,
    rotation_y: -20,
    rotation_z: 0,
    scale: 0.9,
    description: "Voice-interactive UI for neurodivergent users",
    thumbnail_url: "/images/talking-canvas.jpg"
  }
];

function App() {
  const [selectedArtifact, setSelectedArtifact] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 2000);
  }, []);

  if (isLoading) {
    return (
      <TronLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-electric-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-ice-white font-tron text-xl mb-2">Initializing Portfolio</h2>
            <p className="text-platinum/60 font-wick">Loading Corey's digital universe...</p>
          </div>
        </div>
      </TronLayout>
    );
  }

  return (
    <TronLayout>
      <WickNavigation />

      <main className="ml-20 h-screen">
        <CinematicGallery
          artifacts={mockArtifacts}
          onArtifactSelect={setSelectedArtifact}
        />
      </main>

      <CuratorAgent
        currentArtifact={selectedArtifact}
        onNavigateToArtifact={(id) => {
          const artifact = mockArtifacts.find(a => a.id === id);
          setSelectedArtifact(artifact);
        }}
      />
    </TronLayout>
  );
}

export default App;

FINAL CHECKLIST FOR AUTONOMOUS IMPLEMENTATION
✅ Pre-Implementation Verification
 All dependencies installed correctly
 Tailwind configuration updated
 Font files accessible
 TypeScript types defined
 File structure created
✅ Component Implementation Order
 TronLayout (base styling)
 WickNavigation (sidebar)
 CinematicGallery (3D space)
 CuratorAgent (AI interface)
 App integration
✅ Testing Checklist
 3D gallery renders without errors
 Navigation animations smooth
 Voice recognition works
 Text-to-speech functions
 Responsive design intact
 Performance optimized
✅ Accessibility Features
 High contrast ratios maintained
 Clear visual hierarchy
 Voice controls functional
 Keyboard navigation
 Screen reader compatible

This transformation will elevate your portfolio from juvenile to sophisticated, embodying the Tron-meets-John-Wick aesthetic you desire while maintaining all the advanced functionality for neurodivergent users. The result will be a truly haute couture digital experience worthy of your expertise.
