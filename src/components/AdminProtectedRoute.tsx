
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import AdminLogin from "../pages/AdminLogin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Lock } from "lucide-react";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated: isMainAppAuthenticated, login: mainAppLogin } = useAuth();
  const { isAuthenticated: isAdminAuthenticated, loading } = useAdminAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [attempting, setAttempting] = useState(false);

  const handleMainAppLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAttempting(true);
    setError("");

    const success = mainAppLogin(password);
    if (!success) {
      setError("Invalid access code");
    }
    setAttempting(false);
  };

  // Show loading spinner while checking admin auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // First gate: Main app authentication
  if (!isMainAppAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Lock className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Restricted Access</CardTitle>
            <CardDescription>
              Enter access code to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleMainAppLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Access Code
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter access code"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={attempting}
              >
                {attempting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background"></div>
                    <span>Verifying...</span>
                  </div>
                ) : (
                  'Continue'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Second gate: Admin authentication
  if (!isAdminAuthenticated) {
    return <AdminLogin />;
  }

  // Both gates passed - show admin dashboard
  return <>{children}</>;
};

export default AdminProtectedRoute;
