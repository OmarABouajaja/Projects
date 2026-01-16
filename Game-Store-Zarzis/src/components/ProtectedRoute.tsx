import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
  requireOwner?: boolean;
}

// ProtectedRoute only guards /dashboard routes - does NOT interfere with public auth routes
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireOwner = false }) => {
  const { user, role, isLoading, isOwner } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>;
  }

  // If user is authenticated but role isn't loaded yet, show loading
  if (user && role === null) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>;
  }

  // Redirect to primary staff login route if not authenticated
  if (!user) {
    return <Navigate to="/management-gs-zarzis" replace />;
  }

  if (role !== 'owner' && role !== 'worker') {
    return <Navigate to="/management-gs-zarzis" replace />;
  }

  if (requireOwner && !isOwner) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
