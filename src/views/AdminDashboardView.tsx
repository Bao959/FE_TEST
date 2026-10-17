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
  Calendar,
  Utensils,
  ShieldAlert,
  Flame,
  Award,
  ChevronRight,
  Sliders,
  Percent,
  Check,
  X,
  CreditCard,
  MessageSquare,
  Gift,
  AlertCircle,
  HelpCircle,
  FileText
} from 'lucide-react';
import { Restaurant, User, GroupVoucher, DiningSession, DiningReport, PlatformCampaign, FinancialPayout } from '../types';
import { storageService } from '../services/storageService';
import { formatCurrency } from '../utils/geo';

interface AdminDashboardViewProps {
  currentUser: User;
  activeSection?: 'overview' | 'restaurants' | 'sessions' | 'users' | 'moderation' | 'vouchers' | 'finance';
  onSectionChange?: (sec: 'overview' | 'restaurants' | 'sessions' | 'users' | 'moderation' | 'vouchers' | 'finance') => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  currentUser,
  activeSection,
  onSectionChange
}) => {
  const [internalTab, setInternalTab] = useState<'overview' | 'restaurants' | 'sessions' | 'users' | 'moderation' | 'vouchers' | 'finance'>('overview');
  const activeTab = activeSection || internalTab;

  const setActiveTab = (tab: 'overview' | 'restaurants' | 'sessions' | 'users' | 'moderation' | 'vouchers' | 'finance') => {
    setInternalTab(tab);
    if (onSectionChange) onSectionChange(tab);
  };

  const [restaurants, setRestaurants] = useState<Restaurant[]>(() => storageService.getRestaurants());
  const [users, setUsers] = useState<User[]>(() => storageService.getUsers());
  const [sessions, setSessions] = useState<DiningSession[]>(() => storageService.getSessions());
  const [reports, setReports] = useState<DiningReport[]>(() => storageService.getReports());
  const [campaigns, setCampaigns] = useState<PlatformCampaign[]>(() => storageService.getCampaigns());
  const [payouts, setPayouts] = useState<FinancialPayout[]>(() => storageService.getPayouts());

  // Restaurant filter & search
  const [restStatusFilter, setRestStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'LOCKED'>('ALL');
  const [restCategoryFilter, setRestCategoryFilter] = useState<string>('ALL');
  const [restSearchQuery, setRestSearchQuery] = useState('');

  // Selected restaurant for detail modal
  const [selectedRestDetail, setSelectedRestDetail] = useState<Restaurant | null>(null);

  // Add Restaurant Modal
  const [isAddRestModalOpen, setIsAddRestModalOpen] = useState(false);
  const [newRestName, setNewRestName] = useState('');
  const [newRestCategory, setNewRestCategory] = useState('Lẩu & Nướng Than Hoa');
  const [newRestAddress, setNewRestAddress] = useState('');
  const [newRestPhone, setNewRestPhone] = useState('');
  const [newRestPriceRange, setNewRestPriceRange] = useState('150.000đ - 250.000đ/người');
  const [newRestOpenHours, setNewRestOpenHours] = useState('10:00 - 23:00');
  const [newRestCapacity, setNewRestCapacity] = useState<number>(100);
  const [newRestCommission, setNewRestCommission] = useState<number>(10);
  const [newRestImage, setNewRestImage] = useState('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80');

  // Add Platform Campaign Modal
  const [isAddCampaignModalOpen, setIsAddCampaignModalOpen] = useState(false);
  const [campCode, setCampCode] = useState('');
  const [campTitle, setCampTitle] = useState('');
  const [campDiscount, setCampDiscount] = useState('Giảm 50.000đ');
  const [campMinGroup, setCampMinGroup] = useState<number>(4);
  const [campBudget, setCampBudget] = useState<number>(20000000);
  const [campCategory, setCampCategory] = useState('Tất cả');

  // Sessions filter
  const [sessionStatusFilter, setSessionStatusFilter] = useState<string>('ALL');
  const [sessionSearchQuery, setSessionSearchQuery] = useState('');

  // User search & filter
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userTrustFilter, setUserTrustFilter] = useState<'ALL' | 'VIP' | 'HIGH' | 'WARNING' | 'LOCKED'>('ALL');

  // Reports filter
  const [reportStatusFilter, setReportStatusFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED' | 'DISMISSED'>('ALL');

  // Calculations for Metrics
  const totalRestaurants = restaurants.length;
  const activeRestaurants = restaurants.filter((r) => r.status === 'ACTIVE' || (!r.status && r.isRegisteredOnSystem)).length;
  const pendingRestaurants = restaurants.filter((r) => r.status === 'PENDING').length;
  const pendingReportsCount = reports.filter((r) => r.status === 'PENDING').length;
  
  const totalCompletedSessions = sessions.filter((s) => s.status === 'COMPLETED').length;
  const totalGMV = sessions.reduce((acc, s) => acc + (s.paymentInfo?.totalAmount || 850000), 0) + 124500000;
  const platformRevenue = Math.round(totalGMV * 0.1); // 10% platform take-rate

  // Actions: Restaurant
  const handleApproveRestaurant = (restId: string) => {
    storageService.updateRestaurantStatus(restId, 'ACTIVE');
    setRestaurants(storageService.getRestaurants());
    alert('🎉 Đã phê duyệt chính thức quán ăn vào hệ sinh thái Chạm Đũa!');
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
      if (selectedRestDetail?.id === restId) setSelectedRestDetail(null);
    }
  };

  const handleUpdateCommission = (restId: string, rate: number) => {
    storageService.updateRestaurantCommission(restId, rate);
    setRestaurants(storageService.getRestaurants());
  };

  const handleUpdateBadge = (restId: string, badge?: 'MICHELIN' | 'DIAMOND' | 'GOLD' | 'VERIFIED') => {
    storageService.updateRestaurantBadge(restId, badge);
    setRestaurants(storageService.getRestaurants());
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
      status: 'ACTIVE',
      capacity: Number(newRestCapacity),
      commissionRate: Number(newRestCommission),
      badge: 'VERIFIED',
      featuredDishes: ['Món Lẩu Đặc Biệt', 'Món Nướng Chữ Ký']
    });

    setRestaurants(storageService.getRestaurants());
    setIsAddRestModalOpen(false);
    setNewRestName('');
    setNewRestAddress('');
    setNewRestPhone('');
    alert(`Đã thêm nhà hàng "${added.name}" thành công vào danh sách đối tác!`);
  };

  // Actions: User
  const handleAdjustTrust = (user: User, delta: number) => {
    const newScore = Math.max(1.0, Math.min(5.0, user.trustScore + delta));
    storageService.updateUserTrustScore(user.id, newScore);
    setUsers(storageService.getUsers());
  };

  const handleToggleUserLock = (user: User) => {
    storageService.toggleUserLock(user.id);
    setUsers(storageService.getUsers());
  };

  // Actions: Moderation Reports
  const handleResolveReport = (report: DiningReport, actionType: 'PENALTY' | 'VOUCHER' | 'DISMISS') => {
    let penalty = '';
    if (actionType === 'PENALTY') {
      penalty = 'Đã trừ -0.5 điểm uy tín và cảnh cáo tài khoản vi phạm';
      if (report.reportedUserName) {
        const u = users.find((x) => x.name.toLowerCase() === report.reportedUserName?.toLowerCase());
        if (u) storageService.updateUserTrustScore(u.id, Math.max(1.0, u.trustScore - 0.5));
      }
      storageService.updateReportStatus(report.id, 'RESOLVED', penalty);
    } else if (actionType === 'VOUCHER') {
      penalty = 'Đã hoàn tặng voucher đền bù 50.000đ cho người báo cáo';
      storageService.updateReportStatus(report.id, 'RESOLVED', penalty);
    } else {
      penalty = 'Đơn khiếu nại không đủ bằng chứng vi phạm';
      storageService.updateReportStatus(report.id, 'DISMISSED', penalty);
    }
    setReports(storageService.getReports());
    setUsers(storageService.getUsers());
  };

  // Actions: Campaigns
  const handleToggleCampaign = (campId: string) => {
    storageService.toggleCampaignStatus(campId);
    setCampaigns(storageService.getCampaigns());
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campCode.trim() || !campTitle.trim()) return;

    storageService.addCampaign({
      code: campCode.trim().toUpperCase(),
      title: campTitle.trim(),
      discount: campDiscount.trim(),
      minGroup: Number(campMinGroup),
      budget: Number(campBudget),
      targetCategory: campCategory
    });

    setCampaigns(storageService.getCampaigns());
    setIsAddCampaignModalOpen(false);
    setCampCode('');
    setCampTitle('');
    alert('Đã phát hành chiến dịch voucher toàn sàn thành công!');
  };

  // Actions: Payouts
  const handleConfirmPayout = (payoutId: string) => {
    storageService.updatePayoutStatus(payoutId, 'PAID');
    setPayouts(storageService.getPayouts());
    alert('Đã hoàn tất đối soát và xác nhận thanh toán hoa hồng cho nhà hàng!');
  };

  // Filtered lists
  const filteredRestaurants = restaurants.filter((r) => {
    const matchQuery =
      r.name.toLowerCase().includes(restSearchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(restSearchQuery.toLowerCase()) ||
      r.address.toLowerCase().includes(restSearchQuery.toLowerCase());
    const rStatus = r.status || (r.isRegisteredOnSystem ? 'ACTIVE' : 'PENDING');
    const matchStatus = restStatusFilter === 'ALL' || rStatus === restStatusFilter;
    const matchCategory = restCategoryFilter === 'ALL' || r.category.toLowerCase().includes(restCategoryFilter.toLowerCase());
    return matchQuery && matchStatus && matchCategory;
  });

  const filteredSessions = sessions.filter((s) => {
    const matchQuery =
      s.title.toLowerCase().includes(sessionSearchQuery.toLowerCase()) ||
      s.restaurantName.toLowerCase().includes(sessionSearchQuery.toLowerCase()) ||
      s.hostName.toLowerCase().includes(sessionSearchQuery.toLowerCase());
    const matchStatus = sessionStatusFilter === 'ALL' || s.status === sessionStatusFilter;
    return matchQuery && matchStatus;
  });

  const filteredUsers = users.filter((u) => {
    const matchQuery =
      u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      (u.occupation && u.occupation.toLowerCase().includes(userSearchQuery.toLowerCase()));
    
    let matchTrust = true;
    if (userTrustFilter === 'VIP') matchTrust = u.trustScore === 5.0;
    else if (userTrustFilter === 'HIGH') matchTrust = u.trustScore >= 4.5 && u.trustScore < 5.0;
    else if (userTrustFilter === 'WARNING') matchTrust = u.trustScore < 4.5;
    else if (userTrustFilter === 'LOCKED') matchTrust = u.isLocked === true;

    return matchQuery && matchTrust;
  });

  const filteredReports = reports.filter((r) => {
    return reportStatusFilter === 'ALL' || r.status === reportStatusFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* GRAND GOURMET ADMIN HERO BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-950 text-white p-6 sm:p-8 rounded-3xl border border-amber-900/30 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-brand-500 via-amber-500 to-amber-600 flex items-center justify-center text-white text-3xl shadow-xl shadow-brand-500/30 ring-4 ring-amber-500/20">
              🥢
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Trung Tâm Quản Trị Hệ Sinh Thái Ẩm Thực Chạm Đũa
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <Award className="w-3 h-3" /> F&B Master Admin
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Điều phối bàn ăn ghép, thẩm định đối tác nhà hàng, đối soát hoa hồng và bảo vệ cộng đồng ẩm thực văn minh, uy tín 5.0★.
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <button
              onClick={() => setIsAddRestModalOpen(true)}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 transition-all transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Quán Ăn Mới</span>
            </button>

            <button
              onClick={() => setIsAddCampaignModalOpen(true)}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <Gift className="w-4 h-4 text-amber-400" />
              <span>Phát Hành Voucher Sàn</span>
            </button>
          </div>
        </div>

        {/* 4 CORE KPI METRICS WITH GOURMET GLOW */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10 backdrop-blur-xs">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Tổng Doanh Số Đặt Bàn</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white">{formatCurrency(totalGMV)}</div>
            <div className="text-[11px] text-emerald-400 font-bold mt-1 flex items-center gap-1">
              <span>↑ +24.8%</span>
              <span className="text-slate-400 font-normal">so với tuần trước</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10 backdrop-blur-xs">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Hoa Hồng Sàn Thực Thu (10%)</span>
              <Percent className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400">{formatCurrency(platformRevenue)}</div>
            <div className="text-[11px] text-amber-300 font-semibold mt-1">
              Take-rate trung bình 10%
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10 backdrop-blur-xs">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Bàn Ghép Hoàn Tất</span>
              <UtensilsCrossed className="w-4 h-4 text-brand-400" />
            </div>
            <div className="text-2xl font-black text-white">{totalCompletedSessions + 248} bàn</div>
            <div className="text-[11px] text-teal-400 font-semibold mt-1">
              96.4% thực khách hài lòng
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10 backdrop-blur-xs">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Đối Tác & Khách Hoạt Động</span>
              <Store className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-black text-white">{activeRestaurants} Quán • {users.length + 1280} Khách</div>
            <div className="text-[11px] text-sky-300 font-semibold mt-1 flex items-center gap-1">
              <span>★ 4.9/5.0 Điểm uy tín TB</span>
              {pendingRestaurants > 0 && (
                <span className="text-amber-400">• {pendingRestaurants} quán chờ duyệt</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FULL ADMIN TABS NAVIGATION */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
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
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
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
            onClick={() => setActiveTab('sessions')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'sessions'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Bàn Ăn Ghép ({sessions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Thành Viên & Uy Tín ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('moderation')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'moderation'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-rose-600'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            <span>Khiếu Nại & An Toàn ({reports.length})</span>
            {pendingReportsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black animate-bounce">
                {pendingReportsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('vouchers')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'vouchers'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Voucher Toàn Sàn ({campaigns.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('finance')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'finance'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-emerald-700'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Tài Chính & Đối Soát</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW & SYSTEM HEALTH */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Action Alerts Banner */}
          {(pendingRestaurants > 0 || pendingReportsCount > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRestaurants > 0 && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping flex-shrink-0" />
                    <span className="text-xs text-amber-950 font-bold">
                      Có <strong>{pendingRestaurants} quán ăn mới</strong> vừa nộp hồ sơ chờ Ban Quản Trị thẩm định.
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('restaurants')}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-xs whitespace-nowrap"
                  >
                    Duyệt ngay &rarr;
                  </button>
                </div>
              )}

              {pendingReportsCount > 0 && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 animate-bounce" />
                    <span className="text-xs text-rose-950 font-bold">
                      Có <strong>{pendingReportsCount} báo cáo vi phạm bàn ăn</strong> cần Admin can thiệp xử lý.
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('moderation')}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-xs whitespace-nowrap"
                  >
                    Xử lý &rarr;
                  </button>
                </div>
              )}
            </div>
          )}

          {/* GOURMET CATEGORY BREAKDOWN & SYSTEM PERFORMANCE */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-brand-600" />
                  <span>Cơ Cấu Món Ăn Được Ghép Bàn Nhiều Nhất</span>
                </h3>
                <span className="text-[11px] text-slate-400">Dữ liệu thời gian thực</span>
              </div>
              <div className="space-y-3.5 pt-2 text-xs">
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="flex items-center gap-1.5">🍲 Lẩu Trung Hoa, Lẩu Nấm, Lẩu Bò</span>
                    <span className="text-brand-600 font-bold">48% lượt ghép</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-brand-500 h-2.5 rounded-full" style={{ width: '48%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="flex items-center gap-1.5">🥩 Nướng BBQ Hàn Quốc & Than Hoa</span>
                    <span className="text-amber-600 font-bold">26% lượt ghép</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '26%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="flex items-center gap-1.5">🦪 Ốc & Hải Sản Sài Gòn Lai Rai</span>
                    <span className="text-sky-600 font-bold">16% lượt ghép</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-sky-500 h-2.5 rounded-full" style={{ width: '16%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="flex items-center gap-1.5">🍱 Ẩm Thực Nhật Bản & Cơm Niêu</span>
                    <span className="text-emerald-600 font-bold">10% lượt ghép</span>
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
                  <span>Chỉ Số An Toàn & Vận Hành Bàn Ăn</span>
                </h3>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  Hoạt động xuất sắc
                </span>
              </div>
              <div className="space-y-3 pt-1 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800">Tỷ lệ thực khách xác thực hồ sơ (&gt;80%)</span>
                    <p className="text-[11px] text-slate-500">Giúp ghép bạn ăn có gu tương đồng và uy tín</p>
                  </div>
                  <span className="text-sm font-black text-emerald-600">92.8%</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800">Thời gian nhà hàng phản hồi đơn chốt bàn</span>
                    <p className="text-[11px] text-slate-500">Từ lúc khách chốt bàn đến khi nhận xác nhận</p>
                  </div>
                  <span className="text-sm font-black text-brand-600">3.4 phút</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800">Tỷ lệ thanh toán chia bill sòng phẳng</span>
                    <p className="text-[11px] text-slate-500">Không có tranh chấp tài chính bàn ăn</p>
                  </div>
                  <span className="text-sm font-black text-emerald-600">99.4%</span>
                </div>
              </div>
            </div>
          </div>

          {/* TOP 3 RESTAURANTS SPOTLIGHT */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span>Top Đối Tác Nhà Hàng Doanh Thu Dẫn Đầu Tháng Này</span>
                </h3>
                <p className="text-xs text-slate-500">Các đối tác F&B xuất sắc đón nhiều nhóm khách ghép nhất trên Chạm Đũa</p>
              </div>
              <button
                onClick={() => setActiveTab('restaurants')}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <span>Xem tất cả quán</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {restaurants.slice(0, 3).map((r, idx) => (
                <div
                  key={r.id}
                  onClick={() => setSelectedRestDetail(r)}
                  className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={r.coverImage}
                      alt={r.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                    
                    {/* Badge rank */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
                        #{idx + 1}
                      </span>
                      {r.badge && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase">
                          💎 {r.badge}
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wide">
                        {r.category}
                      </span>
                      <h4 className="font-black text-sm text-white truncate drop-shadow-sm">{r.name}</h4>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Doanh thu sàn:</span>
                      <span className="font-black text-emerald-600">
                        {formatCurrency(r.monthlyRevenue || 65000000)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                      <span className="text-slate-500">Hoa hồng sàn ({r.commissionRate || 10}%):</span>
                      <span className="font-bold text-amber-600">
                        {formatCurrency(Math.round((r.monthlyRevenue || 65000000) * ((r.commissionRate || 10) / 100)))}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>★ {r.rating} ({r.reviewCount} đánh giá)</span>
                      <span className="text-brand-600 font-bold group-hover:underline">Chi tiết &rarr;</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: RESTAURANTS MANAGEMENT (CARDS BẮT MẮT & ĐẦY ĐỦ TÍNH NĂNG) */}
      {/* ========================================================================= */}
      {activeTab === 'restaurants' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm nhà hàng theo tên, món ăn, địa chỉ..."
                value={restSearchQuery}
                onChange={(e) => setRestSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              {(['ALL', 'ACTIVE', 'PENDING', 'LOCKED'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setRestStatusFilter(status)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    restStatusFilter === status
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {status === 'ALL' && 'Tất cả đối tác'}
                  {status === 'ACTIVE' && `Đang hoạt động (${activeRestaurants})`}
                  {status === 'PENDING' && `⚡ Chờ duyệt (${pendingRestaurants})`}
                  {status === 'LOCKED' && 'Đã khóa'}
                </button>
              ))}

              <button
                onClick={() => setIsAddRestModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 text-white font-black text-xs flex items-center gap-1 shadow-xs whitespace-nowrap ml-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Quán</span>
              </button>
            </div>
          </div>

          {/* RESTAURANTS CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRestaurants.map((rest) => {
              const status = rest.status || (rest.isRegisteredOnSystem ? 'ACTIVE' : 'PENDING');
              const isLocked = status === 'LOCKED';
              const isPending = status === 'PENDING';

              return (
                <div
                  key={rest.id}
                  className={`group bg-white rounded-3xl border overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between ${
                    isPending
                      ? 'border-amber-300 ring-2 ring-amber-200/60'
                      : isLocked
                      ? 'border-rose-200 opacity-80'
                      : 'border-slate-200'
                  }`}
                >
                  {/* Photo & Badges */}
                  <div className="h-44 relative overflow-hidden">
                    <img
                      src={rest.coverImage}
                      alt={rest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                    
                    {/* Top status badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-md ${
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

                      {rest.badge && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-900/90 text-amber-300 text-[10px] font-black border border-amber-400/40 shadow-sm">
                          {rest.badge === 'DIAMOND' && '💎 Kim Cương'}
                          {rest.badge === 'GOLD' && '🥇 Vàng'}
                          {rest.badge === 'MICHELIN' && '🌟 Michelin'}
                          {rest.badge === 'VERIFIED' && '🛡️ Xác Thực'}
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wide">
                        {rest.category}
                      </span>
                      <h3 className="text-sm sm:text-base font-black truncate drop-shadow-sm">{rest.name}</h3>
                    </div>
                  </div>

                  {/* Body & Business Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
                        <span className="truncate">{rest.address}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Hotline: <strong>{rest.phone}</strong></span>
                        <span className="font-bold text-amber-600 flex items-center gap-1">
                          ★ {rest.rating} ({rest.reviewCount})
                        </span>
                      </div>

                      {/* Featured Dishes Chips */}
                      {rest.featuredDishes && rest.featuredDishes.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {rest.featuredDishes.slice(0, 3).map((dish, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-medium border border-amber-200">
                              {dish}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Revenue & Commission stats */}
                      <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-400 block">Doanh số sàn:</span>
                          <span className="font-black text-slate-900">
                            {formatCurrency(rest.monthlyRevenue || 45000000)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Hoa hồng sàn:</span>
                          <span className="font-black text-amber-600">
                            {rest.commissionRate || 10}% Commission
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Toolbar */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5">
                      {isPending ? (
                        <button
                          onClick={() => handleApproveRestaurant(rest.id)}
                          className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Duyệt Đối Tác Ngay</span>
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => setSelectedRestDetail(rest)}
                            className="flex-1 py-1.5 px-2.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Xem Menu & Chi Tiết</span>
                          </button>

                          <button
                            onClick={() => handleToggleLockRestaurant(rest)}
                            className={`p-2 rounded-xl text-xs font-bold transition-colors border ${
                              isLocked
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : 'bg-slate-50 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'
                            }`}
                            title={isLocked ? 'Mở khóa quán' : 'Tạm khóa quán'}
                          >
                            {isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => handleDeleteRestaurant(rest.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Xóa đối tác"
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

      {/* ========================================================================= */}
      {/* TAB 3: DINING SESSIONS MONITORING (GIÁM SÁT BÀN ĂN GHÉP TOÀN SÀN) */}
      {/* ========================================================================= */}
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm theo quán, người khởi xướng, món..."
                value={sessionSearchQuery}
                onChange={(e) => setSessionSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              {(['ALL', 'RECRUITING', 'LOCKED', 'COMPLETED', 'CANCELLED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setSessionStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    sessionStatusFilter === st
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'ALL' && 'Tất cả bàn'}
                  {st === 'RECRUITING' && 'Đang tuyển người'}
                  {st === 'LOCKED' && 'Đã chốt gửi quán'}
                  {st === 'COMPLETED' && 'Đã ăn & thanh toán'}
                  {st === 'CANCELLED' && 'Đã hủy'}
                </button>
              ))}
            </div>
          </div>

          {/* Dining Sessions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={session.restaurantImage}
                        alt={session.restaurantName}
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-sm"
                      />
                      <div>
                        <h4 className="font-black text-sm text-slate-900">{session.title}</h4>
                        <span className="text-xs font-semibold text-brand-600">{session.restaurantName}</span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      session.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : session.status === 'LOCKED'
                        ? 'bg-amber-100 text-amber-800'
                        : session.status === 'CANCELLED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-sky-100 text-sky-800'
                    }`}>
                      {session.status === 'COMPLETED' && '✓ Đã hoàn tất'}
                      {session.status === 'LOCKED' && '🔒 Đã chốt bàn'}
                      {session.status === 'RECRUITING' && '⚡ Đang gom khách'}
                      {session.status === 'CANCELLED' && '✕ Đã hủy'}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Giờ hẹn ăn:</span>
                      <strong className="text-slate-800">{session.eatingTime}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Tiến độ ghép bàn:</span>
                      <strong className="text-slate-800">
                        {session.joinedMembers.length} / {session.targetSlots} người
                      </strong>
                    </div>
                  </div>

                  {/* Joined Members Avatars */}
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <div className="flex items-center -space-x-2">
                      {session.joinedMembers.map((m) => (
                        <img
                          key={m.userId}
                          src={m.avatar}
                          alt={m.name}
                          title={`${m.name} ${m.isHost ? '(Host)' : ''}`}
                          className="w-7 h-7 rounded-full object-cover border-2 border-white shadow-xs"
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-500">Host: <strong>{session.hostName}</strong></span>
                  </div>
                </div>

                {/* Bill info & Admin Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Tổng hóa đơn bàn:</span>
                    <span className="font-black text-slate-900">
                      {formatCurrency(session.paymentInfo?.totalAmount || 850000)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {session.status !== 'CANCELLED' && (
                      <button
                        onClick={() => {
                          if (confirm('Bạn có chắc muốn hủy bàn ăn ghép này khẩn cấp?')) {
                            storageService.cancelDiningSessionByAdmin(session.id);
                            setSessions(storageService.getSessions());
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-bold transition-colors"
                      >
                        Hủy Bàn
                      </button>
                    )}
                    <span className="text-[11px] text-emerald-600 font-bold px-2 py-1 bg-emerald-50 rounded-xl">
                      {session.reservationStatus === 'CONFIRMED_BY_RESTAURANT' ? 'Quán đã giữ bàn' : 'Chờ xác nhận'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: USERS & TRUST SCORE (QUẢN LÝ THỰC KHÁCH & UY TÍN) */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* User Filter Bar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm theo tên, email, nghề nghiệp..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {(['ALL', 'VIP', 'HIGH', 'WARNING', 'LOCKED'] as const).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setUserTrustFilter(tier)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    userTrustFilter === tier
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tier === 'ALL' && 'Tất cả thành viên'}
                  {tier === 'VIP' && '⭐ VIP (5.0★)'}
                  {tier === 'HIGH' && 'Uy tín cao (4.5★ - 4.9★)'}
                  {tier === 'WARNING' && '⚠️ Cần nhắc nhở (<4.5★)'}
                  {tier === 'LOCKED' && '🔒 Đã khóa'}
                </button>
              ))}
            </div>
          </div>

          {/* User Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className={`bg-white p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 shadow-xs hover:shadow-md ${
                  user.isLocked ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start gap-3.5">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-brand-200 shadow-xs flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-sm text-slate-900 truncate">{user.name}</h4>
                        {user.isLocked && (
                          <span className="px-1.5 py-0.2 bg-rose-600 text-white text-[9px] font-black rounded">
                            LOCKED
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{user.occupation || user.email}</p>
                      <span className="inline-block mt-0.5 text-[10px] font-bold text-brand-600">
                        {user.companyOrSchool || 'Thành viên Chạm Đũa'}
                      </span>
                    </div>
                  </div>

                  {/* Trust Score & Profile Progress */}
                  <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Điểm Uy Tín (Trust Score):</span>
                      <span className="font-black text-amber-500 flex items-center gap-1">
                        ★ {user.trustScore.toFixed(1)} / 5.0
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full ${
                          user.trustScore >= 4.5 ? 'bg-amber-400' : user.trustScore >= 3.5 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${(user.trustScore / 5.0) * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>Bữa ăn đã ghép: <strong>{user.totalMealsJoined}</strong></span>
                      <span>Hồ sơ: <strong>{user.profileCompletionPercent || 100}%</strong></span>
                    </div>
                  </div>

                  {/* Smart Food Tags */}
                  {user.smartTags && user.smartTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {user.smartTags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Trust score adjustment tools */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleAdjustTrust(user, 0.1)}
                      className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px]"
                      title="Cộng thưởng điểm uy tín"
                    >
                      +0.1★
                    </button>
                    <button
                      onClick={() => handleAdjustTrust(user, -0.2)}
                      className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px]"
                      title="Trừ điểm uy tín (vi phạm)"
                    >
                      -0.2★
                    </button>
                  </div>

                  <button
                    onClick={() => handleToggleUserLock(user)}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold border transition-colors ${
                      user.isLocked
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-rose-50 hover:text-rose-600'
                    }`}
                  >
                    {user.isLocked ? 'Mở Khóa' : 'Khóa Tài Khoản'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: MODERATION & REPORTS (KHIẾU NẠI & AN TOÀN BÀN ĂN) */}
      {/* ========================================================================= */}
      {activeTab === 'moderation' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Trung Tâm Tiếp Nhận & Xử Lý Khiếu Nại Bàn Ăn</span>
              </h3>
              <p className="text-xs text-slate-500">Giám sát các hành vi vi phạm quy tắc văn minh ghép bàn: bùng hẹn, chia bill thiếu sòng phẳng</p>
            </div>

            <div className="flex items-center gap-2">
              {(['ALL', 'PENDING', 'RESOLVED', 'DISMISSED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setReportStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    reportStatusFilter === st
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'ALL' && 'Tất cả'}
                  {st === 'PENDING' && `Chờ xử lý (${pendingReportsCount})`}
                  {st === 'RESOLVED' && 'Đã giải quyết'}
                  {st === 'DISMISSED' && 'Bác đơn'}
                </button>
              ))}
            </div>
          </div>

          {/* Reports List */}
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      report.severity === 'HIGH'
                        ? 'bg-rose-100 text-rose-700'
                        : report.severity === 'MEDIUM'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      Mức độ: {report.severity}
                    </span>
                    <span className="text-xs font-black text-slate-900">{report.reason}</span>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    report.status === 'PENDING'
                      ? 'bg-amber-500 text-white animate-pulse'
                      : report.status === 'RESOLVED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {report.status === 'PENDING' && '⚡ Chờ Admin Xử Lý'}
                    {report.status === 'RESOLVED' && '✓ Đã Xử Lý Thành Công'}
                    {report.status === 'DISMISSED' && '✕ Bác Khiếu Nại'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Người gửi khiếu nại:</span>
                    <strong className="text-slate-800">{report.reporterName}</strong>
                    <p className="text-[10px] text-slate-400 mt-0.5">Thời gian: {report.createdAt}</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-rose-50/50 border border-rose-100">
                    <span className="text-rose-400 block text-[10px]">Đối tượng bị phản ánh:</span>
                    <strong className="text-rose-900">
                      {report.reportedUserName || report.reportedRestaurantName || 'Thành viên ghép bàn'}
                    </strong>
                    <p className="text-[10px] text-rose-500 mt-0.5">Bàn tiệc liên quan: {report.sessionId || 'N/A'}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100 leading-relaxed">
                  <strong>Nội dung phản ánh:</strong> {report.detail}
                </p>

                {report.penaltyApplied && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span><strong>Kết quả xử lý:</strong> {report.penaltyApplied}</span>
                  </div>
                )}

                {report.status === 'PENDING' && (
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2 text-xs">
                    <button
                      onClick={() => handleResolveReport(report, 'DISMISS')}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold"
                    >
                      Bác Đơn (Không vi phạm)
                    </button>
                    <button
                      onClick={() => handleResolveReport(report, 'VOUCHER')}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold flex items-center gap-1 shadow-xs"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>Đền Bù Voucher 50k</span>
                    </button>
                    <button
                      onClick={() => handleResolveReport(report, 'PENALTY')}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black flex items-center gap-1 shadow-sm"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Trừ -0.5★ Uy Tín & Cảnh Cáo</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: VOUCHERS & PLATFORM CAMPAIGNS (VOUCHER TOÀN SÀN KÍCH CẦU) */}
      {/* ========================================================================= */}
      {activeTab === 'vouchers' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <Gift className="w-4 h-4 text-amber-500" />
                <span>Chiến Dịch Voucher Toàn Sàn Chạm Đũa Tài Trợ</span>
              </h3>
              <p className="text-xs text-slate-500">Mã ưu đãi nhóm do nền tảng Chạm Đũa trợ giá để kích cầu đặt bàn giờ thấp điểm</p>
            </div>

            <button
              onClick={() => setIsAddCampaignModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-white font-black text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Mã Ưu Đãi Mới</span>
            </button>
          </div>

          {/* Campaigns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map((camp) => (
              <div
                key={camp.id}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-sm font-black px-2.5 py-1 bg-amber-50 text-amber-900 rounded-xl border border-amber-300">
                      🎟️ {camp.code}
                    </span>
                    <h4 className="font-black text-base text-slate-900 mt-2.5">{camp.title}</h4>
                    <span className="text-xs font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full inline-block mt-1">
                      {camp.discount}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleCampaign(camp.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                      camp.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {camp.status === 'ACTIVE' ? 'Đang chạy' : 'Tạm dừng'}
                  </button>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 grid grid-cols-3 gap-2 text-[11px] text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Quy mô nhóm:</span>
                    <strong>Từ {camp.minGroup} người</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Đã sử dụng:</span>
                    <strong className="text-brand-600">{camp.usedCount} lượt</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Hạn dùng:</span>
                    <strong>{camp.expiry}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span>Ngân sách tài trợ: <strong>{formatCurrency(camp.budget)}</strong></span>
                  <span className="text-slate-400">Áp dụng: {camp.targetCategory || 'Tất cả'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: FINANCE & COMMISSION PAYOUTS (TÀI CHÍNH & ĐỐI SOÁT F&B) */}
      {/* ========================================================================= */}
      {activeTab === 'finance' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Bảng Đối Soát Doanh Thu & Hoa Hồng Nền Tảng Chạm Đũa</span>
              </h3>
              <p className="text-xs text-slate-500">Giám sát dòng tiền thanh toán bàn ăn, trích xuất hoa hồng và chuyển khoản định kỳ cho đối tác</p>
            </div>
          </div>

          {/* Payouts Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4 font-black">Đối Tác Nhà Hàng</th>
                    <th className="p-4 font-black">Kỳ Đối Soát</th>
                    <th className="p-4 font-black">Tổng GMV Bàn Ăn</th>
                    <th className="p-4 font-black">Hoa Hồng Sàn (%)</th>
                    <th className="p-4 font-black">Phí Sàn Giữ Lại</th>
                    <th className="p-4 font-black">Thực Chuyển Nhà Hàng</th>
                    <th className="p-4 font-black">Trạng Thái</th>
                    <th className="p-4 font-black text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {payouts.map((pay) => (
                    <tr key={pay.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 font-bold text-slate-900">{pay.restaurantName}</td>
                      <td className="p-4 text-slate-500">{pay.period}</td>
                      <td className="p-4 font-black text-slate-900">{formatCurrency(pay.totalGMV)}</td>
                      <td className="p-4 font-bold text-amber-600">{pay.commissionRate}%</td>
                      <td className="p-4 font-bold text-slate-900">{formatCurrency(pay.commissionFee)}</td>
                      <td className="p-4 font-black text-emerald-600">{formatCurrency(pay.netPayout)}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          pay.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800 animate-pulse'
                        }`}>
                          {pay.status === 'PAID' ? '✓ Đã thanh toán' : '⏳ Chờ đối soát'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {pay.status === 'PENDING' ? (
                          <button
                            onClick={() => handleConfirmPayout(pay.id)}
                            className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                          >
                            Xác Nhận Đã Chuyển
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">Đã chi trả: {pay.payoutDate}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: XEM CHI TIẾT ĐỐI TÁC NHÀ HÀNG & CẤU HÌNH HOA HỒNG */}
      {/* ========================================================================= */}
      {selectedRestDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal header with cover image */}
            <div className="h-48 relative overflow-hidden">
              <img
                src={selectedRestDetail.coverImage}
                alt={selectedRestDetail.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <button
                onClick={() => setSelectedRestDetail(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black"
              >
                ✕
              </button>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  {selectedRestDetail.category}
                </span>
                <h3 className="text-xl font-black">{selectedRestDetail.name}</h3>
                <p className="text-xs text-slate-300 mt-0.5">{selectedRestDetail.address}</p>
              </div>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {/* Quick Commission & Badge Controls */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Cấu hình hoa hồng sàn Chạm Đũa (% Take-rate):
                  </label>
                  <select
                    value={selectedRestDetail.commissionRate || 10}
                    onChange={(e) => handleUpdateCommission(selectedRestDetail.id, Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300 text-xs font-black text-amber-900 focus:outline-none"
                  >
                    <option value={8}>8% (Quán đối tác thân thiết lâu năm)</option>
                    <option value={10}>10% (Tỷ lệ tiêu chuẩn toàn sàn)</option>
                    <option value={12}>12% (Kèm gói đẩy hiển thị Banner)</option>
                    <option value={15}>15% (Gói VIP ưu tiên gom khách số 1)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Huy hiệu vinh danh nhà hàng:
                  </label>
                  <select
                    value={selectedRestDetail.badge || 'VERIFIED'}
                    onChange={(e) => handleUpdateBadge(selectedRestDetail.id, e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300 text-xs font-black text-amber-900 focus:outline-none"
                  >
                    <option value="VERIFIED">🛡️ Đối Tác Đã Xác Thực</option>
                    <option value="GOLD">🥇 Quán Ăn Xuất Sắc</option>
                    <option value="DIAMOND">💎 Đối Tác Kim Cương</option>
                    <option value="MICHELIN">🌟 Tuyển Chọn Michelin</option>
                  </select>
                </div>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Hotline:</span>
                  <strong className="text-slate-800">{selectedRestDetail.phone}</strong>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Giờ mở cửa:</span>
                  <strong className="text-slate-800">{selectedRestDetail.openHours}</strong>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Sức chứa:</span>
                  <strong className="text-slate-800">{selectedRestDetail.capacity || 120} chỗ</strong>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Đánh giá:</span>
                  <strong className="text-amber-600 font-black">★ {selectedRestDetail.rating} / 5.0</strong>
                </div>
              </div>

              {/* Featured Dishes List */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2">Thực Đơn Chữ Ký (Signature Dishes):</h4>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedRestDetail.featuredDishes || ['Lẩu Tứ Xuyên Cay Nồng', 'Bò Mỹ Nướng Cuộn Nấm', 'Múa Mì Kéo Tay']).map((d, i) => (
                    <span key={i} className="px-3 py-1 rounded-xl bg-brand-50 text-brand-800 font-bold border border-brand-200">
                      🍲 {d}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRestDetail(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-sm hover:bg-slate-800"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: THÊM NHÀ HÀNG ĐỐI TÁC MỚI */}
      {/* ========================================================================= */}
      {isAddRestModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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
                    <option value="Lẩu Trung Hoa & Hồng Kông">Lẩu Trung Hoa & Hồng Kông</option>
                    <option value="Nướng BBQ Hàn Quốc">Nướng BBQ Hàn Quốc</option>
                    <option value="Ốc & Hải Sản Sài Gòn">Ốc & Hải Sản Sài Gòn</option>
                    <option value="Ẩm Thực Nhật Bản (Sushi, Ramen)">Ẩm Thực Nhật Bản</option>
                    <option value="Cơm & Món Việt">Cơm & Món Việt</option>
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sức chứa bàn (chỗ ngồi)</label>
                  <input
                    type="number"
                    value={newRestCapacity}
                    onChange={(e) => setNewRestCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tỷ lệ hoa hồng sàn (%)</label>
                  <input
                    type="number"
                    value={newRestCommission}
                    onChange={(e) => setNewRestCommission(Number(e.target.value))}
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
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-black text-xs shadow-md transition-all"
                >
                  Xác Nhận Thêm Đối Tác
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: PHÁT HÀNH CHIẾN DỊCH VOUCHER TOÀN SÀN MỚI */}
      {/* ========================================================================= */}
      {isAddCampaignModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 bg-gradient-to-r from-amber-500 to-brand-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
                <h3 className="font-black text-base">Phát Hành Voucher Sàn Kích Cầu</h3>
              </div>
              <button
                onClick={() => setIsAddCampaignModalOpen(false)}
                className="text-white hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="p-5 space-y-3.5">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mã Voucher *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: LAUNHOM80K"
                    value={campCode}
                    onChange={(e) => setCampCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:outline-none focus:border-brand-500 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mức giảm giá *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Giảm 80.000đ"
                    value={campDiscount}
                    onChange={(e) => setCampDiscount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tiêu đề chiến dịch *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Trợ Giá Bữa Lẩu & Nướng Cuối Tuần"
                  value={campTitle}
                  onChange={(e) => setCampTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Quy mô nhóm tối thiểu</label>
                  <input
                    type="number"
                    min={2}
                    value={campMinGroup}
                    onChange={(e) => setCampMinGroup(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ngân sách tài trợ (VNĐ)</label>
                  <input
                    type="number"
                    value={campBudget}
                    onChange={(e) => setCampBudget(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddCampaignModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md transition-all"
                >
                  Phát Hành Chiến Dịch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
