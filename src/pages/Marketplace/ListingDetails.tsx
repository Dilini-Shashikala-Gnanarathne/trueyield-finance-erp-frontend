import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { listingsApi, type ListingResponse } from "@/api/marketplace.api";
import PageHeader from "@/components/layout/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import SellerLocationMap from "@/components/ui/SellerLocationMap";

export default function ListingDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<ListingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    listingsApi.getById(id)
      .then(setListing)
      .catch((err) => {
        console.error(err);
        setError(err.message || "Failed to load listing");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
        <LoadingSpinner size="lg" label="Loading details..." />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="page-container">
        <PageHeader title="Error" subtitle="Could not load listing details" />
        <div style={{ color: 'red', marginTop: '1rem' }}>{error}</div>
        <button className="btn btn-secondary" onClick={() => navigate(-1)} style={{ marginTop: '1rem' }}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ padding: '1rem' }}>
      <PageHeader 
        title={listing.title || listing.produce?.name || "Listing Details"} 
        subtitle={`Listed by ${listing.seller?.sellerName || "Farmer"} • ${listing.location?.locality || ""}${listing.location?.district ? `, ${listing.location.district}` : ""}`}
      />

      <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
        {/* Left Column: Details */}
        <div style={{ flex: '1 1 400px', backgroundColor: '#1e1e2d', padding: '1.5rem', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#fff' }}>Listing Information</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#a1a1aa' }}>Price</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#10b981' }}>
                LKR {listing.pricePerUnit.toFixed(2)} / {listing.unit}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#a1a1aa' }}>Available Quantity</div>
              <div style={{ fontSize: '1.125rem', color: '#fff' }}>
                {listing.availableQuantity} {listing.unit}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#a1a1aa' }}>Quality Grade</div>
              <div style={{ fontSize: '1.125rem', color: '#fff' }}>{listing.qualityGrade}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#a1a1aa' }}>Harvest Date</div>
              <div style={{ fontSize: '1.125rem', color: '#fff' }}>
                {new Date(listing.harvestDate).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', color: '#a1a1aa', marginBottom: '0.5rem' }}>Description</h3>
            <p style={{ color: '#e4e4e7', lineHeight: '1.5' }}>
              {listing.description || "No description provided."}
            </p>
          </div>

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.75rem', fontSize: '1.125rem' }}
            onClick={() => alert("Order Checkout Flow Coming Soon (ORDER-001)")}
            disabled={listing.status !== 'ACTIVE' || listing.availableQuantity <= 0}
          >
            {listing.status === 'ACTIVE' ? 'Order Now' : 'Currently Unavailable'}
          </button>
        </div>

        {/* Right Column: Map & Seller Info */}
        <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ backgroundColor: '#1e1e2d', padding: '1.5rem', borderRadius: '8px' }}>
             <h3 style={{ fontSize: '1.125rem', color: '#fff', marginBottom: '1rem' }}>Location Information</h3>
             {listing.location ? (
               <>
                 <div style={{ height: '300px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
                    <SellerLocationMap 
                      latitude={listing.location.latitude}
                      longitude={listing.location.longitude}
                      locality={listing.location.locality}
                      district={listing.location.district}
                      visibility={listing.location.visibility}
                    />
                 </div>
                 <div style={{ marginTop: '1rem', color: '#a1a1aa', fontSize: '0.875rem' }}>
                   {listing.location.visibility === 'APPROXIMATE' 
                      ? "Showing approximate location to protect seller privacy." 
                      : "Showing exact farm location."}
                 </div>
               </>
             ) : (
               <div style={{ color: '#a1a1aa', fontSize: '0.875rem' }}>Location details unavailable.</div>
             )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
