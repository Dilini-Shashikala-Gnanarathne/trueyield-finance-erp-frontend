import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { listingsApi, produceApi } from "@/api/marketplace.api";
import type {
  ListingSummaryResponse,
  PageResponse,
  ListingSearchCriteria,
  ProduceResponse,
  QualityGrade,
  ProduceCategory,
  SortBy,
} from "@/api/marketplace.api";
import type { ApiError } from "@/api/types";

// ─── Grade badge ──────────────────────────────────────────────────────────────

function GradeBadge({ grade }: { grade: QualityGrade }) {
  const map: Record<QualityGrade, { label: string; cls: string }> = {
    PREMIUM:    { label: "⭐ Premium",    cls: "badge--warning" },
    STANDARD:   { label: "✔ Standard",   cls: "badge--success" },
    PROCESSING: { label: "⚙ Processing", cls: "badge--neutral" },
  };
  const { label, cls } = map[grade] ?? { label: grade, cls: "badge--neutral" };
  return <span className={"badge " + cls}>{label}</span>;
}

// ─── Listing Card ─────────────────────────────────────────────────────────────

function ListingCard({ listing, onClick }: { listing: ListingSummaryResponse; onClick: () => void }) {
  const defaultImg = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80";
  const harvestDate = new Date(listing.harvestDate).toLocaleDateString("en-LK", {
    year: "numeric", month: "short", day: "numeric",
  });

  return (
    <div className="listing-card" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      aria-label={"View listing: " + (listing.title ?? listing.produceName)}
    >
      <div className="listing-card__img-wrap">
        <img
          src={listing.primaryImageUrl ?? defaultImg}
          alt={listing.produceName}
          className="listing-card__img"
          onError={(e) => { (e.target as HTMLImageElement).src = defaultImg; }}
        />
        <div className="listing-card__grade">
          <GradeBadge grade={listing.qualityGrade} />
        </div>
      </div>
      <div className="listing-card__body">
        <div className="listing-card__produce">{listing.produceName}</div>
        <div className="listing-card__title">{listing.title ?? listing.produceName}</div>
        <div className="listing-card__price">
          <span className="listing-card__price-val">LKR {Number(listing.pricePerUnit).toFixed(2)}</span>
          <span className="listing-card__price-unit"> / {listing.unit}</span>
        </div>
        <div className="listing-card__meta">
          <span className="listing-card__stock">
            {Number(listing.availableQuantity).toFixed(1)} {listing.unit} available
          </span>
          <span className="listing-card__location">
            {listing.locality}{listing.district ? ", " + listing.district : ""}
          </span>
        </div>
        <div className="listing-card__harvest">🗓 Harvested: {harvestDate}</div>
      </div>
    </div>
  );
}

// ─── Filters ──────────────────────────────────────────────────────────────────

interface FiltersProps {
  criteria: ListingSearchCriteria;
  produce:  ProduceResponse[];
  onChange: (c: Partial<ListingSearchCriteria>) => void;
  onReset:  () => void;
}

