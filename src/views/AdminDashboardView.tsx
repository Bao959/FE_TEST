import React, { useState } from 'react';
import {
  Store,
  Users,
  UtensilsCrossed,
  Tag,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Star,
  DollarSign,
  TrendingUp,
  Search,
  Filter,
  Eye,
  Lock,
  Unlock,
  Trash2,
  Building,
  Sparkles,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react';
import { Restaurant, User, GroupVoucher, DiningSession } from '../types';
import { storageService } from '../services/storageService';
import { formatCurrency } from '../utils/geo';

interface AdminDashboardViewProps {
  currentUser: User;
  activeSection?: 'overview' | 'restaurants' | 'users' | 'vouchers';
  onSectionChange?: (sec: 'overview' | 'restaurants' | 'users' | 'vouchers') => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  currentUser,
  activeSection,
  onSectionChange
}) => {
  const [internalTab, setInternalTab] = useState<'overview' | 'restaurants' | 'users' | 'vouchers'>('overview');
  const activeTab = activeSection || internalTab;

  const setActiveTab = (tab: 'overview' | 'restaurants' | 'users' | 'vouchers') => {
    setInternalTab(tab);
    if (onSectionChange) onSectionChange(tab);
  };

  const [restaurants, setRestaurants] = useState<Restaurant[]>(() => storageService.getRestaurants());
  const [users, setUsers] = useState<User[]>(() => storageService.getUsers());
  const [sessions, setSessions] = useState<DiningSession[]>(() => storageService.getSessions());

  // Restaurant filter
  const [restStatusFilter, setRestStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'LOCKED'>('ALL');
  const [restSearchQuery, setRestSearchQuery] = useState('');

  // Add Restaurant Modal
  const [isAddRestModalOpen, setIsAddRestModalOpen] = useState(false);
  const [newRestName, setNewRestName] = useState('');
  const [newRestCategory, setNewRestCategory] = useState('Lẩu & Nướng Than Hoa');
  const [newRestAddress, setNewRestAddress] = useState('');
  const [newRestPhone, setNewRestPhone] = useState('');
  const [newRestPriceRange, setNewRestPriceRange] = useState('150.000đ - 250.000đ/người');
  const [newRestOpenHours, setNewRestOpenHours] = useState('10:00 - 23:00');
  const [newRestImage, setNewRestImage] = useState('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80');

  // User search
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Calculate Metrics
  const totalRestaurants = restaurants.length;
  const activeRestaurants = restaurants.filter((r) => r.status === 'ACTIVE' || (!r.status && r.isRegisteredOnSystem)).length;
  const pendingRestaurants = restaurants.filter((r) => r.status === 'PENDING').length;
  const totalCompletedSessions = sessions.filter((s) => s.status === 'COMPLETED').length;
  const totalRevenue = totalCompletedSessions * 850000 + 45200000;

  // Actions
  const handleApproveRestaurant = (restId: string) => {
    storageService.updateRestaurantStatus(restId, 'ACTIVE');
    setRestaurants(storageService.getRestaurants());
    alert('Đã phê duyệt thành công nhà hàng đối tác chính thức của Chạm Đũa!');
  };

  const handleToggleLockRestaurant = (rest: Restaurant) => {
    const newStatus = rest.status === 'LOCKED' ? 'ACTIVE' : 'LOCKED';
    storageService.updateRestaurantStatus(rest.id, newStatus);
    setRestaurants(storageService.getRestaurants());
  };

  const handleDeleteRestaurant = (restId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa nhà hàng này khỏi hệ sinh thái Chạm Đũa?')) {
      storageService.deleteRestaurant(restId);
      setRestaurants(storageService.getRestaurants());
    }
  };

  const handleAdjustTrust = (user: User, delta: number) => {
    const newScore = Math.max(1.0, Math.min(5.0, user.trustScore + delta));
    storageService.updateUserTrustScore(user.id, newScore);
    setUsers(storageService.getUsers());
  };

  const handleCreateRestaurant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRestName.trim()) return;

    const added = storageService.addRestaurant({
      name: newRestName.trim(),
      category: newRestCategory,
      address: newRestAddress.trim() || 'Quận 1, TP. Hồ Chí Minh',
      phone: newRestPhone.trim() || '028 3822 9999',
      priceRange: newRestPriceRange,
      openHours: newRestOpenHours,
      coverImage: newRestImage,
      isRegisteredOnSystem: true,
      status: 'ACTIVE'
    });

    setRestaurants(storageService.getRestaurants());
    setIsAddRestModalOpen(false);
    setNewRestName('');
    alert(`Đã thêm nhà hàng "${added.name}" thành công vào danh sách đối tác!`);
  };

  // Filtered restaurants
  const filteredRestaurants = restaurants.filter((r) => {
    const matchQuery = r.name.toLowerCase().includes(restSearchQuery.toLowerCase()) ||
                       r.category.toLowerCase().includes(restSearchQuery.toLowerCase());
    const rStatus = r.status || (r.isRegisteredOnSystem ? 'ACTIVE' : 'PENDING');
    const matchStatus = restStatusFilter === 'ALL' || rStatus === restStatusFilter;
    return matchQuery && matchStatus;
  });

  // Filtered users
  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* ADMIN HERO HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-indigo-900/50 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-500 to-amber-500 flex items-center justify-center text-white text-2xl shadow-lg shadow-brand-500/30">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Trung Tâm Quản Trị Hệ Thống Chạm Đũa
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold uppercase tracking-wide">
                  Super Admin
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Giám sát toàn bộ hoạt động đối tác nhà hàng, phê duyệt quán mới và kiểm soát chất lượng bàn ăn ghép
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto">
            <button
              onClick={() => setIsAddRestModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-brand-500/20 transition-all transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Đối Tác Nhà Hàng Mới</span>
            </button>
          </div>
        </div>

        {/* 4 CORE KPI METRICS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Đối Tác Nhà Hàng</span>
              <Store className="w-4 h-4 text-brand-400" />
            </div>
            <div className="text-2xl font-black text-white">{totalRestaurants}</div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <span>{activeRestaurants} đang hoạt động</span>
              {pendingRestaurants > 0 && (
                <span className="text-amber-400">• {pendingRestaurants} chờ duyệt</span>
              )}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Bàn Ghép Thành Công</span>
              <UtensilsCrossed className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white">{totalCompletedSessions + 86}</div>
            <div className="text-[11px] text-amber-300 font-semibold mt-1">
              +18% so với tuần trước
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Tổng Doanh Số Đặt Bàn</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white">{formatCurrency(totalRevenue)}</div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-1">
              Doanh thu hệ sinh thái F&B
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Cộng Đồng Thành Viên</span>
              <Users className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-black text-white">{users.length + 1240}</div>
            <div className="text-[11px] text-sky-300 font-semibold mt-1">
              ★ 4.9/5.0 Điểm uy tín TB
            </div>
          </div>
        </div>
      </div>

      {/* ADMIN TABS NAVIGATION */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Tổng Quan Hệ Thống</span>
          </button>

          <button
            onClick={() => setActiveTab('restaurants')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'restaurants'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Quản Lý Nhà Hàng ({restaurants.length})</span>
            {pendingRestaurants > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-black animate-pulse">
                {pendingRestaurants} mới
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Thành Viên & Điểm Uy Tín ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('vouchers')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'vouchers'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Voucher Toàn Sàn</span>
          </button>
        </div>
      </div>

      {/* TAB 0: OVERVIEW & SYSTEM HEALTH */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Notice Alert if pending restaurants */}
          {pendingRestaurants > 0 && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
                <span className="text-xs text-amber-900 font-bold">
                  Hiện có {pendingRestaurants} đối tác nhà hàng mới vừa nộp đơn đăng ký chờ Ban Quản Trị phê duyệt.
                </span>
              </div>
              <button
                onClick={() => setActiveTab('restaurants')}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-xs whitespace-nowrap"
              >
                Xem và Duyệt Ngay &rarr;
              </button>
            </div>
          )}

          {/* System Charts & Category Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand-600" />
                  <span>Cơ Cấu Nhu Cầu Ẩm Thực Của Thực Khách</span>
                </h3>
                <span className="text-[11px] text-slate-400">Dữ liệu thời gian thực</span>
              </div>
              <div className="space-y-3.5 pt-2 text-xs">
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>Lẩu & Nướng Than Hoa</span>
                    <span className="text-brand-600 font-bold">48% lượt ghép</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-brand-500 h-2.5 rounded-full" style={{ width: '48%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>Hải Sản & Ốc Sài Gòn</span>
                    <span className="text-brand-600 font-bold">26% lượt ghép</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '26%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>Ẩm Thực Hàn Quốc & Nhật Bản</span>
                    <span className="text-brand-600 font-bold">16% lượt ghép</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-sky-500 h-2.5 rounded-full" style={{ width: '16%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>Cơm & Món Việt Truyền Thống</span>
                    <span className="text-brand-600 font-bold">10% lượt ghép</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '10%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Trạng Thái Vận Hành Hệ Sinh Thái Chạm Đũa</span>
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  Hoạt động bình thường
                </span>
              </div>
              <div className="space-y-3 pt-2 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800">Tỷ lệ xác thực tài khoản thực khách</span>
                    <p className="text-[11px] text-slate-500">Đã hoàn thiện hồ sơ trên 80%</p>
                  </div>
                  <span className="text-sm font-black text-emerald-600">92.8%</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800">Thời gian phản hồi đơn đặt bàn trung bình</span>
                    <p className="text-[11px] text-slate-500">Từ lúc khách chốt bàn đến khi quán nhận</p>
                  </div>
                  <span className="text-sm font-black text-brand-600">3.4 phút</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800">Chỉ số an toàn & văn minh bàn ăn</span>
                    <p className="text-[11px] text-slate-500">Không có báo cáo vi phạm tiêu cực</p>
                  </div>
                  <span className="text-sm font-black text-emerald-600">99.6%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: RESTAURANTS MANAGEMENT */}
      {activeTab === 'restaurants' && (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm nhà hàng theo tên, thể loại..."
                value={restSearchQuery}
                onChange={(e) => setRestSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              {(['ALL', 'ACTIVE', 'PENDING', 'LOCKED'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setRestStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    restStatusFilter === status
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {status === 'ALL' && 'Tất cả'}
                  {status === 'ACTIVE' && 'Đang hoạt động'}
                  {status === 'PENDING' && `Chờ duyệt (${pendingRestaurants})`}
                  {status === 'LOCKED' && 'Đã khóa'}
                </button>
              ))}
            </div>
          </div>

          {/* Restaurants Grid / List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRestaurants.map((rest) => {
              const status = rest.status || (rest.isRegisteredOnSystem ? 'ACTIVE' : 'PENDING');
              const isLocked = status === 'LOCKED';
              const isPending = status === 'PENDING';

              return (
                <div
                  key={rest.id}
                  className={`bg-white rounded-2xl border overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col ${
                    isPending
                      ? 'border-amber-300 ring-2 ring-amber-200/50'
                      : isLocked
                      ? 'border-rose-200 opacity-75'
                      : 'border-slate-200'
                  }`}
                >
                  {/* Card Cover */}
                  <div className="h-36 relative">
                    <img
                      src={rest.coverImage}
                      alt={rest.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Status Pill */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-white shadow-xs ${
                        isPending
                          ? 'bg-amber-500 animate-pulse'
                          : isLocked
                          ? 'bg-rose-600'
                          : 'bg-emerald-600'
                      }`}>
                        {isPending && '⚡ Chờ Duyệt'}
                        {isLocked && '🔒 Đã Khóa'}
                        {!isPending && !isLocked && '✓ Hoạt Động'}
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 left-3 right-3 text-white">
                      <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wide">
                        {rest.category}
                      </span>
                      <h3 className="text-sm font-black truncate">{rest.name}</h3>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
                        <span className="truncate">{rest.address}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                        <span>Hotline: <strong>{rest.phone}</strong></span>
                        <span className="flex items-center gap-1 text-amber-600 font-bold">
                          ★ {rest.rating} ({rest.reviewCount})
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      {isPending ? (
                        <button
                          onClick={() => handleApproveRestaurant(rest.id)}
                          className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Duyệt Đối Tác Ngay</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleLockRestaurant(rest)}
                          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-colors ${
                            isLocked
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'
                          }`}
                        >
                          {isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          <span>{isLocked ? 'Mở Khóa Quán' : 'Tạm Khóa'}</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteRestaurant(rest.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Xóa nhà hàng"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* TAB 2: USERS & COMMUNITY TRUST */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Kiểm Soát Người Dùng & Điểm Uy Tín
              </h3>
              <p className="text-xs text-slate-500">
                Điều chỉnh điểm uy tín cộng đồng Chạm Đũa và xem thông tin xác minh Email/SĐT
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm thành viên..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-bold">
                  <th className="py-3 px-4">Thành Viên</th>
                  <th className="py-3 px-4">Vai Trò</th>
                  <th className="py-3 px-4">Định Danh</th>
                  <th className="py-3 px-4 text-center">Bữa Ăn Đã Đi</th>
                  <th className="py-3 px-4 text-center">Điểm Uy Tín</th>
                  <th className="py-3 px-4 text-right">Điều Chỉnh Uy Tín</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{u.name}</div>
                          <div className="text-[11px] text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : u.role === 'restaurant'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role === 'admin' ? 'Quản Trị Viên' : u.role === 'restaurant' ? 'Nhà Hàng' : 'Thực Khách'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {u.isPhoneVerified && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            ✓ SĐT
                          </span>
                        )}
                        {u.isEmailVerified && (
                          <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 text-[10px] font-bold">
                            ✓ Email
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center font-bold text-slate-800">
                      {u.totalMealsJoined} bữa
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                        ★ {u.trustScore}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleAdjustTrust(u, 0.2)}
                          className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px]"
                          title="Cộng điểm uy tín"
                        >
                          +0.2 ★
                        </button>
                        <button
                          onClick={() => handleAdjustTrust(u, -0.2)}
                          className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px]"
                          title="Trừ điểm uy tín"
                        >
                          -0.2 ★
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: VOUCHERS MANAGEMENT */}
      {activeTab === 'vouchers' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Voucher Nhóm Toàn Sàn</h3>
              <p className="text-xs text-slate-500">Các chương trình ưu đãi độc quyền dành cho bàn ghép Chạm Đũa</p>
            </div>
            <span className="text-xs font-bold text-brand-600">
              Đang áp dụng trên tất cả quán đối tác
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {storageService.getVouchers().map((v) => (
              <div key={v.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-brand-100 text-brand-800 text-[10px] font-extrabold tracking-wider">
                    {v.code}
                  </span>
                  <span className="text-xs font-black text-rose-600">{v.discountValue}</span>
                </div>
                <h4 className="font-bold text-xs text-slate-900">{v.title}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-2">{v.description}</p>
                <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200 flex justify-between">
                  <span>Tối thiểu: {v.minGroupSize} người</span>
                  <span>HSD: {v.expiryDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL THÊM NHÀ HÀNG ĐỐI TÁC */}
      {isAddRestModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-brand-600 to-amber-500 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5" />
                <h3 className="font-black text-base">Thêm Đối Tác Nhà Hàng Mới</h3>
              </div>
              <button
                onClick={() => setIsAddRestModalOpen(false)}
                className="text-white hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRestaurant} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên nhà hàng / quán ăn *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Lẩu Nướng Than Hoa Sài Gòn"
                  value={newRestName}
                  onChange={(e) => setNewRestName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Thể loại ẩm thực</label>
                  <select
                    value={newRestCategory}
                    onChange={(e) => setNewRestCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-brand-500 bg-white"
                  >
                    <option value="Lẩu & Nướng Than Hoa">Lẩu & Nướng Than Hoa</option>
                    <option value="Lẩu Trung Hoa">Lẩu Trung Hoa</option>
                    <option value="Nướng BBQ Hàn Quốc">Nướng BBQ Hàn Quốc</option>
                    <option value="Ốc & Hải Sản Sài Gòn">Ốc & Hải Sản Sài Gòn</option>
                    <option value="Ẩm Thực Nhật Bản">Ẩm Thực Nhật Bản</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại / Hotline</label>
                  <input
                    type="tel"
                    placeholder="028 3822 5566"
                    value={newRestPhone}
                    onChange={(e) => setNewRestPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Địa chỉ chi tiết</label>
                <input
                  type="text"
                  placeholder="Số 123 Nguyễn Huệ, Phường Bến Nghé, Quận 1"
                  value={newRestAddress}
                  onChange={(e) => setNewRestAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Khung giá trung bình</label>
                  <input
                    type="text"
                    value={newRestPriceRange}
                    onChange={(e) => setNewRestPriceRange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Giờ mở cửa</label>
                  <input
                    type="text"
                    value={newRestOpenHours}
                    onChange={(e) => setNewRestOpenHours(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddRestModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs shadow-md transition-all"
                >
                  Xác Nhận Thêm Đối Tác
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
