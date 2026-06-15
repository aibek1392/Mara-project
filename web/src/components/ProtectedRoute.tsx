import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types";

interface Props {
  role?: UserRole | UserRole[];
}

export function ProtectedRoute({ role }: Props) {
  const { user, isRole } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role) {
    const allowed = Array.isArray(role) ? role : [role];
    if (!allowed.some((r) => isRole(r))) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}
