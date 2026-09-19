import React, { useState } from 'react';
import {
  User as UserIcon,
  Settings,
  Heart,
  MessageSquare,
  Plus,
  Tag,
  Users,
  MapPin,
  Star,
  Sparkles,
  Edit3,
  Check,
  X,
  Share2,
  Image as ImageIcon
} from 'lucide-react';
import { User, UserPost } from '../types';
import { storageService } from '../services/storageService';

interface UserProfileViewProps {
  currentUser: User;
  onUserUpdated: (user: User) => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  currentUser,
  onUserUpdated
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'posts' | 'preferences' | 'friends'>('posts');
  const [posts, setPosts] = useState<UserPost[]>(() => storageService.getPosts());
  const allUsers = storageService.getUsers();

  // Edit profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(currentUser.name);
  const [editBio, setEditBio] = useState(currentUser.bio);
  const [editAddress, setEditAddress] = useState(currentUser.location.address);

  // New Post Form
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostRestaurant, setNewPostRestaurant] = useState('');
  const [newPostImage, setNewPostImage] = useState('https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80');

  // Preferences tag state
  const [newTagInput, setNewTagInput] = useState('');

  // Friend preview modal
  const [previewFriend, setPreviewFriend] = useState<User | null>(null);

  // Save profile edits
  const handleSaveProfile = () => {
    const updated: User = {
      ...currentUser,
      name: editName,
      bio: editBio,
      location: {
        ...currentUser.location,
        address: editAddress
      }
    };
    storageService.updateUser(updated);
    onUserUpdated(updated);
    setIsEditingProfile(false);
  };

  // Add food preference tag
  const handleAddTag = (tagToAdd?: string) => {
    const tag = tagToAdd || newTagInput.trim();
    if (!tag || currentUser.foodPreferences.includes(tag)) return;

    const updated: User = {
      ...currentUser,
      foodPreferences: [...currentUser.foodPreferences, tag]
    };
    storageService.updateUser(updated);
    onUserUpdated(updated);
    setNewTagInput('');
  };

  // Remove food preference tag
  const handleRemoveTag = (tagToRemove: string) => {
    const updated: User = {
      ...currentUser,
      foodPreferences: currentUser.foodPreferences.filter((t) => t !== tagToRemove)
    };
    storageService.updateUser(updated);
    onUserUpdated(updated);
  };

  // Create post
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    storageService.createPost({
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content: newPostContent.trim(),
      restaurantName: newPostRestaurant.trim() || undefined,
      image: newPostImage || undefined
    });

    setNewPostContent('');
    setNewPostRestaurant('');
    setPosts(storageService.getPosts());
  };

  // Like post
  const handleLikePost = (postId: string) => {
    storageService.likePost(postId);
    setPosts(storageService.getPosts());
  };

  // Friend list objects
  const friendsList = allUsers.filter((u) => currentUser.friends.includes(u.id));

  // Preset preference recommendations
  const recommendedTags = [
    'Lẩu & Nướng',
    'Ăn cay cấp 3',
    'Không ăn hành',
    'Món Hàn Quốc',
    'Buffet hải sản',
    'Ăn vặt vỉa hè',
    'Trà sữa & Đồ ngọt',
    'Budget 100k - 200k'
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* PROFILE HEADER CARD */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="h-32 bg-gradient-to-r from-brand-600 via-orange-500 to-amber-500 relative" />
        
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16 mb-4">
            
            {/* Avatar & Basic Info */}
            <div className="flex items-end gap-4">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg bg-white"
              />
              <div className="mb-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900">{currentUser.name}</h1>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-brand-100 text-brand-700">
                    {currentUser.role === 'restaurant' ? 'Chủ Nhà Hàng' : 'Foodie Thành Viên'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-600" />
                  <span>{currentUser.location.address}</span>
                </p>
              </div>
            </div>

            {/* Stats & Edit Button */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-4 text-center px-4 py-2 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <div className="font-extrabold text-amber-600 flex items-center justify-center gap-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{currentUser.trustScore}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Điểm uy tín</span>
                </div>
                <div className="w-px h-6 bg-slate-200" />
                <div>
                  <div className="font-extrabold text-slate-900">{currentUser.totalMealsJoined}</div>
                  <span className="text-[10px] text-slate-500">Bữa ăn chung</span>
                </div>
                <div className="w-px h-6 bg-slate-200" />
                <div>
                  <div className="font-extrabold text-slate-900">{friendsList.length}</div>
                  <span className="text-[10px] text-slate-500">Bạn bè</span>
                </div>
              </div>

              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditingProfile ? 'Đóng sửa' : 'Sửa hồ sơ'}</span>
              </button>
            </div>

          </div>

          {/* EDIT FORM (TOGGLEABLE) */}
          {isEditingProfile ? (
            <div className="p-4 bg-brand-50/50 rounded-2xl border border-brand-200 mb-4 space-y-3">
              <h3 className="font-bold text-xs text-brand-900 uppercase">Chỉnh Sửa Thông Tin Cá Nhân</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Họ và tên</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Địa chỉ / Khu vực</label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Giới thiệu ngắn (Bio)</label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:border-brand-500"
                />
              </div>
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs"
              >
                Lưu Thay Đổi
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl mb-4">
              {currentUser.bio}
            </p>
          )}

          {/* Quick preference badges preview */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Tag className="w-3 h-3 text-brand-600" /> Gu ăn uống:
            </span>
            {currentUser.foodPreferences.map((pref) => (
              <span
                key={pref}
                className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium"
              >
                {pref}
              </span>
            ))}
          </div>

        </div>
      </div>

      {/* SUB-TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('posts')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeSubTab === 'posts'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Bài Đăng & Review</span>
        </button>

        <button
          onClick={() => setActiveSubTab('preferences')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeSubTab === 'preferences'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Cài Đặt Sở Thích Ẩm Thực</span>
        </button>

        <button
          onClick={() => setActiveSubTab('friends')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeSubTab === 'friends'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Danh Sách Bạn Bè ({friendsList.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: POSTS & CREATE POST */}
      {activeSubTab === 'posts' && (
        <div className="space-y-5">
          {/* Create Post Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-600" />
              Chia Sẻ Trải Nghiệm Ăn Uống Của Bạn
            </h3>
            <form onSubmit={handleCreatePost} className="space-y-3">
              <textarea
                rows={3}
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder={`Chia sẻ cảm nhận về bữa ăn chung gần nhất, review quán ngon hoặc rủ rê bạn bè...`}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-brand-500 bg-slate-50/50"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  value={newPostRestaurant}
                  onChange={(e) => setNewPostRestaurant(e.target.value)}
                  placeholder="Địa điểm / Tên nhà hàng (VD: Haidilao Bitexco)"
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-brand-500"
                />
                <input
                  type="text"
                  value={newPostImage}
                  onChange={(e) => setNewPostImage(e.target.value)}
                  placeholder="URL hình ảnh món ăn"
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-brand-500"
                />
              </div>
              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={!newPostContent.trim()}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Đăng Bài Lên Trang Cá Nhân</span>
                </button>
              </div>
            </form>
          </div>

          {/* Posts Feed */}
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.userAvatar}
                      alt={post.userName}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{post.userName}</h4>
                      <p className="text-[10px] text-slate-400">{post.createdAt}</p>
                    </div>
                  </div>
                  {post.restaurantName && (
                    <span className="text-[11px] font-semibold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg">
                      📍 {post.restaurantName}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>

                {post.image && (
                  <div className="rounded-xl overflow-hidden max-h-80 bg-slate-100">
                    <img src={post.image} alt="Food review" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <button
                    onClick={() => handleLikePost(post.id)}
                    className="flex items-center gap-1.5 text-slate-600 hover:text-red-500 transition-colors font-semibold"
                  >
                    <Heart className="w-4 h-4 text-red-500 fill-red-500/20" />
                    <span>{post.likes} Yêu thích</span>
                  </button>
                  <span className="text-[11px] text-slate-400">Cộng đồng Chạm Đũa</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: PREFERENCES SETTINGS */}
      {activeSubTab === 'preferences' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Sở Thích & Khẩu Vị Ẩm Thực Của Bạn</h3>
            <p className="text-xs text-slate-500 mt-1">
              Hệ thống sẽ dựa vào sở thích để gợi ý bạn bè có cùng gu món ăn khi ghép bàn.
            </p>
          </div>

          {/* Current tags */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Các thẻ sở thích hiện tại ({currentUser.foodPreferences.length}):
            </label>
            <div className="flex flex-wrap gap-2">
              {currentUser.foodPreferences.map((pref) => (
                <span
                  key={pref}
                  className="px-3 py-1.5 rounded-xl bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold flex items-center gap-1.5"
                >
                  <span>{pref}</span>
                  <button
                    onClick={() => handleRemoveTag(pref)}
                    className="w-4 h-4 rounded-full hover:bg-brand-200 flex items-center justify-center text-brand-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Add custom tag */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Thêm sở thích mới:
            </label>
            <div className="flex items-center gap-2 max-w-md">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                placeholder="VD: Không ăn ngò, Thích bia craft, Nghiện phô mai..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-brand-500"
              />
              <button
                onClick={() => handleAddTag()}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs"
              >
                Thêm thẻ
              </button>
            </div>
          </div>

          {/* Recommended tags */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Gợi ý các thẻ phổ biến được nhiều người chọn:
            </label>
            <div className="flex flex-wrap gap-2">
              {recommendedTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleAddTag(tag)}
                  disabled={currentUser.foodPreferences.includes(tag)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                    currentUser.foodPreferences.includes(tag)
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                      : 'bg-white border-slate-300 text-slate-700 hover:border-brand-500 hover:text-brand-600'
                  }`}
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: FRIENDS LIST & PUBLIC PROFILE PREVIEW */}
      {activeSubTab === 'friends' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Bạn Bè Cùng Gu Ẩm Thực</h3>
            <p className="text-xs text-slate-500 mt-1">
              Bấm vào từng người bạn để xem hồ sơ công khai, sở thích ăn uống và rủ họ đi ăn chung.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {friendsList.map((friend) => (
              <div
                key={friend.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-brand-300 hover:shadow-md transition-all flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{friend.name}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{friend.bio}</p>
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-amber-600 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{friend.trustScore} điểm uy tín</span>
                      <span className="text-slate-400 font-normal">• {friend.totalMealsJoined} bữa ăn</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setPreviewFriend(friend)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-brand-50 hover:border-brand-400 hover:text-brand-600 text-slate-700 text-xs font-bold transition-all whitespace-nowrap shadow-xs"
                >
                  Xem Profile
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FRIEND PUBLIC PROFILE MODAL */}
      {previewFriend && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={previewFriend.avatar}
                  alt={previewFriend.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-400 shadow-md"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900">{previewFriend.name}</h3>
                  <p className="text-xs text-slate-500">{previewFriend.location.address}</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 inline-block mt-1">
                    ★ {previewFriend.trustScore} Uy tín ({previewFriend.totalMealsJoined} lần ghép bàn)
                  </span>
                </div>
              </div>
              <button
                onClick={() => setPreviewFriend(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700 italic">
              "{previewFriend.bio}"
            </div>

            <div>
              <span className="text-xs font-bold text-slate-800 block mb-2">Sở thích ẩm thực:</span>
              <div className="flex flex-wrap gap-1.5">
                {previewFriend.foodPreferences.map((p) => (
                  <span key={p} className="px-2.5 py-1 rounded-lg bg-brand-50 text-brand-800 text-xs font-medium">
                    {p}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  alert(`Đã gửi thông báo rủ ${previewFriend.name} cùng đi ăn một bữa!`);
                  setPreviewFriend(null);
                }}
                className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-colors"
              >
                Rủ {previewFriend.name} Đi Ăn Ngay
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
