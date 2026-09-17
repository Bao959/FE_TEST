import React, { useState } from 'react';
import {
  Utensils,
  Sparkles,
  Users,
  Tag,
  DollarSign,
  Smile,
  ShieldCheck,
  ArrowRight,
  LogIn,
  UserPlus
} from 'lucide-react';
import { User, Restaurant } from '../types';
import { storageService } from '../services/storageService';
import { InteractiveMap } from '../components/common/InteractiveMap';
import { calculateDistanceKm, formatDistance } from '../utils/geo';

interface AuthSplitViewProps {
  onLoginSuccess: (user: User) => void;
}

export const AuthSplitView: React.FC<AuthSplitViewProps> = ({ onLoginSuccess }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('tuan.nguyen@foodie.vn');
  const [password, setPassword] = useState('123456');
  const [fullName, setFullName] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  const allUsers = storageService.getUsers();
  const restaurants = storageService.getRestaurants();

  // User simulated GPS (District 1, HCMC)
  const defaultLocation = {
    lat: 10.7769,
    lng: 106.7009,
    address: 'Bến Nghé, Quận 1, TP. Hồ Chí Minh'
  };

  const handleQuickLogin = (user: User) => {
    storageService.setCurrentUserId(user.id);
    onLoginSuccess(user);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegisterMode) {
      if (!fullName.trim()) {
        alert('Vui lòng nhập họ và tên của bạn.');
        return;
      }
      const newUser = storageService.createUser({
        name: fullName,
        email: email,
        bio: 'Thành viên mới gia nhập DineTogether!',
        foodPreferences: ['Lẩu & Nướng', 'Ăn vặt'],
        role: 'user'
      });
      storageService.setCurrentUserId(newUser.id);
      onLoginSuccess(newUser);
    } else {
      // Find matching user or fallback to first
      const matched = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
      const chosen = matched || allUsers[0];
      storageService.setCurrentUserId(chosen.id);
      onLoginSuccess(chosen);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-900">
      
      {/* LEFT COLUMN: AUTH & VALUE PROPOSITIONS (50%) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-14 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white overflow-y-auto">
        <div>
          {/* Brand Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
              <Utensils className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
                Dine<span className="text-brand-500">Together</span>
              </span>
              <p className="text-xs text-slate-400 font-medium">Nền tảng kết nối những người xa lạ đi ăn chung</p>
            </div>
          </div>

          {/* Value Proposition Pills */}
          <div className="mt-8 space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Ăn Ngon Hơn, Vui Hơn, <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-brand-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                Tiết Kiệm Hơn Khi Đi Cùng Nhau
              </span>
            </h1>
            <p className="text-sm text-slate-300 max-w-lg leading-relaxed">
              Bạn muốn ăn lẩu, ăn nướng, thử nhiều món nhưng ngại đi một mình? Tham gia cùng những người bạn mới, chia sẻ tiền bàn và cùng mở khóa những voucher nhóm siêu ưu đãi!
            </p>

            {/* Core Values Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/60 text-xs text-slate-200">
                <Smile className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Tạo niềm vui mới</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/60 text-xs text-slate-200">
                <Utensils className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>Thử nhiều món ngon</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/60 text-xs text-slate-200">
                <DollarSign className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Chia nhỏ hóa đơn</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/60 text-xs text-slate-200">
                <Tag className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span>Mở khóa Voucher nhóm</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/60 text-xs text-slate-200">
                <Users className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <span>Kết bạn bốn phương</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/60 text-xs text-slate-200">
                <ShieldCheck className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <span>Đánh giá uy tín cao</span>
              </div>
            </div>
          </div>

          {/* Quick Demo Personas (1-Click Login) */}
          <div className="mt-8 p-4 rounded-2xl bg-brand-950/40 border border-brand-800/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Trải nghiệm nhanh (1 Click)
              </span>
              <span className="text-[11px] text-slate-400">Chọn vai để vào ngay:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {allUsers.slice(0, 4).map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleQuickLogin(u)}
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-800/80 hover:bg-brand-600/30 hover:border-brand-500/50 border border-slate-700/50 text-left transition-all group"
                >
                  <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover border border-slate-600" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white group-hover:text-brand-400 truncate flex items-center justify-between">
                      <span>{u.name}</span>
                      <span className="text-[9px] px-1 rounded bg-slate-700 text-slate-300">
                        {u.role === 'restaurant' ? 'Nhà Hàng' : 'Thực Khách'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{u.bio}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Credentials Form */}
          <div className="mt-6 bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {isRegisterMode ? <UserPlus className="w-4 h-4 text-brand-400" /> : <LogIn className="w-4 h-4 text-brand-400" />}
                {isRegisterMode ? 'Đăng Ký Tài Khoản Mới' : 'Đăng Nhập Hệ Thống'}
              </h3>
              <button
                type="button"
                onClick={() => setIsRegisterMode(!isRegisterMode)}
                className="text-xs font-semibold text-brand-400 hover:text-brand-300 underline"
              >
                {isRegisterMode ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              {isRegisterMode && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Họ và tên của bạn</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Hoàng Minh Trí"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="tuan.nguyen@foodie.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Mật khẩu</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-95 mt-2"
              >
                <span>{isRegisterMode ? 'Tạo Tài Khoản & Bắt Đầu' : 'Đăng Nhập Vào Ứng Dụng'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 DineTogether Platform. Kết nối niềm vui ẩm thực.</span>
          <span className="text-slate-400">Hỗ trợ đầy đủ dữ liệu Mock trực tiếp</span>
        </div>
      </div>

      {/* RIGHT COLUMN: RADAR MAP OF NEARBY RESTAURANTS (50%) */}
      <div className="w-full lg:w-1/2 h-[500px] lg:h-auto min-h-full relative flex flex-col bg-slate-800 p-4 sm:p-6">
        
        {/* Floating Header on Map */}
        <div className="absolute top-8 left-8 right-8 z-[1000] pointer-events-none">
          <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-slate-100 flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Radar Quán Ăn & Ưu Đãi Gần Bạn</h4>
                <p className="text-[10px] text-slate-500">Đang quét các nhà hàng có voucher nhóm & bàn đang gom quanh bạn</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-brand-600">{restaurants.length} Quán</span>
            </div>
          </div>
        </div>

        {/* Interactive Leaflet Map */}
        <div className="flex-1 w-full h-full pt-16">
          <InteractiveMap
            restaurants={restaurants}
            userLocation={defaultLocation}
            selectedRestaurantId={selectedRestaurant?.id}
            onSelectRestaurant={(rest) => setSelectedRestaurant(rest)}
            heightClass="h-full min-h-[420px]"
          />
        </div>

        {/* Floating Quick Action / Preview Card */}
        {selectedRestaurant && (
          <div className="absolute bottom-10 left-8 right-8 z-[1000] bg-white rounded-2xl p-4 shadow-2xl border border-slate-200 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-start gap-3">
              <img
                src={selectedRestaurant.coverImage}
                alt={selectedRestaurant.name}
                className="w-20 h-20 rounded-xl object-cover shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                    {selectedRestaurant.category}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">
                    Cách {formatDistance(calculateDistanceKm(defaultLocation.lat, defaultLocation.lng, selectedRestaurant.lat, selectedRestaurant.lng))}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm truncate mt-0.5">{selectedRestaurant.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-1">{selectedRestaurant.address}</p>
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <span className="text-amber-600 font-bold">★ {selectedRestaurant.rating} ({selectedRestaurant.reviewCount} đánh giá)</span>
                  <span className="text-slate-600">{selectedRestaurant.priceRange}</span>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {selectedRestaurant.activeDealsCount > 0 ? (
                  <strong className="text-red-600 font-semibold">🎁 Có {selectedRestaurant.activeDealsCount} Voucher nhóm hấp dẫn</strong>
                ) : (
                  'Bàn ăn tự do thoải mái'
                )}
              </span>
              <button
                onClick={() => {
                  // Quick login with default user and proceed
                  handleQuickLogin(allUsers[0]);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-brand-500/20"
              >
                <span>Vào tìm bạn ăn tại quán này</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
