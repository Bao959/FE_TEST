import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Camera,
  MapPin,
  Phone,
  Tag,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Heart,
  Smile
} from 'lucide-react';
import { User } from '../../types';
import { storageService } from '../../services/storageService';

interface ProfileCompletionModalProps {
  user: User;
  onComplete: (completedUser: User) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80'
];

const AVAILABLE_PREFERENCES = [
  'Lẩu & Nướng Than Hoa',
  'Ăn Cay Cấp Độ 3',
  'Không Ăn Hành',
  'Ốc & Hải Sản Sài Gòn',
  'Món Hàn Quốc (Kim Chi, Tokbokki)',
  'Ẩm Thực Nhật (Sushi, Ramen)',
  'Món Chay / Healthy',
  'Đồ Ngọt & Trà Sữa',
  'Ăn Vặt Đường Phố',
  'Bia Thủ Công / Nhậu Vui',
  'Cơm Gia Đình Chuẩn Vị',
  'Thích Chụp Ảnh Check-in'
];

const BUDGET_OPTIONS = [
  'Dưới 100.000đ / người (Bình dân, ăn vặt)',
  '100.000đ - 200.000đ / người (Phổ thông)',
  '200.000đ - 350.000đ / người (Lẩu, Buffet nướng)',
  'Trên 350.000đ / người (Nhà hàng cao cấp)'
];

const DISTRICT_OPTIONS = [
  'Quận 1, TP. Hồ Chí Minh',
  'Quận 3, TP. Hồ Chí Minh',
  'Quận 5, TP. Hồ Chí Minh',
  'Quận 7, TP. Hồ Chí Minh',
  'Quận 10, TP. Hồ Chí Minh',
  'Quận Bình Thạnh, TP. Hồ Chí Minh',
  'TP. Thủ Đức, TP. Hồ Chí Minh',
  'Quận Hoàn Kiếm, Hà Nội',
  'Quận Cầu Giấy, Hà Nội',
  'Quận Đống Đa, Hà Nội'
];

