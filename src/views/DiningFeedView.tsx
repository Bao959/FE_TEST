import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  Plus,
  Users,
  Clock,
  MapPin,
  Star,
  Tag,
  Sparkles,
  MessageCircle,
  ArrowRight,
  Filter,
  CheckCircle2,
  Building
} from 'lucide-react';
import { DiningSession, User, Restaurant } from '../types';
import { storageService } from '../services/storageService';
import { CreateSessionModal } from '../components/dining/CreateSessionModal';
import { DiscussionRoomModal } from './DiscussionRoomModal';
import { calculateDistanceKm, formatDistance } from '../utils/geo';

interface DiningFeedViewProps {
  currentUser: User;
  onOpenDeals: () => void;
  targetSessionId?: string | null;
  clearTargetSessionId?: () => void;
}

export const DiningFeedView: React.FC<DiningFeedViewProps> = ({
  currentUser,
  onOpenDeals,
  targetSessionId,
  clearTargetSessionId
}) => {
  const [sessions, setSessions] = useState<DiningSession[]>(() => storageService.getSessions());
  const restaurants = storageService.getRestaurants();

  // Search & Filter States
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState<'NEAREST' | 'RATING' | 'VOUCHER' | 'NEWEST'>('NEAREST');
  
  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeDiscussionSession, setActiveDiscussionSession] = useState<DiningSession | null>(() => {
    if (targetSessionId) {
      return storageService.getSession(targetSessionId) || null;
    }
    return null;
  });

  // User simulated GPS (District 1)
  const userLat = currentUser.location.lat;
  const userLng = currentUser.location.lng;

  // Categories list
  const categories = ['ALL', 'Lẩu Trung Hoa', 'Nướng BBQ Hàn Quốc', 'Ốc & Hải Sản', 'Lẩu Bò & Đặc Sản'];

  // Refresh sessions helper
  const refreshSessions = () => {
    setSessions(storageService.getSessions());
  };

  // Filtered & Sorted Sessions
  const filteredSessions = useMemo(() => {
    return sessions
      .filter((session) => {
        // Keyword match on restaurant name, title, note
        const matchSearch =
          session.restaurantName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          session.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          session.note.toLowerCase().includes(searchKeyword.toLowerCase());

        // Category match
        const rest = restaurants.find((r) => r.id === session.restaurantId);
        const matchCategory =
          selectedCategory === 'ALL' || (rest && rest.category.toLowerCase().includes(selectedCategory.toLowerCase()));

        return matchSearch && matchCategory;
      })
      .sort((a, b) => {
        const restA = restaurants.find((r) => r.id === a.restaurantId);
        const restB = restaurants.find((r) => r.id === b.restaurantId);

        if (sortBy === 'NEAREST') {
          const distA = restA ? calculateDistanceKm(userLat, userLng, restA.lat, restA.lng) : 999;
          const distB = restB ? calculateDistanceKm(userLat, userLng, restB.lat, restB.lng) : 999;
          return distA - distB;
        }
        if (sortBy === 'RATING') {
          const ratingA = restA ? restA.rating : 0;
          const ratingB = restB ? restB.rating : 0;
          return ratingB - ratingA;
        }
        if (sortBy === 'VOUCHER') {
          const hasVoucherA = a.voucherApplied ? 1 : 0;
          const hasVoucherB = b.voucherApplied ? 1 : 0;
          return hasVoucherB - hasVoucherA;
        }
        // NEWEST
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [sessions, searchKeyword, selectedCategory, sortBy, restaurants, userLat, userLng]);

  // Join table action
  const handleJoinSession = (session: DiningSession) => {
    const isAlreadyMember = session.joinedMembers.some((m) => m.userId === currentUser.id);
    if (isAlreadyMember) {
      setActiveDiscussionSession(session);
      return;
    }

    const intro = prompt(
      `Bạn muốn gửi lời chào/sở thích gì tới nhóm bàn ăn ${session.restaurantName}?`,
      `Chào mọi người, mình là ${currentUser.name}. Mình rất mong được cùng ăn và trò chuyện!`
    );

    if (intro !== null) {
      const updated = storageService.joinSession(session.id, currentUser, intro);
      if (updated) {
        refreshSessions();
        setActiveDiscussionSession(updated);
      }
    }
  };

  // Quick fill simulation for a card
  const handleQuickAutoFill = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = storageService.autoFillStrangers(sessionId);
    if (updated) {
      refreshSessions();
      setActiveDiscussionSession(updated);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* HERO BANNER & CTA */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 via-orange-600 to-amber-500 p-6 sm:p-8 text-white shadow-xl shadow-brand-500/15">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-amber-100">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Bữa ăn đông vui • Chia nhỏ chi phí
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-3 leading-tight">
            Bạn Đang Thèm Món Gì? <br className="hidden sm:inline" />
            Tìm Bạn Ăn Chung Ngay Bây Giờ!
          </h1>
          <p className="text-sm text-brand-100 mt-2 leading-relaxed max-w-xl">
            Đi ăn một mình thì ngán và không gọi được nhiều món, đi ăn chung vừa vui vừa mở khóa voucher giảm giá nhóm của nhà hàng!
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-brand-600 font-extrabold text-sm shadow-lg shadow-black/10 flex items-center gap-2 transform active:scale-95 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Đăng Bài Tìm Bạn Ăn Chung</span>
            </button>

            <button
              onClick={onOpenDeals}
              className="px-5 py-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-sm backdrop-blur-md flex items-center gap-2 transition-all"
            >
              <Tag className="w-4 h-4 text-amber-300" />
              <span>Khám Phá Ưu Đãi Nhóm Gần Nhất</span>
            </button>
          </div>
        </div>

        {/* Decorative background food illustration / blur circle */}
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="hidden lg:block absolute right-10 bottom-6 text-8xl opacity-30 select-none">
          🍲 🥩
        </div>
      </div>

      {/* SEARCH, SORT & CATEGORIES FILTER BAR */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200/80 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Keyword Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Tìm theo món ăn, tên nhà hàng (Haidilao, Gogi, Lẩu bò...), hoặc địa chỉ..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-500"
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Sắp xếp:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-brand-500"
            >
              <option value="NEAREST">📍 Gần vị trí của tôi nhất</option>
              <option value="VOUCHER">🎁 Có Voucher nhóm khủng</option>
              <option value="RATING">★ Đánh giá sao cao nhất</option>
              <option value="NEWEST">⏰ Bài đăng mới nhất</option>
            </select>
          </div>

        </div>

        {/* Category Tags */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'ALL' ? '🍽️ Tất cả món' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* FEED LIST HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>Bàn Ăn Đang Gom & Tìm Người</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-700 font-extrabold">
              {filteredSessions.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Chọn bàn phù hợp để tham gia hoặc tạo bàn mới của riêng bạn</p>
        </div>
      </div>

      {/* SESSIONS GRID */}
      {filteredSessions.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-500 flex items-center justify-center mx-auto mb-3 text-2xl">
            🍲
          </div>
          <h3 className="text-base font-bold text-slate-800">Chưa tìm thấy bàn ăn nào phù hợp</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Hãy thử tìm kiếm với từ khóa khác, hoặc tự mình tạo ngay một bàn ăn mới để chiêu mộ những người bạn xung quanh!
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-4 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-all"
          >
            Tạo bàn mới ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSessions.map((session) => {
            const rest = restaurants.find((r) => r.id === session.restaurantId);
            const distance = rest ? calculateDistanceKm(userLat, userLng, rest.lat, rest.lng) : null;
            const isUserJoined = session.joinedMembers.some((m) => m.userId === currentUser.id);
            const isFull = session.joinedMembers.length >= session.targetSlots;
            const isLocked = session.status === 'LOCKED';

            return (
              <div
                key={session.id}
                onClick={() => setActiveDiscussionSession(session)}
                className="bg-white rounded-2xl border border-slate-200 hover:border-brand-400 hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Card Cover & Badges */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                    <img
                      src={session.restaurantImage}
                      alt={session.restaurantName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      {session.voucherApplied ? (
                        <span className="px-2.5 py-1 rounded-lg bg-red-600/90 backdrop-blur-xs text-white text-[11px] font-extrabold flex items-center gap-1 shadow-md">
                          <Tag className="w-3 h-3" />
                          {session.voucherApplied.discountValue}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-xs text-white text-[11px] font-medium">
                          Ăn chia bill
                        </span>
                      )}

                      {/* Status Badge */}
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs shadow-sm ${
                        isLocked
                          ? 'bg-emerald-600 text-white'
                          : isFull
                          ? 'bg-amber-500 text-white'
                          : 'bg-brand-500 text-white'
                      }`}>
                        {isLocked ? 'Đã Chốt' : isFull ? 'Đủ Người • Đang Thảo Luận' : 'Đang Tuyển Bạn'}
                      </span>
                    </div>

                    {/* Bottom overlay info on image */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-amber-300">{rest?.category}</span>
                        {distance !== null && (
                          <span className="flex items-center gap-1 text-[11px] text-slate-200">
                            <MapPin className="w-3 h-3 text-brand-400" />
                            Cách {formatDistance(distance)}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-base leading-tight truncate">{session.restaurantName}</h3>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3">
                    
                    {/* Session Title & Note */}
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 line-clamp-1 group-hover:text-brand-600 transition-colors">
                        {session.title}
                      </h4>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                        "{session.note}"
                      </p>
                    </div>

                    {/* Time & Registered status */}
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-brand-600" />
                        <span>{session.eatingTime}</span>
                      </div>
                      {session.isRestaurantRegistered ? (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Building className="w-3 h-3" /> Đặt qua App
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          Tự gọi giữ chỗ
                        </span>
                      )}
                    </div>

                    {/* Members Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-slate-700 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-brand-600" />
                          Tiến độ gom bàn:
                        </span>
                        <span className="font-extrabold text-brand-600">
                          {session.joinedMembers.length}/{session.targetSlots} người
                        </span>
                      </div>

                      {/* Progress bar track */}
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isFull ? 'bg-emerald-500' : 'bg-brand-500'
                          }`}
                          style={{
                            width: `${Math.min(100, (session.joinedMembers.length / session.targetSlots) * 100)}%`
                          }}
                        />
                      </div>

                      {/* Avatars of members */}
                      <div className="flex items-center justify-between mt-2.5">
                        <div className="flex -space-x-2 overflow-hidden items-center">
                          {session.joinedMembers.map((m) => (
                            <img
                              key={m.userId}
                              src={m.avatar}
                              alt={m.name}
                              title={`${m.name} ${m.isHost ? '(Chủ bàn)' : ''}`}
                              className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover"
                            />
                          ))}
                          {Array.from({ length: Math.max(0, session.targetSlots - session.joinedMembers.length) }).map((_, idx) => (
                            <div
                              key={idx}
                              className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] text-slate-500 font-bold"
                            >
                              ?
                            </div>
                          ))}
                        </div>

                        {/* Demo quick auto fill button */}
                        {!isFull && !isLocked && (
                          <button
                            onClick={(e) => handleQuickAutoFill(session.id, e)}
                            className="text-[10px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-md border border-amber-200 flex items-center gap-1 transition-colors"
                            title="Giả lập thêm người lạ vào bàn ăn ngay"
                          >
                            <Sparkles className="w-3 h-3 text-amber-600" />
                            <span>+ Fill người lạ</span>
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Card Bottom CTA */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500">
                    Tạo bởi: <strong className="text-slate-800">{session.hostName}</strong>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJoinSession(session);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs ${
                      isUserJoined || isFull || isLocked
                        ? 'bg-slate-800 hover:bg-slate-900 text-white'
                        : 'bg-brand-600 hover:bg-brand-700 text-white'
                    }`}
                  >
                    {isLocked ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Xem Bàn Đã Chốt</span>
                      </>
                    ) : isUserJoined ? (
                      <>
                        <MessageCircle className="w-3.5 h-3.5 text-brand-300" />
                        <span>Phòng Thảo Luận</span>
                      </>
                    ) : isFull ? (
                      <>
                        <Users className="w-3.5 h-3.5" />
                        <span>Xem Thảo Luận</span>
                      </>
                    ) : (
                      <>
                        <Users className="w-3.5 h-3.5" />
                        <span>Tham Gia Bàn</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* CREATE SESSION MODAL */}
      {isCreateModalOpen && (
        <CreateSessionModal
          currentUser={currentUser}
          restaurants={restaurants}
          onClose={() => setIsCreateModalOpen(false)}
          onSessionCreated={(newId) => {
            setIsCreateModalOpen(false);
            refreshSessions();
            const created = storageService.getSession(newId);
            if (created) setActiveDiscussionSession(created);
          }}
        />
      )}

      {/* DISCUSSION ROOM MODAL */}
      {activeDiscussionSession && (
        <DiscussionRoomModal
          session={activeDiscussionSession}
          currentUser={currentUser}
          onClose={() => {
            setActiveDiscussionSession(null);
            if (clearTargetSessionId) clearTargetSessionId();
            refreshSessions();
          }}
          onSessionUpdated={(updated) => {
            setActiveDiscussionSession(updated);
            refreshSessions();
          }}
        />
      )}

    </div>
  );
};
