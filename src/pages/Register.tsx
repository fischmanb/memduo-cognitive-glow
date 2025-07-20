
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Register = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [approvedUserData, setApprovedUserData] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (token) {
      validateToken();
    } else {
      setError('No registration token provided');
      setTokenValid(false);
    }
  }, [token]);

  const validateToken = async () => {
    try {
      setIsLoading(true);
      
      // Get approved user data by token
      const { data: approvedUser, error: tokenError } = await supabase
        .from('approved_users')
        .select(`
          *,
          waitlist_submission_id (
            first_name,
            last_name,
            email
          )
        `)
        .eq('setup_token', token)
        .eq('account_created', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (tokenError || !approvedUser) {
        setError('Invalid or expired registration token');
        setTokenValid(false);
        return;
      }

      setApprovedUserData(approvedUser);
      setTokenValid(true);
      
      // Pre-populate form with waitlist data
      const waitlistData = approvedUser.waitlist_submission_id;
      if (waitlistData) {
        setFormData(prev => ({
          ...prev,
          firstName: waitlistData.first_name || '',
          lastName: waitlistData.last_name || '',
          email: waitlistData.email || ''
        }));
      }
    } catch (err) {
      console.error('Token validation error:', err);
      setError('Error validating registration token');
      setTokenValid(false);
    } finally {
      setIsLoading(false);
    }
  };

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
      // Create Supabase user account
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

      // Mark the approved user as having created an account
      const { error: updateError } = await supabase
        .from('approved_users')
        .update({ account_created: true })
        .eq('setup_token', token);

      if (updateError) {
        console.error('Error updating approved user:', updateError);
      }

      // Mark magic link as used if it exists
      const { error: linkError } = await supabase
        .from('magic_links')
        .update({ 
          used: true, 
          used_at: new Date().toISOString() 
        })
        .eq('approved_user_id', approvedUserData.id);

      if (linkError) {
        console.error('Error updating magic link:', linkError);
      }

      toast.success('Account created successfully! Complete your profile setup.');
      
      // Redirect to onboarding flow instead of main app
      navigate('/onboarding', { replace: true });

    } catch (err) {
      console.error('Registration error:', err);
      setError('An unexpected error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && tokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Validating registration token...</p>
        </div>
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md z-10 neural-glass-premium">
          <CardHeader>
            <CardTitle className="text-destructive">Invalid Registration Link</CardTitle>
            <CardDescription>
              This registration link is invalid, expired, or has already been used.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/')} 
              className="w-full neural-glass-hover"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md z-10 neural-glass-premium neural-glass-hover">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/lovable-uploads/101a3a9b-610a-41f7-b143-4f57fcf9ed32.png" 
              alt="MemDuo" 
              className="h-12 w-12 object-contain"
            />
          </div>
          <CardTitle className="text-center bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">
            Create Your MemDuo Account
          </CardTitle>
          <CardDescription className="text-center">
            Complete your registration to access the platform
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
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