export const ProfileCompletionModal: React.FC<ProfileCompletionModalProps> = ({
  user,
  onComplete
}) => {
  const [fullName, setFullName] = useState(user.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar || PRESET_AVATARS[0]);
  const [phone, setPhone] = useState(user.phone || '');
  const [bio, setBio] = useState(user.bio || '');
  const [district, setDistrict] = useState(user.location?.address || DISTRICT_OPTIONS[0]);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(user.foodPreferences || []);
  const [favoriteBudget, setFavoriteBudget] = useState(user.favoriteBudget || BUDGET_OPTIONS[1]);

  // Real-time calculation of profile completion percentage
  const calculatePercent = () => {
    let score = 0;
    // Name: +15%
    if (fullName.trim().length >= 2) score += 15;
    // Avatar: +15%
    if (selectedAvatar) score += 15;
    // Phone: +15% (optional to skip, but gives 15%)
    if (phone.trim().length >= 9) score += 15;
    // Bio: +15% (>= 10 chars)
    if (bio.trim().length >= 10) score += 15;
    // Address / District: +15%
    if (district.trim()) score += 15;
    // Preferences: +25% if >= 3 tags, +15% if 1-2 tags
    if (selectedPreferences.length >= 3) {
      score += 25;
    } else if (selectedPreferences.length > 0) {
      score += 15;
    }
    // Budget: +15%
    if (favoriteBudget) score += 15;

    return Math.min(100, score);
  };

  const currentPercent = calculatePercent();
  const isEligible = currentPercent >= 80;

  const togglePreference = (pref: string) => {
    if (selectedPreferences.includes(pref)) {
      setSelectedPreferences(selectedPreferences.filter((p) => p !== pref));
    } else {
      setSelectedPreferences([...selectedPreferences, pref]);
    }
  };

  const handleFinish = () => {
    if (!isEligible) {
      alert(`Hồ sơ của bạn mới đạt ${currentPercent}%. Cần tối thiểu 80% để mở khóa Chạm Đũa. Bạn hãy điền thêm sở thích hoặc số điện thoại nhé!`);
      return;
    }

    const updatedUser: User = {
      ...user,
      name: fullName.trim(),
      avatar: selectedAvatar,
      phone: phone.trim(),
      bio: bio.trim() || 'Thành viên mới gia nhập Chạm Đũa!',
      foodPreferences: selectedPreferences,
      favoriteBudget: favoriteBudget,
      location: {
        ...user.location,
        address: district
      },
      profileCompletionPercent: currentPercent,
      isProfileCompleted: true
    };

    storageService.updateUser(updatedUser);
    onComplete(updatedUser);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* HEADER & PROGRESS BAR */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-brand-600 via-orange-600 to-amber-500 text-white">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🥢</span>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight">
                Hoàn Thiện Hồ Sơ Chạm Đũa
              </h2>
              <p className="text-xs text-amber-100 mt-0.5">
                Yêu cầu hoàn thiện <strong>tối thiểu 80%</strong> để mở khóa tính năng tìm bạn ăn chung & săn deal.
              </p>
            </div>
          </div>

          {/* Progress Bar Container */}
          <div className="mt-4 p-3.5 bg-black/20 backdrop-blur-md rounded-2xl border border-white/20">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="flex items-center gap-1.5">
                {isEligible ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                ) : (
                  <Sparkles className="w-4 h-4 text-amber-300" />
                )}
                <span>Tiến độ hồ sơ: <strong className="text-white text-sm">{currentPercent}% / 80%</strong></span>
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                isEligible ? 'bg-emerald-400 text-emerald-950' : 'bg-amber-300 text-amber-950 animate-pulse'
              }`}>
                {isEligible ? '✓ Đủ điều kiện mở khóa' : `Còn thiếu ${80 - currentPercent}%`}
              </span>
            </div>

            {/* Progress track */}
            <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isEligible
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-300 shadow-sm'
                    : 'bg-gradient-to-r from-amber-300 to-orange-400'
                }`}
                style={{ width: `${currentPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* ONBOARDING FORM BODY */}
        <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-6">
          
          {/* STEP 1: CHỌN AVATAR & HỌ TÊN */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>1. Ảnh đại diện & Tên hiển thị (+30%)</span>
              <span className="text-emerald-600 font-bold text-[11px]">Đã đạt</span>
            </label>

            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={selectedAvatar}
                  alt="Avatar preview"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-500 shadow-md"
                />
                <span className="absolute -bottom-1 -right-1 bg-brand-600 text-white p-1 rounded-full text-[9px]">
                  <Camera className="w-2.5 h-2.5" />
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Họ và tên hiển thị trên Chạm Đũa"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-800 focus:outline-none focus:border-brand-500"
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">Chọn nhanh một avatar bên dưới:</span>
              </div>
            </div>

            {/* Preset Avatars Row */}
            <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1">
              {PRESET_AVATARS.map((av, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedAvatar(av)}
                  className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-transform ${
                    selectedAvatar === av
                      ? 'border-brand-600 scale-110 ring-2 ring-brand-300'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={av} alt="Preset" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* STEP 2: KHU VỰC THƯỜNG ĂN UỐNG & LIÊN HỆ */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>2. Khu vực & Thông tin liên hệ (+30%)</span>
              <span className="text-[11px] text-slate-400 font-normal">Có thể bổ sung hoặc chỉnh sửa sau</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-600" /> Khu vực sinh sống / Thường ăn (+15%)
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-brand-500"
                >
                  {DISTRICT_OPTIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-brand-600" /> Số điện thoại liên hệ (+15%)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="VD: 0909 123 456"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Smile className="w-3.5 h-3.5 text-brand-600" /> Giới thiệu ngắn về bản thân (+15%)
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="VD: Dân văn phòng thích ăn nướng, hòa đồng, vui tính, chia bill sòng phẳng..."
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* STEP 3: CHỌN SỞ THÍCH ẨM THỰC (QUAN TRỌNG) */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-brand-600" />
                <span>3. Chọn gu sở thích ẩm thực (+25%)</span>
              </label>
              <span className={`text-[11px] font-bold ${
                selectedPreferences.length >= 3 ? 'text-emerald-600' : 'text-amber-600'
              }`}>
                Đã chọn: {selectedPreferences.length}/3 tags tối thiểu
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Chọn ít nhất 3 thẻ để hệ thống Chạm Đũa ghép bạn vào những bàn ăn có cùng khẩu vị:
            </p>

            <div className="flex flex-wrap gap-2">
              {AVAILABLE_PREFERENCES.map((pref) => {
                const isSelected = selectedPreferences.includes(pref);
                return (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => togglePreference(pref)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-brand-600 text-white shadow-xs scale-105'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{isSelected ? '✓' : '+'}</span>
                    <span>{pref}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 4: NGÂN SÁCH ĂN UỐNG ƯU TIÊN */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-brand-600" />
              <span>4. Khung ngân sách ăn uống thường đi (+15%)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {BUDGET_OPTIONS.map((opt) => (
                <label
                  key={opt}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center gap-2 transition-all ${
                    favoriteBudget === opt
                      ? 'bg-brand-50 border-brand-500 font-bold text-brand-900 ring-1 ring-brand-300'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="fav_budget"
                    checked={favoriteBudget === opt}
                    onChange={() => setFavoriteBudget(opt)}
                    className="text-brand-600"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>

        </div>

        {/* FOOTER ACTION BUTTON */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-600 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-brand-600 flex-shrink-0" />
            <span>
              {isEligible
                ? 'Hồ sơ đã đạt chuẩn an toàn cộng đồng Chạm Đũa!'
                : `Cần đạt tối thiểu 80% (hiện tại: ${currentPercent}%) để mở khóa.`}
            </span>
          </div>

          <button
            onClick={handleFinish}
            disabled={!isEligible}
            className={`w-full sm:w-auto py-3 px-6 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
              isEligible
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-500/25 scale-100 hover:scale-105'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>Kích Hoạt Hồ Sơ & Vào Chạm Đũa</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
