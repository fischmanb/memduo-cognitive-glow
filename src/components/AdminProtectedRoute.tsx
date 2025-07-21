import { useAdminAuth } from "../contexts/AdminAuthContext";
import AdminLogin from "../pages/AdminLogin";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated: isAdminAuthenticated, loading } = useAdminAuth();

  // Show loading spinner while checking admin auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show admin login if not authenticated
  if (!isAdminAuthenticated) {
    return <AdminLogin />;
  }

  // Admin authenticated - show admin dashboard
  return <>{children}</>;
};

export default AdminProtectedRoute;