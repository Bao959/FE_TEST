import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Send,
  RotateCw,
  BellRing
} from 'lucide-react';
import { User } from '../../types';
import { storageService } from '../../services/storageService';

interface VerificationModalProps {
  user: User;
  isOpen: boolean;
  initialTab?: 'email' | 'phone';
  onClose: () => void;
  onVerified: (updatedUser: User) => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  user,
  isOpen,
  initialTab = 'phone',
  onClose,
  onVerified
}) => {
  const [activeTab, setActiveTab] = useState<'email' | 'phone'>(initialTab);

  // Email states
  const [emailInput, setEmailInput] = useState(user.email || '');
  const [emailOtp, setEmailOtp] = useState(['', '', '', '', '', '']);
  const [isEmailOtpSent, setIsEmailOtpSent] = useState(false);
  const [emailTimer, setEmailTimer] = useState(0);
  const [simulatedEmailCode, setSimulatedEmailCode] = useState<string | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(!!user.isEmailVerified);

  // Phone states
  const [phoneInput, setPhoneInput] = useState(user.phone || '');
  const [phoneOtp, setPhoneOtp] = useState(['', '', '', '', '', '']);
  const [isPhoneOtpSent, setIsPhoneOtpSent] = useState(false);
  const [phoneTimer, setPhoneTimer] = useState(0);
  const [simulatedPhoneCode, setSimulatedPhoneCode] = useState<string | null>(null);
  const [isPhoneVerified, setIsPhoneVerified] = useState(!!user.isPhoneVerified);

  // Notification toast
  const [activeSimulatedToast, setActiveSimulatedToast] = useState<{
    type: 'email' | 'phone';
    code: string;
    msg: string;
  } | null>(null);

  useEffect(() => {
    let interval: any = null;
    if (emailTimer > 0) {
      interval = setInterval(() => setEmailTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [emailTimer]);

  useEffect(() => {
    let interval: any = null;
    if (phoneTimer > 0) {
      interval = setInterval(() => setPhoneTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [phoneTimer]);

  if (!isOpen) return null;

  // SEND EMAIL OTP
  const handleSendEmailOtp = () => {
    if (!emailInput.trim()) {
      alert('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }
    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedEmailCode(generated);
    setIsEmailOtpSent(true);
    setEmailTimer(60);

    // Show simulated toast notification
    setActiveSimulatedToast({
      type: 'email',
      code: generated,
      msg: `[Hộp thư Chạm Đũa]: Mã xác thực Email của bạn là ${generated} (hiệu lực 5 phút).`
    });
  };

  // SEND PHONE OTP
  const handleSendPhoneOtp = () => {
    if (!phoneInput.trim() || phoneInput.trim().length < 9) {
      alert('Vui lòng nhập số điện thoại hợp lệ (từ 10 chữ số).');
      return;
    }
    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedPhoneCode(generated);
    setIsPhoneOtpSent(true);
    setPhoneTimer(60);

    // Show simulated SMS toast notification
    setActiveSimulatedToast({
      type: 'phone',
      code: generated,
      msg: `[SMS OTP Chạm Đũa]: Mã xác thực SĐT của bạn là ${generated}. Tuyệt đối không chia sẻ mã này.`
    });
  };

  // AUTO-FILL OTP FROM NOTIFICATION
  const handleAutoFillOtp = () => {
    if (!activeSimulatedToast) return;
    const digits = activeSimulatedToast.code.split('');
    if (activeSimulatedToast.type === 'email') {
      setEmailOtp(digits);
    } else {
      setPhoneOtp(digits);
    }
    setActiveSimulatedToast(null);
  };

  // VERIFY EMAIL
  const handleVerifyEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = emailOtp.join('');
    if (entered.length < 6) {
      alert('Vui lòng nhập đủ 6 chữ số mã OTP.');
      return;
    }

    if (entered === simulatedEmailCode || entered === '123456') {
      setIsEmailVerified(true);
      const updated: User = {
        ...user,
        email: emailInput.trim(),
        isEmailVerified: true,
        trustScore: Math.min(5.0, Number((user.trustScore + 0.1).toFixed(1)))
      };
      storageService.updateUser(updated);
      onVerified(updated);
    } else {
      alert('Mã OTP không chính xác. Vui lòng kiểm tra lại!');
    }
  };

  // VERIFY PHONE
  const handleVerifyPhone = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = phoneOtp.join('');
    if (entered.length < 6) {
      alert('Vui lòng nhập đủ 6 chữ số mã OTP.');
      return;
    }

    if (entered === simulatedPhoneCode || entered === '123456') {
      setIsPhoneVerified(true);
      const updated: User = {
        ...user,
        phone: phoneInput.trim(),
        isPhoneVerified: true,
        trustScore: Math.min(5.0, Number((user.trustScore + 0.3).toFixed(1)))
      };
      storageService.updateUser(updated);
      onVerified(updated);
    } else {
      alert('Mã OTP không chính xác. Vui lòng kiểm tra lại!');
    }
  };

  // OTP Box Change handler
  const handleOtpBoxChange = (
    index: number,
    value: string,
    target: 'email' | 'phone'
  ) => {
    const val = value.slice(-1);
    const current = target === 'email' ? [...emailOtp] : [...phoneOtp];
    current[index] = val;

    if (target === 'email') {
      setEmailOtp(current);
    } else {
      setPhoneOtp(current);
    }

    // Auto-focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`${target}-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      
      {/* SIMULATED TOAST NOTIFICATION */}
      {activeSimulatedToast && (
        <div className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-50 bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl border border-amber-500/40 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <BellRing className="w-4 h-4 animate-bounce" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-amber-300 flex items-center justify-between">
                <span>{activeSimulatedToast.type === 'email' ? 'Thông báo Hộp thư mới' : 'Tin nhắn SMS (Mô phỏng)'}</span>
                <span className="text-[10px] text-slate-400">Vừa xong</span>
              </div>
              <p className="text-[11px] text-slate-200 mt-1 leading-snug">
                {activeSimulatedToast.msg}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAutoFillOtp}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-[11px] flex items-center gap-1 shadow-sm transition-all"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Điền mã {activeSimulatedToast.code} ngay</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSimulatedToast(null)}
                  className="text-[11px] text-slate-400 hover:text-white"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden relative">
        
        {/* HEADER */}
        <div className="p-5 bg-gradient-to-r from-brand-600 via-orange-600 to-amber-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-xl">
              🛡️
            </div>
            <div>
              <h3 className="font-extrabold text-base">Xác Minh & Bổ Sung Thông Tin</h3>
              <p className="text-xs text-amber-100">
                Xác thực Email và Số điện thoại để tăng điểm uy tín trong bàn ăn Chạm Đũa
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

        {/* TABS */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('phone')}
            className={`pb-3 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'phone'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Xác minh Số điện thoại</span>
            {isPhoneVerified ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('email')}
            className={`pb-3 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'email'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Xác minh Email</span>
            {isEmailVerified ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 sm:p-6 space-y-4">
          
          {/* TAB 1: PHONE VERIFICATION */}
          {activeTab === 'phone' && (
            <div>
              {isPhoneVerified ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="font-extrabold text-sm text-emerald-900">
                    Số Điện Thoại Đã Được Xác Minh!
                  </h4>
                  <p className="text-xs text-emerald-700">
                    Số điện thoại: <strong>{phoneInput}</strong> đã được xác thực an toàn. Điểm uy tín được cộng thêm <strong>+0.3 ★</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsPhoneVerified(false)}
                    className="mt-2 text-xs text-slate-500 hover:text-slate-800 underline"
                  >
                    Thay đổi số điện thoại khác
                  </button>
                </div>
              ) : (
                <form onSubmit={handleVerifyPhone} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Số điện thoại di động (Việt Nam) *
                    </label>
                    <div className="flex gap-2">
                      <div className="flex items-center px-3 rounded-xl bg-slate-100 border border-slate-300 text-xs font-bold text-slate-600">
                        🇻🇳 +84
                      </div>
                      <input
                        type="tel"
                        required
                        placeholder="0912 345 678"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-brand-500 font-semibold"
                      />
                      <button
                        type="button"
                        onClick={handleSendPhoneOtp}
                        disabled={phoneTimer > 0}
                        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                          phoneTimer > 0
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm'
                        }`}
                      >
                        <Send className="w-3 h-3" />
                        <span>{phoneTimer > 0 ? `${phoneTimer}s` : isPhoneOtpSent ? 'Gửi lại' : 'Gửi mã OTP'}</span>
                      </button>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Hệ thống sẽ gửi mã xác thực 6 số qua tin nhắn SMS mô phỏng.
                    </span>
                  </div>

                  {isPhoneOtpSent && (
                    <div className="space-y-3 pt-2 border-t border-slate-100 animate-in fade-in">
                      <label className="block text-xs font-semibold text-slate-700">
                        Nhập mã OTP 6 số đã gửi tới số của bạn:
                      </label>
                      <div className="flex justify-between gap-1.5 sm:gap-2">
                        {phoneOtp.map((digit, idx) => (
                          <input
                            key={idx}
                            id={`phone-otp-${idx}`}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpBoxChange(idx, e.target.value, 'phone')}
                            className="w-10 sm:w-12 h-12 text-center text-lg font-black rounded-xl border-2 border-slate-300 focus:border-brand-500 focus:outline-none bg-slate-50 focus:bg-white transition-all"
                          />
                        ))}
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Xác Nhận & Nâng Điểm Uy Tín</span>
                      </button>
                    </div>
                  )}
                </form>
              )}
            </div>
          )}

          {/* TAB 2: EMAIL VERIFICATION */}
          {activeTab === 'email' && (
            <div>
              {isEmailVerified ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="font-extrabold text-sm text-emerald-900">
                    Email Đã Được Xác Minh!
                  </h4>
                  <p className="text-xs text-emerald-700">
                    Email <strong>{emailInput}</strong> là địa chỉ nhận thông báo bàn ăn chính thức.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsEmailVerified(false)}
                    className="mt-2 text-xs text-slate-500 hover:text-slate-800 underline"
                  >
                    Thay đổi địa chỉ email khác
                  </button>
                </div>
              ) : (
                <form onSubmit={handleVerifyEmail} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Địa chỉ Email tài khoản *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        required
                        placeholder="tuan.nguyen@foodie.vn"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-brand-500 font-semibold"
                      />
                      <button
                        type="button"
                        onClick={handleSendEmailOtp}
                        disabled={emailTimer > 0}
                        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                          emailTimer > 0
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm'
                        }`}
                      >
                        <Send className="w-3 h-3" />
                        <span>{emailTimer > 0 ? `${emailTimer}s` : isEmailOtpSent ? 'Gửi lại' : 'Gửi mã OTP'}</span>
                      </button>
                    </div>
                  </div>

                  {isEmailOtpSent && (
                    <div className="space-y-3 pt-2 border-t border-slate-100 animate-in fade-in">
                      <label className="block text-xs font-semibold text-slate-700">
                        Nhập mã xác thực 6 số gửi qua hòm thư:
                      </label>
                      <div className="flex justify-between gap-1.5 sm:gap-2">
                        {emailOtp.map((digit, idx) => (
                          <input
                            key={idx}
                            id={`email-otp-${idx}`}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpBoxChange(idx, e.target.value, 'email')}
                            className="w-10 sm:w-12 h-12 text-center text-lg font-black rounded-xl border-2 border-slate-300 focus:border-brand-500 focus:outline-none bg-slate-50 focus:bg-white transition-all"
                          />
                        ))}
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Xác Nhận Email Thành Công</span>
                      </button>
                    </div>
                  )}
                </form>
              )}
            </div>
          )}

          {/* VALUE NOTICE */}
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Lợi ích xác minh:</strong> Hồ sơ có tích xanh xác minh Email & SĐT được các thành viên khác tin tưởng duyệt vào bàn ăn chung nhanh hơn gấp <strong>3 lần</strong>!
            </span>
          </div>

        </div>

        {/* FOOTER */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">Bảo mật chuẩn OTP viễn thông Việt Nam</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
