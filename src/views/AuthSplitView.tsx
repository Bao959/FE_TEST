import React, { useState, useEffect } from 'react';
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
  CheckCircle2,
  Server,
  RefreshCw
} from 'lucide-react';
import { User, Restaurant } from '../types';
import { storageService } from '../services/storageService';
import { InteractiveMap } from '../components/common/InteractiveMap';
import { calculateDistanceKm, formatDistance } from '../utils/geo';
import { SocialLoginModal } from '../components/auth/SocialLoginModal';
import { authApi } from '../services/api/authApi';
import { apiClient, API_BASE_URL } from '../services/api/client';

interface AuthSplitViewProps {
  onLoginSuccess: (user: User) => void;
}

export const AuthSplitView: React.FC<AuthSplitViewProps> = ({ onLoginSuccess }) => {
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [socialProvider, setSocialProvider] = useState<'google' | 'facebook' | null>(null);
  
  // Login states
  const [loginEmail, setLoginEmail] = useState('admin@chamdua.vn');
  const [loginPassword, setLoginPassword] = useState('123456');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiNotice, setApiNotice] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<{ isHealthy: boolean; latencyMs: number } | null>(null);

  // Check live AWS ALB health on mount
  useEffect(() => {
    let mounted = true;
    apiClient.checkHealth().then((health) => {
      if (mounted && health) {
        setBackendStatus({ isHealthy: true, latencyMs: health.latencyMs });
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Restaurant Partner Registration states
  const [regRestName, setRegRestName] = useState('');
  const [regManagerName, setRegManagerName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCategory, setRegCategory] = useState('Lẩu & Nướng Than Hoa');
  const [regAddress, setRegAddress] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  const allUsers = storageService.getUsers();
  const restaurants = storageService.getRestaurants();

  // Highlighted Admin & Partner demo accounts
  const demoAccounts = [
    allUsers.find((u) => u.id === 'user_admin') || {
      id: 'user_admin',
      name: 'Admin Tổng Chạm Đũa',
      email: 'admin@chamdua.vn',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'admin' as const,
      bio: 'Quản trị viên cấp cao hệ thống Chạm Đũa'
    },
    allUsers.find((u) => u.id === 'user_rest_1') || {
      id: 'user_rest_1',
      name: 'Quản Lý Haidilao Bitexco',
      email: 'manager@haidilao.vn',
      avatar: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=80',
      role: 'restaurant' as const,
      bio: 'Đối tác Lẩu Trung Hoa chính thức'
    },
    allUsers.find((u) => u.id === 'user_rest_2') || {
      id: 'user_rest_2',
      name: 'Bếp Trưởng Gogi House',
      email: 'gogi.saigon@redsun.vn',
      avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&auto=format&fit=crop&q=80',
      role: 'restaurant' as const,
      bio: 'Quán Nướng BBQ Hàn Quốc Nguyễn Huệ'
    },
    {
      id: 'user_rest_3_demo',
      name: 'Quán Ốc Đào Sài Gòn (Chờ duyệt)',
      email: 'ocdao.q1@foodie.vn',
      avatar: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=150&auto=format&fit=crop&q=80',
      role: 'restaurant' as const,
      bio: 'Quán mới đăng ký tham gia sàn'
    }
  ];

  // User simulated GPS (District 1, HCMC)
  const defaultLocation = {
    lat: 10.7769,
    lng: 106.7009,
    address: 'Bến Nghé, Quận 1, TP. Hồ Chí Minh'
  };

  const handleQuickLogin = (account: any) => {
    const existing = allUsers.find((u) => u.id === account.id || u.email === account.email);
    const chosen = existing || (account as User);
    storageService.setCurrentUserId(chosen.id);
    onLoginSuccess(chosen);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setApiNotice(null);

    try {
      // 1. Call live AWS ALB Auth API
      const apiRes = await authApi.loginEmail(loginEmail, loginPassword);
      if (apiRes.ok && apiRes.data?.accessToken) {
        // Successfully authenticated with AWS ALB
        const meRes = await authApi.getMe();
        if (meRes.ok && meRes.data) {
          const beUser = meRes.data;
          const matched = allUsers.find(u => u.email.toLowerCase() === loginEmail.toLowerCase());
          const chosenUser: User = matched || {
            id: `user_${beUser.id}`,
            name: beUser.name || loginEmail.split('@')[0],
            email: beUser.email || loginEmail,
            phone: beUser.phone || '',
            role: (beUser.role as any) || (loginEmail.includes('admin') ? 'admin' : 'restaurant'),
            avatar: beUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            bio: 'Tài khoản xác thực từ AWS Backend',
            foodPreferences: ['Lẩu & Nướng'],
            favoriteBudget: '150.000đ - 300.000đ/người',
            friends: [],
            trustScore: 5.0,
            totalMealsJoined: 1,
            isProfileCompleted: true,
            profileCompletionPercent: 100,
            hasCompletedOnboardingTour: true,
            location: {
              lat: 10.7769,
              lng: 106.7009,
              address: 'Bến Nghé, Quận 1, TP. Hồ Chí Minh'
            }
          };
          storageService.setCurrentUserId(chosenUser.id);
          onLoginSuccess(chosenUser);
          return;
        }
      }
    } catch (err: any) {
      console.warn('Backend login fallback:', err);
    } finally {
      setIsSubmitting(false);
    }

    // 2. Seamless Mock / Demo Fallback
    const matched = allUsers.find((u) => u.email.toLowerCase() === loginEmail.toLowerCase());
    const fallback = allUsers.find((u) => u.role === 'admin') || allUsers.find((u) => u.role === 'restaurant') || allUsers[0];
    const chosen = matched || fallback;
    storageService.setCurrentUserId(chosen.id);
    onLoginSuccess(chosen);
  };

  const handlePartnerRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regRestName.trim()) {
      alert('Vui lòng nhập tên nhà hàng / quán ăn.');
      return;
    }
    if (!regManagerName.trim()) {
      alert('Vui lòng nhập họ tên người đại diện.');
      return;
    }
    if (!regEmail.trim()) {
      alert('Vui lòng nhập email liên hệ.');
      return;
    }
    if (regPassword && regPassword !== regConfirmPassword) {
      alert('Mật khẩu và xác nhận mật khẩu không khớp!');
      return;
    }

    setIsSubmitting(true);
    // 1. Send registration payload to live AWS Backend API
    try {
      const pwd = regPassword || 'MatKhau@ChamDua2026';
      await authApi.registerEmail(regEmail.trim(), pwd, pwd);
    } catch (err) {
      console.warn('Backend register call logged:', err);
    } finally {
      setIsSubmitting(false);
    }

    // 2. Create Restaurant with PENDING status
    const newRest = storageService.addRestaurant({
      name: regRestName.trim(),
      category: regCategory,
      address: regAddress.trim() || 'Quận 1, TP. Hồ Chí Minh',
      phone: regPhone.trim() || '028 3888 9999',
      priceRange: '150.000đ - 300.000đ/người',
      openHours: '10:00 - 22:30',
      coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
      isRegisteredOnSystem: true,
      status: 'PENDING'
    });

    // 3. Create User account for this restaurant manager
    const newManager = storageService.createUser({
      name: regManagerName.trim(),
      email: regEmail.trim(),
      phone: regPhone.trim(),
      role: 'restaurant',
      restaurantId: newRest.id,
      bio: `Đại diện nhà hàng ${newRest.name}`,
      foodPreferences: [regCategory],
      favoriteBudget: '150.000đ - 300.000đ/người',
      isProfileCompleted: true,
      profileCompletionPercent: 100,
      hasCompletedOnboardingTour: true
    });

    storageService.setCurrentUserId(newManager.id);
    alert(`🎉 Chúc mừng bạn đã đăng ký đối tác "${newRest.name}" thành công!\n\nHồ sơ đang ở trạng thái 'Chờ Ban Quản Trị Phê Duyệt'. Bạn có thể bắt đầu cài đặt thực đơn và voucher đón khách ngay bây giờ.`);
    onLoginSuccess(newManager);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-900">
      
      {/* LEFT COLUMN: AUTH & VALUE PROPOSITIONS (50%) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-12 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white overflow-y-auto">
        <div>
          {/* Brand Header - Chạm Đũa Portal */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/30 text-2xl">
              🥢
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
                  Chạm<span className="text-brand-500">Đũa</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30 text-[10px] font-extrabold uppercase tracking-wider">
                  B2B Portal
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight flex items-center gap-1 border ${
                  backendStatus?.isHealthy
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${backendStatus?.isHealthy ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  AWS ALB {backendStatus?.latencyMs ? `(${backendStatus.latencyMs}ms)` : ''}
                </span>
              </div>
              <p className="text-xs text-amber-300 font-semibold">Cổng Quản Trị Hệ Thống & Đối Tác Nhà Hàng</p>
            </div>
          </div>

          {/* Value Proposition Pills for Admin & Restaurant */}
          <div className="mt-6 space-y-3">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Tối Ưu Công Suất Bàn, <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-brand-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                Gia Tăng Doanh Thu F&B Bền Vững
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed">
              Nền tảng vận hành tập trung dành riêng cho Ban Quản Trị Chạm Đũa và các Quán Ăn / Nhà Hàng Đối Tác. Tiếp nhận nhóm khách gom văn minh, quản lý bàn trống thời gian thực và quản trị hệ sinh thái ẩm thực thông minh.
            </p>

            {/* Core Values Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/70 border border-slate-700/60 text-xs text-slate-200">
                <Store className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>Tăng doanh thu bàn trống</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/70 border border-slate-700/60 text-xs text-slate-200">
                <Users className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                <span>Gom khách tự động</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/70 border border-slate-700/60 text-xs text-slate-200">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Báo cáo doanh số chi tiết</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/70 border border-slate-700/60 text-xs text-slate-200">
                <Tag className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                <span>Voucher kích cầu linh hoạt</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/70 border border-slate-700/60 text-xs text-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                <span>Kiểm duyệt & An toàn</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/70 border border-slate-700/60 text-xs text-slate-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                <span>Cộng đồng uy tín 5.0★</span>
              </div>
            </div>
          </div>

          {/* Quick Demo Personas (1-Click Login for Admin & Restaurant) */}
          <div className="mt-6 p-3.5 rounded-2xl bg-brand-950/40 border border-brand-800/50">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Trải nghiệm nhanh (1-Click Demo Portal)
              </span>
              <span className="text-[11px] text-slate-400">Chọn vai để vào:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => handleQuickLogin(acc)}
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-800/80 hover:bg-brand-600/30 hover:border-brand-500/50 border border-slate-700/50 text-left transition-all group"
                >
                  <img src={acc.avatar} alt={acc.name} className="w-8 h-8 rounded-full object-cover border border-slate-600" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white group-hover:text-brand-400 truncate flex items-center justify-between">
                      <span>{acc.name}</span>
                      <span className={`text-[9px] px-1 rounded font-extrabold ${
                        acc.role === 'admin'
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-emerald-600 text-white'
                      }`}>
                        {acc.role === 'admin' ? '👑 Admin' : '🏪 Quán'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{acc.bio}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* AUTH SECTION WITH TWO TABS: ĐĂNG NHẬP & ĐĂNG KÝ ĐỐI TÁC */}
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
                <span>Đăng Nhập Quản Trị / Đối Tác</span>
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
                <Store className="w-3.5 h-3.5" />
                <span>Đăng Ký Đối Tác Quán Ăn Mới</span>
              </button>
            </div>

            {/* TAB 1: LOGIN FORM */}
            {authTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email quản trị hoặc nhà hàng</label>
                  <input
                    type="email"
                    required
                    placeholder="admin@chamdua.vn hoặc manager@haidilao.vn"
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
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 disabled:opacity-70 text-white font-bold text-sm shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-95 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang xác thực với AWS ALB...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Đăng Nhập Cổng Quản Trị / Đối Tác</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB 2: PARTNER REGISTRATION FORM */}
            {authTab === 'register' && (
              <form onSubmit={handlePartnerRegisterSubmit} className="space-y-3.5">
                
                <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/30 text-[11px] text-amber-200 leading-relaxed flex items-start gap-2">
                  <Store className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Hợp tác cùng Chạm Đũa:</strong> Đăng ký gian hàng nhà hàng của bạn để đón hàng ngàn nhóm khách gom mỗi ngày và lấp đầy bàn ăn vào các khung giờ vàng.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Tên nhà hàng / quán ăn *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Lẩu Nấm Ashima Sài Gòn"
                    value={regRestName}
                    onChange={(e) => setRegRestName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Người đại diện / quản lý *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Nguyễn Văn Hùng"
                      value={regManagerName}
                      onChange={(e) => setRegManagerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Thể loại món ăn</label>
                    <select
                      value={regCategory}
                      onChange={(e) => setRegCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-500 font-medium"
                    >
                      <option value="Lẩu & Nướng Than Hoa">Lẩu & Nướng Than Hoa</option>
                      <option value="Lẩu Trung Hoa & Hồng Kông">Lẩu Trung Hoa & Hồng Kông</option>
                      <option value="Ốc & Hải Sản Sài Gòn">Ốc & Hải Sản Sài Gòn</option>
                      <option value="Món Nướng BBQ Hàn Quốc">Món Nướng BBQ Hàn Quốc</option>
                      <option value="Ẩm Thực Nhật Bản (Sushi, Ramen)">Ẩm Thực Nhật Bản (Sushi, Ramen)</option>
                      <option value="Cơm & Đặc Sản Việt Nam">Cơm & Đặc Sản Việt Nam</option>
                      <option value="Quán Nhậu Lai Rai & Bia Craft">Quán Nhậu Lai Rai & Bia Craft</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Email quản lý *</label>
                    <input
                      type="email"
                      required
                      placeholder="partner@ashima.vn"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Hotline / SĐT quán *</label>
                    <input
                      type="tel"
                      required
                      placeholder="028 3822 8899"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Địa chỉ quán kinh doanh *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: 35 Tú Xương, Phường Võ Thị Sáu, Quận 3, TP.HCM"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-brand-500"
                  />
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

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 disabled:opacity-70 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-95"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang đồng bộ hồ sơ lên AWS ALB...</span>
                    </>
                  ) : (
                    <>
                      <Store className="w-4 h-4" />
                      <span>Đăng Ký Đối Tác & Vào Trang Quản Trị Quán</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* SOCIAL LOGIN UI: GOOGLE & FACEBOOK */}
            <div className="mt-5 pt-4 border-t border-slate-700/60">
              <div className="relative flex items-center justify-center mb-3">
                <span className="px-2 bg-slate-800 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                  Hoặc tiếp tục nhanh với
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* GOOGLE BUTTON */}
                <button
                  type="button"
                  onClick={() => setSocialProvider('google')}
                  className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs shadow-sm flex items-center justify-center gap-2.5 transition-all transform active:scale-95 border border-slate-200 group"
                >
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.14C3.25 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.59H1.26C.46 8.19 0 9.99 0 12s.46 3.81 1.26 5.41l4.02-3.14z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.26 6.59l4.02 3.14c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span className="group-hover:text-slate-950">Tiếp tục với Google</span>
                </button>

                {/* FACEBOOK BUTTON */}
                <button
                  type="button"
                  onClick={() => setSocialProvider('facebook')}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2.5 transition-all transform active:scale-95 group"
                >
                  <svg className="w-4 h-4 fill-white flex-shrink-0" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Tiếp tục với Facebook</span>
                </button>
              </div>
            </div>

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

      {/* SOCIAL LOGIN MODAL (GOOGLE / FACEBOOK) */}
      {socialProvider && (
        <SocialLoginModal
          provider={socialProvider}
          isOpen={!!socialProvider}
          onClose={() => setSocialProvider(null)}
          onSuccess={(loggedInUser) => {
            setSocialProvider(null);
            onLoginSuccess(loggedInUser);
          }}
        />
      )}

    </div>
  );
};
