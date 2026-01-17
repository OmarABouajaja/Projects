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

  // REMOVED: The block that showed spinner if (user && role === null)
  // Reason: If role fetch fails (e.g. RLS block), role remains null and isLoading becomes false.
  // We must NOT show spinner here, effectively trapping the user. We must let it fall through to "Access Denied".

  // Redirect to primary staff login route if not authenticated
  if (!user) {
    return <Navigate to="/management-gs-zarzis" replace />;
  }

  // If we have a user but no role (and not loading), it means role fetch failed or user has no role.
  // CRITICAL FIX: Do NOT redirect to login, as login will redirect back here -> Infinite Loop.
  // Instead, show an "Access Denied" or "Role Missing" screen.
  if (!role || (role !== 'owner' && role !== 'worker')) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-bold text-destructive mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-4">You do not have the required permissions to access this area.</p>
        <button
          onClick={() => window.location.href = '/management-gs-zarzis'}
          className="bg-primary text-secondary px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          Return to Login
        </button>
      </div>
    );
  }

  if (requireOwner && !isOwner) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
