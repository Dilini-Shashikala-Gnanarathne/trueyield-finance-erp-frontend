import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { produceApi } from "@/api/marketplace.api";
import type { ProduceResponse, ProduceCategory } from "@/api/marketplace.api";
import type { ApiError } from "@/api/types";
import { useAuth } from "@/contexts/AuthContext";

// ─── Schema ───────────────────────────────────────────────────────────────────

const createProduceSchema = z.object({
  code:           z.string().min(1, "Code required (e.g. RAMBUTAN)"),
  name:           z.string().min(1, "Name required"),
  scientificName: z.string().optional(),
  category:       z.enum(["FRUIT", "VEGETABLE", "GRAIN", "SPICE", "OTHER"]),
  description:    z.string().optional(),
  defaultUnit:    z.string().min(1, "Default unit required"),
  imageUrl:       z.string().url("Invalid URL").optional().or(z.literal("")),
});
type CreateForm = z.infer<typeof createProduceSchema>;

// ─── Category badge ───────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: ProduceCategory }) {
  const map: Record<ProduceCategory, { icon: string; cls: string }> = {
    FRUIT:     { icon: "🍎", cls: "badge--warning" },
    VEGETABLE: { icon: "🥦", cls: "badge--success" },
    GRAIN:     { icon: "🌾", cls: "badge--info"    },
    SPICE:     { icon: "🌶", cls: "badge--error"   },
    OTHER:     { icon: "🔮", cls: "badge--neutral"  },
  };
  const { icon, cls } = map[category] ?? { icon: "", cls: "badge--neutral" };
  return <span className={"badge " + cls}>{icon} {category}</span>;
}

// ─── Produce Card ─────────────────────────────────────────────────────────────

