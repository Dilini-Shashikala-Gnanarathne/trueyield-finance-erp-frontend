import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';
import { env } from './env';

// ── TanStack Query client configuration ────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data stays fresh for 30 s before background refetch
      staleTime: 30_000,
      // Retry once on failure (health checks may flicker)
      retry: 1,
      retryDelay: 1_000,
      // Don't refetch just because the user switched tabs
      refetchOnWindowFocus: false,
    },
    mutations: {
      // Mutations never auto-retry — idempotency must be explicit
      retry: 0,
    },
  },
});

// ── Root mount ─────────────────────────────────────────────────────────────────
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error(
    '[main] #root element not found in index.html. The app cannot start.',
  );
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          gutter={8}
          toastOptions={{
            duration: 5_000,
            style: {
              background: 'var(--clr-surface-elevated)',
              color: 'var(--clr-text-primary)',
              border: '1px solid var(--clr-border-strong)',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.875rem',
              boxShadow: 'var(--shadow-card)',
            },
            success: {
              iconTheme: {
                primary: 'var(--clr-success)',
                secondary: 'var(--clr-surface)',
              },
            },
            error: {
              duration: 8_000,
              iconTheme: {
                primary: 'var(--clr-error)',
                secondary: 'var(--clr-surface)',
              },
            },
          }}
        />
      </BrowserRouter>
      {/* Only rendered in development */}
      {env.isDev && <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />}
    </QueryClientProvider>
  </React.StrictMode>,
);
