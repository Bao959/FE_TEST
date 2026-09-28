import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { User } from '../../types';
import { storageService } from '../../services/storageService';

interface SocialLoginModalProps {
  provider: 'google' | 'facebook';
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const SocialLoginModal: React.FC<SocialLoginModalProps> = ({
  provider,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number | null>(null);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  if (!isOpen) return null;

  const isGoogle = provider === 'google';

  const googlePresets = [
    {
      name: 'Nguyễn Hoàng Tuấn',
      email: 'tuan.nguyen@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      desc: 'Tài khoản Google cá nhân'
    },
    {
      name: 'Trần Thảo Mai',
      email: 'mai.tran@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      desc: 'Tài khoản Google cá nhân'
    },
    {
      name: 'Hoàng Minh Quân (New User)',
      email: 'quan.hoang@work.io',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      desc: 'Đăng nhập lần đầu qua Google'
    }
  ];

  const facebookPresets = [
    {
      name: 'Nguyễn Hoàng Tuấn (Facebook)',
      email: 'tuan.nguyen.fb@facebook.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      desc: 'Tiếp tục với trang cá nhân Facebook'
    },
    {
      name: 'Trần Thảo Mai (Facebook)',
      email: 'mai.tran.fb@facebook.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      desc: 'Tiếp tục với trang cá nhân Facebook'
    },
    {
      name: 'Đặng Ngọc Lan (Tài khoản mới)',
      email: 'lan.dang@facebook.com',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      desc: 'Đăng nhập lần đầu qua Facebook'
    }
  ];

  const presets = isGoogle ? googlePresets : facebookPresets;

  const handleSelectPreset = (index: number) => {
    setSelectedPresetIndex(index);
    setIsAuthenticating(true);

    const chosen = presets[index];
    setTimeout(() => {
      // Check if user already exists
      const allUsers = storageService.getUsers();
      const existing = allUsers.find(
        (u) => u.email.toLowerCase() === chosen.email.toLowerCase()
      );

      if (existing) {
        setIsAuthenticating(false);
        onSuccess(existing);
      } else {
        // Create new social user (first login onboarding)
        const newUser = storageService.createUser({
          name: chosen.name.replace(' (New User)', '').replace(' (Tài khoản mới)', ''),
          email: chosen.email,
          avatar: chosen.avatar,
          socialProvider: provider,
          isEmailVerified: true, // Google/FB verified email
          isPhoneVerified: false,
          isProfileCompleted: false,
          profileCompletionPercent: 45,
          hasCompletedOnboardingTour: false,
          bio: `Thành viên mới gia nhập Chạm Đũa qua ${isGoogle ? 'Google' : 'Facebook'}!`,
          foodPreferences: ['Lẩu & Nướng Than Hoa', 'Ăn Cay Cấp Độ 3'],
          occupation: isGoogle ? 'Công Nghệ Thông Tin / Kỹ Thuật' : 'Sáng Tạo Nội Dung / Nghệ Thuật'
        });
        setIsAuthenticating(false);
        onSuccess(newUser);
      }
    }, 700);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customEmail.trim()) return;

    setIsAuthenticating(true);
    setTimeout(() => {
      const newUser = storageService.createUser({
        name: customName.trim(),
        email: customEmail.trim(),
        socialProvider: provider,
        isEmailVerified: true,
        isPhoneVerified: false,
        isProfileCompleted: false,
        profileCompletionPercent: 45,
        hasCompletedOnboardingTour: false,
        bio: `Thành viên mới tham gia qua ${isGoogle ? 'Google' : 'Facebook'}!`,
        foodPreferences: ['Lẩu & Nướng Than Hoa'],
        occupation: 'Nhân viên văn phòng'
      });
      setIsAuthenticating(false);
      onSuccess(newUser);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden relative">
        
        {/* TOP BRAND BAR */}
        <div className={`p-5 text-white flex items-center justify-between ${
          isGoogle
            ? 'bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500'
            : 'bg-gradient-to-r from-blue-600 to-indigo-700'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-md">
              {isGoogle ? (
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.14C3.25 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.59H1.26C.46 8.19 0 9.99 0 12s.46 3.81 1.26 5.41l4.02-3.14z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.26 6.59l4.02 3.14c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              ) : (
                <svg className="w-6 h-6 fill-[#1877F2]" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-sm leading-tight">
                {isGoogle ? 'Đăng nhập với Google' : 'Đăng nhập với Facebook'}
              </h3>
              <p className="text-[11px] text-white/90">
                Ủy quyền kết nối an toàn vào Chạm Đũa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* LOADING OVERLAY */}
        {isAuthenticating && (
          <div className="absolute inset-0 bg-white/95 z-20 flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
            <Loader2 className={`w-10 h-10 animate-spin mb-3 ${isGoogle ? 'text-red-500' : 'text-blue-600'}`} />
            <h4 className="font-bold text-slate-900 text-sm">
              Đang xác thực bảo mật OAuth 2.0...
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Đang nhận diện danh tính và đồng bộ thông tin tài khoản an toàn vào Chạm Đũa.
            </p>
          </div>
        )}

        {/* BODY */}
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              Chạm Đũa chỉ yêu cầu quyền đọc <strong>Tên hiển thị</strong>, <strong>Email</strong> và <strong>Ảnh đại diện</strong> công khai.
            </span>
          </div>

          {!isCustomMode ? (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                Chọn tài khoản {isGoogle ? 'Google' : 'Facebook'} của bạn:
              </span>

              <div className="space-y-2">
                {presets.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(idx)}
                    className="w-full p-3 rounded-2xl border border-slate-200 hover:border-brand-500 hover:bg-brand-50/40 text-left flex items-center gap-3 transition-all group hover:shadow-md"
                  >
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 group-hover:ring-2 group-hover:ring-brand-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-900 text-xs truncate group-hover:text-brand-600">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">{item.email}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 transform group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setIsCustomMode(true)}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 underline"
                >
                  + Sử dụng tài khoản {isGoogle ? 'Google' : 'Facebook'} khác
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase">
                  Nhập thông tin tài khoản:
                </span>
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  className="text-[11px] text-slate-500 hover:text-slate-800 underline"
                >
                  Quay lại danh sách
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Hoàng Tuấn Kiệt"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Email {isGoogle ? 'Google (@gmail.com)' : 'Facebook'} *
                </label>
                <input
                  type="email"
                  required
                  placeholder={isGoogle ? 'tuankiet@gmail.com' : 'tuankiet@facebook.com'}
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-brand-500"
                />
              </div>

              <button
                type="submit"
                className={`w-full py-3 px-4 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
                  isGoogle
                    ? 'bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                }`}
              >
                <span>Xác nhận & Tiếp tục</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>

        {/* FOOTER */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 text-center text-[10px] text-slate-500">
          Bằng việc tiếp tục, bạn đồng ý với Điều khoản sử dụng và Chính sách bảo mật của Chạm Đũa.
        </div>

      </div>
    </div>
  );
};
