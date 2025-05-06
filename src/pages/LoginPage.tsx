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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserRole } from '@/contexts/AuthContext';
import { toast } from "@/components/ui/sonner";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    role: ''
  });
  const navigate = useNavigate();
  const { login } = useAuth();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {
      email: '',
      password: '',
      role: ''
    };
    let isValid = true;

    if (!email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    if (!role) {
      newErrors.role = 'Please select a role';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await login(email, password, role);
      if (!success) {
        setPassword(''); // Clear password on failed login
      }
    } catch (error) {
      toast.error('An error occurred during login. Please try again.');
      setPassword(''); // Clear password on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center login-container">
      <div className="w-full max-w-md px-4">
        <MotionWrapper 
          variant="scale" 
          className="flex justify-center mb-8"
        >
          <HealableLogo size="lg" />
        </MotionWrapper>
        
        <MotionWrapper variant="fadeUp">
          <Card className="w-full shadow-lg border-healable-light">
            <CardHeader className="space-y-1">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <CardTitle className="text-2xl font-semibold text-center text-healable-secondary">
                  Welcome
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
                noValidate
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
                      className={`pl-10 ${errors.email ? 'border-red-500 focus:border-red-500 ring-red-500 focus:ring-red-500' : ''}`}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) {
                          setErrors(prev => ({ ...prev, email: '' }));
                        }
                      }}
                      onBlur={() => {
                        if (!email) {
                          setErrors(prev => ({ ...prev, email: 'Email is required' }));
                        } else if (!validateEmail(email)) {
                          setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
                        }
                      }}
                      required
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                  )}
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
                      className={`pl-10 pr-10 ${errors.password ? 'border-red-500 focus:border-red-500 ring-red-500 focus:ring-red-500' : ''}`}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) {
                          setErrors(prev => ({ ...prev, password: '' }));
                        }
                      }}
                      onBlur={() => {
                        if (!password) {
                          setErrors(prev => ({ ...prev, password: 'Password is required' }));
                        }
                      }}
                      required
                    />
                    <button 
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-500"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select 
                    value={role} 
                    onValueChange={(value) => {
                      setRole(value as UserRole);
                      if (errors.role) {
                        setErrors(prev => ({ ...prev, role: '' }));
                      }
                    }}
                  >
                    <SelectTrigger 
                      className={`${errors.role ? 'border-red-500 focus:border-red-500 ring-red-500 focus:ring-red-500' : ''}`}
                    >
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="physician">Physician</SelectItem>
                      <SelectItem value="caseManager">Case Manager</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="analyst">Operations/Analyst</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-sm text-red-500 mt-1">{errors.role}</p>
                  )}
                </div>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    type="submit" 
                    className="w-full bg-healable-primary hover:bg-healable-secondary transition-colors"
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
