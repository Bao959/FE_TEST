import React, { useState } from 'react';
import {
  X,
  Briefcase,
  GraduationCap,
  Sparkles,
  Tag,
  Clock,
  Heart,
  Smile,
  ShieldCheck,
  CheckCircle2,
  Save,
  Check
} from 'lucide-react';
import { User } from '../../types';
import { storageService } from '../../services/storageService';

interface SmartProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
}

export const POPULAR_OCCUPATIONS = [
  'Kỹ sư phần mềm (Software Engineer / IT)',
  'UI/UX & Thiết kế đồ họa',
  'Marketing, Truyền Thông & PR',
  'Sinh viên đại học / Cao đẳng',
  'Kinh doanh, Sales & Khởi nghiệp',
  'Tài chính, Kế toán & Ngân hàng',
  'Bác sĩ, Dược sĩ & Y tế',
  'Giáo dục & Giảng dạy',
  'Nhân sự (HR) & Vận hành',
  'Freelancer / Làm việc tự do',
  'Quản lý nhà hàng & F&B'
];

export const DINING_VIBES = [
  'Vui vẻ hòa đồng',
  'Yên tĩnh thưởng thức món',
  'Networking chia sẻ kinh nghiệm IT/Tech',
  'Thích chụp ảnh check-in sống ảo',
  'Tán gẫu vui tươi hài hước',
  'Lắng nghe & mở rộng quan hệ',
  'Bàn chuyện kinh doanh & đầu tư',
  'Chia bill sòng phẳng chuẩn từng đồng'
];

export const EATING_HABITS = [
  'Không ăn hành',
  'Thánh ăn cay cấp độ 3',
  'Không ăn cay',
  'Ăn chay thuần / Thanh tịnh',
  'Không uống rượu bia',
  'Thích nhậu bia thủ công lai rai',
  'Đạo đồ ngọt & Trà sữa',
  'Nghiện hải sản & Ốc Sài Gòn',
  'Thích lẩu nướng than hoa',
  'Ăn uống lành mạnh Healthy'
];

export const PREFERRED_DINING_TIMES = [
  'Bữa trưa văn phòng (11h30 - 13h00)',
  'Bữa tối sau giờ làm (18h00 - 19h30)',
  'Ăn đêm chém gió (21h00 - 23h00)',
  'Cuối tuần tụ họp thả ga',
  'Cà phê ăn sáng (07h30 - 09h00)'
];

export const SmartProfileModal: React.FC<SmartProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onSave
}) => {
  const [occupation, setOccupation] = useState(user.occupation || POPULAR_OCCUPATIONS[0]);
  const [companyOrSchool, setCompanyOrSchool] = useState(user.companyOrSchool || '');
  const [diningVibes, setDiningVibes] = useState<string[]>(user.diningVibe || []);
  const [eatingHabits, setEatingHabits] = useState<string[]>(user.eatingHabits || []);
  const [diningTimes, setDiningTimes] = useState<string[]>(user.diningTimes || []);

  if (!isOpen) return null;

  const toggleItem = (list: string[], setList: (val: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  const calculateSmartScore = () => {
    let score = 20;
    if (occupation) score += 20;
    if (companyOrSchool.trim()) score += 15;
    if (diningVibes.length >= 2) score += 15;
    if (eatingHabits.length >= 2) score += 15;
    if (diningTimes.length >= 1) score += 15;
    return Math.min(100, score);
  };

  const smartScore = calculateSmartScore();

  const handleSave = () => {
    const updated: User = {
      ...user,
      occupation,
      companyOrSchool: companyOrSchool.trim(),
      diningVibe: diningVibes,
      eatingHabits: eatingHabits,
      diningTimes: diningTimes,
      smartTags: Array.from(new Set([...diningVibes, ...eatingHabits])).slice(0, 6)
    };
    storageService.updateUser(updated);
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* HEADER */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-violet-600 via-indigo-600 to-brand-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner">
              🧠
            </div>
            <div>
              <h3 className="font-black text-lg">Smart Profile & Ghép Đôi AI</h3>
              <p className="text-xs text-indigo-100">
                Cập nhật nghề nghiệp, vibe bàn ăn và thói quen để thuật toán ghép bạn vào đúng người!
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

        {/* SMART SCORE INDICATOR */}
        <div className="bg-indigo-50 px-6 py-3 border-b border-indigo-100 flex items-center justify-between">
          <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Độ chi tiết Smart Profile: <strong>{smartScore}%</strong></span>
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-600 text-white">
            {smartScore >= 80 ? '✨ Rất dễ ghép bàn hợp cạ' : '⚡ Điền thêm để tăng độ chuẩn'}
          </span>
        </div>

        {/* BODY */}
        <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-6">
          
          {/* 1. OCCUPATION & WORKPLACE */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              <span>1. Nghề nghiệp & Nơi làm việc / Học tập</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Lĩnh vực / Nghề nghiệp chính *
                </label>
                <select
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold bg-white"
                >
                  {POPULAR_OCCUPATIONS.map((occ) => (
                    <option key={occ} value={occ}>
                      {occ}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Công ty / Trường học (Tùy chọn)</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: VNG, FPT, ĐH Bách Khoa..."
                  value={companyOrSchool}
                  onChange={(e) => setCompanyOrSchool(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* 2. DINING VIBE */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Smile className="w-4 h-4 text-brand-600" />
                <span>2. Gu kết nối & Vibe trên bàn ăn</span>
              </label>
              <span className="text-[11px] text-slate-400">Chọn các thẻ phù hợp với bạn:</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {DINING_VIBES.map((vibe) => {
                const isSelected = diningVibes.includes(vibe);
                return (
                  <button
                    key={vibe}
                    type="button"
                    onClick={() => toggleItem(diningVibes, setDiningVibes, vibe)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-gradient-to-r from-brand-600 to-amber-600 text-white shadow-xs scale-105'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{isSelected ? '✓' : '+'}</span>
                    <span>{vibe}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. EATING HABITS & ALLERGIES */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>3. Thói quen ẩm thực & Lưu ý</span>
              </label>
              <span className="text-[11px] text-slate-400">Giúp đồng bàn chuẩn bị món phù hợp:</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {EATING_HABITS.map((habit) => {
                const isSelected = eatingHabits.includes(habit);
                return (
                  <button
                    key={habit}
                    type="button"
                    onClick={() => toggleItem(eatingHabits, setEatingHabits, habit)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-rose-500 text-white shadow-xs scale-105'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{isSelected ? '✓' : '+'}</span>
                    <span>{habit}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. PREFERRED DINING TIMES */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>4. Khung giờ thường rảnh để đi ăn</span>
            </label>

            <div className="flex flex-wrap gap-2">
              {PREFERRED_DINING_TIMES.map((time) => {
                const isSelected = diningTimes.includes(time);
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => toggleItem(diningTimes, setDiningTimes, time)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs scale-105'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{isSelected ? '✓' : '+'}</span>
                    <span>{time}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Dữ liệu Smart Profile được dùng để gợi ý bàn ăn tương thích</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-brand-600 hover:from-indigo-700 hover:to-brand-700 text-white font-bold text-xs shadow-md shadow-indigo-500/25 flex items-center gap-1.5 transition-all transform active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu Smart Profile</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
