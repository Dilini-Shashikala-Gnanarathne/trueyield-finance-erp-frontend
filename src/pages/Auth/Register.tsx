import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/api/auth.api';
import type { ApiError } from '@/api/types';

type Role = 'FARMER' | 'BUYER';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const phoneRegex = /^(\+94|0)?[0-9]{9,10}$/;

const baseSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  phone:    z.string().regex(phoneRegex, 'Invalid phone number (e.g. +94771234567 or 0771234567)'),
  email:    z.string().email('Invalid email').optional().or(z.literal('')),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
});

const farmerSchema = baseSchema.extend({
  farmName:  z.string().optional(),
  locality:  z.string().optional(),
  district:  z.string().optional(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match', path: ['confirmPassword'],
});

const buyerSchema = baseSchema.extend({
  deliveryAddress: z.string().optional(),
  locality:        z.string().optional(),
  district:        z.string().optional(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match', path: ['confirmPassword'],
});

type FarmerForm = z.infer<typeof farmerSchema>;
type BuyerForm  = z.infer<typeof buyerSchema>;

// ─── Sub-forms ────────────────────────────────────────────────────────────────

function FarmerFields({ register, errors }: { register: ReturnType<typeof useForm<FarmerForm>>['register'], errors: ReturnType<typeof useForm<FarmerForm>>['formState']['errors'] }) {
  return (
    <>
      <div className="form-grid form-grid--2col">
        <div className="form-field">
          <label htmlFor="farmName" className="form-label">Farm Name</label>
          <input id="farmName" type="text" className="form-input" placeholder="Green Valley Farm" {...register('farmName')} />
        </div>
        <div className="form-field">
          <label htmlFor="locality" className="form-label">Locality</label>
          <input id="locality" type="text" className="form-input" placeholder="Kandy" {...register('locality')} />
        </div>
      </div>
      <div className="form-field">
        <label htmlFor="district" className="form-label">District</label>
        <input id="district" type="text" className="form-input" placeholder="Kandy District" {...register('district')} />
      </div>
    </>
  );
}

function BuyerFields({ register }: { register: ReturnType<typeof useForm<BuyerForm>>['register'] }) {
  return (
    <>
      <div className="form-field">
        <label htmlFor="deliveryAddress" className="form-label">Delivery Address</label>
        <input id="deliveryAddress" type="text" className="form-input" placeholder="123 Main St, Colombo" {...register('deliveryAddress')} />
      </div>
      <div className="form-grid form-grid--2col">
        <div className="form-field">
          <label htmlFor="locality" className="form-label">Locality</label>
          <input id="locality" type="text" className="form-input" placeholder="Colombo 03" {...register('locality')} />
        </div>
        <div className="form-field">
          <label htmlFor="district" className="form-label">District</label>
          <input id="district" type="text" className="form-input" placeholder="Colombo" {...register('district')} />
        </div>
      </div>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Register() {
  const navigate        = useNavigate();
  const { login }       = useAuth();
  const [role, setRole] = useState<Role>('FARMER');
  const [loading, setLoading] = useState(false);

  const farmerForm = useForm<FarmerForm>({ resolver: zodResolver(farmerSchema) });
  const buyerForm  = useForm<BuyerForm>({ resolver: zodResolver(buyerSchema) });

  const onFarmerSubmit = async (values: FarmerForm) => {
    setLoading(true);
    try {
      const data = await authApi.registerFarmer({
        fullName: values.fullName,
        phone:    values.phone,
        email:    values.email || undefined,
        password: values.password,
        farmName: values.farmName || undefined,
        locality: values.locality || undefined,
        district: values.district || undefined,
      });
      login(data);
      toast.success('Farmer account created successfully!');
      navigate('/');
    } catch (err) {
      const apiErr = err as ApiError;
      toast.error(apiErr.message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const onBuyerSubmit = async (values: BuyerForm) => {
    setLoading(true);
    try {
      const data = await authApi.registerBuyer({
        fullName:        values.fullName,
        phone:           values.phone,
        email:           values.email || undefined,
        password:        values.password,
        deliveryAddress: values.deliveryAddress || undefined,
        locality:        values.locality || undefined,
        district:        values.district || undefined,
      });
      login(data);
      toast.success('Buyer account created successfully!');
      navigate('/');
    } catch (err) {
      const apiErr = err as ApiError;
      toast.error(apiErr.message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const isFarmer = role === 'FARMER';
  const fe = farmerForm.formState.errors;
  const be = buyerForm.formState.errors;

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide animate-in">
        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-brand__logo">🌾</div>
          <div>
            <h1 className="auth-brand__name">TrueYield</h1>
            <p className="auth-brand__sub">Finance ERP Platform</p>
          </div>
        </div>

        <div className="auth-card__header">
          <h2 className="auth-card__title">Create your account</h2>
          <p className="auth-card__subtitle">Join the agricultural marketplace</p>
        </div>

        {/* Role Toggle */}
        <div className="role-toggle" role="group" aria-label="Account type">
          <button
            id="role-farmer"
            type="button"
            className={`role-toggle__btn${isFarmer ? ' active' : ''}`}
            onClick={() => setRole('FARMER')}
          >
            🚜 Farmer
          </button>
          <button
            id="role-buyer"
            type="button"
            className={`role-toggle__btn${!isFarmer ? ' active' : ''}`}
            onClick={() => setRole('BUYER')}
          >
            🛒 Buyer
          </button>
        </div>

        {/* Farmer Form */}
        {isFarmer && (
          <form onSubmit={farmerForm.handleSubmit(onFarmerSubmit)} className="auth-form" noValidate>
            <div className="form-grid form-grid--2col">
              <div className="form-field">
                <label htmlFor="f-fullName" className="form-label form-label--required">Full Name</label>
                <input id="f-fullName" type="text" className={`form-input${fe.fullName ? ' form-input--error' : ''}`} placeholder="Kumara Perera" autoComplete="name" {...farmerForm.register('fullName')} />
                {fe.fullName && <span className="form-error" role="alert">⚠ {fe.fullName.message}</span>}
              </div>
              <div className="form-field">
                <label htmlFor="f-phone" className="form-label form-label--required">Phone Number</label>
                <input id="f-phone" type="tel" className={`form-input${fe.phone ? ' form-input--error' : ''}`} placeholder="+94771234567" autoComplete="tel" {...farmerForm.register('phone')} />
                {fe.phone && <span className="form-error" role="alert">⚠ {fe.phone.message}</span>}
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="f-email" className="form-label">Email (optional)</label>
              <input id="f-email" type="email" className={`form-input${fe.email ? ' form-input--error' : ''}`} placeholder="farmer@example.com" autoComplete="email" {...farmerForm.register('email')} />
              {fe.email && <span className="form-error" role="alert">⚠ {fe.email.message}</span>}
            </div>

            <div className="form-grid form-grid--2col">
              <div className="form-field">
                <label htmlFor="f-password" className="form-label form-label--required">Password</label>
                <input id="f-password" type="password" className={`form-input${fe.password ? ' form-input--error' : ''}`} placeholder="Min. 8 characters" autoComplete="new-password" {...farmerForm.register('password')} />
                {fe.password && <span className="form-error" role="alert">⚠ {fe.password.message}</span>}
              </div>
              <div className="form-field">
                <label htmlFor="f-confirmPassword" className="form-label form-label--required">Confirm Password</label>
                <input id="f-confirmPassword" type="password" className={`form-input${fe.confirmPassword ? ' form-input--error' : ''}`} placeholder="Re-enter password" autoComplete="new-password" {...farmerForm.register('confirmPassword')} />
                {fe.confirmPassword && <span className="form-error" role="alert">⚠ {fe.confirmPassword.message}</span>}
              </div>
            </div>

            <div className="auth-section-label">Farm Details <span className="auth-optional">(optional)</span></div>
            <FarmerFields register={farmerForm.register} errors={fe} />

            <button id="farmer-register-submit" type="submit" className="btn btn--primary btn--full" disabled={loading}>
              {loading ? <span className="btn-spinner"><span className="spinner spinner--sm" aria-hidden="true" /> Creating account...</span> : '🚜 Create Farmer Account'}
            </button>
          </form>
        )}

        {/* Buyer Form */}
        {!isFarmer && (
          <form onSubmit={buyerForm.handleSubmit(onBuyerSubmit)} className="auth-form" noValidate>
            <div className="form-grid form-grid--2col">
              <div className="form-field">
                <label htmlFor="b-fullName" className="form-label form-label--required">Full Name</label>
                <input id="b-fullName" type="text" className={`form-input${be.fullName ? ' form-input--error' : ''}`} placeholder="Saman Silva" autoComplete="name" {...buyerForm.register('fullName')} />
                {be.fullName && <span className="form-error" role="alert">⚠ {be.fullName.message}</span>}
              </div>
              <div className="form-field">
                <label htmlFor="b-phone" className="form-label form-label--required">Phone Number</label>
                <input id="b-phone" type="tel" className={`form-input${be.phone ? ' form-input--error' : ''}`} placeholder="+94711234567" autoComplete="tel" {...buyerForm.register('phone')} />
                {be.phone && <span className="form-error" role="alert">⚠ {be.phone.message}</span>}
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="b-email" className="form-label">Email (optional)</label>
              <input id="b-email" type="email" className={`form-input${be.email ? ' form-input--error' : ''}`} placeholder="buyer@example.com" autoComplete="email" {...buyerForm.register('email')} />
              {be.email && <span className="form-error" role="alert">⚠ {be.email.message}</span>}
            </div>

            <div className="form-grid form-grid--2col">
              <div className="form-field">
                <label htmlFor="b-password" className="form-label form-label--required">Password</label>
                <input id="b-password" type="password" className={`form-input${be.password ? ' form-input--error' : ''}`} placeholder="Min. 8 characters" autoComplete="new-password" {...buyerForm.register('password')} />
                {be.password && <span className="form-error" role="alert">⚠ {be.password.message}</span>}
              </div>
              <div className="form-field">
                <label htmlFor="b-confirmPassword" className="form-label form-label--required">Confirm Password</label>
                <input id="b-confirmPassword" type="password" className={`form-input${be.confirmPassword ? ' form-input--error' : ''}`} placeholder="Re-enter password" autoComplete="new-password" {...buyerForm.register('confirmPassword')} />
                {be.confirmPassword && <span className="form-error" role="alert">⚠ {be.confirmPassword.message}</span>}
              </div>
            </div>

            <div className="auth-section-label">Delivery Info <span className="auth-optional">(optional)</span></div>
            <BuyerFields register={buyerForm.register} />

            <button id="buyer-register-submit" type="submit" className="btn btn--primary btn--full" disabled={loading}>
              {loading ? <span className="btn-spinner"><span className="spinner spinner--sm" aria-hidden="true" /> Creating account...</span> : '🛒 Create Buyer Account'}
            </button>
          </form>
        )}

        <p className="auth-card__footer-text">
          Already have an account?{' '}
          <Link to="/auth/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
