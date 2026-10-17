import React, { useState } from 'react';
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
  DollarSign
} from 'lucide-react';
import { User, AppNotification } from '../../types';
import { storageService } from '../../services/storageService';

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
  const allUsers = storageService.getUsers();
  const allRestaurants = storageService.getRestaurants();

  // Pending restaurants & reports count for Admin badge
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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Portal Branding */}
          <div
            className="flex items-center gap-3 cursor-pointer group select-none"
            onClick={() => {
              if (isAdmin) setActiveTab('admin_overview');
              else setActiveTab('restaurant_reservations');
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform text-xl">
              🥢
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1">
                  Chạm<span className="text-brand-600">Đũa</span>
                </span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isAdmin
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}>
                  {isAdmin ? '👑 Admin' : '🏪 Đối Tác'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium -mt-0.5 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                {isAdmin ? 'Cổng Quản Trị Hệ Thống' : 'Kênh Vận Hành Nhà Hàng'}
              </p>
            </div>
          </div>

          {/* Navigation Links for Admin or Restaurant */}
          <nav className="hidden xl:flex items-center gap-1">
            {isAdmin ? (
              <>
                <button
                  onClick={() => setActiveTab('admin_overview')}
                  className={`flex items-center gap-1 px-2.5 py-2 rounded-xl font-semibold text-xs transition-all ${
                    activeTab === 'admin_overview'
                      ? 'bg-brand-50 text-brand-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Tổng Quan</span>
                </button>

                <button
                  onClick={() => setActiveTab('admin_restaurants')}
                  className={`flex items-center gap-1 px-2.5 py-2 rounded-xl font-semibold text-xs transition-all ${
                    activeTab === 'admin_restaurants'
                      ? 'bg-brand-50 text-brand-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Quán Ăn</span>
                  {pendingRestaurantsCount > 0 && (
                    <span className="px-1.5 py-0.2 text-[9px] bg-amber-500 text-white rounded-full font-bold animate-pulse">
                      {pendingRestaurantsCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('admin_sessions')}
                  className={`flex items-center gap-1 px-2.5 py-2 rounded-xl font-semibold text-xs transition-all ${
                    activeTab === 'admin_sessions'
                      ? 'bg-brand-50 text-brand-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Utensils className="w-3.5 h-3.5" />
                  <span>Bàn Ghép</span>
                </button>

                <button
                  onClick={() => setActiveTab('admin_users')}
                  className={`flex items-center gap-1 px-2.5 py-2 rounded-xl font-semibold text-xs transition-all ${
                    activeTab === 'admin_users'
                      ? 'bg-brand-50 text-brand-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Thành Viên</span>
                </button>

                <button
                  onClick={() => setActiveTab('admin_moderation')}
                  className={`flex items-center gap-1 px-2.5 py-2 rounded-xl font-semibold text-xs transition-all ${
                    activeTab === 'admin_moderation'
                      ? 'bg-rose-50 text-rose-600 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-rose-600 hover:bg-slate-100'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                  <span>Khiếu Nại</span>
                  {pendingReportsCount > 0 && (
                    <span className="px-1.5 py-0.2 text-[9px] bg-rose-500 text-white rounded-full font-bold animate-bounce">
                      {pendingReportsCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('admin_vouchers')}
                  className={`flex items-center gap-1 px-2.5 py-2 rounded-xl font-semibold text-xs transition-all ${
                    activeTab === 'admin_vouchers'
                      ? 'bg-brand-50 text-brand-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Voucher Sàn</span>
                </button>

                <button
                  onClick={() => setActiveTab('admin_finance')}
                  className={`flex items-center gap-1 px-2.5 py-2 rounded-xl font-semibold text-xs transition-all ${
                    activeTab === 'admin_finance'
                      ? 'bg-emerald-50 text-emerald-700 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-100'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tài Chính</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('restaurant_reservations')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-xs transition-all ${
                    activeTab === 'restaurant_reservations'
                      ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Đơn Đặt Bàn Nhóm</span>
                </button>

                <button
                  onClick={() => setActiveTab('restaurant_menu')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-xs transition-all ${
                    activeTab === 'restaurant_menu'
                      ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Quản Lý Thực Đơn</span>
                </button>

                <button
                  onClick={() => setActiveTab('restaurant_vouchers')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-xs transition-all ${
                    activeTab === 'restaurant_vouchers'
                      ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Voucher & Khuyến Mãi</span>
                </button>

                <button
                  onClick={() => setActiveTab('restaurant_stats')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-xs transition-all ${
                    activeTab === 'restaurant_stats'
                      ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Thống Kê & Doanh Thu</span>
                </button>
              </>
            )}
          </nav>

          {/* Right Actions: Persona Switcher, Notifications, Reset & Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick Demo Persona Switcher (Admin & Partner only) */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-colors"
                title="Đổi vai trò quản trị / đối tác"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-brand-300"
                />
                <div className="hidden lg:block text-xs">
                  <div className="font-bold text-slate-800 line-clamp-1 flex items-center gap-1">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {currentUser.role === 'admin' ? '👑 Quản Trị Viên' : '🏪 Đối Tác Quán'} • Đổi vai
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Persona Dropdown */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Chuyển vai trò B2B:</span>
                    <span className="text-[9px] text-brand-600">{portalUsers.length} tài khoản</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                    {portalUsers.map((u) => (
                      <div
                        key={u.id}
                        onClick={() => handleSwitchUser(u)}
                        className={`px-3 py-2.5 flex items-center gap-3 cursor-pointer hover:bg-brand-50/70 transition-colors ${
                          u.id === currentUser.id ? 'bg-brand-50 font-bold' : ''
                        }`}
                      >
                        <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover border border-slate-200" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-slate-800 truncate flex items-center justify-between">
                            <span>{u.name}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                              u.role === 'admin'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {u.role === 'admin' ? '👑 Admin' : '🏪 Quán'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{u.bio}</p>
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
                className="relative p-2 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors"
                title="Thông báo"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-50">
                  <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">Thông báo ({notifications.length})</span>
                    <span className="text-xs text-brand-600 font-semibold">{unreadCount} chưa đọc</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">Chưa có thông báo nào</div>
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
                          className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors ${
                            !notif.isRead ? 'bg-amber-50/50' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-slate-900">{notif.title}</span>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap">{notif.createdAt}</span>
                          </div>
                          <p className="text-slate-600 mt-1 leading-relaxed">{notif.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Reset Data Button */}
            <button
              onClick={handleResetData}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              title="Khôi phục Mock Data về mặc định"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Exit/Logout to Split Screen */}
            <button
              onClick={onLogout}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-colors"
              title="Đăng xuất / Quay lại màn hình đăng nhập"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Thoát</span>
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="lg:hidden flex items-center justify-around border-t border-slate-100 bg-white py-2 px-1 text-[10px] font-semibold text-slate-600 overflow-x-auto">
        {isAdmin ? (
          <>
            <button
              onClick={() => setActiveTab('admin_overview')}
              className={`flex flex-col items-center gap-1 p-1 min-w-12 ${activeTab === 'admin_overview' ? 'text-brand-600 font-bold' : ''}`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Tổng Quan</span>
            </button>
            <button
              onClick={() => setActiveTab('admin_restaurants')}
              className={`flex flex-col items-center gap-1 p-1 min-w-12 ${activeTab === 'admin_restaurants' ? 'text-brand-600 font-bold' : ''}`}
            >
              <Store className="w-4 h-4" />
              <span>Quán Ăn</span>
            </button>
            <button
              onClick={() => setActiveTab('admin_sessions')}
              className={`flex flex-col items-center gap-1 p-1 min-w-12 ${activeTab === 'admin_sessions' ? 'text-brand-600 font-bold' : ''}`}
            >
              <Utensils className="w-4 h-4" />
              <span>Bàn Ghép</span>
            </button>
            <button
              onClick={() => setActiveTab('admin_users')}
              className={`flex flex-col items-center gap-1 p-1 min-w-12 ${activeTab === 'admin_users' ? 'text-brand-600 font-bold' : ''}`}
            >
              <Users className="w-4 h-4" />
              <span>Thành Viên</span>
            </button>
            <button
              onClick={() => setActiveTab('admin_moderation')}
              className={`flex flex-col items-center gap-1 p-1 min-w-12 ${activeTab === 'admin_moderation' ? 'text-rose-600 font-bold' : ''}`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Khiếu Nại</span>
            </button>
            <button
              onClick={() => setActiveTab('admin_vouchers')}
              className={`flex flex-col items-center gap-1 p-1 min-w-12 ${activeTab === 'admin_vouchers' ? 'text-brand-600 font-bold' : ''}`}
            >
              <Tag className="w-4 h-4" />
              <span>Voucher</span>
            </button>
            <button
              onClick={() => setActiveTab('admin_finance')}
              className={`flex flex-col items-center gap-1 p-1 min-w-12 ${activeTab === 'admin_finance' ? 'text-emerald-700 font-bold' : ''}`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Tài Chính</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTab('restaurant_reservations')}
              className={`flex flex-col items-center gap-1 p-1 min-w-14 ${activeTab === 'restaurant_reservations' ? 'text-emerald-700 font-bold' : ''}`}
            >
              <Calendar className="w-4 h-4" />
              <span>Đặt Bàn</span>
            </button>
            <button
              onClick={() => setActiveTab('restaurant_menu')}
              className={`flex flex-col items-center gap-1 p-1 min-w-14 ${activeTab === 'restaurant_menu' ? 'text-emerald-700 font-bold' : ''}`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Thực Đơn</span>
            </button>
            <button
              onClick={() => setActiveTab('restaurant_vouchers')}
              className={`flex flex-col items-center gap-1 p-1 min-w-14 ${activeTab === 'restaurant_vouchers' ? 'text-emerald-700 font-bold' : ''}`}
            >
              <Tag className="w-4 h-4" />
              <span>Voucher</span>
            </button>
            <button
              onClick={() => setActiveTab('restaurant_stats')}
              className={`flex flex-col items-center gap-1 p-1 min-w-14 ${activeTab === 'restaurant_stats' ? 'text-emerald-700 font-bold' : ''}`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Thống Kê</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
};
