import React, { useState } from 'react';
import {
  X,
  Clock,
  Users,
  Send,
  Lock,
  CheckCircle2,
  AlertCircle,
  PhoneCall,
  Vote,
  Sparkles,
  Calendar,
  Share2,
  Building
} from 'lucide-react';
import { DiningSession, User } from '../types';
import { storageService } from '../services/storageService';

interface DiscussionRoomModalProps {
  session: DiningSession;
  currentUser: User;
  onClose: () => void;
  onSessionUpdated: (updatedSession: DiningSession) => void;
}

export const DiscussionRoomModal: React.FC<DiscussionRoomModalProps> = ({
  session,
  currentUser,
  onClose,
  onSessionUpdated
}) => {
  const [inputText, setInputText] = useState('');
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [editedTime, setEditedTime] = useState(session.eatingTime);
  const [editedSlots, setEditedSlots] = useState(session.targetSlots);
  const [selectedBookerId, setSelectedBookerId] = useState(session.appointedBookerId || '');

  const isHost = session.hostId === currentUser.id;
  const isMember = session.joinedMembers.some((m) => m.userId === currentUser.id);

  // Send new message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    storageService.sendSessionMessage(session.id, currentUser, inputText.trim());
    setInputText('');
    const updated = storageService.getSession(session.id);
    if (updated) onSessionUpdated(updated);
  };

  // Quick intro suggestion
  const handleSendQuickIntro = (introText: string) => {
    storageService.sendSessionMessage(
      session.id,
      currentUser,
      `👋 Giới thiệu: "${introText}"`
    );
    const updated = storageService.getSession(session.id);
    if (updated) onSessionUpdated(updated);
  };

  // Update session settings during discussion
  const handleSaveSettings = () => {
    storageService.updateSessionSettings(session.id, editedTime, editedSlots);
    setIsEditingSettings(false);
    const updated = storageService.getSession(session.id);
    if (updated) onSessionUpdated(updated);
  };

  // Lock session ("Chốt bàn")
  const handleLockSession = () => {
    const updated = storageService.lockSession(session.id);
    if (updated) {
      onSessionUpdated(updated);
    }
  };

  // Appoint person to book if restaurant is not registered
  const handleAppointBooker = (userId: string, userName: string) => {
    storageService.appointBooker(session.id, userId, userName);
    setSelectedBookerId(userId);
    const updated = storageService.getSession(session.id);
    if (updated) onSessionUpdated(updated);
  };

  // Auto fill simulation for instant full table
  const handleAutoFill = () => {
    const updated = storageService.autoFillStrangers(session.id);
    if (updated) onSessionUpdated(updated);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-brand-600 via-orange-600 to-amber-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={session.restaurantImage}
              alt={session.restaurantName}
              className="w-12 h-12 rounded-xl object-cover border-2 border-white/40 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs">
                  {session.status === 'LOCKED' ? '🔒 Bàn đã chốt thành công' : '💬 Phòng Thảo Luận Trước Khi Chốt'}
                </span>
                {session.isRestaurantRegistered ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400 text-emerald-950 flex items-center gap-1">
                    <Building className="w-3 h-3" /> Quán liên kết đặt tự động
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-300 text-amber-950 flex items-center gap-1">
                    <PhoneCall className="w-3 h-3" /> Quán tự liên hệ giữ chỗ
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-bold leading-tight mt-1">{session.title}</h2>
              <p className="text-xs text-orange-100 line-clamp-1">{session.restaurantName} • {session.restaurantAddress}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SUB-BAR: TIME, SLOTS & ACTION STATUS */}
        <div className="px-4 sm:px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <Clock className="w-4 h-4 text-brand-600" />
              <span>Giờ ăn: <strong className="text-slate-900">{session.eatingTime}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <Users className="w-4 h-4 text-brand-600" />
              <span>Thành viên: <strong className="text-slate-900">{session.joinedMembers.length}/{session.targetSlots} người</strong></span>
            </div>
            {session.voucherApplied && (
              <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 font-bold">
                🎁 {session.voucherApplied.discountValue}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Can edit time and slots during discussion */}
            {session.status !== 'LOCKED' && isMember && (
              <button
                onClick={() => setIsEditingSettings(!isEditingSettings)}
                className="px-3 py-1 rounded-lg border border-slate-300 hover:bg-white text-slate-700 font-semibold transition-colors"
              >
                {isEditingSettings ? 'Đóng chỉnh sửa' : '✏️ Thay đổi giờ / số lượng'}
              </button>
            )}

            {/* Auto Fill Strangers button for quick testing */}
            {session.status === 'RECRUITING' && (
              <button
                onClick={handleAutoFill}
                className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 font-bold transition-colors flex items-center gap-1"
                title="Giả lập thêm người lạ vào bàn ăn"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Fill người lạ (Demo)</span>
              </button>
            )}
          </div>
        </div>

        {/* EDIT SETTINGS COLLAPSIBLE */}
        {isEditingSettings && session.status !== 'LOCKED' && (
          <div className="p-4 bg-amber-50/70 border-b border-amber-200 flex flex-col sm:flex-row items-center gap-4 text-xs">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="font-bold text-slate-700">Giờ đặt bàn:</label>
              <input
                type="text"
                value={editedTime}
                onChange={(e) => setEditedTime(e.target.value)}
                placeholder="VD: 19:30 - Tối nay"
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-brand-500 flex-1"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="font-bold text-slate-700">Số lượng người:</label>
              <select
                value={editedSlots}
                onChange={(e) => setEditedSlots(Number(e.target.value))}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-brand-500"
              >
                <option value={2}>2 người</option>
                <option value={3}>3 người</option>
                <option value={4}>4 người (chuẩn Voucher)</option>
                <option value={5}>5 người</option>
                <option value={6}>6 người</option>
                <option value={8}>8 người</option>
              </select>
            </div>
            <button
              onClick={handleSaveSettings}
              className="px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold transition-colors w-full sm:w-auto"
            >
              Lưu thay đổi bàn
            </button>
          </div>
        )}

        {/* MAIN BODY: 2 COLUMNS (MEMBERS & LIVE CHAT) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[380px]">
          
          {/* COLUMN 1: MEMBERS LIST & INTRODUCTIONS (1/3) */}
          <div className="w-full md:w-80 bg-slate-50/80 border-r border-slate-200 p-4 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-brand-600" />
                  Thành viên tham gia ({session.joinedMembers.length}/{session.targetSlots})
                </span>
                {session.joinedMembers.length >= session.targetSlots && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Đã Đủ Người
                  </span>
                )}
              </div>

              <div className="space-y-2.5">
                {session.joinedMembers.map((member) => (
                  <div
                    key={member.userId}
                    className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-9 h-9 rounded-full object-cover border border-brand-200"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-800 truncate">{member.name}</span>
                          {member.isHost && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-brand-100 text-brand-800">
                              Chủ Bàn
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 italic truncate">
                          {member.introduction || 'Chưa giới thiệu'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Empty slot placeholders */}
                {Array.from({ length: Math.max(0, session.targetSlots - session.joinedMembers.length) }).map((_, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-400 bg-slate-100/50"
                  >
                    + Đang chờ thêm 1 bạn ghép vào...
                  </div>
                ))}
              </div>
            </div>

            {/* Non-registered restaurant election box */}
            {!session.isRestaurantRegistered && session.status === 'LOCKED' && (
              <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                <span className="font-bold text-amber-900 flex items-center gap-1">
                  <PhoneCall className="w-3.5 h-3.5 text-amber-600" /> Bầu chọn người đặt bàn:
                </span>
                <p className="text-[11px] text-amber-800 mt-1 mb-2">
                  Quán chưa có tài khoản app. Nhóm hãy chọn 1 bạn gọi Hotline: <strong>{storageService.getRestaurant(session.restaurantId)?.phone || '090 943 7033'}</strong>
                </p>
                <div className="space-y-1.5">
                  {session.joinedMembers.map((m) => (
                    <button
                      key={m.userId}
                      onClick={() => handleAppointBooker(m.userId, m.name)}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                        session.appointedBookerId === m.userId
                          ? 'bg-amber-600 text-white'
                          : 'bg-white border border-amber-200 hover:bg-amber-100/60 text-slate-700'
                      }`}
                    >
                      <span>{m.name} {m.userId === currentUser.id ? '(Bạn)' : ''}</span>
                      {session.appointedBookerId === m.userId ? '✓ Đã nhận đặt' : 'Bầu chọn'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Intro buttons for user */}
            {isMember && session.status !== 'LOCKED' && (
              <div className="mt-4 pt-3 border-t border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                  Giới thiệu nhanh bản thân:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => handleSendQuickIntro('Mình ăn cay siêu tốt, gọi cay tẹt ga nha!')}
                    className="text-[10px] px-2 py-1 rounded-full bg-slate-200 hover:bg-brand-100 hover:text-brand-800 text-slate-700 transition-colors"
                  >
                    🌶️ Mê ăn cay
                  </button>
                  <button
                    onClick={() => handleSendQuickIntro('Mình không ăn được cay, nhờ mọi người chọn nước lẩu thanh nhé.')}
                    className="text-[10px] px-2 py-1 rounded-full bg-slate-200 hover:bg-brand-100 hover:text-brand-800 text-slate-700 transition-colors"
                  >
                    🥦 Ăn không cay
                  </button>
                  <button
                    onClick={() => handleSendQuickIntro('Mình sẽ có mặt đúng giờ, hẹn gặp cả nhóm!')}
                    className="text-[10px] px-2 py-1 rounded-full bg-slate-200 hover:bg-brand-100 hover:text-brand-800 text-slate-700 transition-colors"
                  >
                    ⏰ Đúng giờ
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* COLUMN 2: DISCUSSION CHAT & ACTION BUTTON (2/3) */}
          <div className="flex-1 flex flex-col justify-between bg-white">
            
            {/* Chat Messages Log */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              <div className="text-center my-2">
                <span className="text-[11px] bg-slate-100 text-slate-500 px-3 py-1 rounded-full font-medium">
                  Chào mừng bạn đến phòng thảo luận! Hãy giới thiệu bản thân và thống nhất trước khi chốt bàn.
                </span>
              </div>

              {session.discussionMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.isSystem ? 'justify-center my-2' : msg.userId === currentUser.id ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.isSystem ? (
                    <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs px-3.5 py-1.5 rounded-xl font-medium max-w-lg text-center shadow-xs">
                      {msg.message}
                    </div>
                  ) : (
                    <>
                      {msg.userId !== currentUser.id && (
                        <img src={msg.userAvatar} alt={msg.userName} className="w-8 h-8 rounded-full object-cover" />
                      )}
                      <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-xs shadow-xs ${
                        msg.userId === currentUser.id
                          ? 'bg-brand-600 text-white rounded-tr-xs'
                          : 'bg-slate-100 text-slate-800 rounded-tl-xs'
                      }`}>
                        <div className="flex items-center justify-between gap-3 mb-0.5">
                          <span className={`font-bold text-[11px] ${msg.userId === currentUser.id ? 'text-brand-100' : 'text-slate-600'}`}>
                            {msg.userName}
                          </span>
                          <span className={`text-[10px] ${msg.userId === currentUser.id ? 'text-brand-200' : 'text-slate-400'}`}>
                            {msg.timestamp}
                          </span>
                        </div>
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* BOTTOM BAR: LOCK BUTTON & INPUT FORM */}
            <div className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50/50 space-y-3">
              
              {/* LOCK STATUS / CHỐT BÀN BANNER */}
              {session.status === 'LOCKED' ? (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <div>
                      <div>Bàn ăn đã được CHỐT thành công! 🎉</div>
                      <div className="text-[11px] font-normal text-emerald-700">
                        {session.isRestaurantRegistered
                          ? session.reservationStatus === 'CONFIRMED_BY_RESTAURANT'
                            ? 'Nhà hàng đã xác nhận giữ bàn cho nhóm.'
                            : 'Đã gửi yêu cầu đặt bàn sang Nhà hàng (Đang chờ Quán bấm xác nhận).'
                          : session.appointedBookerName
                            ? `${session.appointedBookerName} đang phụ trách liên hệ giữ chỗ với quán.`
                            : 'Cả nhóm hãy bầu 1 bạn gọi điện giữ bàn.'}
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs">
                    ĐÃ CHỐT
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-gradient-to-r from-brand-50 to-amber-50 border border-brand-200">
                  <div className="text-xs text-brand-900">
                    <span className="font-bold">Đã thống nhất mọi thông tin?</span>
                    <p className="text-[11px] text-brand-700">
                      Bấm Chốt Bàn để gửi yêu cầu đặt bàn tới quán và chốt danh sách thành viên.
                    </p>
                  </div>
                  <button
                    onClick={handleLockSession}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 whitespace-nowrap transform active:scale-95 transition-all"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Chốt Bàn Ngay</span>
                  </button>
                </div>
              )}

              {/* Chat input form */}
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Nhập tin nhắn thảo luận món ăn, sở thích, chào hỏi..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-500"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Gửi</span>
                </button>
              </form>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
