import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Setup: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [validToken, setValidToken] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const token = searchParams.get('setup_token') || searchParams.get('token');

  useEffect(() => {
    console.log('Setup page loaded with token:', token);
    if (token) {
      validateToken(token);
    } else {
      console.log('No setup token provided');
      setLoading(false);
      setError('No setup token provided');
    }
  }, [token]);

  const validateToken = async (setupToken: string) => {
    try {
      console.log('Validating token:', setupToken);
      console.log('Current time:', new Date().toISOString());
      
      // First get the approved user record
      const { data: approvedUser, error: approvedError } = await supabase
        .from('approved_users')
        .select('*')
        .eq('setup_token', setupToken)
        .eq('account_created', false)
        .gte('expires_at', new Date().toISOString())
        .single();

      console.log('Approved user query result:', { approvedUser, approvedError });

      if (approvedError) {
        console.error('Approved user error:', approvedError);
        
        // Try without the time constraint to see if the token exists at all
        const { data: tokenCheck, error: tokenCheckError } = await supabase
          .from('approved_users')
          .select('*')
          .eq('setup_token', setupToken)
          .single();
          
        console.log('Token check result:', { tokenCheck, tokenCheckError });
        
        if (tokenCheckError) {
          setError('Invalid setup token');
        } else if (tokenCheck.account_created) {
          setError('This registration link has already been used');
        } else if (new Date(tokenCheck.expires_at) < new Date()) {
          setError('This registration link has expired');
        } else {
          setError('Invalid or expired setup token');
        }
        setLoading(false);
        return;
      }

      if (!approvedUser) {
        setError('Invalid or expired setup token');
        setLoading(false);
        return;
      }

      // Then get the waitlist submission
      const { data: waitlistData, error: waitlistError } = await supabase
        .from('waitlist_submissions')
        .select('first_name, last_name, email')
        .eq('id', approvedUser.waitlist_submission_id)
        .single();

      console.log('Waitlist query result:', { waitlistData, waitlistError });

      if (waitlistError || !waitlistData) {
        console.error('Waitlist data error:', waitlistError);
        setError('Invalid setup token');
        setLoading(false);
        return;
      }

      console.log('Token validation successful');
      setValidToken(true);
      setUserInfo({
        ...approvedUser,
        waitlist_submissions: waitlistData
      });
      setLoading(false);
    } catch (error) {
      console.error('Error validating token:', error);
      setError('Failed to validate setup token');
      setLoading(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setCreating(true);
    setError('');

    try {
      const email = userInfo.waitlist_submissions.email;
      const firstName = userInfo.waitlist_submissions.first_name;
      const lastName = userInfo.waitlist_submissions.last_name;

      // Create Supabase auth account
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (signUpError) {
        console.error('Sign up error:', signUpError);
        
        // If user already exists, that's actually OK - the account was created before
        if (signUpError.message?.includes('already registered')) {
          // Mark the token as used and proceed
          const { error: updateError } = await supabase
            .from('approved_users')
            .update({ account_created: true })
            .eq('id', userInfo.id);

          if (updateError) {
            console.error('Error updating approved user:', updateError);
          }

          toast({
            title: "Account already exists",
            description: "Please sign in with your existing credentials.",
          });
          
          navigate('/register');
          return;
        }
        
        setError(signUpError.message || 'Failed to create account');
        setCreating(false);
        return;
      }

      // Mark approved user as account created
      const { error: updateError } = await supabase
        .from('approved_users')
        .update({ account_created: true })
        .eq('id', userInfo.id);

      if (updateError) {
        console.error('Error updating approved user:', updateError);
        // Don't fail the whole process for this
      }

      // Don't sign out the user - we want to keep them logged in for onboarding
      // await supabase.auth.signOut();

      // Store setup data for onboarding flow
      sessionStorage.setItem('setupData', JSON.stringify({
        email,
        password,
        firstName,
        lastName
      }));

      toast({
        title: "Account created successfully!",
        description: "Please complete your onboarding to set up your AI assistant.",
      });

      // Direct redirect to onboarding flow
      navigate('/onboarding');

    } catch (error) {
      console.error('Error creating account:', error);
      setError('Failed to create account. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (!validToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Invalid Setup Link</h2>
              <p className="text-muted-foreground mb-4">
                {error || 'This setup link is invalid or has expired.'}
              </p>
              <Button onClick={() => navigate('/')}>
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Complete Your Registration</CardTitle>
          <CardDescription>
            Welcome {userInfo?.waitlist_submissions?.first_name}! Create your password to finish setting up your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-200 block mb-2">
                Email Address
              </label>
              <Input
                type="email"
                value={userInfo?.waitlist_submissions?.email || ''}
                disabled
                className="bg-gray-800 border-gray-600 text-gray-300"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-200 block mb-2">
                Create Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-200 block mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10"
                  placeholder="Confirm your password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={creating || !password || !confirmPassword}
            >
              {creating ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Setup;