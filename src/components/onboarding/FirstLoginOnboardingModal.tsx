import React, { useState } from 'react';
import {
  Utensils,
  Tag,
  DollarSign,
  MapPin,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Users,
  Compass,
  Smile,
  ShieldCheck
} from 'lucide-react';
import { User } from '../../types';
import { storageService } from '../../services/storageService';

interface FirstLoginOnboardingModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onFinish: (updatedUser: User) => void;
}

export const FirstLoginOnboardingModal: React.FC<FirstLoginOnboardingModalProps> = ({
  user,
  isOpen,
  onClose,
  onFinish
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      title: 'Chào mừng bạn đến với Chạm Đũa!',
      subtitle: 'Nền tảng kết nối những người xa lạ cùng đi ăn chung',
      icon: '🥢',
      badge: 'Chạm đũa kết thân • Ăn ngon chia sẻ',
      gradient: 'from-brand-600 via-orange-600 to-amber-500',
      description:
        'Bạn thèm ăn lẩu, nướng, ẩm thực đường phố nhưng ngại đi một mình? Chạm Đũa giúp bạn tìm thấy những người bạn có cùng gu ăn uống, cùng sở thích và vị trí gần bạn nhất!',
      highlights: [
        { icon: Smile, text: 'Tạo niềm vui kết bạn bốn phương' },
        { icon: Utensils, text: 'Thưởng thức được nhiều món ngon cùng lúc' },
        { icon: Users, text: 'Bàn ăn an toàn, hồ sơ uy tín xác minh' }
      ]
    },
    {
      title: 'Săn Voucher Nhóm Cực Khủng',
      subtitle: 'Mở khóa ưu đãi độc quyền từ các nhà hàng đối tác',
      icon: '🎁',
      badge: 'Tiết kiệm chi phí ăn uống',
      gradient: 'from-amber-500 via-orange-600 to-rose-600',
      description:
        'Nhiều nhà hàng, quán nướng buffet có các voucher giảm từ 20% - 50% hoặc tặng món với điều kiện đi nhóm từ 3 - 6 người. Chạm Đũa giúp bạn gom đủ người chỉ trong 5 phút để cùng nhận voucher!',
      highlights: [
        { icon: Tag, text: 'Voucher giảm giá nhóm lên đến 50%' },
        { icon: Sparkles, text: 'Tặng kèm món signature hoặc đồ uống' },
        { icon: ShieldCheck, text: 'Áp dụng trực tiếp tại bàn nhà hàng' }
      ]
    },
    {
      title: 'Chia Tiền Minh Bạch & Sòng Phẳng',
      subtitle: 'Thanh toán trước hoặc sau bữa ăn không lo tính toán',
      icon: '💵',
      badge: 'Sòng phẳng đến từng đồng',
      gradient: 'from-emerald-600 via-teal-600 to-cyan-700',
      description:
        'Bạn có thể chọn đặt món trước & thanh toán trước, hoặc gọi món ăn xong mới tính tiền. Hệ thống tự động tính tổng tiền và chia nhỏ chi phí chi tiết cho từng thành viên tham gia.',
      highlights: [
        { icon: DollarSign, text: 'Chia nhỏ chi phí trải nghiệm món đắt tiền' },
        { icon: CheckCircle2, text: 'Hiển thị tiền tổng và tiền chia từng người' },
        { icon: ShieldCheck, text: 'Xác nhận thanh toán an toàn, minh bạch' }
      ]
    },
    {
      title: 'Radar Quán & Kèo Hẹn Gần Bạn',
      subtitle: 'Bản đồ trực quan và tính năng hẹn lịch trước',
      icon: '📍',
      badge: 'Công nghệ định vị thời gian thực',
      gradient: 'from-blue-600 via-indigo-600 to-violet-700',
      description:
        'Xem trực tiếp bản đồ định vị các nhà hàng có ưu đãi quanh bạn. Bạn có thể tham gia bàn ăn ngay tức thì, hoặc xem các bài đăng hẹn lịch cho ngày mai / cuối tuần (kể cả khi chưa chọn quán)!',
      highlights: [
        { icon: Compass, text: 'Radar quét quán ăn gần bạn nhất' },
        { icon: MapPin, text: 'Đặt lịch hẹn trước cho ngày mai & cuối tuần' },
        { icon: Utensils, text: 'Đăng bài gợi ý món muốn ăn tự do' }
      ]
    }
  ];

  const current = slides[currentSlide];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleComplete = () => {
    const updated: User = {
      ...user,
      hasCompletedOnboardingTour: true
    };
    storageService.updateUser(updated);
    onFinish(updated);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200">
        
        {/* TOP HERO BANNER */}
        <div className={`p-6 sm:p-8 bg-gradient-to-r ${current.gradient} text-white relative transition-all duration-300`}>
          
          {/* Header pill & Skip button */}
          <div className="flex items-center justify-between mb-4">
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold tracking-wide">
              {current.badge}
            </span>
            <button
              type="button"
              onClick={handleComplete}
              className="text-xs text-white/80 hover:text-white underline font-semibold transition-colors"
            >
              Bỏ qua tour
            </button>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner flex-shrink-0 animate-bounce">
              {current.icon}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                {current.title}
              </h2>
              <p className="text-xs sm:text-sm text-white/90 mt-1 font-medium">
                {current.subtitle}
              </p>
            </div>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-1.5 mt-6">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentSlide === idx
                    ? 'w-8 bg-white shadow-sm'
                    : 'w-2 bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </div>

        {/* CONTENT BODY */}
        <div className="p-6 sm:p-8 space-y-6">
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
            {current.description}
          </p>

          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Điểm nổi bật:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {current.highlights.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-xs font-semibold text-slate-800"
                  >
                    <div className="w-7 h-7 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span>{item.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* BOTTOM NAV BAR */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentSlide === 0}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              currentSlide === 0
                ? 'opacity-0 pointer-events-none'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-100'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-700 hover:to-amber-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-md shadow-brand-500/25 transition-all transform active:scale-95"
          >
            <span>{currentSlide === slides.length - 1 ? '🎉 Sẵn Sàng Nhập Tiệc' : 'Tiếp tục'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
