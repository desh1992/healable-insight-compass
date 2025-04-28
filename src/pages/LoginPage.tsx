
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import HealableLogo from '@/components/HealableLogo';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Eye, EyeOff, Lock, User } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password');
  const [role, setRole] = useState<UserRole>('physician');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await login(email, password, role);
      if (success) {
        navigate('/ethics-agreement');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center login-container">
      <div className="w-full max-w-md px-4">
        <div className="flex justify-center mb-8">
          <HealableLogo size="lg" />
        </div>
        
        <Card className="w-full animate-fade-in shadow-lg border-healable-light">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold text-center text-healable-secondary">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-center">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <User size={16} />
                  </div>
                  <Input
                    id="email"
                    placeholder="you@healable.com"
                    type="email"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Lock size={16} />
                  </div>
                  <Input
                    id="password"
                    placeholder="********"
                    type={showPassword ? "text" : "password"}
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Select Your Role</Label>
                <RadioGroup 
                  defaultValue="physician"
                  className="grid grid-cols-2 gap-2"
                  value={role}
                  onValueChange={(value) => setRole(value as UserRole)}
                >
                  <div className="flex items-center space-x-2 border rounded-md p-3">
                    <RadioGroupItem value="physician" id="physician" />
                    <Label htmlFor="physician" className="cursor-pointer w-full">Physician</Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-3">
                    <RadioGroupItem value="caseManager" id="caseManager" />
                    <Label htmlFor="caseManager" className="cursor-pointer w-full">Case Manager</Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-3">
                    <RadioGroupItem value="admin" id="admin" />
                    <Label htmlFor="admin" className="cursor-pointer w-full">Administrator</Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-3">
                    <RadioGroupItem value="analyst" id="analyst" />
                    <Label htmlFor="analyst" className="cursor-pointer w-full">Operations/Analyst</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-healable-primary hover:bg-healable-secondary transition-colors"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
              
              <div className="text-xs text-center text-gray-500 mt-4">
                <p>Demo credentials:</p>
                <p className="text-muted-foreground">
                  Use any email ending with @healable.com with password: password
                </p>
                <p className="text-muted-foreground mt-1">
                  Pre-set accounts: dr.smith@healable.com (physician), case.jones@healable.com (caseManager),
                  admin@healable.com (admin), analyst@healable.com (analyst)
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
