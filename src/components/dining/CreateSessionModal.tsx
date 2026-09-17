import React, { useState } from 'react';
import {
  X,
  Plus,
  Utensils,
  Clock,
  Users,
  Tag,
  MessageSquare,
  UserCheck,
  Building,
  Check
} from 'lucide-react';
import { User, Restaurant, GroupVoucher } from '../../types';
import { storageService } from '../../services/storageService';

interface CreateSessionModalProps {
  currentUser: User;
  restaurants: Restaurant[];
  preselectedRestaurantId?: string;
  onClose: () => void;
  onSessionCreated: (sessionId: string) => void;
}

export const CreateSessionModal: React.FC<CreateSessionModalProps> = ({
  currentUser,
  restaurants,
  preselectedRestaurantId,
  onClose,
  onSessionCreated
}) => {
  const [selectedRestId, setSelectedRestId] = useState(preselectedRestaurantId || restaurants[0]?.id || '');
  const [targetSlots, setTargetSlots] = useState(4);
  const [eatingTime, setEatingTime] = useState('19:30 - Tối nay');
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('Lập nhóm ăn chung cho vui, thưởng thức được nhiều món và chia đều bill sòng phẳng nha!');
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [selectedVoucherId, setSelectedVoucherId] = useState<string>('');

  const currentRestaurant = restaurants.find((r) => r.id === selectedRestId) || restaurants[0];
  const availableVouchers = storageService.getVouchers(currentRestaurant?.id);
  const allUsers = storageService.getUsers();
  
  // Filter user's friends
  const friendObjects = allUsers.filter((u) => currentUser.friends.includes(u.id));

  const toggleFriendSelection = (friendId: string) => {
    if (selectedFriendIds.includes(friendId)) {
      setSelectedFriendIds(selectedFriendIds.filter((id) => id !== friendId));
    } else {
      setSelectedFriendIds([...selectedFriendIds, friendId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRestaurant) return;

    const chosenVoucher = availableVouchers.find((v) => v.id === selectedVoucherId);

    const generatedTitle = title.trim() || `Tìm bạn ăn ${currentRestaurant.name} - Gom nhóm ${targetSlots} người!`;

    const newSession = storageService.createSession(
      {
        title: generatedTitle,
        restaurantId: currentRestaurant.id,
        restaurantName: currentRestaurant.name,
        restaurantAddress: currentRestaurant.address,
        restaurantImage: currentRestaurant.coverImage,
        isRestaurantRegistered: currentRestaurant.isRegisteredOnSystem,
        hostId: currentUser.id,
        hostName: currentUser.name,
        hostAvatar: currentUser.avatar,
        targetSlots: Number(targetSlots),
        eatingTime: eatingTime,
        note: note,
        voucherApplied: chosenVoucher,
        status: 'RECRUITING'
      },
      currentUser,
      selectedFriendIds
    );

    onSessionCreated(newSession.id);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden">
        
        {/* HEADER */}
        <div className="p-5 bg-gradient-to-r from-brand-600 to-amber-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Tạo Bàn & Đăng Tuyển Bạn Ăn Chung</h2>
              <p className="text-xs text-brand-100">Chiêu mộ người cùng gu ẩm thực, chia nhỏ hóa đơn & săn voucher</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FORM BODY */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* 1. CHỌN NHÀ HÀNG */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-brand-600" /> Chọn Nhà Hàng / Quán Ăn
            </label>
            <select
              value={selectedRestId}
              onChange={(e) => {
                setSelectedRestId(e.target.value);
                setSelectedVoucherId('');
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:outline-none focus:border-brand-500"
            >
              {restaurants.map((rest) => (
                <option key={rest.id} value={rest.id}>
                  {rest.name} — {rest.category} ({rest.address.split(',')[rest.address.split(',').length - 2]?.trim() || 'TP.HCM'})
                </option>
              ))}
            </select>
          </div>

          {/* 2. CHỌN SỐ LƯỢNG & GIỜ ĐẾN ĂN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-brand-600" /> Số lượng người muốn ghép
              </label>
              <select
                value={targetSlots}
                onChange={(e) => setTargetSlots(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:outline-none focus:border-brand-500"
              >
                <option value={2}>2 người (Team nhẹ nhàng)</option>
                <option value={3}>3 người</option>
                <option value={4}>4 người (Phổ biến nhất & Mở Voucher)</option>
                <option value={5}>5 người</option>
                <option value={6}>6 người (Bàn lẩu/nướng lớn)</option>
                <option value={8}>8 người (Đại tiệc buffet)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-600" /> Giờ đến ăn dự kiến
              </label>
              <input
                type="text"
                required
                value={eatingTime}
                onChange={(e) => setEatingTime(e.target.value)}
                placeholder="Ví dụ: 19:30 - Tối nay"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:outline-none focus:border-brand-500"
              />
              <div className="flex gap-1.5 mt-1.5 overflow-x-auto">
                {['19:00 - Tối nay', '19:30 - Tối nay', '20:00 - Ngày mai', '12:00 - Trưa mai'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setEatingTime(preset)}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-brand-50 hover:text-brand-600 text-slate-600 transition-colors whitespace-nowrap"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. VOUCHER NHÓM ÁP DỤNG */}
          {availableVouchers.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200">
              <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-600" /> Ưu đãi nhóm có sẵn tại quán
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="voucher"
                    checked={selectedVoucherId === ''}
                    onChange={() => setSelectedVoucherId('')}
                    className="text-brand-600 focus:ring-brand-500"
                  />
                  <span>Không áp dụng voucher</span>
                </label>
                {availableVouchers.map((v) => (
                  <label
                    key={v.id}
                    className={`flex items-start gap-2.5 p-2 rounded-xl border cursor-pointer transition-colors ${
                      selectedVoucherId === v.id
                        ? 'bg-white border-brand-500 ring-2 ring-brand-200'
                        : 'bg-white/60 border-amber-200 hover:bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="voucher"
                      value={v.id}
                      checked={selectedVoucherId === v.id}
                      onChange={() => setSelectedVoucherId(v.id)}
                      className="mt-0.5 text-brand-600 focus:ring-brand-500"
                    />
                    <div className="text-xs">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>{v.title}</span>
                        <span className="px-1.5 py-0.2 rounded bg-red-100 text-red-700 font-extrabold text-[10px]">
                          {v.discountValue}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">{v.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* 4. MỜI BẠN BÈ ĐÃ KẾT BẠN */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-brand-600" /> Mời bạn bè tham gia trước ({selectedFriendIds.length} đã chọn)
              </label>
              <span className="text-[11px] text-slate-400">Bạn bè sẽ nhận thông báo mời</span>
            </div>
            
            {friendObjects.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Chưa có bạn bè nào trong danh sách.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {friendObjects.map((friend) => {
                  const isSelected = selectedFriendIds.includes(friend.id);
                  return (
                    <div
                      key={friend.id}
                      onClick={() => toggleFriendSelection(friend.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-brand-50 border-brand-500 ring-1 ring-brand-400'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <img src={friend.avatar} alt={friend.name} className="w-8 h-8 rounded-full object-cover" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{friend.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{friend.bio}</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center border text-xs ${
                        isSelected ? 'bg-brand-600 text-white border-brand-600' : 'border-slate-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 5. TIÊU ĐỀ & NỘI DUNG CHIÊU MỘ */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Tiêu đề bài tuyển bạn
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`Tìm bạn cùng ăn ${currentRestaurant?.name || 'quán ngon'}...`}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-brand-600" /> Nội dung chiêu mộ & Lưu ý
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú sở thích ăn uống, chia bill, gu nói chuyện..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-amber-500 hover:from-brand-700 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-95"
            >
              <span>Đăng Bài & Bắt Đầu Gom Bàn</span>
              <Users className="w-4 h-4" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
