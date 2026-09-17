import React, { useState, useEffect } from 'react';
import { User, AppNotification } from './types';
import { storageService } from './services/storageService';
import { AuthSplitView } from './views/AuthSplitView';
import { Navbar } from './components/layout/Navbar';
import { DiningFeedView } from './views/DiningFeedView';
import { NearbyDealsView } from './views/NearbyDealsView';
import { UserProfileView } from './views/UserProfileView';
import { RestaurantDashboardView } from './views/RestaurantDashboardView';
import { NearbyFuturePostsView } from './views/NearbyFuturePostsView';
import { FullMapView } from './views/FullMapView';

export function App() {
  const [currentUser, setCurrentUser] = useState<User>(() => storageService.getCurrentUser());
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'feed' | 'future_posts' | 'map_view' | 'deals' | 'profile' | 'restaurant_portal'>('feed');
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    storageService.getNotifications(currentUser.id)
  );
  const [targetSessionId, setTargetSessionId] = useState<string | null>(null);

  // Sync notifications whenever currentUser changes
  useEffect(() => {
    setNotifications(storageService.getNotifications(currentUser.id));
  }, [currentUser]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    if (user.role === 'restaurant') {
      setActiveTab('restaurant_portal');
    } else {
      setActiveTab('feed'); // As requested: "khi bấm đăng nhập song , vào giao diện mặc định là phần tìm bạn ăn chung"
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setTargetSessionId(null);
  };

  const handleUserChanged = (user: User) => {
    setCurrentUser(user);
  };

  const handleOpenSessionFromNotif = (sessionId: string) => {
    setActiveTab('feed');
    setTargetSessionId(sessionId);
  };

  const handleOpenFeedWithSession = (sessionId: string) => {
    setActiveTab('feed');
    setTargetSessionId(sessionId);
  };

  // If not logged in, show the required 50/50 Split Screen
  if (!isLoggedIn) {
    return <AuthSplitView onLoginSuccess={handleLoginSuccess} />;
  }

  // Once logged in, show main application with Navbar and default view "Tìm bạn ăn chung"
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notifications={notifications}
        onOpenSession={handleOpenSessionFromNotif}
        onLogout={handleLogout}
        onUserChanged={handleUserChanged}
      />

      {/* Main Content View Container */}
      <main className="flex-1 pb-16">
        {activeTab === 'feed' && (
          <DiningFeedView
            currentUser={currentUser}
            onOpenDeals={() => setActiveTab('deals')}
            targetSessionId={targetSessionId}
            clearTargetSessionId={() => setTargetSessionId(null)}
          />
        )}

        {activeTab === 'future_posts' && (
          <NearbyFuturePostsView
            currentUser={currentUser}
            onOpenFeedWithSession={handleOpenFeedWithSession}
          />
        )}

        {activeTab === 'map_view' && (
          <FullMapView
            currentUser={currentUser}
            onOpenSession={handleOpenSessionFromNotif}
            onOpenDeals={() => setActiveTab('deals')}
          />
        )}

        {activeTab === 'deals' && (
          <NearbyDealsView
            currentUser={currentUser}
            onOpenFeedWithSession={handleOpenFeedWithSession}
          />
        )}

        {activeTab === 'profile' && (
          <UserProfileView
            currentUser={currentUser}
            onUserUpdated={(updated) => setCurrentUser(updated)}
          />
        )}

        {activeTab === 'restaurant_portal' && (
          <RestaurantDashboardView currentUser={currentUser} />
        )}
      </main>

      {/* Global Quick Demo Helper / Floating Pill */}
      <div className="fixed bottom-4 right-4 z-30 hidden sm:flex items-center gap-2 bg-slate-900/90 text-white backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-slate-700 text-xs">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Đang đăng nhập: <strong>{currentUser.name}</strong></span>
        <button
          onClick={() => {
            const nextTab = activeTab === 'restaurant_portal' ? 'feed' : 'restaurant_portal';
            setActiveTab(nextTab);
          }}
          className="ml-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 underline"
        >
          {activeTab === 'restaurant_portal' ? '➔ Về Giao diện Khách' : '➔ Sang Quản trị Quán'}
        </button>
      </div>
    </div>
  );
}

export default App;
