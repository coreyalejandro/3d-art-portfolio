
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/utils/trpc';
import type { User, CreateUserInput } from '../../../server/src/schema';

interface AuthPanelProps {
  onUserLogin: (user: User) => void;
}

export function AuthPanel({ onUserLogin }: AuthPanelProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateUserInput>({
    email: '',
    username: '',
    display_name: '',
    avatar_url: undefined
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isLogin) {
        // For demonstration, create a demo user account
        // In production, this would authenticate with existing credentials
        const demoUser: User = {
          id: Date.now(),
          email: formData.email || 'demo@example.com',
          username: formData.username || 'demo_user',
          display_name: formData.display_name || 'Demo User',
          avatar_url: null,
          created_at: new Date(),
          updated_at: new Date()
        };
        onUserLogin(demoUser);
      } else {
        const newUser = await trpc.createUser.mutate(formData);
        onUserLogin(newUser);
      }
    } catch (error) {
      console.error('Authentication failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader className="text-center">
        <CardTitle className="text-white">
          {isLogin ? '🔑 Sign In' : '✨ Create Account'}
        </CardTitle>
        <CardDescription className="text-blue-200">
          {isLogin ? 'Enter your details to continue' : 'Join the immersive art community'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email address"
            value={formData.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData((prev: CreateUserInput) => ({ ...prev, email: e.target.value }))
            }
            className="bg-white/10 border-white/30 text-white placeholder:text-gray-400"
            required
          />
          
          {!isLogin && (
            <>
              <Input
                placeholder="Username"
                value={formData.username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateUserInput) => ({ ...prev, username: e.target.value }))
                }
                className="bg-white/10 border-white/30 text-white placeholder:text-gray-400"
                required
              />
              <Input
                placeholder="Display Name"
                value={formData.display_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateUserInput) => ({ ...prev, display_name: e.target.value }))
                }
                className="bg-white/10 border-white/30 text-white placeholder:text-gray-400"
                required
              />
              <Input
                type="url"
                placeholder="Avatar URL (optional)"
                value={formData.avatar_url || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateUserInput) => ({ 
                    ...prev, 
                    avatar_url: e.target.value || undefined 
                  }))
                }
                className="bg-white/10 border-white/30 text-white placeholder:text-gray-400"
              />
            </>
          )}
          
          <Button 
            type="submit" 
            className="w-full bg-purple-600 hover:bg-purple-700"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            className="w-full text-blue-300 hover:text-white"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
