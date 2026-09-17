import React, { useState, useMemo } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  Search,
  SlidersHorizontal,
  Plus,
  Sparkles,
  DollarSign,
  Utensils,
  Clock,
  ArrowRight,
  Check,
  MessageSquare,
  Compass,
  X
} from 'lucide-react';
import { User, FutureDiningPost } from '../types';
import { storageService } from '../services/storageService';
import { calculateDistanceKm, formatDistance } from '../utils/geo';

interface NearbyFuturePostsViewProps {
  currentUser: User;
  onOpenFeedWithSession?: (sessionId: string) => void;
}

export const NearbyFuturePostsView: React.FC<NearbyFuturePostsViewProps> = ({
  currentUser
}) => {
  const [posts, setPosts] = useState<FutureDiningPost[]>(() => storageService.getFuturePosts());
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortBy, setSortBy] = useState<'NEAREST' | 'DATE' | 'SLOTS'>('NEAREST');
  const [maxDistance, setMaxDistance] = useState<number | 'ALL'>('ALL');

  // Create post modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [cravingDish, setCravingDish] = useState('');
  const [preferredArea, setPreferredArea] = useState('Quận 1, TP. Hồ Chí Minh');
  const [targetDate, setTargetDate] = useState('Tối Thứ Bảy tuần này (19:30)');
  const [restaurantSuggestion, setRestaurantSuggestion] = useState('Chưa chốt quán, cùng bàn luận khi đủ team');
  const [targetSlots, setTargetSlots] = useState(4);
  const [budgetPerPerson, setBudgetPerPerson] = useState('150.000đ - 250.000đ');
  const [description, setDescription] = useState('');

  const userLat = currentUser.location.lat;
  const userLng = currentUser.location.lng;

  const refreshPosts = () => {
    setPosts(storageService.getFuturePosts());
  };

  // Filtered and sorted posts
  const filteredPosts = useMemo(() => {
    return posts
      .map((post) => {
        const distanceKm = calculateDistanceKm(userLat, userLng, post.lat, post.lng);
        return { ...post, distanceKm };
      })
      .filter((post) => {
        const matchSearch =
          post.cravingDish.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          post.preferredArea.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          post.description.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          (post.restaurantSuggestion && post.restaurantSuggestion.toLowerCase().includes(searchKeyword.toLowerCase()));

        const matchDist = maxDistance === 'ALL' || post.distanceKm <= maxDistance;

        return matchSearch && matchDist;
      })
      .sort((a, b) => {
        if (sortBy === 'NEAREST') return a.distanceKm - b.distanceKm;
        if (sortBy === 'SLOTS') return b.joinedUsers.length - a.joinedUsers.length;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [posts, searchKeyword, maxDistance, sortBy, userLat, userLng]);

  // Handle join future post
  const handleJoinPost = (post: FutureDiningPost) => {
    const isJoined = post.joinedUsers.some((u) => u.userId === currentUser.id);
    if (isJoined) {
      alert('Bạn đã tham gia kèo ăn này rồi! Hãy chờ chủ bài đăng liên hệ chốt quán nhé.');
      return;
    }

    const note = prompt(
      `Gửi lời nhắn tới ${post.userName} (VD: Mình thích ăn thịt nướng, có thể đi được đúng giờ):`,
      'Mình đăng ký 1 slot nhé, rất vui được làm quen!'
    );

    if (note !== null) {
      storageService.joinFuturePost(post.id, currentUser, note);
      refreshPosts();
      alert(`🎉 Bạn đã tham gia kèo "${post.cravingDish}" thành công!`);
    }
  };

  // Handle submit new future post
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cravingDish.trim()) {
      alert('Vui lòng nhập món ăn bạn muốn rủ đi ăn!');
      return;
    }

    storageService.createFuturePost(
      {
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        cravingDish: cravingDish.trim(),
        preferredArea: preferredArea.trim(),
        targetDate: targetDate.trim(),
        lat: currentUser.location.lat,
        lng: currentUser.location.lng,
        restaurantSuggestion: restaurantSuggestion.trim() || 'Chưa chốt quán, cùng bàn luận khi đủ team',
        targetSlots: Number(targetSlots),
        budgetPerPerson: budgetPerPerson.trim(),
        description: description.trim() || 'Lên kèo tìm bạn cùng gu ăn uống, vui vẻ hòa đồng và chia bill sòng phẳng!'
      },
      currentUser
    );

    setIsCreateModalOpen(false);
    setCravingDish('');
    setDescription('');
    refreshPosts();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* BANNER HEADER */}
      <div className="bg-gradient-to-r from-amber-500 via-brand-500 to-rose-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-amber-100">
            <Calendar className="w-3.5 h-3.5 text-amber-200" /> Kèo Ăn Hẹn Lịch Xa • Gợi Ý Món Ngon
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-3 leading-tight">
            Thèm Món Gì Cho Cuối Tuần? <br className="hidden sm:inline" />
            Lên Kèo Tìm Bạn Trước — Quán Chọn Sau!
          </h1>
          <p className="text-sm text-amber-50 mt-2 leading-relaxed">
            Chưa cần biết chính xác quán nào, bạn chỉ cần đăng món mình đang thèm (buffet nướng, lẩu, đồ ngọt...) và thời gian dự kiến. Những người bạn ở gần sẽ cùng join vào và bàn luận chọn quán phù hợp nhất!
          </p>

          <div className="mt-5">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-brand-700 font-extrabold text-sm shadow-lg shadow-black/10 flex items-center gap-2 transform active:scale-95 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Đăng Kèo Hẹn Lịch Mới (Chưa Cần Chọn Quán)</span>
            </button>
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Tìm theo món thèm (thịt nướng, lẩu thái, ốc...), khu vực (Quận 1, Cầu Giấy...)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap justify-end text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-500">Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-700 focus:outline-none focus:border-brand-500"
            >
              <option value="NEAREST">📍 Gần tôi nhất</option>
              <option value="SLOTS">👥 Đông người tham gia nhất</option>
              <option value="DATE">⏰ Mới đăng</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-500">Bán kính:</span>
            <select
              value={maxDistance}
              onChange={(e) => setMaxDistance(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-700 focus:outline-none focus:border-brand-500"
            >
              <option value="ALL">Tất cả khoảng cách</option>
              <option value={2}>Trong 2 km</option>
              <option value={5}>Trong 5 km</option>
              <option value={10}>Trong 10 km</option>
            </select>
          </div>
        </div>
      </div>

      {/* POSTS GRID */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
          <span>Kèo Hẹn Ăn Uống Xa Gần Bạn</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-700 font-extrabold">
            {filteredPosts.length} bài đăng
          </span>
        </h2>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
          <Utensils className="w-12 h-12 text-brand-400 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800 text-base">Chưa có bài đăng hẹn lịch nào phù hợp</h3>
          <p className="text-xs text-slate-500 mt-1">Hãy là người đầu tiên lên kèo món bạn muốn ăn cho cuối tuần!</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-4 px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs"
          >
            Đăng Kèo Mới Ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPosts.map((post) => {
            const isUserJoined = post.joinedUsers.some((u) => u.userId === currentUser.id);
            const isFull = post.joinedUsers.length >= post.targetSlots;

            return (
              <div
                key={post.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-xl hover:border-amber-400 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div>
                  {/* Author Header & Distance */}
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={post.userAvatar}
                        alt={post.userName}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{post.userName}</h4>
                        <span className="text-[10px] text-slate-400">{post.createdAt}</span>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-brand-600" />
                      <span>Cách {formatDistance(post.distanceKm)}</span>
                    </span>
                  </div>

                  {/* Craving Dish Highlight */}
                  <div className="mt-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1">
                      <Utensils className="w-3 h-3" /> Món thèm / Muốn rủ ăn:
                    </span>
                    <h3 className="text-base font-black text-slate-900 mt-0.5 group-hover:text-brand-600 transition-colors">
                      {post.cravingDish}
                    </h3>
                  </div>

                  {/* Date & Area Info Box */}
                  <div className="mt-3 p-3 bg-amber-50/60 rounded-2xl border border-amber-200/70 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-800">
                      <Calendar className="w-4 h-4 text-brand-600 flex-shrink-0" />
                      <span>Lịch hẹn: <strong>{post.targetDate}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-800">
                      <Compass className="w-4 h-4 text-brand-600 flex-shrink-0" />
                      <span>Khu vực: <strong>{post.preferredArea}</strong></span>
                    </div>
                    {post.restaurantSuggestion && (
                      <div className="flex items-center gap-2 text-slate-600 text-[11px]">
                        <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <span>Gợi ý quán: <em>{post.restaurantSuggestion}</em></span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-slate-800 text-[11px] pt-1 border-t border-amber-200/50">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>Ngân sách dự kiến: <strong>{post.budgetPerPerson}</strong></span>
                    </div>
                  </div>

                  {/* Description / Note */}
                  <p className="text-xs text-slate-600 mt-3 leading-relaxed line-clamp-3">
                    "{post.description}"
                  </p>

                  {/* Joined Members Progress */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-slate-700 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-brand-600" />
                        Đã tham gia:
                      </span>
                      <span className="font-extrabold text-brand-600">
                        {post.joinedUsers.length}/{post.targetSlots} người
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2 overflow-hidden items-center">
                        {post.joinedUsers.map((u) => (
                          <img
                            key={u.userId}
                            src={u.userAvatar}
                            alt={u.userName}
                            title={`${u.userName} (${u.note || ''})`}
                            className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover"
                          />
                        ))}
                        {Array.from({ length: Math.max(0, post.targetSlots - post.joinedUsers.length) }).map((_, idx) => (
                          <div
                            key={idx}
                            className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] text-slate-400 font-bold"
                          >
                            +
                          </div>
                        ))}
                      </div>

                      {isFull && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          Đã đủ team
                        </span>
                      )}
                    </div>
                  </div>

                </div>

                {/* Bottom Join CTA */}
                <div className="pt-2">
                  <button
                    onClick={() => handleJoinPost(post)}
                    disabled={isFull && !isUserJoined}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                      isUserJoined
                        ? 'bg-emerald-600 text-white'
                        : isFull
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20'
                    }`}
                  >
                    {isUserJoined ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Bạn Đã Tham Gia Kèo Này</span>
                      </>
                    ) : isFull ? (
                      <span>Đã Đủ Người Tham Gia</span>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tham Gia Kèo Ăn Này</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* CREATE FUTURE POST MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            
            <div className="p-5 bg-gradient-to-r from-amber-500 to-brand-500 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <div>
                  <h3 className="font-extrabold text-base">Đăng Kèo Hẹn Lịch Xa (Gợi Ý Món)</h3>
                  <p className="text-xs text-amber-100">Chưa cần chọn quán, rủ bạn bè cùng gu trước!</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="w-7 h-7 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-3.5 max-h-[80vh] overflow-y-auto text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Món bạn đang thèm / Gợi ý món muốn ăn: *
                </label>
                <input
                  type="text"
                  required
                  value={cravingDish}
                  onChange={(e) => setCravingDish(e.target.value)}
                  placeholder="VD: Buffet nướng Hàn Quốc, Lẩu Haidilao, Ốc Sài Gòn..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 font-bold focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Ngày & Giờ hẹn dự kiến: *
                  </label>
                  <input
                    type="text"
                    required
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    placeholder="VD: Tối Thứ 7 (19:30), Cuối tuần tới..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Khu vực muốn ăn: *
                  </label>
                  <input
                    type="text"
                    required
                    value={preferredArea}
                    onChange={(e) => setPreferredArea(e.target.value)}
                    placeholder="VD: Quận 1, Quận 3, Bình Thạnh..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Quán gợi ý (không bắt buộc):
                </label>
                <input
                  type="text"
                  value={restaurantSuggestion}
                  onChange={(e) => setRestaurantSuggestion(e.target.value)}
                  placeholder="VD: Gogi House hoặc chưa chọn quán, lập team xong cùng bàn..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Số lượng người cần tuyển:
                  </label>
                  <select
                    value={targetSlots}
                    onChange={(e) => setTargetSlots(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-brand-500"
                  >
                    <option value={2}>2 người</option>
                    <option value={3}>3 người</option>
                    <option value={4}>4 người (chuẩn bàn nướng/lẩu)</option>
                    <option value={5}>5 người</option>
                    <option value={6}>6 người</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Ngân sách dự kiến:
                  </label>
                  <input
                    type="text"
                    value={budgetPerPerson}
                    onChange={(e) => setBudgetPerPerson(e.target.value)}
                    placeholder="VD: 150k - 250k/người"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nội dung rủ rê & Gu ăn uống:
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Chia sẻ lý do thèm món này, mong muốn tìm bạn như thế nào..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-brand-500 text-white font-extrabold text-xs shadow-md shadow-brand-500/20 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Đăng Kèo Lên Cộng Đồng Gần Bạn</span>
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