function ProduceCard({ produce }: { produce: ProduceResponse }) {
  const defaultImg = "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&q=80";
  return (
    <div className="produce-card">
      <div className="produce-card__img-wrap">
        <img
          src={produce.imageUrl ?? defaultImg}
          alt={produce.name}
          className="produce-card__img"
          onError={(e) => { (e.target as HTMLImageElement).src = defaultImg; }}
        />
      </div>
      <div className="produce-card__body">
        <div className="produce-card__code">{produce.code}</div>
        <div className="produce-card__name">{produce.name}</div>
        {produce.scientificName && (
          <div className="produce-card__scientific"><em>{produce.scientificName}</em></div>
        )}
        <CategoryBadge category={produce.category} />
        {produce.description && (
          <p className="produce-card__desc">{produce.description}</p>
        )}
        <div className="produce-card__units">
          <span className="produce-card__unit-label">Units:</span>
          {(produce.supportedUnits ?? [produce.defaultUnit]).map((u) => (
            <span key={u} className="badge badge--neutral" style={{ fontSize: "0.65rem" }}>{u}</span>
          ))}
        </div>
        {produce.supportedGrades && produce.supportedGrades.length > 0 && (
          <div className="produce-card__grades">
            <span className="produce-card__unit-label">Grades:</span>
            {produce.supportedGrades.map((g) => (
              <span key={g} className="badge badge--warning" style={{ fontSize: "0.65rem" }}>{g}</span>
            ))}
          </div>
        )}
        <div className="produce-card__active">
          <span className={"badge " + (produce.isActive ? "badge--success" : "badge--neutral")}>
            {produce.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Create Form ────────────────────────────────────────────────────────

function CreateProduceForm({ onCreated }: { onCreated: () => void }) {
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateForm>({
    resolver: zodResolver(createProduceSchema),
  });

  const onSubmit = async (vals: CreateForm) => {
    setSaving(true);
    try {
      await produceApi.create({
        code:           vals.code.toUpperCase(),
        name:           vals.name,
        scientificName: vals.scientificName || undefined,
        category:       vals.category,
        description:    vals.description || undefined,
        defaultUnit:    vals.defaultUnit,
        imageUrl:       vals.imageUrl || undefined,
      });
      toast.success("Produce type created!");
      reset();
      onCreated();
    } catch (err) {
      toast.error((err as ApiError).message ?? "Failed to create produce");
    } finally {
      setSaving(false);
    }
  };

  const e = errors;
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="admin-produce-form" noValidate>
      <div className="section-title">Add Produce Type</div>
      <div className="form-grid form-grid--2col">
        <div className="form-field">
          <label htmlFor="pr-code" className="form-label form-label--required">Code (e.g. RAMBUTAN)</label>
          <input id="pr-code" type="text" className={"form-input" + (e.code ? " form-input--error" : "")}
            {...register("code")} placeholder="RAMBUTAN" style={{ textTransform: "uppercase" }} />
          {e.code && <span className="form-error">⚠ {e.code.message}</span>}
        </div>
        <div className="form-field">
          <label htmlFor="pr-name" className="form-label form-label--required">Name</label>
          <input id="pr-name" type="text" className={"form-input" + (e.name ? " form-input--error" : "")}
            {...register("name")} placeholder="Rambutan" />
          {e.name && <span className="form-error">⚠ {e.name.message}</span>}
        </div>
      </div>
      <div className="form-grid form-grid--2col">
        <div className="form-field">
          <label htmlFor="pr-category" className="form-label form-label--required">Category</label>
          <select id="pr-category" className={"form-input" + (e.category ? " form-input--error" : "")} {...register("category")}>
            <option value="">Select...</option>
            <option value="FRUIT">🍎 Fruit</option>
            <option value="VEGETABLE">🥦 Vegetable</option>
            <option value="GRAIN">🌾 Grain</option>
            <option value="SPICE">🌶 Spice</option>
            <option value="OTHER">Other</option>
          </select>
          {e.category && <span className="form-error">⚠ {e.category.message}</span>}
        </div>
        <div className="form-field">
          <label htmlFor="pr-unit" className="form-label form-label--required">Default Unit</label>
          <select id="pr-unit" className={"form-input" + (e.defaultUnit ? " form-input--error" : "")} {...register("defaultUnit")}>
            <option value="">Select...</option>
            <option value="KG">KG</option>
            <option value="G">Grams</option>
            <option value="MT">Metric Ton</option>
            <option value="PCS">Pieces</option>
            <option value="BOX">Box</option>
          </select>
          {e.defaultUnit && <span className="form-error">⚠ {e.defaultUnit.message}</span>}
        </div>
      </div>
      <div className="form-field">
        <label htmlFor="pr-sci" className="form-label">Scientific Name</label>
        <input id="pr-sci" type="text" className="form-input" {...register("scientificName")} placeholder="Nephelium lappaceum" />
      </div>
      <div className="form-field">
        <label htmlFor="pr-desc" className="form-label">Description</label>
        <textarea id="pr-desc" className="form-input form-textarea" rows={3} {...register("description")} placeholder="Describe the produce..." />
      </div>
      <div className="form-field">
        <label htmlFor="pr-img" className="form-label">Image URL</label>
        <input id="pr-img" type="url" className={"form-input" + (e.imageUrl ? " form-input--error" : "")}
          {...register("imageUrl")} placeholder="https://..." />
        {e.imageUrl && <span className="form-error">⚠ {e.imageUrl.message}</span>}
      </div>
      <div className="form-actions">
        <button id="pr-submit" type="submit" className="btn btn--primary" disabled={saving}>
          {saving ? <span className="btn-spinner"><span className="spinner spinner--sm" /> Adding...</span> : "🌿 Add to Catalogue"}
        </button>
      </div>
    </form>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Produce() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [produce,    setProduce]    = useState<ProduceResponse[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [catFilter,  setCatFilter]  = useState<ProduceCategory | "">("");

  const loadProduce = async () => {
    setLoading(true);
    try {
      const data = await produceApi.getAll();
      setProduce(data);
    } catch (err) {
      toast.error((err as ApiError).message ?? "Failed to load produce");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProduce(); }, []);

  const filtered = produce.filter((p) => {
    const matchesSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !catFilter || p.category === catFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="section animate-in">
      <div className="my-listings-header">
        <div>
          <h1 className="my-listings-header__title">🌿 Produce Catalogue</h1>
          <p className="my-listings-header__sub">
            {produce.length} active produce type{produce.length !== 1 ? "s" : ""} available
          </p>
        </div>
        {isAdmin && (
          <button id="add-produce-toggle" type="button"
            className={"btn " + (showCreate ? "btn--secondary" : "btn--primary")}
            onClick={() => setShowCreate((v) => !v)}
          >
            {showCreate ? "✕ Cancel" : "+ Add Produce"}
          </button>
        )}
      </div>

      {showCreate && isAdmin && (
        <CreateProduceForm onCreated={() => { setShowCreate(false); loadProduce(); }} />
      )}

      {/* Search + Category filter */}
      <div className="produce-filters">
        <input
          id="produce-search"
          type="search"
          className="form-input produce-filters__search"
          placeholder="Search by name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="produce-cat-tabs">
          {(["", "FRUIT", "VEGETABLE", "GRAIN", "SPICE", "OTHER"] as const).map((c) => (
            <button key={c} type="button" id={"cat-" + (c || "ALL")}
              className={"status-tab" + (catFilter === c ? " active" : "")}
              onClick={() => setCatFilter(c)}
            >
              {c === "FRUIT" ? "🍎 Fruit" : c === "VEGETABLE" ? "🥦 Veg" :
               c === "GRAIN" ? "🌾 Grain" : c === "SPICE" ? "🌶 Spice" :
               c === "OTHER" ? "Other" : "All"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="market-loading">
          <span className="spinner" /> <p>Loading catalogue...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="market-empty">
          <div className="market-empty__icon">🔍</div>
          <h3>No produce found</h3>
          <p>Try a different search or category filter.</p>
        </div>
      ) : (
        <div className="produce-grid">
          {filtered.map((p) => <ProduceCard key={p.id} produce={p} />)}
        </div>
      )}
    </div>
  );
}
