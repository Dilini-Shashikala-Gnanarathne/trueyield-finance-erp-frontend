import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { listingsApi, produceApi } from "@/api/marketplace.api";
import type {
  ListingResponse,
  ProduceResponse,
  ListingStatus,
  ValidationResultResponse,
} from "@/api/marketplace.api";
import type { ApiError } from "@/api/types";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const createSchema = z.object({
  produceId:     z.string().min(1, "Produce is required"),
  title:         z.string().optional(),
  description:   z.string().optional(),
  totalQuantity: z.number({ invalid_type_error: "Quantity required" }).positive("Must be > 0"),
  unit:          z.string().min(1, "Unit is required"),
  pricePerUnit:  z.number({ invalid_type_error: "Price required" }).positive("Must be > 0"),
  qualityGrade:  z.enum(["PREMIUM", "STANDARD", "PROCESSING"]),
  harvestDate:   z.string().min(1, "Harvest date required"),
  // location
  latitude:      z.number({ invalid_type_error: "Latitude required" }),
  longitude:     z.number({ invalid_type_error: "Longitude required" }),
  locality:      z.string().min(1, "Locality required"),
  district:      z.string().optional(),
  locationVisibility: z.enum(["APPROXIMATE", "EXACT_AFTER_ORDER"]).default("APPROXIMATE"),
  minOrderQuantity: z.number().positive().optional(),
});

type CreateForm = z.infer<typeof createSchema>;

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ListingStatus }) {
  const map: Record<ListingStatus, { icon: string; cls: string }> = {
    DRAFT:      { icon: "✏️", cls: "badge--neutral"  },
    ACTIVE:     { icon: "✅", cls: "badge--success"  },
    SOLD_OUT:   { icon: "📦", cls: "badge--info"     },
    CANCELLED:  { icon: "❌", cls: "badge--error"    },
    EXPIRED:    { icon: "⏰", cls: "badge--neutral"  },
  };
  const { icon, cls } = map[status] ?? { icon: "", cls: "badge--neutral" };
  return <span className={"badge " + cls}>{icon} {status}</span>;
}

// ─── Validation Result Panel ─────────────────────────────────────────────────

function ValidationPanel({ result, onClose }: { result: ValidationResultResponse; onClose: () => void }) {
  return (
    <div className={"validation-panel " + (result.valid ? "validation-panel--ok" : "validation-panel--fail")}>
      <div className="validation-panel__header">
        <span>{result.valid ? "✅ Listing is valid" : "❌ Validation failed"}</span>
        <button type="button" onClick={onClose} className="btn btn--ghost">✕</button>
      </div>
      {result.errors.length > 0 && (
        <ul className="validation-panel__list validation-panel__list--errors">
          {result.errors.map((e, i) => <li key={i}>⛔ {e}</li>)}
        </ul>
      )}
      {result.warnings.length > 0 && (
        <ul className="validation-panel__list validation-panel__list--warnings">
          {result.warnings.map((w, i) => <li key={i}>⚠ {w}</li>)}
        </ul>
      )}
    </div>
  );
}

// ─── Create Form ─────────────────────────────────────────────────────────────