function Filters({ criteria, produce, onChange, onReset }: FiltersProps) {
  return (
    <div className="market-filters">
      <div className="market-filters__header">
        <span className="market-filters__title">🔍 Filters</span>
        <button type="button" className="btn btn--ghost" onClick={onReset}>Reset</button>
      </div>

      <div className="form-field">
        <label className="form-label">Keyword</label>
        <input
          id="mkt-search"
          type="search"
          className="form-input"
          placeholder="Search produce, farms..."
          value={criteria.query ?? ""}
          onChange={(e) => onChange({ query: e.target.value || undefined, page: 0 })}
        />
      </div>

      <div className="form-field">
        <label className="form-label">Produce Type</label>
        <select
          id="mkt-produce"
          className="form-input"
          value={criteria.produceId ?? ""}
          onChange={(e) => onChange({ produceId: e.target.value || undefined, page: 0 })}
        >
          <option value="">All Produce</option>
          {produce.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label className="form-label">Category</label>
        <select
          id="mkt-category"
          className="form-input"
          value={criteria.category ?? ""}
          onChange={(e) => onChange({ category: (e.target.value as ProduceCategory) || undefined, page: 0 })}
        >
          <option value="">All Categories</option>
          <option value="FRUIT">🍎 Fruit</option>
          <option value="VEGETABLE">🥦 Vegetable</option>
          <option value="GRAIN">🌾 Grain</option>
          <option value="SPICE">🌶 Spice</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      <div className="form-field">
        <label className="form-label">Quality Grade</label>
        <select
          id="mkt-grade"
          className="form-input"
          value={criteria.qualityGrade ?? ""}
          onChange={(e) => onChange({ qualityGrade: (e.target.value as QualityGrade) || undefined, page: 0 })}
        >
          <option value="">Any Grade</option>
          <option value="PREMIUM">⭐ Premium</option>
          <option value="STANDARD">✔ Standard</option>
          <option value="PROCESSING">⚙ Processing</option>
        </select>
      </div>

      <div className="form-grid form-grid--2col">
        <div className="form-field">
          <label className="form-label">Min Price (LKR)</label>
          <input
            id="mkt-min-price"
            type="number" min="0"
            className="form-input"
            placeholder="0"
            value={criteria.minPrice ?? ""}
            onChange={(e) => onChange({ minPrice: e.target.value ? Number(e.target.value) : undefined, page: 0 })}
          />
        </div>
        <div className="form-field">
          <label className="form-label">Max Price (LKR)</label>
          <input
            id="mkt-max-price"
            type="number" min="0"
            className="form-input"
            placeholder="∞"
            value={criteria.maxPrice ?? ""}
            onChange={(e) => onChange({ maxPrice: e.target.value ? Number(e.target.value) : undefined, page: 0 })}
          />
        </div>
      </div>

      <div className="form-field">
        <label className="form-label">District</label>
        <input
          id="mkt-district"
          type="text"
          className="form-input"
          placeholder="e.g. Kandy"
          value={criteria.district ?? ""}
          onChange={(e) => onChange({ district: e.target.value || undefined, page: 0 })}
        />
      </div>

      <div className="form-field">
        <label className="form-label">Sort By</label>
        <select
          id="mkt-sort"
          className="form-input"
          value={criteria.sortBy ?? "NEWEST"}
          onChange={(e) => onChange({ sortBy: e.target.value as SortBy, page: 0 })}
        >
          <option value="NEWEST">🆕 Newest First</option>
          <option value="PRICE_ASC">💰 Price: Low → High</option>
          <option value="PRICE_DESC">💰 Price: High → Low</option>
          <option value="HARVEST_DATE_ASC">🗓 Harvest: Oldest</option>
          <option value="HARVEST_DATE_DESC">🗓 Harvest: Latest</option>
        </select>
      </div>

      <div className="market-filters__stock">
        <label className="market-filters__checkbox-label">
          <input
            id="mkt-in-stock"
            type="checkbox"
            checked={criteria.inStockOnly !== false}
            onChange={(e) => onChange({ inStockOnly: e.target.checked, page: 0 })}
          />
          <span>In-stock only</span>
        </label>
      </div>
    </div>
  );
}

// ─── Default criteria ─────────────────────────────────────────────────────────

const DEFAULT_CRITERIA: ListingSearchCriteria = {
  inStockOnly: true,
  sortBy: "NEWEST",
  page: 0,
  size: 12,
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Marketplace() {
  const navigate = useNavigate();
  const [criteria, setCriteria]   = useState<ListingSearchCriteria>(DEFAULT_CRITERIA);
  const [result,   setResult]     = useState<PageResponse<ListingSummaryResponse> | null>(null);
  const [produce,  setProduce]    = useState<ProduceResponse[]>([]);
  const [loading,  setLoading]    = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchListings = useCallback(async (c: ListingSearchCriteria) => {
    setLoading(true);
    try {
      const data = await listingsApi.search(c);
      setResult(data);
    } catch (err) {
      toast.error((err as ApiError).message ?? "Failed to load listings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    produceApi.getAll().then(setProduce).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchListings(criteria), 300);
    return () => clearTimeout(timer);
  }, [criteria, fetchListings]);

  const updateCriteria = (patch: Partial<ListingSearchCriteria>) =>
    setCriteria((prev) => ({ ...prev, ...patch }));

  const resetCriteria = () => setCriteria(DEFAULT_CRITERIA);

  const handleCardClick = (id: string) => {
    setSelectedId(id);
    navigate("/marketplace/" + id);
  };

  const totalPages = result?.totalPages ?? 0;
  const currentPage = criteria.page ?? 0;

  return (
    <div className="market-page animate-in">
      {/* Page Header */}
      <div className="market-header">
        <div>
          <h1 className="market-header__title">🌿 Marketplace</h1>
          <p className="market-header__sub">
            Fresh produce directly from Sri Lankan farmers
            {result && <span> · <strong>{result.totalElements}</strong> listings</span>}
          </p>
        </div>
      </div>

      <div className="market-layout">
        {/* Sidebar Filters */}
        <Filters criteria={criteria} produce={produce} onChange={updateCriteria} onReset={resetCriteria} />

        {/* Listings Grid */}
        <div className="market-content">
          {loading ? (
            <div className="market-loading">
              <span className="spinner" aria-label="Loading..." />
              <p>Finding fresh produce...</p>
            </div>
          ) : result?.content.length === 0 ? (
            <div className="market-empty">
              <div className="market-empty__icon">🌱</div>
              <h3>No listings found</h3>
              <p>Try adjusting your filters or check back later for fresh produce.</p>
              <button id="market-reset-filters" type="button" className="btn btn--primary" onClick={resetCriteria}>
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="listing-grid">
                {result?.content.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    onClick={() => handleCardClick(listing.id)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="market-pagination">
                  <button
                    id="market-prev"
                    type="button"
                    className="btn btn--secondary"
                    disabled={result?.isFirst}
                    onClick={() => updateCriteria({ page: currentPage - 1 })}
                  >
                    ← Prev
                  </button>
                  <span className="market-pagination__info">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  <button
                    id="market-next"
                    type="button"
                    className="btn btn--secondary"
                    disabled={result?.isLast}
                    onClick={() => updateCriteria({ page: currentPage + 1 })}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
