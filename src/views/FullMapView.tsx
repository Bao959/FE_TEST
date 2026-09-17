import React, { useState } from 'react';
import {
  MapPin,
  Utensils,
  Tag,
  Users,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  Filter,
  Eye
} from 'lucide-react';
import { User, Restaurant, DiningSession, FutureDiningPost } from '../types';
import { storageService } from '../services/storageService';
import { InteractiveMap } from '../components/common/InteractiveMap';
import { calculateDistanceKm, formatDistance } from '../utils/geo';

interface FullMapViewProps {
  currentUser: User;
  onOpenSession: (sessionId: string) => void;
  onOpenDeals: () => void;
}

export const FullMapView: React.FC<FullMapViewProps> = ({
  currentUser,
  onOpenSession,
  onOpenDeals
}) => {
  const restaurants = storageService.getRestaurants();
  const sessions = storageService.getSessions().filter((s) => s.status !== 'CANCELLED');
  const futurePosts = storageService.getFuturePosts();

  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(restaurants[0] || null);
  const [filterMode, setFilterMode] = useState<'ALL' | 'VOUCHERS' | 'SESSIONS'>('ALL');

  const userLat = currentUser.location.lat;
  const userLng = currentUser.location.lng;

  const filteredRestaurants = restaurants.filter((r) => {
    if (filterMode === 'VOUCHERS') return r.activeDealsCount > 0;
    if (filterMode === 'SESSIONS') {
      return sessions.some((s) => s.restaurantId === r.id);
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      
      {/* MAP HEADER */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-600" />
              Bản Đồ Ẩm Thực & Quán Ăn Gần Bạn
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Khám phá trực quan vị trí các quán ăn, bàn đang gom người và ưu đãi nhóm xung quanh bạn (GPS: {currentUser.location.address})
          </p>
        </div>

        {/* MAP FILTER PILLS */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Lọc:
          </span>
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterMode === 'ALL'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất Cả ({restaurants.length})
          </button>
          <button
            onClick={() => setFilterMode('VOUCHERS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterMode === 'VOUCHERS'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            🎁 Có Voucher Khủng
          </button>
          <button
            onClick={() => setFilterMode('SESSIONS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterMode === 'SESSIONS'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            👥 Có Bàn Đang Gom
          </button>
        </div>
      </div>

      {/* MAP + SIDEBAR INTERACTIVE CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 h-[620px]">
        
        {/* INTERACTIVE MAP (2/3) */}
        <div className="lg:col-span-2 h-full rounded-3xl overflow-hidden border border-slate-200 shadow-md relative">
          <InteractiveMap
            restaurants={filteredRestaurants}
            userLocation={currentUser.location}
            selectedRestaurantId={selectedRestaurant?.id}
            onSelectRestaurant={(rest) => setSelectedRestaurant(rest)}
            heightClass="h-full"
          />
        </div>

        {/* SIDEBAR: SELECTED VENUE DETAILS & CURRENT OPEN SESSIONS (1/3) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm overflow-y-auto flex flex-col justify-between space-y-4">
          {selectedRestaurant ? (
            <div className="space-y-4">
              
              {/* RESTAURANT COVER & INFO */}
              <div>
                <div className="relative h-40 rounded-2xl overflow-hidden bg-slate-100 mb-3 shadow-xs">
                  <img
                    src={selectedRestaurant.coverImage}
                    alt={selectedRestaurant.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold">
                    Cách {formatDistance(calculateDistanceKm(userLat, userLng, selectedRestaurant.lat, selectedRestaurant.lng))}
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-brand-600 text-white text-[11px] font-bold uppercase">
                    {selectedRestaurant.category}
                  </div>
                </div>

                <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                  {selectedRestaurant.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  📍 {selectedRestaurant.address}
                </p>

                <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-slate-100">
                  <span className="text-amber-600 font-bold">★ {selectedRestaurant.rating} ({selectedRestaurant.reviewCount} đánh giá)</span>
                  <span className="text-slate-600 font-semibold">{selectedRestaurant.priceRange}</span>
                </div>
              </div>

              {/* SESSIONS OPEN AT THIS RESTAURANT */}
              <div>
                <span className="font-bold text-xs text-slate-700 uppercase tracking-wider block mb-2">
                  Bàn ăn đang gom tại quán này:
                </span>

                {sessions.filter((s) => s.restaurantId === selectedRestaurant.id).length === 0 ? (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-400">
                    Chưa có bàn nào đang gom tại đây. Bạn có thể là người tạo bàn đầu tiên!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sessions
                      .filter((s) => s.restaurantId === selectedRestaurant.id)
                      .map((s) => (
                        <div
                          key={s.id}
                          onClick={() => onOpenSession(s.id)}
                          className="p-2.5 rounded-xl border border-slate-200 hover:border-brand-500 bg-slate-50 hover:bg-brand-50/50 cursor-pointer transition-all"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-900 line-clamp-1">{s.title}</span>
                            <span className="font-extrabold text-brand-600 whitespace-nowrap ml-2">
                              {s.joinedMembers.length}/{s.targetSlots}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                            <span>Giờ: {s.eatingTime}</span>
                            <span className="text-brand-600 font-semibold underline">Vào bàn &rarr;</span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* VOUCHER AT THIS RESTAURANT */}
              {selectedRestaurant.activeDealsCount > 0 && (
                <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs">
                  <div className="font-bold text-red-900 flex items-center gap-1 mb-1">
                    <Tag className="w-3.5 h-3.5 text-red-600" />
                    <span>Ưu đãi nhóm đang áp dụng:</span>
                  </div>
                  <p className="text-[11px] text-red-800">
                    Quán đang có {selectedRestaurant.activeDealsCount} Voucher nhóm đặc biệt khi lập team từ 3-4 người!
                  </p>
                  <button
                    onClick={onOpenDeals}
                    className="mt-2 text-xs font-bold text-red-700 hover:text-red-800 underline"
                  >
                    Xem chi tiết mã giảm giá &rarr;
                  </button>
                </div>
              )}

            </div>
          ) : (
            <div className="py-20 text-center text-xs text-slate-400">
              Bấm vào bất kỳ ghim nhà hàng nào trên bản đồ để xem chi tiết quán và các bàn đang gom!
            </div>
          )}

          {/* Quick instructions at bottom */}
          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            <span>Click vào ghim trên bản đồ để di chuyển camera & xem bàn ăn.</span>
          </div>

        </div>

      </div>

    </div>
  );
};
