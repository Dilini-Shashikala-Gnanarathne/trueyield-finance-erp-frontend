import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

// ── Lazy-loaded pages (code-split per route) ──────────────────────────────────
const Dashboard    = lazy(() => import('@/pages/Dashboard/Dashboard'));
const Payroll      = lazy(() => import('@/pages/Payroll/Payroll'));
const JournalEntry = lazy(() => import('@/pages/JournalEntry/JournalEntry'));
const History      = lazy(() => import('@/pages/History/History'));

function PageFallback() {
  return (
    <div className="page-loading">
      <LoadingSpinner size="lg" label="Loading page…" />
    </div>
  );
}

export default function App() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">
        <ErrorBoundary>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/"                element={<Dashboard />}    />
              <Route path="/payroll"         element={<Payroll />}      />
              <Route path="/journal-entries" element={<JournalEntry />} />
              <Route path="/history"         element={<History />}      />
              {/* Catch-all: redirect unknown paths to dashboard */}
              <Route path="*"               element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}
