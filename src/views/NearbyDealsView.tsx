import React, { useState, useMemo } from 'react';
import {
  Tag,
  MapPin,
  Users,
  Clock,
  ArrowRight,
  Sparkles,
  Search,
  SlidersHorizontal,
  Plus
} from 'lucide-react';
import { User, Restaurant, GroupVoucher } from '../types';
import { storageService } from '../services/storageService';
import { calculateDistanceKm, formatDistance } from '../utils/geo';
import { CreateSessionModal } from '../components/dining/CreateSessionModal';

interface NearbyDealsViewProps {
  currentUser: User;
  onOpenFeedWithSession: (sessionId: string) => void;
}

export const NearbyDealsView: React.FC<NearbyDealsViewProps> = ({
  currentUser,
  onOpenFeedWithSession
}) => {
  const [vouchers, setVouchers] = useState<GroupVoucher[]>(() => storageService.getVouchers());
  const restaurants = storageService.getRestaurants();
  const [searchQuery, setSearchQuery] = useState('');
  const [maxDistanceFilter, setMaxDistanceFilter] = useState<number | 'ALL'>('ALL');
  const [targetRestaurantForModal, setTargetRestaurantForModal] = useState<string | null>(null);

  const userLat = currentUser.location.lat;
  const userLng = currentUser.location.lng;

  // Enrich vouchers with restaurant and distance
  const enrichedVouchers = useMemo(() => {
    return vouchers
      .map((voucher) => {
        const rest = restaurants.find((r) => r.id === voucher.restaurantId);
        const distanceKm = rest ? calculateDistanceKm(userLat, userLng, rest.lat, rest.lng) : 999;
        return {
          ...voucher,
          restaurant: rest,
          distanceKm
        };
      })
      .filter((item) => {
        const matchQuery =
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.restaurantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase());

        const matchDistance =
          maxDistanceFilter === 'ALL' || item.distanceKm <= maxDistanceFilter;

        return matchQuery && matchDistance;
      })
      .sort((a, b) => a.distanceKm - b.distanceKm); // Sort by nearest first!
  }, [vouchers, restaurants, userLat, userLng, searchQuery, maxDistanceFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-amber-100">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Săn Ưu Đãi Nhóm Gần Nhất
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-3">
            Đi Càng Đông — Ưu Đãi Càng Khủng!
          </h1>
          <p className="text-sm text-rose-100 mt-2 leading-relaxed">
            Các nhà hàng luôn có chương trình giảm 20% - 35% hoặc tặng món đặc biệt cho nhóm từ 3-4 người. Tìm bạn cùng gom bàn để mở khóa ngay!
          </p>
        </div>
      </div>

      {/* SEARCH & DISTANCE FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm voucher theo tên quán, món ăn hoặc loại giảm giá..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Bán kính:
          </span>
          <select
            value={maxDistanceFilter}
            onChange={(e) => setMaxDistanceFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-brand-500"
          >
            <option value="ALL">Tất cả khoảng cách</option>
            <option value={1}>Trong vòng 1 km</option>
            <option value={2}>Trong vòng 2 km</option>
            <option value={5}>Trong vòng 5 km</option>
          </select>
        </div>
      </div>

      {/* VOUCHER CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {enrichedVouchers.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-red-400 transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Image & Discount Badge */}
              <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                <img
                  src={item.bannerImage}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Badge Discount */}
                <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-xl text-xs font-extrabold shadow-md flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  <span>{item.discountValue}</span>
                </div>

                {/* Nearest distance indicator */}
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs text-slate-800 px-3 py-1 rounded-xl text-xs font-bold shadow-md flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-600" />
                  <span>Cách {formatDistance(item.distanceKm)}</span>
                </div>

                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                    {item.restaurant?.category}
                  </span>
                  <h3 className="font-bold text-lg leading-tight truncate mt-0.5">
                    {item.restaurantName}
                  </h3>
                  <p className="text-xs text-slate-200 line-clamp-1">{item.restaurant?.address}</p>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-base text-slate-900 leading-snug">
                    {item.title}
                  </h4>
                  <span className="text-xs font-mono font-bold px-2 py-1 bg-slate-100 text-slate-700 rounded-lg border border-slate-200 whitespace-nowrap">
                    {item.code}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.description}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 text-brand-700 font-bold bg-brand-50 px-2.5 py-1 rounded-lg">
                    <Users className="w-3.5 h-3.5 text-brand-600" />
                    <span>Yêu cầu nhóm từ {item.minGroupSize} người trở lên</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>HSD: {item.expiryDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Button */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-600">
                Đang có bàn gom quanh đây?
              </span>
              <button
                onClick={() => setTargetRestaurantForModal(item.restaurantId)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-brand-600 hover:from-red-700 hover:to-brand-700 text-white font-bold text-xs shadow-md shadow-red-500/20 flex items-center gap-1.5 transition-all transform active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Tạo Bàn Ăn Deal Này Ngay</span>
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* CREATE SESSION MODAL WITH PRESELECTED RESTAURANT */}
      {targetRestaurantForModal && (
        <CreateSessionModal
          currentUser={currentUser}
          restaurants={restaurants}
          preselectedRestaurantId={targetRestaurantForModal}
          onClose={() => setTargetRestaurantForModal(null)}
          onSessionCreated={(newId) => {
            setTargetRestaurantForModal(null);
            onOpenFeedWithSession(newId);
          }}
        />
      )}

    </div>
  );
};
