import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Restaurant } from '../../types';

interface InteractiveMapProps {
  restaurants: Restaurant[];
  userLocation: { lat: number; lng: number; address: string };
  selectedRestaurantId?: string;
  onSelectRestaurant?: (restaurant: Restaurant) => void;
  heightClass?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  restaurants,
  userLocation,
  selectedRestaurantId,
  onSelectRestaurant,
  heightClass = 'h-full'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Map if not yet created
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userLocation.lat, userLocation.lng],
        zoom: 14,
        zoomControl: false
      });

      // OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      // Add zoom control top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear old markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    // User Location Marker
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-brand-400 opacity-75"></span>
          <div class="relative w-7 h-7 bg-brand-600 rounded-full border-2 border-white flex items-center justify-center shadow-lg text-white text-xs font-bold">
            📍
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
      .addTo(map)
      .bindPopup(`
        <div class="p-1 font-sans">
          <p class="text-xs font-bold text-slate-800">Vị trí của bạn</p>
          <p class="text-[11px] text-slate-500">${userLocation.address}</p>
        </div>
      `);
    markersRef.current['user'] = userMarker;

    // Restaurant Markers
    restaurants.forEach((restaurant) => {
      const isSelected = restaurant.id === selectedRestaurantId;
      const markerHtml = `
        <div class="group cursor-pointer transform hover:scale-110 transition-transform">
          <div class="px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md border ${
            isSelected
              ? 'bg-brand-600 text-white border-brand-700 ring-2 ring-brand-300'
              : 'bg-white text-slate-800 border-slate-200 hover:border-brand-500'
          }">
            <span>🍲</span>
            <span class="truncate max-w-[120px]">${restaurant.name}</span>
            <span class="text-[10px] bg-amber-100 text-amber-800 px-1 rounded">★${restaurant.rating}</span>
          </div>
          ${
            restaurant.activeDealsCount > 0
              ? `<div class="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center shadow animate-pulse">
                  Deal
                </div>`
              : ''
          }
        </div>
      `;

      const restIcon = L.divIcon({
        className: 'custom-rest-marker',
        html: markerHtml,
        iconSize: [140, 32],
        iconAnchor: [70, 16]
      });

      const marker = L.marker([restaurant.lat, restaurant.lng], { icon: restIcon }).addTo(map);

      // Popup content
      const popupContent = `
        <div class="p-2 w-56 font-sans">
          <img src="${restaurant.coverImage}" class="w-full h-24 object-cover rounded-md mb-2 shadow-sm" />
          <h4 class="font-bold text-slate-900 text-sm leading-tight">${restaurant.name}</h4>
          <p class="text-xs text-brand-600 font-medium mt-0.5">${restaurant.category}</p>
          <p class="text-[11px] text-slate-500 line-clamp-1 mt-1">${restaurant.address}</p>
          <div class="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
            <span class="text-amber-600 font-bold">★ ${restaurant.rating} (${restaurant.reviewCount})</span>
            <span class="text-slate-600 font-semibold">${restaurant.priceRange.split('/')[0]}</span>
          </div>
          ${
            restaurant.isRegisteredOnSystem
              ? '<div class="mt-2 text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded text-center">✓ Đặt bàn trực tiếp qua App</div>'
              : '<div class="mt-2 text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-center">Tự liên hệ giữ bàn</div>'
          }
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        if (onSelectRestaurant) {
          onSelectRestaurant(restaurant);
        }
      });

      markersRef.current[restaurant.id] = marker;
    });

    // Invalidate size to guarantee rendering
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [restaurants, userLocation, selectedRestaurantId, onSelectRestaurant]);

  // Recenter when selected restaurant changes
  useEffect(() => {
    if (selectedRestaurantId && mapInstanceRef.current) {
      const rest = restaurants.find((r) => r.id === selectedRestaurantId);
      if (rest) {
        mapInstanceRef.current.flyTo([rest.lat, rest.lng], 16, { duration: 1 });
        const marker = markersRef.current[rest.id];
        if (marker) {
          marker.openPopup();
        }
      }
    }
  }, [selectedRestaurantId, restaurants]);

  return (
    <div className={`relative w-full ${heightClass} rounded-2xl overflow-hidden shadow-inner border border-slate-200`}>
      <div ref={mapContainerRef} className="w-full h-full" />
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse"></span>
        <span>GPS Vị trí: <strong>{userLocation.address}</strong></span>
      </div>
    </div>
  );
};
