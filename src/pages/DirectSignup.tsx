import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const DirectSignup = () => {
  const navigate = useNavigate();
  const { setBackendAuth } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Step 1: Register with backend first
      console.log('🔄 Direct signup - Registering with backend...');
      try {
        await apiClient.register({
          email: formData.email,
          password: formData.password,
          name: `${formData.firstName} ${formData.lastName}`,
          machine_name: "Assistant", // Default name
          contradiction_tolerance: 0,
          belief_sensitivity: "{}" // Default empty JSON
        });
        console.log('✅ Backend registration successful');
      } catch (backendError) {
        console.log('⚠️ Backend registration failed, continuing with Supabase...');
        // Continue anyway - user might already exist in backend
      }

      // Step 2: Create Supabase user account
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName
          }
        }
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (!authData.user) {
        setError('Failed to create user account');
        return;
      }

      // Step 3: Authenticate with backend to get token
      console.log('🔄 Getting backend token...');
      try {
        const loginResponse = await apiClient.login({
          email: formData.email,
          password: formData.password
        });

        if (loginResponse.access_token) {
          // Store backend token and user data
          localStorage.setItem('memduo_token', loginResponse.access_token);
          localStorage.setItem('memduo_backend_auth', 'true');
          localStorage.setItem('memduo_user_email', formData.email);
          if (loginResponse.user) {
            localStorage.setItem('memduo_user_data', JSON.stringify(loginResponse.user));
          }

          // Set backend auth state
          setBackendAuth(true, loginResponse.user || null);
          console.log('✅ Backend authentication successful');
        }
      } catch (backendAuthError) {
        console.error('❌ Backend authentication failed:', backendAuthError);
        // Continue anyway - user has Supabase account
      }

      toast.success('Account created successfully! Redirecting to onboarding...');
      
      // Redirect to onboarding flow
      navigate('/onboarding', { replace: true });

    } catch (err) {
      console.error('Registration error:', err);
      setError('An unexpected error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black p-4">
      <Card className="w-full max-w-md z-10 neural-glass-premium neural-glass-hover">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/lovable-uploads/7b4c7179-5f77-44b2-8117-fba1f5c3a4a8.png" 
              alt="MemDuo" 
              className="h-12 w-12 object-contain"
            />
          </div>
          <CardTitle className="text-center bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">
            Direct Account Creation
          </CardTitle>
          <CardDescription className="text-center">
            Create your MemDuo account instantly - no waitlist required
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full neural-glass-hover" 
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account & Continue'}
            </Button>
          </form>

          <div className="mt-6 p-4 neural-glass rounded-lg">
            <p className="text-xs text-gray-400 text-center">
              🔐 Secret access detected • Bypassing waitlist approval
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DirectSignup;