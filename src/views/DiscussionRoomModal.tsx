import React, { useState } from 'react';
import {
  X,
  Clock,
  Users,
  Send,
  Lock,
  CheckCircle2,
  PhoneCall,
  Sparkles,
  Building,
  Receipt,
  CreditCard,
  QrCode,
  UtensilsCrossed,
  Plus,
  Minus,
  Check,
  DollarSign,
  Tag,
  MessageCircle,
  HelpCircle
} from 'lucide-react';
import { DiningSession, User, MenuItem } from '../types';
import { storageService } from '../services/storageService';
import { formatCurrency } from '../utils/geo';

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
  const [activeModalTab, setActiveModalTab] = useState<'chat' | 'menu_order' | 'payment'>('chat');
  
  // Chat state
  const [inputText, setInputText] = useState('');
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [editedTime, setEditedTime] = useState(session.eatingTime);
  const [editedSlots, setEditedSlots] = useState(session.targetSlots);

  // Bill custom amount state
  const [customBillInput, setCustomBillInput] = useState<number>(
    session.paymentInfo?.customBillAmount || 850000
  );

  // QR Payment modal state
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrPaymentType, setQrPaymentType] = useState<'SHARE' | 'FULL'>('SHARE');

  const isMember = session.joinedMembers.some((m) => m.userId === currentUser.id);
  const restaurantMenuItems = storageService.getMenuItems(session.restaurantId);

  // Ensure paymentInfo is initialized
  const paymentInfo = session.paymentInfo || {
    orderType: 'PRE_ORDER',
    paymentMode: 'PRE_PAY',
    orderItems: [],
    subtotal: 0,
    discountAmount: 0,
    totalAmount: 0,
    amountPerPerson: 0,
    paymentStatus: 'UNPAID',
    paidMembers: {}
  };

  const isCurrentUserPaid = !!paymentInfo.paidMembers[currentUser.id]?.paid;
  const isAllPaid = paymentInfo.paymentStatus === 'PAID';

  // Send new chat message
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
    if (updated) onSessionUpdated(updated);
  };

  // Appoint person to book if restaurant is not registered
  const handleAppointBooker = (userId: string, userName: string) => {
    storageService.appointBooker(session.id, userId, userName);
    const updated = storageService.getSession(session.id);
    if (updated) onSessionUpdated(updated);
  };

  // Auto fill simulation for instant full table
  const handleAutoFill = () => {
    const updated = storageService.autoFillStrangers(session.id);
    if (updated) onSessionUpdated(updated);
  };

  // --- ORDERING & PAYMENT HANDLERS ---
  const handleAddDish = (item: MenuItem) => {
    const updated = storageService.addOrderItem(session.id, item, currentUser, 1);
    if (updated) onSessionUpdated(updated);
  };

  const handleUpdateItemQty = (orderItemId: string, delta: number) => {
    const updated = storageService.updateOrderItemQuantity(session.id, orderItemId, delta);
    if (updated) onSessionUpdated(updated);
  };

  const handleUpdatePaymentConfig = (orderType: 'PRE_ORDER' | 'DINE_IN_ORDER', paymentMode: 'PRE_PAY' | 'POST_PAY') => {
    const updated = storageService.updatePaymentConfig(session.id, orderType, paymentMode);
    if (updated) onSessionUpdated(updated);
  };

  const handleSaveCustomBill = () => {
    const updated = storageService.updateCustomBillAmount(session.id, Number(customBillInput));
    if (updated) onSessionUpdated(updated);
  };

  const handlePayShareSuccess = () => {
    const updated = storageService.payMemberShare(session.id, currentUser.id, currentUser.name);
    setShowQRModal(false);
    if (updated) onSessionUpdated(updated);
  };

  const handlePayFullSuccess = () => {
    const updated = storageService.payFullBill(session.id, currentUser.id, currentUser.name);
    setShowQRModal(false);
    if (updated) onSessionUpdated(updated);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* 1. MODAL HEADER */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-brand-600 via-orange-600 to-amber-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={session.restaurantImage}
              alt={session.restaurantName}
              className="w-12 h-12 rounded-xl object-cover border-2 border-white/40 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs">
                  {isAllPaid
                    ? '🎉 Bàn Đã Thanh Toán Hoàn Tất'
                    : session.status === 'LOCKED'
                    ? '🔒 Bàn Đã Chốt'
                    : '💬 Phòng Thảo Luận & Đặt Món'}
                </span>
                {session.isRestaurantRegistered ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400 text-emerald-950 flex items-center gap-1">
                    <Building className="w-3 h-3" /> Quán liên kết trực tiếp
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

        {/* 2. THREE MAIN TABS NAVIGATION */}
        <div className="flex items-center justify-between bg-slate-100 border-b border-slate-200 px-4 pt-2 gap-2 text-xs font-bold overflow-x-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveModalTab('chat')}
              className={`pb-2.5 px-3 flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
                activeModalTab === 'chat'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>Thảo Luận & Thành Viên</span>
            </button>

            <button
              onClick={() => setActiveModalTab('menu_order')}
              className={`pb-2.5 px-3 flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
                activeModalTab === 'menu_order'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Gọi Món / Thực Đơn</span>
              {paymentInfo.orderItems.length > 0 && (
                <span className="px-1.5 py-0.2 bg-brand-100 text-brand-700 rounded-full text-[10px]">
                  {paymentInfo.orderItems.reduce((sum, i) => sum + i.quantity, 0)} món
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveModalTab('payment')}
              className={`pb-2.5 px-3 flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
                activeModalTab === 'payment'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Receipt className="w-4 h-4 text-emerald-600" />
              <span>Hóa Đơn & Thanh Toán Chia Bill</span>
              {isAllPaid ? (
                <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full text-[10px]">
                  ✓ Đã Xong
                </span>
              ) : paymentInfo.totalAmount > 0 ? (
                <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded-full text-[10px]">
                  {formatCurrency(paymentInfo.amountPerPerson)}/người
                </span>
              ) : null}
            </button>
          </div>

          {/* Quick action: Jump to Pay button */}
          {activeModalTab !== 'payment' && paymentInfo.totalAmount > 0 && (
            <button
              onClick={() => setActiveModalTab('payment')}
              className="mb-1.5 px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold flex items-center gap-1 shadow-xs"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Thanh Toán ({formatCurrency(paymentInfo.totalAmount)}) &rarr;</span>
            </button>
          )}
        </div>

        {/* 3. TAB 1: DISCUSSION CHAT & MEMBERS */}
        {activeModalTab === 'chat' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* SUB-BAR */}
            <div className="px-4 sm:px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-brand-600" />
                  Giờ hẹn: <strong>{session.eatingTime}</strong>
                </span>
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-brand-600" />
                  Thành viên: <strong>{session.joinedMembers.length}/{session.targetSlots} người</strong>
                </span>
                {session.voucherApplied && (
                  <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 font-bold text-[11px]">
                    🎁 {session.voucherApplied.discountValue}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {session.status !== 'LOCKED' && session.status !== 'COMPLETED' && isMember && (
                  <button
                    onClick={() => setIsEditingSettings(!isEditingSettings)}
                    className="px-2.5 py-1 rounded-lg border border-slate-300 hover:bg-white text-slate-700 font-semibold"
                  >
                    {isEditingSettings ? 'Đóng sửa' : '✏️ Sửa giờ/số lượng'}
                  </button>
                )}
                {session.status === 'RECRUITING' && (
                  <button
                    onClick={handleAutoFill}
                    className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 font-bold flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Fill người lạ (Demo)</span>
                  </button>
                )}
              </div>
            </div>

            {/* EDIT SETTINGS COLLAPSIBLE */}
            {isEditingSettings && (
              <div className="p-3 bg-amber-50 border-b border-amber-200 flex flex-col sm:flex-row items-center gap-3 text-xs">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <label className="font-bold text-slate-700">Giờ đặt bàn:</label>
                  <input
                    type="text"
                    value={editedTime}
                    onChange={(e) => setEditedTime(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <label className="font-bold text-slate-700">Số lượng:</label>
                  <select
                    value={editedSlots}
                    onChange={(e) => setEditedSlots(Number(e.target.value))}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value={2}>2 người</option>
                    <option value={3}>3 người</option>
                    <option value={4}>4 người (chuẩn Voucher)</option>
                    <option value={5}>5 người</option>
                    <option value={6}>6 người</option>
                  </select>
                </div>
                <button
                  onClick={handleSaveSettings}
                  className="px-3 py-1.5 rounded-lg bg-brand-600 text-white font-bold"
                >
                  Lưu thay đổi
                </button>
              </div>
            )}

            {/* 2-COLUMN CHAT BODY */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[380px]">
              
              {/* MEMBERS LIST */}
              <div className="w-full md:w-72 bg-slate-50 border-r border-slate-200 p-3.5 overflow-y-auto flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-brand-600" />
                      Thành viên ({session.joinedMembers.length}/{session.targetSlots})
                    </span>
                  </div>

                  <div className="space-y-2">
                    {session.joinedMembers.map((member) => (
                      <div key={member.userId} className="p-2 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-2">
                        <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full object-cover" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-800 truncate">{member.name}</span>
                            {member.isHost && (
                              <span className="text-[9px] bg-brand-100 text-brand-800 px-1 rounded font-bold">Chủ bàn</span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 italic truncate">{member.introduction || 'Thành viên'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Non-registered restaurant election */}
                {!session.isRestaurantRegistered && session.status !== 'RECRUITING' && (
                  <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                    <span className="font-bold text-amber-900 flex items-center gap-1">
                      <PhoneCall className="w-3.5 h-3.5 text-amber-600" /> Bầu người gọi quán:
                    </span>
                    <div className="space-y-1 mt-1.5">
                      {session.joinedMembers.map((m) => (
                        <button
                          key={m.userId}
                          onClick={() => handleAppointBooker(m.userId, m.name)}
                          className={`w-full text-left px-2 py-1 rounded text-xs font-semibold flex items-center justify-between ${
                            session.appointedBookerId === m.userId
                              ? 'bg-amber-600 text-white'
                              : 'bg-white border border-amber-200 hover:bg-amber-100 text-slate-700'
                          }`}
                        >
                          <span>{m.name}</span>
                          {session.appointedBookerId === m.userId ? '✓ Đã chọn' : 'Bầu'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick intro options */}
                {isMember && session.status !== 'LOCKED' && session.status !== 'COMPLETED' && (
                  <div className="mt-3 pt-2 border-t border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 block mb-1">Giới thiệu nhanh:</span>
                    <div className="flex flex-wrap gap-1">
                      <button
                        onClick={() => handleSendQuickIntro('Mình ăn cay siêu tốt!')}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 hover:bg-brand-100 text-slate-700"
                      >
                        🌶️ Ăn cay
                      </button>
                      <button
                        onClick={() => handleSendQuickIntro('Mình ăn thanh đạm nhé.')}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 hover:bg-brand-100 text-slate-700"
                      >
                        🥦 Không cay
                      </button>
                      <button
                        onClick={() => handleSendQuickIntro('Mình đến đúng giờ!')}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 hover:bg-brand-100 text-slate-700"
                      >
                        ⏰ Đúng giờ
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* CHAT MESSAGES & ACTION BAR */}
              <div className="flex-1 flex flex-col justify-between bg-white">
                <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5">
                  {session.discussionMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-2 ${msg.isSystem ? 'justify-center my-1.5' : msg.userId === currentUser.id ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.isSystem ? (
                        <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs px-3 py-1 rounded-xl max-w-lg text-center font-medium">
                          {msg.message}
                        </div>
                      ) : (
                        <>
                          {msg.userId !== currentUser.id && (
                            <img src={msg.userAvatar} alt={msg.userName} className="w-7 h-7 rounded-full object-cover" />
                          )}
                          <div className={`max-w-[75%] rounded-2xl px-3 py-1.5 text-xs shadow-xs ${
                            msg.userId === currentUser.id
                              ? 'bg-brand-600 text-white rounded-tr-xs'
                              : 'bg-slate-100 text-slate-800 rounded-tl-xs'
                          }`}>
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <span className={`font-bold text-[10px] ${msg.userId === currentUser.id ? 'text-brand-100' : 'text-slate-500'}`}>
                                {msg.userName}
                              </span>
                              <span className={`text-[9px] ${msg.userId === currentUser.id ? 'text-brand-200' : 'text-slate-400'}`}>
                                {msg.timestamp}
                              </span>
                            </div>
                            <p className="whitespace-pre-wrap">{msg.message}</p>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {/* BOTTOM ACTION & CHAT INPUT */}
                <div className="p-3 border-t border-slate-200 bg-slate-50 space-y-2">
                  
                  {/* CHỐT BÀN HOẶC THANH TOÁN BANNER */}
                  {session.status === 'LOCKED' ? (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Bàn đã chốt thành công! Tiếp theo:</span>
                      </div>
                      <button
                        onClick={() => setActiveModalTab('payment')}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs flex items-center gap-1"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Mở Hóa Đơn & Thanh Toán</span>
                      </button>
                    </div>
                  ) : session.status === 'COMPLETED' ? (
                    <div className="p-2.5 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-between text-xs text-emerald-900 font-bold">
                      <span>✓ Bàn đã thanh toán hoàn tất!</span>
                      <button
                        onClick={() => setActiveModalTab('payment')}
                        className="underline text-emerald-800"
                      >
                        Xem biên lai
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-gradient-to-r from-brand-50 to-amber-50 border border-brand-200 text-xs">
                      <span className="text-brand-900">Đã đủ thông tin hoặc muốn chốt bàn?</span>
                      <button
                        onClick={handleLockSession}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Chốt Bàn Ngay</span>
                      </button>
                    </div>
                  )}

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Nhập tin nhắn trao đổi với cả nhóm..."
                      className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:border-brand-500"
                    />
                    <button
                      type="submit"
                      disabled={!inputText.trim()}
                      className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-bold text-xs flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Gửi</span>
                    </button>
                  </form>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* 4. TAB 2: MENU & PRE-ORDER (GỌI MÓN & CHỌN HÌNH THỨC) */}
        {activeModalTab === 'menu_order' && (
          <div className="flex-1 p-5 overflow-y-auto space-y-5 bg-slate-50/50">
            
            {/* CHOICE BANNER: PRE-ORDER VS DINE-IN ORDER */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-brand-600" />
                Chọn Hình Thức Đặt Món & Thời Điểm Thanh Toán:
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Mode 1: Pre-order & Pre-pay */}
                <label
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    paymentInfo.orderType === 'PRE_ORDER' && paymentInfo.paymentMode === 'PRE_PAY'
                      ? 'bg-brand-50 border-brand-500 ring-2 ring-brand-300'
                      : 'bg-slate-50 border-slate-200 hover:bg-white'
                  }`}
                  onClick={() => handleUpdatePaymentConfig('PRE_ORDER', 'PRE_PAY')}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-xs text-brand-900">Đặt Trước & Trả Trước</span>
                      <input
                        type="radio"
                        name="order_mode"
                        checked={paymentInfo.orderType === 'PRE_ORDER' && paymentInfo.paymentMode === 'PRE_PAY'}
                        readOnly
                        className="text-brand-600"
                      />
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Cả nhóm chọn món trước trên App và thanh toán luôn để quán làm sẵn món khi đến.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-brand-700 mt-2 block">✓ Nhanh gọn nhất</span>
                </label>

                {/* Mode 2: Pre-order & Post-pay */}
                <label
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    paymentInfo.orderType === 'PRE_ORDER' && paymentInfo.paymentMode === 'POST_PAY'
                      ? 'bg-brand-50 border-brand-500 ring-2 ring-brand-300'
                      : 'bg-slate-50 border-slate-200 hover:bg-white'
                  }`}
                  onClick={() => handleUpdatePaymentConfig('PRE_ORDER', 'POST_PAY')}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-xs text-brand-900">Đặt Trước & Trả Sau</span>
                      <input
                        type="radio"
                        name="order_mode"
                        checked={paymentInfo.orderType === 'PRE_ORDER' && paymentInfo.paymentMode === 'POST_PAY'}
                        readOnly
                        className="text-brand-600"
                      />
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Lên sẵn danh sách món để nhà hàng chuẩn bị, ăn xong mới quyết toán và chia tiền.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 mt-2 block">✓ Thoải mái gọi thêm</span>
                </label>

                {/* Mode 3: Dine-in order & Post-pay */}
                <label
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    paymentInfo.orderType === 'DINE_IN_ORDER'
                      ? 'bg-brand-50 border-brand-500 ring-2 ring-brand-300'
                      : 'bg-slate-50 border-slate-200 hover:bg-white'
                  }`}
                  onClick={() => handleUpdatePaymentConfig('DINE_IN_ORDER', 'POST_PAY')}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-xs text-brand-900">Gọi Tại Quán & Trả Sau</span>
                      <input
                        type="radio"
                        name="order_mode"
                        checked={paymentInfo.orderType === 'DINE_IN_ORDER'}
                        readOnly
                        className="text-brand-600"
                      />
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Đến quán xem menu trực tiếp, sau khi ăn xong nhập số tiền hóa đơn để chia đều.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 mt-2 block">✓ Nhập tiền bill thực tế</span>
                </label>
              </div>
            </div>

            {/* IF DINE-IN ORDER: BILL INPUT */}
            {paymentInfo.orderType === 'DINE_IN_ORDER' ? (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  Nhập Tổng Tiền Hóa Đơn Quán In Sau Khi Ăn Xong:
                </h4>
                <p className="text-xs text-slate-500">
                  Khi dùng bữa xong, bạn hãy nhập tổng tiền ghi trên hóa đơn nhà hàng để hệ thống tự động trừ voucher (nếu có) và chia đều cho từng thành viên.
                </p>
                <div className="flex items-center gap-3 max-w-md">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      value={customBillInput}
                      onChange={(e) => setCustomBillInput(Number(e.target.value))}
                      step={10000}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-sm text-slate-900 focus:outline-none focus:border-brand-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">VNĐ</span>
                  </div>
                  <button
                    onClick={handleSaveCustomBill}
                    className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs"
                  >
                    Lưu Số Tiền
                  </button>
                </div>
              </div>
            ) : (
              /* IF PRE-ORDER: SHOW MENU TO ADD DISHES */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* RESTAURANT MENU (2 COLUMNS) */}
                <div className="md:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                      Thực đơn tại {session.restaurantName} ({restaurantMenuItems.length} món)
                    </h4>
                    <span className="text-[11px] text-slate-500">Bấm '+' để thêm vào bàn</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {restaurantMenuItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-start gap-2.5 justify-between"
                      >
                        <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-xs text-slate-900 truncate">{item.name}</h5>
                          <span className="text-[10px] text-slate-400 block">{item.category}</span>
                          <span className="font-extrabold text-xs text-brand-600 block mt-1">
                            {formatCurrency(item.price)}
                          </span>
                        </div>
                        <button
                          onClick={() => handleAddDish(item)}
                          className="w-7 h-7 rounded-lg bg-brand-50 hover:bg-brand-600 text-brand-600 hover:text-white flex items-center justify-center font-bold text-xs transition-colors"
                          title="Thêm món này vào bàn ăn"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SELECTED DISHES FOR THIS SESSION (1 COLUMN) */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                        Món Bàn Đã Chọn ({paymentInfo.orderItems.length})
                      </span>
                    </div>

                    {paymentInfo.orderItems.length === 0 ? (
                      <div className="py-10 text-center text-xs text-slate-400">
                        Chưa chọn món nào. Hãy bấm dấu (+) bên trái để chọn món cùng cả nhóm!
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto space-y-2 pt-2">
                        {paymentInfo.orderItems.map((item) => (
                          <div key={item.id} className="pt-2 text-xs">
                            <div className="flex items-start justify-between">
                              <div>
                                <h6 className="font-bold text-slate-800 line-clamp-1">{item.name}</h6>
                                <span className="text-[10px] text-slate-400">
                                  {item.addedByUserName} gọi • {formatCurrency(item.price)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 ml-2">
                                <button
                                  onClick={() => handleUpdateItemQty(item.id, -1)}
                                  className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700"
                                >
                                  <Minus className="w-2.5 h-2.5" />
                                </button>
                                <span className="font-bold text-xs min-w-4 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => handleUpdateItemQty(item.id, 1)}
                                  className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700"
                                >
                                  <Plus className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            </div>
                            <div className="text-right font-extrabold text-[11px] text-brand-600 mt-0.5">
                              = {formatCurrency(item.price * item.quantity)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Summary Box */}
                  <div className="pt-3 border-t border-slate-100 space-y-2 mt-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Tạm tính:</span>
                      <strong className="text-slate-900">{formatCurrency(paymentInfo.subtotal)}</strong>
                    </div>
                    {paymentInfo.discountAmount > 0 && (
                      <div className="flex items-center justify-between text-xs text-red-600 font-semibold">
                        <span>Giảm voucher:</span>
                        <span>-{formatCurrency(paymentInfo.discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs font-bold pt-1 border-t border-slate-100">
                      <span className="text-slate-800">Cần thanh toán:</span>
                      <span className="text-sm font-black text-brand-600">{formatCurrency(paymentInfo.totalAmount)}</span>
                    </div>

                    <button
                      onClick={() => setActiveModalTab('payment')}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm mt-2"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Xem Bảng Chia Tiền &rarr;</span>
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

        {/* 5. TAB 3: BILL & PAYMENT / CHIA TIỀN ĐẦY ĐỦ */}
        {activeModalTab === 'payment' && (
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-6 bg-slate-50/50">
            
            {/* SUCCESS BANNER IF COMPLETED */}
            {isAllPaid && (
              <div className="p-4 bg-emerald-50 border-2 border-emerald-500 rounded-2xl flex items-center justify-between text-emerald-950 animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                    <Check className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm">Thanh Toán Bàn Ăn Thành Công 100%! 🎉</h4>
                    <p className="text-xs text-emerald-700">
                      Tất cả thành viên đã quyết toán hóa đơn. Chúc cả nhóm có bữa ăn ngon miệng và nhiều niềm vui!
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-600 text-white font-black text-xs rounded-xl shadow-xs">
                  COMPLETED
                </span>
              </div>
            )}

            {/* BILL RECEIPT CARD */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 max-w-2xl mx-auto">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h3 className="font-black text-lg text-slate-900">Phiếu Quyết Toán Bàn Ăn</h3>
                  <p className="text-xs text-slate-500">{session.restaurantName} • {session.eatingTime}</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    {paymentInfo.paymentMode === 'PRE_PAY' ? 'Thanh Toán Trước' : 'Thanh Toán Sau Khi Ăn'}
                  </span>
                </div>
              </div>

              {/* Order Items Breakdown */}
              <div className="space-y-2 text-xs">
                {paymentInfo.orderType === 'PRE_ORDER' && paymentInfo.orderItems.length > 0 ? (
                  paymentInfo.orderItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-slate-700">
                      <span>{item.name} × {item.quantity} ({item.addedByUserName})</span>
                      <span className="font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-between text-slate-700">
                    <span>Hóa đơn ăn uống gọi tại quán:</span>
                    <span className="font-semibold">{formatCurrency(paymentInfo.subtotal)}</span>
                  </div>
                )}
              </div>

              {/* Subtotal & Discounts */}
              <div className="pt-3 border-t border-dashed border-slate-300 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Tiền tạm tính (Subtotal):</span>
                  <span className="font-bold">{formatCurrency(paymentInfo.subtotal)}</span>
                </div>

                {session.voucherApplied && paymentInfo.discountAmount > 0 && (
                  <div className="flex items-center justify-between text-red-600 font-bold">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" /> Voucher: {session.voucherApplied.title} ({session.voucherApplied.discountValue})
                    </span>
                    <span>-{formatCurrency(paymentInfo.discountAmount)}</span>
                  </div>
                )}

                {/* TOTAL AMOUNT */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-sm">
                  <span className="font-black text-slate-900">TỔNG TIỀN PHẢI TRẢ (Total):</span>
                  <span className="font-black text-lg text-brand-600">{formatCurrency(paymentInfo.totalAmount)}</span>
                </div>

                {/* SPLIT PER PERSON */}
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs mt-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-brand-600" />
                    <span className="font-bold text-amber-950">
                      Chia đều cho {session.joinedMembers.length} người:
                    </span>
                  </div>
                  <span className="font-black text-base text-amber-900">
                    {formatCurrency(paymentInfo.amountPerPerson)} / người
                  </span>
                </div>
              </div>

              {/* MEMBERS PAYMENT TRACKING */}
              <div className="pt-3 border-t border-slate-200">
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-2.5">
                  Trạng Thái Thanh Toán Của Từng Thành Viên:
                </h4>
                <div className="space-y-2">
                  {session.joinedMembers.map((member) => {
                    const paidInfo = paymentInfo.paidMembers[member.userId];
                    const isPaid = !!paidInfo?.paid;

                    return (
                      <div
                        key={member.userId}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                          isPaid ? 'bg-emerald-50/70 border-emerald-200' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <img src={member.avatar} alt={member.name} className="w-7 h-7 rounded-full object-cover" />
                          <div>
                            <span className="font-bold text-slate-800">{member.name}</span>
                            {member.userId === currentUser.id && <span className="text-[10px] text-brand-600 font-bold ml-1">(Bạn)</span>}
                            <span className="text-[10px] text-slate-400 block">{formatCurrency(paymentInfo.amountPerPerson)}</span>
                          </div>
                        </div>

                        {isPaid ? (
                          <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <Check className="w-3 h-3" /> Đã Thanh Toán ({paidInfo.paidAt})
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-lg">
                            Chưa Thanh Toán
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ACTIONS: PAY BUTTONS */}
              {!isAllPaid && (
                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-3">
                  {/* Pay my share */}
                  {!isCurrentUserPaid && (
                    <button
                      onClick={() => {
                        setQrPaymentType('SHARE');
                        setShowQRModal(true);
                      }}
                      className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transform active:scale-95 transition-all"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Thanh Toán Phần Của Tôi ({formatCurrency(paymentInfo.amountPerPerson)})</span>
                    </button>
                  )}

                  {/* Pay full bill */}
                  <button
                    onClick={() => {
                      setQrPaymentType('FULL');
                      setShowQRModal(true);
                    }}
                    className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <CreditCard className="w-4 h-4 text-amber-400" />
                    <span>Thanh Toán Hết Cả Bàn ({formatCurrency(paymentInfo.totalAmount)})</span>
                  </button>
                </div>
              )}

            </div>

          </div>
        )}

      </div>

      {/* QR CODE SCANNER MODAL (SIMULATED VIETQR / MOMO PAYMENT) */}
      {showQRModal && (
        <div className="fixed inset-0 z-60 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in zoom-in-95 duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden p-6 text-center space-y-4">
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mã Thanh Toán VietQR</span>
              <button onClick={() => setShowQRModal(false)} className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* QR Box */}
            <div className="p-4 bg-gradient-to-tr from-brand-50 to-amber-50 rounded-2xl border border-brand-200 flex flex-col items-center">
              <div className="w-48 h-48 bg-white p-2.5 rounded-xl border border-slate-300 shadow-sm flex flex-col items-center justify-center relative">
                {/* SVG Simulated QR Code */}
                <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                  <rect x="10" y="10" width="25" height="25" fill="black" />
                  <rect x="14" y="14" width="17" height="17" fill="white" />
                  <rect x="18" y="18" width="9" height="9" fill="black" />
                  
                  <rect x="65" y="10" width="25" height="25" fill="black" />
                  <rect x="69" y="14" width="17" height="17" fill="white" />
                  <rect x="73" y="18" width="9" height="9" fill="black" />
                  
                  <rect x="10" y="65" width="25" height="25" fill="black" />
                  <rect x="14" y="69" width="17" height="17" fill="white" />
                  <rect x="18" y="73" width="9" height="9" fill="black" />
                  
                  {/* Pattern dots */}
                  <rect x="42" y="15" width="6" height="6" />
                  <rect x="52" y="25" width="6" height="6" />
                  <rect x="45" y="45" width="10" height="10" fill="#f97316" />
                  <rect x="25" y="45" width="6" height="6" />
                  <rect x="65" y="55" width="6" height="6" />
                  <rect x="75" y="65" width="6" height="6" />
                  <rect x="42" y="75" width="6" height="6" />
                  <rect x="55" y="80" width="6" height="6" />
                  <rect x="80" y="80" width="6" height="6" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-[9px] font-black bg-white px-1.5 py-0.5 rounded shadow border border-brand-300 text-brand-600">
                    VietQR
                  </span>
                </div>
              </div>

              <div className="mt-3 text-center">
                <span className="text-[11px] text-slate-500 font-semibold block">Số tiền cần thanh toán:</span>
                <span className="text-xl font-black text-brand-600">
                  {formatCurrency(qrPaymentType === 'SHARE' ? paymentInfo.amountPerPerson : paymentInfo.totalAmount)}
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Nội dung: <strong>CHAMDUA {session.id.slice(-5).toUpperCase()}</strong>
                </p>
              </div>
            </div>

            {/* CONFIRM SUCCESS BUTTON */}
            <button
              onClick={qrPaymentType === 'SHARE' ? handlePayShareSuccess : handlePayFullSuccess}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-1.5 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Xác Nhận Đã Chuyển Khoản Thành Công</span>
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
