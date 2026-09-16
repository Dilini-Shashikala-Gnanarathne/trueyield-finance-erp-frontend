import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/api/auth.api';
import type { FarmerProfileResponse, BuyerProfileResponse, UpdateFarmerProfileRequest, UpdateBuyerProfileRequest, LocationVisibility } from '@/api/auth.api';
import type { ApiError } from '@/api/types';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const farmerSchema = z.object({
  fullName:           z.string().min(2).max(100).optional().or(z.literal('')),
  email:              z.string().email('Invalid email').optional().or(z.literal('')),
  farmName:           z.string().optional(),
  bio:                z.string().optional(),
  locality:           z.string().optional(),
  district:           z.string().optional(),
  locationVisibility: z.enum(['EXACT', 'DISTRICT', 'HIDDEN']).optional(),
  avatarUrl:          z.string().url('Invalid URL').optional().or(z.literal('')),
});

const buyerSchema = z.object({
  fullName:               z.string().min(2).max(100).optional().or(z.literal('')),
  email:                  z.string().email('Invalid email').optional().or(z.literal('')),
  deliveryAddress:        z.string().optional(),
  locality:               z.string().optional(),
  district:               z.string().optional(),
  preferredContactMethod: z.string().optional(),
  avatarUrl:              z.string().url('Invalid URL').optional().or(z.literal('')),
});

type FarmerForm = z.infer<typeof farmerSchema>;
type BuyerForm  = z.infer<typeof buyerSchema>;

// ─── Role badge ───────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = { FARMER: '🚜 Farmer', BUYER: '🛒 Buyer', ADMIN: '🔑 Admin' };
  const cls: Record<string, string> = { FARMER: 'badge--success', BUYER: 'badge--info', ADMIN: 'badge--warning' };
  return <span className={`badge ${cls[role] ?? 'badge--neutral'}`}>{map[role] ?? role}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = { ACTIVE: 'badge--success', INACTIVE: 'badge--neutral', SUSPENDED: 'badge--error' };
  return <span className={`badge ${cls[status] ?? 'badge--neutral'}`}>{status}</span>;
}

// ─── Farmer Edit Form ─────────────────────────────────────────────────────────

