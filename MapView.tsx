import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Maximize, Tag } from 'lucide-react';

// Fix for default marker icons in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

const cityCoordinates: Record<string, [number, number]> = {
  "التجمع الخامس": [30.0067, 31.4267],
  "مدينة نصر": [30.0626, 31.3283],
  "المعادي": [29.9593, 31.2590],
  "الشروق": [30.1489, 31.6061],
  "الرحاب": [30.0626, 31.4913],
  "مدينتي": [30.0967, 31.6111],
  "الشيخ زايد": [30.0445, 29.9863],
  "أكتوبر": [29.9714, 29.9401],
  "الدقي": [30.0384, 31.2112],
  "الهرم": [29.9896, 31.1283],
  "المهندسين": [30.0588, 31.1970],
  "سموحة": [31.2115, 29.9420],
  "المنتزة": [31.2811, 30.0149],
  "ستانلي": [31.2350, 29.9497],
  "سيدي بشر": [31.2657, 29.9916],
  "ميامي": [31.2690, 29.9980],
  "القاهرة": [30.0444, 31.2357],
  "الجيزة": [30.0131, 31.2089],
  "الإسكندرية": [31.2001, 29.9187]
};

// Helper to get coordinates with a slight random offset so markers don't overlap perfectly
const getCoordinates = (property: any): [number, number] => {
  if (property.location?.lat && property.location?.lng && property.location.lat !== 0) {
    return [property.location.lat, property.location.lng];
  }
  
  const city = property.location?.city;
  const gov = property.location?.governorate;
  
  const baseCoords = cityCoordinates[city] || cityCoordinates[gov] || [30.0444, 31.2357]; // Default to Cairo
  
  // Add a tiny random offset (approx 0-500 meters) to prevent exact overlaps
  // Use property ID to make the random offset deterministic for the same property
  const seed = property.id ? property.id.charCodeAt(0) + property.id.charCodeAt(property.id.length - 1) : Math.random();
  const offsetLat = (seed % 10 - 5) * 0.002;
  const offsetLng = ((seed * 2) % 10 - 5) * 0.002;
  
  return [baseCoords[0] + offsetLat, baseCoords[1] + offsetLng];
};

// Component to auto-adjust map bounds to fit all markers
const MapBounds = ({ properties }: { properties: any[] }) => {
  const map = useMap();

  useEffect(() => {
    if (properties.length === 0) return;
    
    const bounds = L.latLngBounds(properties.map(p => getCoordinates(p)));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
  }, [properties, map]);

  return null;
};

interface MapViewProps {
  properties: any[];
}

export default function MapView({ properties }: MapViewProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(price);
  };

  const isVideo = (url: string) => {
    if (!url) return false;
    const lowerUrl = url.toLowerCase();
    return lowerUrl.includes('.mp4') || lowerUrl.includes('.webm') || lowerUrl.includes('.ogg') || lowerUrl.includes('.mov') || lowerUrl.startsWith('data:video/');
  };

  return (
    <div className="h-[600px] w-full rounded-3xl overflow-hidden shadow-xl border border-gray-200 relative z-0">
      <MapContainer 
        center={[30.0444, 31.2357]} 
        zoom={10} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapBounds properties={properties} />

        {properties.map(property => {
          const coords = getCoordinates(property);
          return (
            <Marker key={property.id} position={coords}>
              <Popup className="property-popup">
                <div className="w-64" dir="rtl">
                  <Link to={`/property/${property.id}`} className="block relative h-32 overflow-hidden rounded-t-xl bg-gray-100">
                    {property.images && property.images.length > 0 ? (
                      isVideo(property.images[0]) ? (
                        <video src={property.images[0]} className="w-full h-full object-cover" muted loop autoPlay playsInline />
                      ) : (
                        <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover" />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">لا توجد صورة</div>
                    )}
                    <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-bold">
                      {property.listingType === 'sale' ? 'للبيع' : 'للإيجار'}
                    </div>
                  </Link>
                  <div className="p-3">
                    <Link to={`/property/${property.id}`}>
                      <h3 className="font-bold text-gray-900 line-clamp-1 hover:text-blue-600 mb-1">{property.title}</h3>
                    </Link>
                    <div className="flex items-center text-gray-500 text-xs mb-2">
                      <MapPin className="h-3 w-3 ml-1" />
                      <span className="line-clamp-1">{property.location.governorate}، {property.location.city}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center text-blue-600 font-bold text-sm">
                        {formatPrice(property.price)}
                      </div>
                      <div className="flex items-center text-gray-500 text-xs">
                        <Maximize className="h-3 w-3 ml-1" />
                        {property.area} م²
                      </div>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      <style>{`
        .property-popup .leaflet-popup-content-wrapper {
          padding: 0;
          overflow: hidden;
          border-radius: 0.75rem;
        }
        .property-popup .leaflet-popup-content {
          margin: 0;
          width: 16rem !important;
        }
        .property-popup .leaflet-popup-tip-container {
          margin-top: -1px;
        }
      `}</style>
    </div>
  );
}
