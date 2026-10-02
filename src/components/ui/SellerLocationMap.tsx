import React from 'react';
import { MapContainer, TileLayer, Marker, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface SellerLocationMapProps {
    latitude: number;
    longitude: number;
    locality: string;
    district?: string;
    visibility: 'APPROXIMATE' | 'EXACT_AFTER_ORDER';
}

const SellerLocationMap: React.FC<SellerLocationMapProps> = ({ 
    latitude, 
    longitude, 
    locality, 
    district,
    visibility 
}) => {
    const position: [number, number] = [latitude, longitude];
    const isApproximate = visibility === 'APPROXIMATE';

    return (
        <div style={{ height: '300px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <MapContainer 
                center={position} 
                zoom={isApproximate ? 13 : 15} 
                scrollWheelZoom={false} 
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {isApproximate ? (
                    <Circle 
                        center={position} 
                        pathOptions={{ fillColor: '#3b82f6', color: '#2563eb', fillOpacity: 0.2 }} 
                        radius={1500} // 1.5km radius for privacy
                    >
                        <Popup>
                            <strong>Approximate Location</strong><br/>
                            {locality}{district ? `, ${district}` : ''}
                        </Popup>
                    </Circle>
                ) : (
                    <Marker position={position}>
                        <Popup>
                            <strong>Seller Location</strong><br/>
                            {locality}{district ? `, ${district}` : ''}
                        </Popup>
                    </Marker>
                )}
            </MapContainer>
        </div>
    );
};

export default SellerLocationMap;