function CreateListingForm({ produce, onCreated }: { produce: ProduceResponse[]; onCreated: () => void }) {
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { locationVisibility: "APPROXIMATE" },
  });

  const onSubmit = async (vals: CreateForm) => {
    setSaving(true);
    try {
      await listingsApi.create({
        produceId:     vals.produceId,
        title:         vals.title || undefined,
        description:   vals.description || undefined,
        totalQuantity: vals.totalQuantity,
        unit:          vals.unit,
        pricePerUnit:  vals.pricePerUnit,
        qualityGrade:  vals.qualityGrade,
        harvestDate:   vals.harvestDate,
        location: {
          latitude:   vals.latitude,
          longitude:  vals.longitude,
          locality:   vals.locality,
          district:   vals.district || undefined,
          visibility: vals.locationVisibility,
        },
        minOrderQuantity: vals.minOrderQuantity || undefined,
      });
      toast.success("Listing created in DRAFT state!");
      reset();
      onCreated();
    } catch (err) {
      toast.error((err as ApiError).message ?? "Failed to create listing");
    } finally {
      setSaving(false);
    }
  };

  const err = errors;
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="create-listing-form" noValidate>
      <div className="section-title">New Listing</div>

      <div className="form-grid form-grid--2col">
        <div className="form-field">
          <label htmlFor="cl-produce" className="form-label form-label--required">Produce Type</label>
          <select id="cl-produce" className={"form-input" + (err.produceId ? " form-input--error" : "")} {...register("produceId")}>
            <option value="">Select produce...</option>
            {produce.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
          </select>
          {err.produceId && <span className="form-error" role="alert">⚠ {err.produceId.message}</span>}
        </div>
        <div className="form-field">
          <label htmlFor="cl-grade" className="form-label form-label--required">Quality Grade</label>
          <select id="cl-grade" className={"form-input" + (err.qualityGrade ? " form-input--error" : "")} {...register("qualityGrade")}>
            <option value="">Select grade...</option>
            <option value="PREMIUM">⭐ Premium</option>
            <option value="STANDARD">✔ Standard</option>
            <option value="PROCESSING">⚙ Processing</option>
          </select>
          {err.qualityGrade && <span className="form-error" role="alert">⚠ {err.qualityGrade.message}</span>}
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="cl-title" className="form-label">Title (optional)</label>
        <input id="cl-title" type="text" className="form-input" placeholder="Fresh Rambutan - Malwana" {...register("title")} />
      </div>

      <div className="form-field">
        <label htmlFor="cl-description" className="form-label">Description</label>
        <textarea id="cl-description" className="form-input form-textarea" rows={3} placeholder="Describe your produce..." {...register("description")} />
      </div>

      <div className="form-grid form-grid--2col">
        <div className="form-field">
          <label htmlFor="cl-qty" className="form-label form-label--required">Total Quantity</label>
          <input id="cl-qty" type="number" step="0.01" className={"form-input" + (err.totalQuantity ? " form-input--error" : "")}
            {...register("totalQuantity", { valueAsNumber: true })} placeholder="e.g. 500" />
          {err.totalQuantity && <span className="form-error" role="alert">⚠ {err.totalQuantity.message}</span>}
        </div>
        <div className="form-field">
          <label htmlFor="cl-unit" className="form-label form-label--required">Unit</label>
          <select id="cl-unit" className={"form-input" + (err.unit ? " form-input--error" : "")} {...register("unit")}>
            <option value="">Select unit...</option>
            <option value="KG">KG</option>
            <option value="G">Grams</option>
            <option value="MT">Metric Ton</option>
            <option value="PCS">Pieces</option>
            <option value="BOX">Box</option>
          </select>
          {err.unit && <span className="form-error" role="alert">⚠ {err.unit.message}</span>}
        </div>
      </div>

      <div className="form-grid form-grid--2col">
        <div className="form-field">
          <label htmlFor="cl-price" className="form-label form-label--required">Price per Unit (LKR)</label>
          <input id="cl-price" type="number" step="0.01" className={"form-input" + (err.pricePerUnit ? " form-input--error" : "")}
            {...register("pricePerUnit", { valueAsNumber: true })} placeholder="e.g. 250.00" />
          {err.pricePerUnit && <span className="form-error" role="alert">⚠ {err.pricePerUnit.message}</span>}
        </div>
        <div className="form-field">
          <label htmlFor="cl-harvest" className="form-label form-label--required">Harvest Date</label>
          <input id="cl-harvest" type="date" className={"form-input" + (err.harvestDate ? " form-input--error" : "")} {...register("harvestDate")} />
          {err.harvestDate && <span className="form-error" role="alert">⚠ {err.harvestDate.message}</span>}
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="cl-min-qty" className="form-label">Min Order Quantity</label>
        <input id="cl-min-qty" type="number" step="0.01" className="form-input"
          {...register("minOrderQuantity", { valueAsNumber: true })} placeholder="e.g. 10 (optional)" />
      </div>

      <div className="auth-section-label">📍 Location</div>

      <div className="form-grid form-grid--2col">
        <div className="form-field">
          <label htmlFor="cl-lat" className="form-label form-label--required">Latitude</label>
          <input id="cl-lat" type="number" step="0.0000001" className={"form-input" + (err.latitude ? " form-input--error" : "")}
            {...register("latitude", { valueAsNumber: true })} placeholder="e.g. 7.0800" />
          {err.latitude && <span className="form-error" role="alert">⚠ {err.latitude.message}</span>}
        </div>
        <div className="form-field">
          <label htmlFor="cl-lng" className="form-label form-label--required">Longitude</label>
          <input id="cl-lng" type="number" step="0.0000001" className={"form-input" + (err.longitude ? " form-input--error" : "")}
            {...register("longitude", { valueAsNumber: true })} placeholder="e.g. 80.0137" />
          {err.longitude && <span className="form-error" role="alert">⚠ {err.longitude.message}</span>}
        </div>
      </div>

      <div className="form-grid form-grid--2col">
        <div className="form-field">
          <label htmlFor="cl-locality" className="form-label form-label--required">Locality</label>
          <input id="cl-locality" type="text" className={"form-input" + (err.locality ? " form-input--error" : "")}
            {...register("locality")} placeholder="e.g. Malwana" />
          {err.locality && <span className="form-error" role="alert">⚠ {err.locality.message}</span>}
        </div>
        <div className="form-field">
          <label htmlFor="cl-district" className="form-label">District</label>
          <input id="cl-district" type="text" className="form-input" {...register("district")} placeholder="e.g. Gampaha" />
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="cl-loc-vis" className="form-label">Location Visibility</label>
        <select id="cl-loc-vis" className="form-input" {...register("locationVisibility")}>
          <option value="APPROXIMATE">Approximate (hides exact GPS)</option>
          <option value="EXACT_AFTER_ORDER">Exact after order placed</option>
        </select>
      </div>

      <div className="form-actions">
        <button id="cl-submit" type="submit" className="btn btn--primary" disabled={saving}>
          {saving ? <span className="btn-spinner"><span className="spinner spinner--sm" /> Creating...</span> : "🌿 Create Listing (DRAFT)"}
        </button>
      </div>
    </form>
  );
}

