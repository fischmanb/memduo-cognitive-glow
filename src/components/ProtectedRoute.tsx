
import { useAuth } from "../contexts/AuthContext";
import PasswordEntry from "../pages/PasswordEntry";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <PasswordEntry />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
