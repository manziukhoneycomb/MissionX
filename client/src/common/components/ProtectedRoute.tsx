import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useUserRoles from '../hooks/useUserRoles';
import { RoleValue } from '../constants/roles';
import { useAuth } from '@clerk/clerk-react';

interface ProtectedRouteProps {
  requiredRoles: RoleValue[];
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRoles, children }) => {
  const { isSignedIn } = useAuth();
  const userRoles = useUserRoles();
  const location = useLocation();

  if (!isSignedIn) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  const hasRequiredRole = userRoles.some((role) => requiredRoles.includes(role as RoleValue));

  if (!hasRequiredRole) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