// ─── Listing Row ──────────────────────────────────────────────────────────────

interface ListingRowProps {
  listing: ListingResponse;
  onRefresh: () => void;
}

function ListingRow({ listing, onRefresh }: ListingRowProps) {
  const [busy,       setBusy]       = useState(false);
  const [validation, setValidation] = useState<ValidationResultResponse | null>(null);
  const [showCancel, setShowCancel] = useState(false);
  const [reason,     setReason]     = useState("");

  const action = async (label: string, fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
      onRefresh();
    } catch (err) {
      toast.error((err as ApiError).message ?? label + " failed");
    } finally {
      setBusy(false);
    }
  };

  const handleValidate = async () => {
    setBusy(true);
    try {
      const v = await listingsApi.validate(listing.id);
      setValidation(v);
      toast(v.valid ? "✅ Listing is valid!" : "❌ Validation errors found", { icon: "" });
    } catch (err) {
      toast.error((err as ApiError).message ?? "Validation failed");
    } finally {
      setBusy(false);
    }
  };

  const isDraft  = listing.status === "DRAFT";
  const isActive = listing.status === "ACTIVE";
  const isTerminal = ["SOLD_OUT", "CANCELLED", "EXPIRED"].includes(listing.status);

  return (
    <div className="my-listing-card">
      <div className="my-listing-card__top">
        <div className="my-listing-card__info">
          <div className="my-listing-card__produce">{listing.produce.name}</div>
          <div className="my-listing-card__title">{listing.title ?? listing.produce.name}</div>
          <div className="my-listing-card__meta">
            <StatusBadge status={listing.status} />
            <span className="badge badge--neutral">
              {Number(listing.availableQuantity).toFixed(1)} / {Number(listing.totalQuantity).toFixed(1)} {listing.unit}
            </span>
            <span className="badge badge--info">LKR {Number(listing.pricePerUnit).toFixed(2)} / {listing.unit}</span>
          </div>
          <div className="my-listing-card__location">
            📍 {listing.location.locality}{listing.location.district ? ", " + listing.location.district : ""}
          </div>
        </div>
        {listing.images.find((i) => i.isPrimary) && (
          <img
            src={listing.images.find((i) => i.isPrimary)!.imageUrl}
            alt="listing"
            className="my-listing-card__thumb"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        )}
      </div>

      {validation && <ValidationPanel result={validation} onClose={() => setValidation(null)} />}

      {showCancel && (
        <div className="cancel-panel">
          <input
            type="text"
            className="form-input"
            placeholder="Cancellation reason (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="cancel-panel__btns">
            <button type="button" className="btn btn--ghost btn--danger" disabled={busy}
              onClick={() => action("Cancel", () => listingsApi.cancel(listing.id, { reason: reason || undefined }))}>
              Confirm Cancel
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => setShowCancel(false)}>Back</button>
          </div>
        </div>
      )}

      <div className="my-listing-card__actions">
        {isDraft && (
          <>
            <button id={"validate-" + listing.id} type="button" className="btn btn--secondary" disabled={busy} onClick={handleValidate}>
              🔍 Validate
            </button>
            <button id={"publish-" + listing.id} type="button" className="btn btn--primary" disabled={busy}
              onClick={() => action("Publish", () => listingsApi.publish(listing.id))}>
              🚀 Publish
            </button>
          </>
        )}
        {!isTerminal && (
          <button id={"cancel-" + listing.id} type="button" className="btn btn--ghost btn--danger" disabled={busy}
            onClick={() => setShowCancel(true)}>
            ✕ Cancel
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MyListings() {
  const [listings,    setListings]  = useState<ListingResponse[]>([]);
  const [produce,     setProduce]   = useState<ProduceResponse[]>([]);
  const [loading,     setLoading]   = useState(true);
  const [showCreate,  setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ListingStatus | "">("");

  const loadListings = async () => {
    setLoading(true);
    try {
      const data = await listingsApi.getMyListings(statusFilter as ListingStatus || undefined);
      setListings(data);
    } catch (err) {
      toast.error((err as ApiError).message ?? "Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    produceApi.getAll().then(setProduce).catch(() => {});
  }, []);

  useEffect(() => { loadListings(); }, [statusFilter]);

  return (
    <div className="section animate-in">
      {/* Header */}
      <div className="my-listings-header">
        <div>
          <h1 className="my-listings-header__title">🚜 My Listings</h1>
          <p className="my-listings-header__sub">Manage your produce listings</p>
        </div>
        <button
          id="create-listing-toggle"
          type="button"
          className={"btn " + (showCreate ? "btn--secondary" : "btn--primary")}
          onClick={() => setShowCreate((v) => !v)}
        >
          {showCreate ? "✕ Cancel" : "+ New Listing"}
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <CreateListingForm
          produce={produce}
          onCreated={() => { setShowCreate(false); loadListings(); }}
        />
      )}

      {/* Filter tabs */}
      <div className="status-tabs">
        {(["", "DRAFT", "ACTIVE", "SOLD_OUT", "CANCELLED", "EXPIRED"] as const).map((s) => (
          <button
            key={s}
            id={"tab-" + (s || "ALL")}
            type="button"
            className={"status-tab" + (statusFilter === s ? " active" : "")}
            onClick={() => setStatusFilter(s)}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {/* Listings */}
      {loading ? (
        <div className="market-loading">
          <span className="spinner" /> <p>Loading your listings...</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="market-empty">
          <div className="market-empty__icon">🌱</div>
          <h3>No listings {statusFilter ? "with status " + statusFilter : "yet"}</h3>
          <p>Create your first listing to start selling on the marketplace.</p>
        </div>
      ) : (
        <div className="my-listings-list">
          {listings.map((l) => (
            <ListingRow key={l.id} listing={l} onRefresh={loadListings} />
          ))}
        </div>
      )}
    </div>
  );
}
