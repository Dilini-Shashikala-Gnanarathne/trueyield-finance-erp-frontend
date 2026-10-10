import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/api/auth.api';
import type { ApiError } from '@/api/types';

const schema = z.object({
  identifier: z.string().min(1, 'Phone number or email is required'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);

    try {
      const data = await authApi.login(values);
      login(data);
      toast.success(`Welcome back, ${data.user.fullName}!`);
      navigate(from, { replace: true });
    } catch (err) {
      const apiErr = err as ApiError;
      toast.error(apiErr.message ?? 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="ty-login">
      <section className="ty-login__visual">
        <div className="ty-visual__glow ty-visual__glow--one" />
        <div className="ty-visual__glow ty-visual__glow--two" />

        <Link to="/" className="ty-brand">
          <span className="ty-brand__icon">🌾</span>
          <span>
            <strong>TrueYield</strong>
            <small>FINANCE ERP PLATFORM</small>
          </span>
        </Link>

        <div className="ty-visual__content">
          <span className="ty-eyebrow">
            <span className="ty-live-dot" />
            SMARTER FINANCIAL MANAGEMENT
          </span>

          <h1>
            Grow your business.
            <br />
            <span>Harvest success.</span>
          </h1>

          <p>
            One intelligent platform to manage your finances,
            streamline operations, and grow with confidence.
          </p>

          <div className="ty-feature-list">
            <div className="ty-feature">
              <span className="ty-feature__icon">↗</span>
              <span>
                <strong>Financial clarity</strong>
                <small>Make informed business decisions</small>
              </span>
            </div>

            <div className="ty-feature">
              <span className="ty-feature__icon">◈</span>
              <span>
                <strong>Everything in one place</strong>
                <small>Simplify your daily operations</small>
              </span>
            </div>

            <div className="ty-feature">
              <span className="ty-feature__icon">✓</span>
              <span>
                <strong>Built for growth</strong>
                <small>Keep your business moving forward</small>
              </span>
            </div>
          </div>
        </div>

        <div className="ty-visual__footer">
          <span>BUILT FOR BETTER BUSINESS</span>
          <span>© {new Date().getFullYear()} TrueYield</span>
        </div>
      </section>

      <section className="ty-login__panel">
        <div className="ty-login__mobile-brand">
          <span>🌾</span> TrueYield
        </div>

        <div className="ty-login__card">
          <div className="ty-welcome-icon">
            <svg
              width="27"
              height="27"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>

          <div className="ty-heading">
            <h2>Welcome back</h2>
            <p>Sign in to continue to your workspace.</p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="ty-form"
            noValidate
          >
            <div className="ty-field">
              <label htmlFor="identifier">Phone number or email</label>

              <div
                className={`ty-input-wrap ${
                  errors.identifier ? 'ty-input-wrap--error' : ''
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  aria-hidden="true"
                >
                  <rect x="3" y="5" width="18" height="14" rx="3" />
                  <path d="m3 7 9 6 9-6" />
                </svg>

                <input
                  id="identifier"
                  type="text"
                  placeholder="+94771234567 or you@example.com"
                  autoComplete="username"
                  aria-invalid={!!errors.identifier}
                  aria-describedby={
                    errors.identifier ? 'identifier-error' : undefined
                  }
                  {...register('identifier')}
                />
              </div>

              {errors.identifier && (
                <span id="identifier-error" className="ty-error" role="alert">
                  {errors.identifier.message}
                </span>
              )}
            </div>

            <div className="ty-field">
              <label htmlFor="password">Password</label>

              <div
                className={`ty-input-wrap ${
                  errors.password ? 'ty-input-wrap--error' : ''
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  aria-hidden="true"
                >
                  <rect x="4" y="10" width="16" height="11" rx="2.5" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>

                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  aria-invalid={!!errors.password}
                  aria-describedby={
                    errors.password ? 'password-error' : undefined
                  }
                  {...register('password')}
                />

                <button
                  type="button"
                  className="ty-password-toggle"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      aria-hidden="true"
                    >
                      <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                      <path d="M9.9 5.2A10.7 10.7 0 0 1 12 5c5 0 8.5 4.5 9 7-.2 1.2-1.1 2.7-2.5 4" />
                      <path d="M6.2 6.2C3.7 7.8 2.2 10.3 2 12c.5 2.5 4 7 10 7 1.2 0 2.3-.2 3.3-.6" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      aria-hidden="true"
                    >
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>

              {errors.password && (
                <span id="password-error" className="ty-error" role="alert">
                  {errors.password.message}
                </span>
              )}
            </div>

            <button
              id="login-submit"
              type="submit"
              className="ty-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="ty-spinner" />
                  Signing you in...
                </>
              ) : (
                <>
                  Sign in to your account
                  <span aria-hidden="true">→</span>
                </>
              )}
            </button>
          </form>

          <div className="ty-security">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <span>Your workspace is protected and secure</span>
          </div>

          <p className="ty-register">
            New to TrueYield?
            <Link to="/auth/register"> Create an account</Link>
          </p>
        </div>

        <p className="ty-panel-footer">
          Smart finance. Sustainable growth.
        </p>
      </section>
    </main>
  );
}