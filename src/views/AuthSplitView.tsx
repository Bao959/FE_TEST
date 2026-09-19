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
  UserPlus,
  Store,
  User as UserIcon,
  CheckCircle2
} from 'lucide-react';
import { User, Restaurant } from '../types';
import { storageService } from '../services/storageService';
import { InteractiveMap } from '../components/common/InteractiveMap';
import { calculateDistanceKm, formatDistance } from '../utils/geo';
import { ProfileCompletionModal } from '../components/auth/ProfileCompletionModal';

interface AuthSplitViewProps {
  onLoginSuccess: (user: User) => void;
}

export const AuthSplitView: React.FC<AuthSplitViewProps> = ({ onLoginSuccess }) => {
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  
  // Login states
  const [loginEmail, setLoginEmail] = useState('tuan.nguyen@foodie.vn');
  const [loginPassword, setLoginPassword] = useState('123456');

  // Register states
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState<'user' | 'restaurant'>('user');

  // Onboarding state
  const [onboardingUser, setOnboardingUser] = useState<User | null>(null);

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

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = allUsers.find((u) => u.email.toLowerCase() === loginEmail.toLowerCase());
    const chosen = matched || allUsers[0];
    storageService.setCurrentUserId(chosen.id);
    onLoginSuccess(chosen);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName.trim()) {
      alert('Vui lòng nhập họ và tên của bạn.');
      return;
    }
    if (!regEmail.trim()) {
      alert('Vui lòng nhập email.');
      return;
    }
    if (regPassword && regPassword !== regConfirmPassword) {
      alert('Mật khẩu và xác nhận mật khẩu không khớp!');
      return;
    }

    // Create user initially (profile is not yet completed 80%)
    const newUser = storageService.createUser({
      name: regFullName.trim(),
      email: regEmail.trim(),
      phone: regPhone.trim(),
      role: regRole,
      bio: 'Thành viên mới gia nhập Chạm Đũa!',
      foodPreferences: ['Lẩu & Nướng Than Hoa', 'Ăn Cay Cấp Độ 3'],
      isProfileCompleted: false,
      profileCompletionPercent: 45
    });

    storageService.setCurrentUserId(newUser.id);
    
    // Trigger the required >= 80% profile completion flow!
    setOnboardingUser(newUser);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-900">
      
      {/* LEFT COLUMN: AUTH & VALUE PROPOSITIONS (50%) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-12 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white overflow-y-auto">
        <div>
          {/* Brand Header - Chạm Đũa */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/30 text-2xl">
              🥢
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
                Chạm<span className="text-brand-500">Đũa</span>
              </span>
              <p className="text-xs text-amber-300 font-semibold">Chạm đũa kết thân • Ăn ngon chia sẻ</p>
            </div>
          </div>

          {/* Value Proposition Pills */}
          <div className="mt-6 space-y-3">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Ăn Ngon Hơn, Vui Hơn, <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-brand-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                Tiết Kiệm Hơn Khi Đi Cùng Nhau
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed">
              Bạn thèm ăn lẩu, nướng, ẩm thực đường phố nhưng ngại đi một mình? Chạm Đũa kết nối bạn với những người cùng gu ăn uống, cùng chia hóa đơn và mở khóa voucher nhóm hấp dẫn!
            </p>

            {/* Core Values Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/70 border border-slate-700/60 text-xs text-slate-200">
                <Smile className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>Tạo niềm vui mới</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/70 border border-slate-700/60 text-xs text-slate-200">
                <Utensils className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                <span>Thử nhiều món ngon</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/70 border border-slate-700/60 text-xs text-slate-200">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Chia nhỏ hóa đơn</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/70 border border-slate-700/60 text-xs text-slate-200">
                <Tag className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                <span>Voucher nhóm khủng</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/70 border border-slate-700/60 text-xs text-slate-200">
                <Users className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                <span>Kết bạn bốn phương</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/70 border border-slate-700/60 text-xs text-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                <span>Cộng đồng uy tín</span>
              </div>
            </div>
          </div>

          {/* Quick Demo Personas (1-Click Login) */}
          <div className="mt-6 p-3.5 rounded-2xl bg-brand-950/40 border border-brand-800/50">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Trải nghiệm nhanh (1-Click Demo)
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
                        {u.role === 'restaurant' ? 'Quán' : 'Khách'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{u.bio}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* AUTH SECTION WITH TWO TABS: ĐĂNG NHẬP & ĐĂNG KÝ */}
          <div className="mt-6 bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50 backdrop-blur-sm shadow-xl">
            
            {/* TOGGLE TABS */}
            <div className="flex items-center bg-slate-900/80 p-1.5 rounded-2xl border border-slate-700 mb-5">
              <button
                type="button"
                onClick={() => setAuthTab('login')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  authTab === 'login'
                    ? 'bg-gradient-to-r from-brand-500 to-amber-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng Nhập</span>
              </button>

              <button
                type="button"
                onClick={() => setAuthTab('register')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  authTab === 'register'
                    ? 'bg-gradient-to-r from-brand-500 to-amber-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Đăng Ký Tài Khoản</span>
                <span className="px-1.5 py-0.2 text-[9px] bg-red-500 text-white rounded-full font-extrabold">
                  80% Profile
                </span>
              </button>
            </div>

            {/* TAB 1: LOGIN FORM */}
            {authTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email tài khoản</label>
                  <input
                    type="email"
                    required
                    placeholder="tuan.nguyen@foodie.vn"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Mật khẩu</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-95 mt-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Đăng Nhập Vào Chạm Đũa</span>
                </button>
              </form>
            )}

            {/* TAB 2: DEDICATED REGISTER FORM */}
            {authTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                
                {/* Role selection */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole('user')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      regRole === 'user'
                        ? 'bg-brand-500/20 border-brand-500 text-brand-300 ring-1 ring-brand-400'
                        : 'bg-slate-900/60 border-slate-700 text-slate-400'
                    }`}
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>Thực Khách (Ăn chung)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('restaurant')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      regRole === 'restaurant'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-400'
                        : 'bg-slate-900/60 border-slate-700 text-slate-400'
                    }`}
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>Chủ Quán / Nhà Hàng</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Họ và tên của bạn *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Hoàng Minh Trí"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Email đăng ký *</label>
                    <input
                      type="email"
                      required
                      placeholder="minhtri@email.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Số điện thoại</label>
                    <input
                      type="tel"
                      placeholder="0912 345 678"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Mật khẩu *</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Xác nhận mật khẩu *</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                {/* Notice on 80% completion */}
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200 leading-relaxed flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Quy định Chạm Đũa:</strong> Sau khi đăng ký, bạn cần hoàn thiện tối thiểu <strong>80% hồ sơ</strong> (chọn sở thích ẩm thực, thông tin cá nhân) để mở khóa quyền ghép bàn ăn.
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Đăng Ký & Tiếp Tục Hoàn Thiện Hồ Sơ (80%)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 Chạm Đũa Platform. Chạm đũa kết thân • Ăn ngon chia sẻ.</span>
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
                  handleQuickLogin(allUsers[0]);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-brand-500/20"
              >
                <span>Vào Chạm Đũa tại quán này</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* 80% PROFILE COMPLETION MODAL */}
      {onboardingUser && (
        <ProfileCompletionModal
          user={onboardingUser}
          onComplete={(completedUser) => {
            setOnboardingUser(null);
            onLoginSuccess(completedUser);
          }}
        />
      )}

    </div>
  );
};
