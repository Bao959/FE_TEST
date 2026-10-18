import React, { useState, useEffect } from 'react';
import {
  Store,
  Bell,
  LogOut,
  RefreshCw,
  Sparkles,
  ChevronDown,
  Calendar,
  UtensilsCrossed,
  Tag,
  TrendingUp,
  Users,
  ShieldCheck,
  Utensils,
  ShieldAlert,
  DollarSign,
  Server
} from 'lucide-react';
import { User, AppNotification } from '../../types';
import { storageService } from '../../services/storageService';
import { apiClient } from '../../services/api/client';
import { BackendStatusModal } from '../common/BackendStatusModal';

export type AdminTab =
  | 'admin_overview'
  | 'admin_restaurants'
  | 'admin_sessions'
  | 'admin_users'
  | 'admin_moderation'
  | 'admin_vouchers'
  | 'admin_finance';
export type RestaurantTab = 'restaurant_reservations' | 'restaurant_menu' | 'restaurant_vouchers' | 'restaurant_stats';
export type PortalTab = AdminTab | RestaurantTab;

interface NavbarProps {
  currentUser: User;
  activeTab: PortalTab;
  setActiveTab: (tab: PortalTab) => void;
  notifications: AppNotification[];
  onOpenSession?: (sessionId: string) => void;
  onLogout: () => void;
  onUserChanged: (user: User) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  notifications,
  onOpenSession,
  onLogout,
  onUserChanged
}) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showBackendModal, setShowBackendModal] = useState(false);
  const [backendLatency, setBackendLatency] = useState<number | null>(null);
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;
    apiClient.checkHealth().then((health) => {
      if (isMounted) {
        if (health) {
          setIsBackendHealthy(true);
          setBackendLatency(health.latencyMs);
        } else {
          setIsBackendHealthy(false);
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const allUsers = storageService.getUsers();
  const allRestaurants = storageService.getRestaurants();

  // Pending counts
  const pendingRestaurantsCount = allRestaurants.filter((r) => r.status === 'PENDING').length;
  const pendingReportsCount = storageService.getReports().filter((r) => r.status === 'PENDING').length;

  // Filter only Admin and Restaurant users for the quick switcher
  const portalUsers = allUsers.filter((u) => u.role === 'admin' || u.role === 'restaurant');
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleSwitchUser = (user: User) => {
    storageService.setCurrentUserId(user.id);
    onUserChanged(user);
    setShowUserDropdown(false);
    if (user.role === 'admin') {
      setActiveTab('admin_overview');
    } else {
      setActiveTab('restaurant_reservations');
    }
  };

  const handleResetData = () => {
    if (window.confirm('Bạn có chắc muốn làm mới toàn bộ dữ liệu mẫu về trạng thái ban đầu?')) {
      storageService.resetAllData();
    }
  };

  const isAdmin = currentUser.role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* LEFT: BRANDING & ROLE PILL */}
          <div
            className="flex items-center gap-3 cursor-pointer group select-none flex-shrink-0"
            onClick={() => {
              if (isAdmin) setActiveTab('admin_overview');
              else setActiveTab('restaurant_reservations');
            }}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-brand-500/25 group-hover:scale-105 transition-transform text-xl">
              🥢
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1">
                  Chạm<span className="text-brand-600">Đũa</span>
                </span>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs ${
                  isAdmin
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {isAdmin ? '👑 ADMIN' : '🏪 QUÁN ĂN'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium -mt-0.5">
                {isAdmin ? 'Trung Tâm Điều Hành Hệ Thống' : 'Kênh Vận Hành Đối Tác'}
              </p>
            </div>
          </div>

          {/* CENTER: CLEAN UNIFIED NAVIGATION TABS */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/80">
            {isAdmin ? (
              <>
                <button
                  onClick={() => setActiveTab('admin_overview')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    activeTab === 'admin_overview'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Tổng Quan</span>
                </button>

                <button
                  onClick={() => setActiveTab('admin_restaurants')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    activeTab === 'admin_restaurants'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Quán Ăn</span>
                  {pendingRestaurantsCount > 0 && (
                    <span className="px-1.5 py-0.2 text-[9px] bg-amber-500 text-slate-950 font-black rounded-full animate-pulse">
                      {pendingRestaurantsCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('admin_sessions')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    activeTab === 'admin_sessions'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Utensils className="w-3.5 h-3.5" />
                  <span>Bàn Ghép</span>
                </button>

                <button
                  onClick={() => setActiveTab('admin_users')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    activeTab === 'admin_users'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Thành Viên</span>
                </button>

                <button
                  onClick={() => setActiveTab('admin_moderation')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    activeTab === 'admin_moderation'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-rose-600 hover:bg-white/60'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Khiếu Nại</span>
                  {pendingReportsCount > 0 && (
                    <span className="px-1.5 py-0.2 text-[9px] bg-rose-500 text-white font-black rounded-full animate-bounce">
                      {pendingReportsCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('admin_vouchers')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    activeTab === 'admin_vouchers'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Voucher Sàn</span>
                </button>

                <button
                  onClick={() => setActiveTab('admin_finance')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    activeTab === 'admin_finance'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-emerald-700 hover:bg-white/60'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Tài Chính</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('restaurant_reservations')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    activeTab === 'restaurant_reservations'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Đơn Đặt Bàn</span>
                </button>

                <button
                  onClick={() => setActiveTab('restaurant_menu')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    activeTab === 'restaurant_menu'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  <span>Thực Đơn</span>
                </button>

                <button
                  onClick={() => setActiveTab('restaurant_vouchers')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    activeTab === 'restaurant_vouchers'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Voucher</span>
                </button>

                <button
                  onClick={() => setActiveTab('restaurant_stats')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    activeTab === 'restaurant_stats'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Thống Kê</span>
                </button>
              </>
            )}
          </nav>

          {/* RIGHT: COMPACT USER PILL, NOTIFICATIONS & CONTROLS */}
          <div className="flex items-center gap-2">
            
            {/* Quick Demo Persona Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 shadow-xs text-left transition-all"
                title="Đổi vai trò trải nghiệm"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-amber-400 ring-2 ring-amber-100"
                />
                <div className="hidden xl:block text-xs">
                  <div className="font-black text-slate-800 line-clamp-1 max-w-[140px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-500 -mt-0.5">
                    {currentUser.role === 'admin' ? 'Quản Trị Viên' : 'Chủ Quán Ăn'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Persona Dropdown */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 py-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Chuyển Vai Trò Test:</span>
                    <span className="text-[10px] text-brand-600 font-bold">{portalUsers.length} tài khoản</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                    {portalUsers.map((u) => (
                      <div
                        key={u.id}
                        onClick={() => handleSwitchUser(u)}
                        className={`px-3.5 py-2.5 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors ${
                          u.id === currentUser.id ? 'bg-amber-50/50 font-bold' : ''
                        }`}
                      >
                        <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-slate-800 truncate flex items-center justify-between">
                            <span>{u.name}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${
                              u.role === 'admin'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-emerald-100 text-emerald-900'
                            }`}>
                              {u.role === 'admin' ? 'Admin' : 'Quán'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 truncate">{u.bio}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                title="Thông báo"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 pb-2.5 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-black text-sm text-slate-900">Thông báo ({notifications.length})</span>
                    <span className="text-xs text-brand-600 font-bold">{unreadCount} chưa đọc</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">Không có thông báo mới</div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            storageService.markNotificationAsRead(notif.id);
                            if (notif.sessionId && onOpenSession) {
                              onOpenSession(notif.sessionId);
                            }
                            setShowNotifs(false);
                          }}
                          className={`p-3.5 text-xs hover:bg-slate-50 cursor-pointer transition-colors ${
                            !notif.isRead ? 'bg-amber-50/40' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-slate-900">{notif.title}</span>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap">{notif.createdAt}</span>
                          </div>
                          <p className="text-slate-600 mt-1 leading-relaxed text-[11px]">{notif.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Live AWS Backend Status Pill */}
            <button
              onClick={() => setShowBackendModal(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs ${
                isBackendHealthy
                  ? 'border-emerald-200 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800'
                  : isBackendHealthy === false
                  ? 'border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
              }`}
              title="Xem trạng thái kết nối AWS Backend Swagger"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isBackendHealthy
                    ? 'bg-emerald-500 animate-pulse'
                    : isBackendHealthy === false
                    ? 'bg-rose-500'
                    : 'bg-amber-400 animate-ping'
                }`}
              />
              <span className="font-mono text-[11px]">AWS ALB</span>
              {backendLatency !== null && (
                <span className="text-[10px] opacity-75 font-mono hidden sm:inline">
                  {backendLatency}ms
                </span>
              )}
            </button>

            {/* Reset Data Button */}
            <button
              onClick={handleResetData}
              className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              title="Khôi phục Mock Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Exit/Logout Button */}
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>

          </div>
        </div>
      </div>

      {/* MOBILE SCROLLABLE TAB BAR */}
      <div className="lg:hidden flex items-center gap-1 border-t border-slate-100 bg-white py-2 px-3 text-[11px] font-bold text-slate-600 overflow-x-auto">
        {isAdmin ? (
          <>
            <button
              onClick={() => setActiveTab('admin_overview')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
                activeTab === 'admin_overview' ? 'bg-slate-900 text-white' : 'bg-slate-100'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Tổng Quan</span>
            </button>
            <button
              onClick={() => setActiveTab('admin_restaurants')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
                activeTab === 'admin_restaurants' ? 'bg-slate-900 text-white' : 'bg-slate-100'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Quán Ăn</span>
              {pendingRestaurantsCount > 0 && (
                <span className="px-1 text-[9px] bg-amber-500 text-slate-950 rounded-full font-black">
                  {pendingRestaurantsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('admin_sessions')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
                activeTab === 'admin_sessions' ? 'bg-slate-900 text-white' : 'bg-slate-100'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Bàn Ghép</span>
            </button>
            <button
              onClick={() => setActiveTab('admin_users')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
                activeTab === 'admin_users' ? 'bg-slate-900 text-white' : 'bg-slate-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Thành Viên</span>
            </button>
            <button
              onClick={() => setActiveTab('admin_moderation')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
                activeTab === 'admin_moderation' ? 'bg-rose-600 text-white' : 'bg-slate-100'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Khiếu Nại</span>
              {pendingReportsCount > 0 && (
                <span className="px-1 text-[9px] bg-rose-500 text-white rounded-full font-black">
                  {pendingReportsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('admin_vouchers')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
                activeTab === 'admin_vouchers' ? 'bg-slate-900 text-white' : 'bg-slate-100'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Voucher</span>
            </button>
            <button
              onClick={() => setActiveTab('admin_finance')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
                activeTab === 'admin_finance' ? 'bg-emerald-600 text-white' : 'bg-slate-100'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Tài Chính</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTab('restaurant_reservations')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
                activeTab === 'restaurant_reservations' ? 'bg-emerald-600 text-white' : 'bg-slate-100'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Đặt Bàn</span>
            </button>
            <button
              onClick={() => setActiveTab('restaurant_menu')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
                activeTab === 'restaurant_menu' ? 'bg-emerald-600 text-white' : 'bg-slate-100'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Thực Đơn</span>
            </button>
            <button
              onClick={() => setActiveTab('restaurant_vouchers')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
                activeTab === 'restaurant_vouchers' ? 'bg-emerald-600 text-white' : 'bg-slate-100'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Voucher</span>
            </button>
            <button
              onClick={() => setActiveTab('restaurant_stats')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
                activeTab === 'restaurant_stats' ? 'bg-emerald-600 text-white' : 'bg-slate-100'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Thống Kê</span>
            </button>
          </>
        )}
      </div>

      {/* Backend API Tester & Status Modal */}
      <BackendStatusModal isOpen={showBackendModal} onClose={() => setShowBackendModal(false)} />
    </header>
  );
};
