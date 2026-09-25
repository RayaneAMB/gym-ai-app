import { Navigate, useParams } from "react-router-dom";
import { AuthView, NeonAuthUIProvider } from "@neondatabase/neon-js/auth/react";

import { authClient } from "../lib/auth";
import { useAuth } from "../hooks/useAuth";
import { LoadingScreen } from "../componentes/ui/LoadingScreen";

/**
 * The Neon account UI provider lives here rather than at the app root: it is
 * the heaviest dependency in the bundle and only these two routes render it.
 */
export default function Auth() {
  const { pathname } = useParams();
  const { user, isAuthLoading } = useAuth();

  if (isAuthLoading) return <LoadingScreen />;
  if (user) return <Navigate to="/profile" replace />;

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 flex items-center justify-center">
      <div className="max-w-md w-full">
        <NeonAuthUIProvider authClient={authClient}>
          <AuthView pathname={pathname} />
        </NeonAuthUIProvider>
      </div>
    </div>
  );
}
