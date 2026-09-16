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
  password:   z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

export default function Login() {
  const navigate    = useNavigate();
  const location    = useLocation();
  const { login }   = useAuth();
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const data = await authApi.login(values);
      login(data);
      toast.success(`Welcome back, ${data.user.fullName}!`);
      navigate(from, { replace: true });
    } catch (err) {
      const apiErr = err as ApiError;
      toast.error(apiErr.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-in">
        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-brand__logo">🌾</div>
          <div>
            <h1 className="auth-brand__name">TrueYield</h1>
            <p className="auth-brand__sub">Finance ERP Platform</p>
          </div>
        </div>

        <div className="auth-card__header">
          <h2 className="auth-card__title">Welcome back</h2>
          <p className="auth-card__subtitle">Sign in to continue to your dashboard</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
          <div className="form-field">
            <label htmlFor="identifier" className="form-label form-label--required">
              Phone / Email
            </label>
            <input
              id="identifier"
              type="text"
              className={`form-input${errors.identifier ? ' form-input--error' : ''}`}
              placeholder="+94771234567 or user@example.com"
              autoComplete="username"
              {...register('identifier')}
            />
            {errors.identifier && (
              <span className="form-error" role="alert">⚠ {errors.identifier.message}</span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="password" className="form-label form-label--required">
              Password
            </label>
            <input
              id="password"
              type="password"
              className={`form-input${errors.password ? ' form-input--error' : ''}`}
              placeholder="••••••••"
              autoComplete="current-password"
              {...register('password')}
            />
            {errors.password && (
              <span className="form-error" role="alert">⚠ {errors.password.message}</span>
            )}
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn btn--primary btn--full"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-spinner">
                <span className="spinner spinner--sm" aria-hidden="true" /> Signing in...
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        <p className="auth-card__footer-text">
          Don&apos;t have an account?{' '}
          <Link to="/auth/register" className="auth-link">Create account</Link>
        </p>
      </div>
    </div>
  );
}
