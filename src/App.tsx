import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Sidebar from "@/components/layout/Sidebar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

// ── Lazy-loaded pages ─────────────────────────────────────────────────────────
const Dashboard    = lazy(() => import("@/pages/Dashboard/Dashboard"));
const JournalEntry = lazy(() => import("@/pages/JournalEntry/JournalEntry"));
const Login        = lazy(() => import("@/pages/Auth/Login"));
const Register     = lazy(() => import("@/pages/Auth/Register"));
const Profile      = lazy(() => import("@/pages/Profile/Profile"));
const Marketplace  = lazy(() => import("@/pages/Marketplace/Marketplace"));
const MyListings   = lazy(() => import("@/pages/MyListings/MyListings"));
const Produce      = lazy(() => import("@/pages/Produce/Produce"));
const ListingDetails= lazy(() => import("@/pages/Marketplace/ListingDetails"));

function PageFallback() {
  return (
    <div className="page-loading">
      <LoadingSpinner size="lg" label="Loading page..." />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* ── Public auth routes (no sidebar) ──────────────────────── */}
        <Route path="/auth/login"    element={<Suspense fallback={<PageFallback />}><Login /></Suspense>} />
        <Route path="/auth/register" element={<Suspense fallback={<PageFallback />}><Register /></Suspense>} />

        {/* ── Protected app routes (with sidebar) ──────────────────── */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="app-shell">
                <Sidebar />
                <main className="app-main">
                  <ErrorBoundary>
                    <Suspense fallback={<PageFallback />}>
                      <Routes>
                        <Route path="/"                element={<Dashboard />}    />
                        <Route path="/journal-entries" element={<JournalEntry />} />
                        <Route path="/profile"         element={<Profile />}      />
                        <Route path="/marketplace"     element={<Marketplace />}  />
                        <Route path="/my-listings"     element={<MyListings />}   />
                        <Route path="/produce"         element={<Produce />}      />
                        <Route path="/marketplace/:id" element={<ListingDetails />} />
                        <Route path="*"                element={<Navigate to="/" replace />} />
                      </Routes>
                    </Suspense>
                  </ErrorBoundary>
                </main>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
