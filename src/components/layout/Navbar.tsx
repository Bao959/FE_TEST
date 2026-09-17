import React, { useState } from 'react';
import {
  Utensils,
  MapPin,
  User as UserIcon,
  Store,
  Bell,
  LogOut,
  RefreshCw,
  Sparkles,
  ChevronDown,
  Calendar,
  Map
} from 'lucide-react';
import { User, AppNotification } from '../../types';
import { storageService } from '../../services/storageService';

interface NavbarProps {
  currentUser: User;
  activeTab: 'feed' | 'future_posts' | 'map_view' | 'deals' | 'profile' | 'restaurant_portal';
  setActiveTab: (tab: 'feed' | 'future_posts' | 'map_view' | 'deals' | 'profile' | 'restaurant_portal') => void;
  notifications: AppNotification[];
  onOpenSession: (sessionId: string) => void;
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

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleSwitchUser = (user: User) => {
    storageService.setCurrentUserId(user.id);
    onUserChanged(user);
    setShowUserDropdown(false);
    if (user.role === 'restaurant') {
      setActiveTab('restaurant_portal');
    }
  };

  const handleResetData = () => {
    if (window.confirm('Bạn có chắc muốn làm mới toàn bộ dữ liệu mẫu về trạng thái ban đầu?')) {
      storageService.resetAllData();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group select-none"
            onClick={() => setActiveTab('feed')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1">
                Dine<span className="text-brand-600">Together</span>
              </span>
              <p className="text-[10px] text-slate-500 font-medium -mt-1 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-amber-500" /> Kết nối ăn chung & Săn deal
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('feed')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-xs transition-all ${
                activeTab === 'feed'
                  ? 'bg-brand-50 text-brand-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Tìm Bạn Ăn Chung</span>
            </button>

            <button
              onClick={() => setActiveTab('future_posts')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-xs transition-all ${
                activeTab === 'future_posts'
                  ? 'bg-amber-50 text-amber-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>Bài Đăng Gần Bạn</span>
              <span className="px-1 py-0.2 text-[9px] bg-amber-500 text-white rounded font-bold">MỚI</span>
            </button>

            <button
              onClick={() => setActiveTab('map_view')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-xs transition-all ${
                activeTab === 'map_view'
                  ? 'bg-brand-50 text-brand-600 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Bản Đồ Quán Ăn</span>
            </button>

            <button
              onClick={() => setActiveTab('deals')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-xs transition-all ${
                activeTab === 'deals'
                  ? 'bg-brand-50 text-brand-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Ưu Đãi Gần Bạn</span>
              <span className="px-1.5 py-0.2 text-[9px] bg-red-500 text-white rounded-full font-bold">HOT</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-xs transition-all ${
                activeTab === 'profile'
                  ? 'bg-brand-50 text-brand-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Trang Cá Nhân</span>
            </button>

            <button
              onClick={() => setActiveTab('restaurant_portal')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-xs transition-all ${
                activeTab === 'restaurant_portal'
                  ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/50'
              }`}
            >
              <Store className="w-3.5 h-3.5 text-emerald-600" />
              <span>Kênh Nhà Hàng</span>
            </button>
          </nav>

          {/* Right Actions: Persona Switcher, Notifications, Reset & Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick Demo Persona Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-colors"
                title="Đổi tài khoản trải nghiệm"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-brand-300"
                />
                <div className="hidden lg:block text-xs">
                  <div className="font-bold text-slate-800 line-clamp-1 flex items-center gap-1">
                    {currentUser.name}
                    {currentUser.role === 'restaurant' && (
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1 py-0.2 rounded font-bold">Quán</span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500">Đổi vai trải nghiệm</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Persona Dropdown */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Chuyển vai trò test nhanh:
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                    {allUsers.map((u) => (
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
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                              u.role === 'restaurant' ? 'bg-emerald-100 text-emerald-800' : 'bg-brand-100 text-brand-800'
                            }`}>
                              {u.role === 'restaurant' ? 'Nhà Hàng' : 'Thực Khách'}
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
                            if (notif.sessionId) {
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
                          {notif.sessionId && (
                            <span className="inline-block mt-1 text-[11px] text-brand-600 font-semibold underline">
                              Mở bàn thảo luận &rarr;
                            </span>
                          )}
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
              title="Đăng xuất / Quay lại màn hình chính"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Thoát</span>
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="lg:hidden flex items-center justify-around border-t border-slate-100 bg-white py-2 px-1 text-[10px] font-semibold text-slate-600 overflow-x-auto">
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex flex-col items-center gap-1 p-1 min-w-14 ${activeTab === 'feed' ? 'text-brand-600 font-bold' : ''}`}
        >
          <Utensils className="w-4 h-4" />
          <span>Tìm Bàn</span>
        </button>
        <button
          onClick={() => setActiveTab('future_posts')}
          className={`flex flex-col items-center gap-1 p-1 min-w-14 ${activeTab === 'future_posts' ? 'text-amber-600 font-bold' : ''}`}
        >
          <Calendar className="w-4 h-4" />
          <span>Bài Đăng</span>
        </button>
        <button
          onClick={() => setActiveTab('map_view')}
          className={`flex flex-col items-center gap-1 p-1 min-w-14 ${activeTab === 'map_view' ? 'text-brand-600 font-bold' : ''}`}
        >
          <Map className="w-4 h-4" />
          <span>Bản Đồ</span>
        </button>
        <button
          onClick={() => setActiveTab('deals')}
          className={`flex flex-col items-center gap-1 p-1 min-w-14 ${activeTab === 'deals' ? 'text-brand-600 font-bold' : ''}`}
        >
          <MapPin className="w-4 h-4" />
          <span>Ưu Đãi</span>
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 p-1 min-w-14 ${activeTab === 'profile' ? 'text-brand-600 font-bold' : ''}`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Cá Nhân</span>
        </button>
        <button
          onClick={() => setActiveTab('restaurant_portal')}
          className={`flex flex-col items-center gap-1 p-1 min-w-14 ${activeTab === 'restaurant_portal' ? 'text-emerald-700 font-bold' : ''}`}
        >
          <Store className="w-4 h-4" />
          <span>Kênh Quán</span>
        </button>
      </div>
    </header>
  );
};
