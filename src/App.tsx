import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import AuthProvider from "./context/AuthContext";
import Navbar from "./componentes/layout/Navbar";
import ProtectedRoute from "./componentes/layout/ProtectedRoute";
import { ErrorBoundary } from "./componentes/ui/ErrorBoundary";
import { LoadingScreen } from "./componentes/ui/LoadingScreen";
import Home from "./pages/Home";

/*
 * Only the landing page ships in the entry chunk. Onboarding pulls in the
 * multi-step form, the dashboard pulls in Framer Motion, and the auth screens
 * pull in Neon's account UI — none of which a first-time visitor needs before
 * they click something.
 */
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Profile = lazy(() => import("./pages/Profile"));
const Auth = lazy(() => import("./pages/Auth"));
const Account = lazy(() => import("./pages/Account"));

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
            <Navbar />
            <main className="flex-1">
              <Suspense fallback={<LoadingScreen />}>
                <Routes>
                  <Route index element={<Home />} />
                  <Route
                    path="/onboarding"
                    element={
                      <ProtectedRoute>
                        <Onboarding />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/:pathname?"
                    element={
                      <ProtectedRoute>
                        <Account />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/auth/:pathname" element={<Auth />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </main>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
