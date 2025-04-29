
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import HealableLogo from '@/components/HealableLogo';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { MotionWrapper } from '@/components/ui/motion-wrapper';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      if (success) {
        navigate('/ethics-agreement');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center login-container bg-gradient-to-b from-[#00304a]/10 to-[#003b57]/5">
      <div className="w-full max-w-md px-4">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex justify-center mb-12"
        >
          <div className="animate-float">
            <HealableLogo size="lg" animateOnHover={true} />
          </div>
        </motion.div>
        
        <MotionWrapper variant="fadeUp">
          <Card className="w-full shadow-lg border-healable-light">
            <CardHeader className="space-y-1">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <CardTitle className="text-2xl font-serif text-center bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-amber-700">
                  Welcome Back
                </CardTitle>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <CardDescription className="text-center">
                  Sign in to your account to continue
                </CardDescription>
              </motion.div>
            </CardHeader>
            <CardContent>
              <motion.form 
                onSubmit={handleSubmit} 
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <User size={16} />
                    </div>
                    <Input
                      id="email"
                      placeholder="Enter your email"
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
                      placeholder="Enter your password"
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
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </motion.div>
              </motion.form>
            </CardContent>
          </Card>
        </MotionWrapper>
      </div>
    </div>
  );
};

export default LoginPage;