function FarmerEdit({ profile, onSaved }: { profile: FarmerProfileResponse; onSaved: () => void }) {
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FarmerForm>({
    resolver: zodResolver(farmerSchema),
    defaultValues: {
      fullName:           profile.fullName,
      email:              profile.email ?? '',
      farmName:           profile.farmName ?? '',
      bio:                profile.bio ?? '',
      locality:           profile.locality ?? '',
      district:           profile.district ?? '',
      locationVisibility: profile.locationVisibility ?? 'DISTRICT',
      avatarUrl:          profile.avatarUrl ?? '',
    },
  });

  const onSubmit = async (vals: FarmerForm) => {
    setSaving(true);
    try {
      const payload: UpdateFarmerProfileRequest = {
        fullName:           vals.fullName || undefined,
        email:              vals.email || undefined,
        farmName:           vals.farmName || undefined,
        bio:                vals.bio || undefined,
        locality:           vals.locality || undefined,
        district:           vals.district || undefined,
        locationVisibility: vals.locationVisibility as LocationVisibility | undefined,
        avatarUrl:          vals.avatarUrl || undefined,
      };
      await authApi.updateFarmerProfile(payload);
      toast.success('Farmer profile updated!');
      onSaved();
    } catch (err) {
      const e = err as ApiError;
      toast.error(e.message ?? 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="profile-edit-form" noValidate>
      <div className="form-grid form-grid--2col">
        <div className="form-field">
          <label htmlFor="pf-fullName" className="form-label">Full Name</label>
          <input id="pf-fullName" type="text" className={`form-input${errors.fullName ? ' form-input--error' : ''}`} {...register('fullName')} />
          {errors.fullName && <span className="form-error" role="alert">⚠ {errors.fullName.message}</span>}
        </div>
        <div className="form-field">
          <label htmlFor="pf-email" className="form-label">Email</label>
          <input id="pf-email" type="email" className={`form-input${errors.email ? ' form-input--error' : ''}`} {...register('email')} />
          {errors.email && <span className="form-error" role="alert">⚠ {errors.email.message}</span>}
        </div>
      </div>

      <div className="form-grid form-grid--2col">
        <div className="form-field">
          <label htmlFor="pf-farmName" className="form-label">Farm Name</label>
          <input id="pf-farmName" type="text" className="form-input" {...register('farmName')} />
        </div>
        <div className="form-field">
          <label htmlFor="pf-locationVisibility" className="form-label">Location Visibility</label>
          <select id="pf-locationVisibility" className="form-input" {...register('locationVisibility')}>
            <option value="EXACT">Exact (precise GPS)</option>
            <option value="DISTRICT">District only</option>
            <option value="HIDDEN">Hidden</option>
          </select>
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="pf-bio" className="form-label">Bio</label>
        <textarea id="pf-bio" className="form-input form-textarea" rows={3} placeholder="Tell buyers about your farm..." {...register('bio')} />
      </div>

      <div className="form-grid form-grid--2col">
        <div className="form-field">
          <label htmlFor="pf-locality" className="form-label">Locality</label>
          <input id="pf-locality" type="text" className="form-input" {...register('locality')} />
        </div>
        <div className="form-field">
          <label htmlFor="pf-district" className="form-label">District</label>
          <input id="pf-district" type="text" className="form-input" {...register('district')} />
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="pf-avatarUrl" className="form-label">Avatar URL</label>
        <input id="pf-avatarUrl" type="url" className={`form-input${errors.avatarUrl ? ' form-input--error' : ''}`} placeholder="https://..." {...register('avatarUrl')} />
        {errors.avatarUrl && <span className="form-error" role="alert">⚠ {errors.avatarUrl.message}</span>}
      </div>

      <div className="profile-edit-actions">
        <button id="farmer-profile-save" type="submit" className="btn btn--primary" disabled={saving}>
          {saving ? <span className="btn-spinner"><span className="spinner spinner--sm" /> Saving...</span> : '💾 Save Changes'}
        </button>
      </div>
    </form>
  );
}

// ─── Buyer Edit Form ──────────────────────────────────────────────────────────

function BuyerEdit({ profile, onSaved }: { profile: BuyerProfileResponse; onSaved: () => void }) {
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<BuyerForm>({
    resolver: zodResolver(buyerSchema),
    defaultValues: {
      fullName:               profile.fullName,
      email:                  profile.email ?? '',
      deliveryAddress:        profile.deliveryAddress ?? '',
      locality:               profile.locality ?? '',
      district:               profile.district ?? '',
      preferredContactMethod: profile.preferredContactMethod ?? '',
      avatarUrl:              profile.avatarUrl ?? '',
    },
  });

  const onSubmit = async (vals: BuyerForm) => {
    setSaving(true);
    try {
      const payload: UpdateBuyerProfileRequest = {
        fullName:               vals.fullName || undefined,
        email:                  vals.email || undefined,
        deliveryAddress:        vals.deliveryAddress || undefined,
        locality:               vals.locality || undefined,
        district:               vals.district || undefined,
        preferredContactMethod: vals.preferredContactMethod || undefined,
        avatarUrl:              vals.avatarUrl || undefined,
      };
      await authApi.updateBuyerProfile(payload);
      toast.success('Buyer profile updated!');
      onSaved();
    } catch (err) {
      const e = err as ApiError;
      toast.error(e.message ?? 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="profile-edit-form" noValidate>
      <div className="form-grid form-grid--2col">
        <div className="form-field">
          <label htmlFor="pb-fullName" className="form-label">Full Name</label>
          <input id="pb-fullName" type="text" className={`form-input${errors.fullName ? ' form-input--error' : ''}`} {...register('fullName')} />
          {errors.fullName && <span className="form-error" role="alert">⚠ {errors.fullName.message}</span>}
        </div>
        <div className="form-field">
          <label htmlFor="pb-email" className="form-label">Email</label>
          <input id="pb-email" type="email" className={`form-input${errors.email ? ' form-input--error' : ''}`} {...register('email')} />
          {errors.email && <span className="form-error" role="alert">⚠ {errors.email.message}</span>}
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="pb-deliveryAddress" className="form-label">Delivery Address</label>
        <input id="pb-deliveryAddress" type="text" className="form-input" {...register('deliveryAddress')} />
      </div>

      <div className="form-grid form-grid--2col">
        <div className="form-field">
          <label htmlFor="pb-locality" className="form-label">Locality</label>
          <input id="pb-locality" type="text" className="form-input" {...register('locality')} />
        </div>
        <div className="form-field">
          <label htmlFor="pb-district" className="form-label">District</label>
          <input id="pb-district" type="text" className="form-input" {...register('district')} />
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="pb-contact" className="form-label">Preferred Contact Method</label>
        <select id="pb-contact" className="form-input" {...register('preferredContactMethod')}>
          <option value="">Select...</option>
          <option value="PHONE">Phone</option>
          <option value="EMAIL">Email</option>
          <option value="WHATSAPP">WhatsApp</option>
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="pb-avatarUrl" className="form-label">Avatar URL</label>
        <input id="pb-avatarUrl" type="url" className={`form-input${errors.avatarUrl ? ' form-input--error' : ''}`} placeholder="https://..." {...register('avatarUrl')} />
        {errors.avatarUrl && <span className="form-error" role="alert">⚠ {errors.avatarUrl.message}</span>}
      </div>

      <div className="profile-edit-actions">
        <button id="buyer-profile-save" type="submit" className="btn btn--primary" disabled={saving}>
          {saving ? <span className="btn-spinner"><span className="spinner spinner--sm" /> Saving...</span> : '💾 Save Changes'}
        </button>
      </div>
    </form>
  );
}

// ─── Main Profile Page ────────────────────────────────────────────────────────

export default function Profile() {
  const { user, profile, isLoading, logout, refreshProfile } = useAuth();
  const [editMode, setEditMode] = useState(false);

  const isFarmer = user?.role === 'FARMER';
  const isBuyer  = user?.role === 'BUYER';

  const farmerProfile = isFarmer ? profile as FarmerProfileResponse : null;
  const buyerProfile  = isBuyer  ? profile as BuyerProfileResponse  : null;

  const handleSaved = async () => {
    setEditMode(false);
    await refreshProfile();
  };

  if (isLoading) {
    return (
      <div className="section">
        <div className="profile-loading">
          <span className="spinner" aria-label="Loading profile..." />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section animate-in">
      {/* Header */}
      <div className="profile-header">
        <div className="profile-avatar">
          {(profile as FarmerProfileResponse | BuyerProfileResponse | null)?.avatarUrl ? (
            <img src={(profile as FarmerProfileResponse)?.avatarUrl ?? ''} alt="Avatar" className="profile-avatar__img" />
          ) : (
            <div className="profile-avatar__placeholder">
              {user?.fullName?.charAt(0).toUpperCase() ?? '?'}
            </div>
          )}
        </div>
        <div className="profile-info">
          <h2 className="profile-name">{user?.fullName ?? '—'}</h2>
          <div className="profile-meta">
            <RoleBadge role={user?.role ?? ''} />
            <StatusBadge status={user?.status ?? ''} />
          </div>
          <p className="profile-phone">📱 {user?.phone}</p>
          {user?.email && <p className="profile-email">✉️ {user.email}</p>}
        </div>
        <div className="profile-actions">
          <button
            id="profile-edit-toggle"
            type="button"
            className={`btn ${editMode ? 'btn--secondary' : 'btn--primary'}`}
            onClick={() => setEditMode(v => !v)}
          >
            {editMode ? '✕ Cancel' : '✏️ Edit Profile'}
          </button>
          <button
            id="profile-logout"
            type="button"
            className="btn btn--ghost btn--danger"
            onClick={logout}
          >
            🚪 Sign Out
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="profile-stats">
        <div className="profile-stat">
          <span className="profile-stat__label">Account ID</span>
          <span className="profile-stat__value text-mono">{user?.id?.slice(0, 8) ?? '—'}...</span>
        </div>
        <div className="profile-stat">
          <span className="profile-stat__label">Registered</span>
          <span className="profile-stat__value">
            {user?.registeredAt ? new Date(user.registeredAt).toLocaleDateString('en-LK', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
          </span>
        </div>
        {isFarmer && farmerProfile && (
          <>
            <div className="profile-stat">
              <span className="profile-stat__label">Farm</span>
              <span className="profile-stat__value">{farmerProfile.farmName ?? 'Not set'}</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat__label">Location</span>
              <span className="profile-stat__value">{farmerProfile.district ?? 'Not set'}</span>
            </div>
          </>
        )}
        {isBuyer && buyerProfile && (
          <>
            <div className="profile-stat">
              <span className="profile-stat__label">District</span>
              <span className="profile-stat__value">{buyerProfile.district ?? 'Not set'}</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat__label">Contact</span>
              <span className="profile-stat__value">{buyerProfile.preferredContactMethod ?? 'Not set'}</span>
            </div>
          </>
        )}
      </div>

      {/* Bio (farmer) */}
      {isFarmer && farmerProfile?.bio && !editMode && (
        <div className="profile-bio">
          <div className="section-title">About the Farm</div>
          <p>{farmerProfile.bio}</p>
        </div>
      )}

      {/* Edit Form */}
      {editMode && (
        <div className="profile-edit-section">
          <div className="section-title">Edit Profile</div>
          {isFarmer && farmerProfile && <FarmerEdit profile={farmerProfile} onSaved={handleSaved} />}
          {isBuyer  && buyerProfile  && <BuyerEdit  profile={buyerProfile}  onSaved={handleSaved} />}
        </div>
      )}
    </div>
  );
}
