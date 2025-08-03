import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApprovedUser {
  id: string;
  waitlist_submission_id: string;
  setup_token: string;
  account_created: boolean;
  expires_at: string;
  waitlist_submissions?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

const AccountSetup: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = searchParams.get('token');
  
  const [approvedUser, setApprovedUser] = useState<ApprovedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing setup token');
      setLoading(false);
      return;
    }

    fetchApprovedUser();
  }, [token]);

  const fetchApprovedUser = async () => {
    try {
      const { data, error } = await supabase
        .from('approved_users')
        .select(`
          *,
          waitlist_submissions (
            first_name,
            last_name,
            email
          )
        `)
        .eq('setup_token', token)
        .single();

      if (error) {
        console.error('Error fetching approved user:', error);
        setError('Invalid or expired setup token');
        return;
      }

      if (!data) {
        setError('Setup token not found');
        return;
      }

      // Check if token is expired
      const expiresAt = new Date(data.expires_at);
      if (expiresAt < new Date()) {
        setError('Setup token has expired');
        return;
      }

      // Check if account is already created
      if (data.account_created) {
        setError('Account has already been set up');
        return;
      }

      setApprovedUser(data);
    } catch (error) {
      console.error('Error fetching approved user:', error);
      setError('Failed to verify setup token');
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
    if (!/\d/.test(password)) errors.push('One number');
    return errors;
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!approvedUser?.waitlist_submissions?.email) {
      setError('User email not found');
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setError(`Password must contain: ${passwordErrors.join(', ')}`);
      return;
    }

    setCreating(true);

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: approvedUser.waitlist_submissions.email,
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // Mark account as created
      const { error: updateError } = await supabase
        .from('approved_users')
        .update({ account_created: true })
        .eq('id', approvedUser.id);

      if (updateError) {
        console.error('Error updating approved user:', updateError);
        // Don't throw here as the account was created successfully
      }

      toast({
        title: "Account Created Successfully!",
        description: "You can now log in with your new credentials.",
      });

      // Direct redirect to main page
      navigate('/');

    } catch (error: any) {
      console.error('Error creating account:', error);
      setError(error.message || 'Failed to create account');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-xl text-red-600">Setup Error</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="mt-4 text-center">
              <Button onClick={() => navigate('/')} variant="outline">
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const passwordErrors = validatePassword(password);
  const isPasswordValid = passwordErrors.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome to MemDuo!</CardTitle>
          <CardDescription>
            Complete your account setup
          </CardDescription>
        </CardHeader>
        <CardContent>
          {approvedUser?.waitlist_submissions && (
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium">Account Details:</p>
              <p className="text-sm text-muted-foreground">
                {approvedUser.waitlist_submissions.first_name} {approvedUser.waitlist_submissions.last_name}
              </p>
              <p className="text-sm text-muted-foreground">
                {approvedUser.waitlist_submissions.email}
              </p>
            </div>
          )}

          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password && (
                <div className="text-xs space-y-1">
                  {passwordErrors.map((error, index) => (
                    <div key={index} className="flex items-center space-x-1 text-red-600">
                      <XCircle className="h-3 w-3" />
                      <span>{error}</span>
                    </div>
                  ))}
                  {isPasswordValid && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      <span>Password meets all requirements</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <div className="flex items-center space-x-1 text-red-600 text-xs">
                  <XCircle className="h-3 w-3" />
                  <span>Passwords do not match</span>
                </div>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={creating || !isPasswordValid || password !== confirmPassword}
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

export default AccountSetup;