import React, { useState, useEffect } from 'react';
import { User, AppNotification } from './types';
import { storageService } from './services/storageService';
import { AuthSplitView } from './views/AuthSplitView';
import { Navbar, PortalTab } from './components/layout/Navbar';
import { AdminDashboardView } from './views/AdminDashboardView';
import { RestaurantDashboardView } from './views/RestaurantDashboardView';
import { ShieldCheck, Store, Smartphone } from 'lucide-react';

export function App() {
  const [currentUser, setCurrentUser] = useState<User>(() => storageService.getCurrentUser());
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<PortalTab>(() =>
    currentUser.role === 'admin' ? 'admin_overview' : 'restaurant_reservations'
  );
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    storageService.getNotifications(currentUser.id)
  );

  // Sync notifications whenever currentUser changes
  useEffect(() => {
    setNotifications(storageService.getNotifications(currentUser.id));
  }, [currentUser]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    if (user.role === 'admin') {
      setActiveTab('admin_overview');
    } else {
      setActiveTab('restaurant_reservations');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const handleUserChanged = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setActiveTab('admin_overview');
    } else {
      setActiveTab('restaurant_reservations');
    }
  };

  // If not logged in, show the 50/50 Split Screen
  if (!isLoggedIn) {
    return <AuthSplitView onLoginSuccess={handleLoginSuccess} />;
  }

  const allUsers = storageService.getUsers();
  const adminUser = allUsers.find((u) => u.id === 'user_admin' || u.role === 'admin');
  const restaurantUser = allUsers.find((u) => u.id === 'user_rest_1' || u.role === 'restaurant');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Navbar specifically for Admin & Restaurant */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notifications={notifications}
        onLogout={handleLogout}
        onUserChanged={handleUserChanged}
      />

      {/* Main Content View Container */}
      <main className="flex-1 pb-16">
        {currentUser.role === 'admin' && (
          <AdminDashboardView
            currentUser={currentUser}
            activeSection={
              activeTab === 'admin_restaurants'
                ? 'restaurants'
                : activeTab === 'admin_sessions'
                ? 'sessions'
                : activeTab === 'admin_users'
                ? 'users'
                : activeTab === 'admin_moderation'
                ? 'moderation'
                : activeTab === 'admin_vouchers'
                ? 'vouchers'
                : activeTab === 'admin_finance'
                ? 'finance'
                : 'overview'
            }
            onSectionChange={(sec) => {
              if (sec === 'restaurants') setActiveTab('admin_restaurants');
              else if (sec === 'sessions') setActiveTab('admin_sessions');
              else if (sec === 'users') setActiveTab('admin_users');
              else if (sec === 'moderation') setActiveTab('admin_moderation');
              else if (sec === 'vouchers') setActiveTab('admin_vouchers');
              else if (sec === 'finance') setActiveTab('admin_finance');
              else setActiveTab('admin_overview');
            }}
          />
        )}

        {currentUser.role === 'restaurant' && (
          <RestaurantDashboardView
            currentUser={currentUser}
            activeSection={
              activeTab === 'restaurant_menu'
                ? 'menu'
                : activeTab === 'restaurant_vouchers'
                ? 'promotions'
                : activeTab === 'restaurant_stats'
                ? 'stats'
                : 'reservations'
            }
            onSectionChange={(sec) => {
              if (sec === 'menu') setActiveTab('restaurant_menu');
              else if (sec === 'promotions') setActiveTab('restaurant_vouchers');
              else if (sec === 'stats') setActiveTab('restaurant_stats');
              else setActiveTab('restaurant_reservations');
            }}
          />
        )}

        {/* If a diner user logs in, guide them to Mobile App & provide quick switcher */}
        {currentUser.role === 'user' && (
          <div className="max-w-3xl mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl text-center space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto text-3xl">
              <Smartphone className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              Cổng Web Dành Cho Quản Trị & Đối Tác Nhà Hàng
            </h2>
            <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              Bạn đang đăng nhập bằng tài khoản <strong>Thực khách cá nhân ({currentUser.name})</strong>. Hệ thống Web này được thiết kế chuyên biệt cho <strong>Ban Quản Trị Hệ Thống</strong> và <strong>Chủ Quán / Nhà Hàng Đối Tác</strong>.
            </p>
            <div className="p-4 rounded-2xl bg-brand-50 border border-brand-100 text-xs text-brand-800 font-semibold max-w-md mx-auto">
              💡 Đối với thực khách cá nhân ghép bàn ăn chung, vui lòng sử dụng ứng dụng di động <strong>Chạm Đũa Mobile App</strong>.
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              {adminUser && (
                <button
                  onClick={() => handleUserChanged(adminUser)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Vào Bằng Quyền Admin Tổng</span>
                </button>
              )}
              {restaurantUser && (
                <button
                  onClick={() => handleUserChanged(restaurantUser)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
                >
                  <Store className="w-4 h-4" />
                  <span>Vào Bằng Quyền Quán Đối Tác</span>
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Global Quick Demo Helper / Floating Pill */}
      <div className="fixed bottom-4 right-4 z-30 hidden sm:flex items-center gap-2.5 bg-slate-900/90 text-white backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700 text-xs">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>
          Đang vào vai: <strong>{currentUser.name}</strong>
        </span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-extrabold ${
          currentUser.role === 'admin' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-600 text-white'
        }`}>
          {currentUser.role === 'admin' ? '👑 Admin' : '🏪 Quán'}
        </span>
        <button
          onClick={() => {
            if (currentUser.role === 'admin') {
              if (restaurantUser) handleUserChanged(restaurantUser);
            } else {
              if (adminUser) handleUserChanged(adminUser);
            }
          }}
          className="ml-2 text-[11px] font-bold text-amber-400 hover:text-amber-300 underline"
        >
          {currentUser.role === 'admin' ? '➔ Sang Quản Trị Quán' : '➔ Sang Admin Tổng'}
        </button>
      </div>
    </div>
  );
}

export default App;
