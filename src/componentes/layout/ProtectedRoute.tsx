import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../../hooks/useAuth";
import { LoadingScreen } from "../ui/LoadingScreen";

/**
 * Waits for the session to resolve before deciding.
 *
 * The previous code read a single `isloading` flag that was already false
 * while the plan was still in flight, so a signed-in athlete refreshing the
 * dashboard got bounced back through onboarding.
 */
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isAuthLoading } = useAuth();
  const location = useLocation();

  if (isAuthLoading) return <LoadingScreen />;

  if (!user) {
    // Remember where they were headed so sign-in can send them back.
    return <Navigate to="/auth/sign-in" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
