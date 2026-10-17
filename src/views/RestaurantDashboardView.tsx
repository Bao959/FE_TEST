import React, { useState } from 'react';
import {
  Store,
  Calendar,
  Users,
  UtensilsCrossed,
  Tag,
  Plus,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Phone,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  Percent,
  PieChart,
  BarChart3,
  ArrowUpRight,
  Download,
  Printer,
  Layers,
  ShoppingBag,
  Award,
  LayoutGrid,
  List,
  Search
} from 'lucide-react';
import { Restaurant, MenuItem, GroupVoucher, DiningSession, User } from '../types';
import { storageService } from '../services/storageService';
import { formatCurrency } from '../utils/geo';

interface RestaurantDashboardViewProps {
  currentUser: User;
  activeSection?: 'reservations' | 'menu' | 'promotions' | 'stats';
  onSectionChange?: (sec: 'reservations' | 'menu' | 'promotions' | 'stats') => void;
}

export const RestaurantDashboardView: React.FC<RestaurantDashboardViewProps> = ({
  currentUser,
  activeSection,
  onSectionChange
}) => {
  const allRestaurants = storageService.getRestaurants().filter((r) => r.isRegisteredOnSystem);
  
  // Choose active restaurant: if user is restaurant manager, pick their restaurant, else default to Haidilao
  const [selectedRestId, setSelectedRestId] = useState<string>(
    currentUser.restaurantId || allRestaurants[0]?.id || 'rest_1'
  );

  const [internalTab, setInternalTab] = useState<'reservations' | 'menu' | 'promotions' | 'stats'>('reservations');
  const activeTab = activeSection || internalTab;

  const setActiveTab = (tab: 'reservations' | 'menu' | 'promotions' | 'stats') => {
    setInternalTab(tab);
    if (onSectionChange) onSectionChange(tab);
  };

  const currentRestaurant = allRestaurants.find((r) => r.id === selectedRestId) || allRestaurants[0];

  // States
  const [reservations, setReservations] = useState<DiningSession[]>(() =>
    storageService.getRestaurantReservations(currentRestaurant.id)
  );
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() =>
    storageService.getMenuItems(currentRestaurant.id)
  );
  const [vouchers, setVouchers] = useState<GroupVoucher[]>(() =>
    storageService.getVouchers(currentRestaurant.id)
  );

  // Form states for adding dish
  const [isAddingDish, setIsAddingDish] = useState(false);
  const [dishName, setDishName] = useState('');
  const [dishPrice, setDishPrice] = useState<number>(120000);
  const [dishCategory, setDishCategory] = useState('Món Nhúng / Nướng');
  const [dishDescription, setDishDescription] = useState('');
  const [dishImage, setDishImage] = useState('https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80');

  // Form states for editing dish
  const [editingDish, setEditingDish] = useState<MenuItem | null>(null);

  // Form states for adding voucher
  const [isAddingVoucher, setIsAddingVoucher] = useState(false);
  const [vCode, setVCode] = useState('');
  const [vTitle, setVTitle] = useState('');
  const [vDiscount, setVDiscount] = useState('Giảm 25%');
  const [vMinSize, setVMinSize] = useState(4);
  const [vDesc, setVDesc] = useState('');
  const [vExpiry, setVExpiry] = useState('30/11/2026');

  // States for detailed revenue statistics
  const [statsTimeRange, setStatsTimeRange] = useState<'7d' | '30d' | 'month' | 'last_month'>('30d');
  const [statsMetric, setStatsMetric] = useState<'revenue' | 'tables'>('revenue');
  const [statsHoveredDay, setStatsHoveredDay] = useState<number | null>(null);
  const [statsViewMode, setStatsViewMode] = useState<'card' | 'list'>('list');
  const [statsSearchQuery, setStatsSearchQuery] = useState('');

  // Switch restaurant helper
  const handleSelectRestaurant = (id: string) => {
    setSelectedRestId(id);
    setReservations(storageService.getRestaurantReservations(id));
    setMenuItems(storageService.getMenuItems(id));
    setVouchers(storageService.getVouchers(id));
  };

  // Confirm booking reservation
  const handleConfirmReservation = (sessionId: string) => {
    storageService.confirmRestaurantReservation(sessionId);
    setReservations(storageService.getRestaurantReservations(currentRestaurant.id));
  };

  // Add Dish
  const handleAddDishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName.trim()) return;

    storageService.addMenuItem({
      restaurantId: currentRestaurant.id,
      name: dishName.trim(),
      price: Number(dishPrice),
      category: dishCategory,
      description: dishDescription.trim() || 'Món ăn thơm ngon, hấp dẫn của nhà hàng.',
      image: dishImage,
      isAvailable: true
    });

    setDishName('');
    setDishPrice(120000);
    setDishDescription('');
    setIsAddingDish(false);
    setMenuItems(storageService.getMenuItems(currentRestaurant.id));
  };

  // Update Dish
  const handleUpdateDishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDish) return;

    storageService.updateMenuItem(editingDish);
    setEditingDish(null);
    setMenuItems(storageService.getMenuItems(currentRestaurant.id));
  };

  // Toggle dish availability
  const handleToggleAvailability = (dish: MenuItem) => {
    const updated = { ...dish, isAvailable: !dish.isAvailable };
    storageService.updateMenuItem(updated);
    setMenuItems(storageService.getMenuItems(currentRestaurant.id));
  };

  // Delete dish
  const handleDeleteDish = (dishId: string) => {
    if (window.confirm('Bạn có chắc muốn xóa món ăn này khỏi thực đơn?')) {
      storageService.deleteMenuItem(dishId);
      setMenuItems(storageService.getMenuItems(currentRestaurant.id));
    }
  };

  // Add Voucher
  const handleAddVoucherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vCode.trim() || !vTitle.trim()) return;

    storageService.addVoucher({
      restaurantId: currentRestaurant.id,
      restaurantName: currentRestaurant.name,
      code: vCode.trim().toUpperCase(),
      title: vTitle.trim(),
      description: vDesc.trim() || `Ưu đãi dành cho nhóm từ ${vMinSize} người trở lên khi ghép bàn trên Chạm Đũa.`,
      discountValue: vDiscount.trim(),
      minGroupSize: Number(vMinSize),
      expiryDate: vExpiry.trim(),
      bannerImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80'
    });

    setVCode('');
    setVTitle('');
    setVDesc('');
    setIsAddingVoucher(false);
    setVouchers(storageService.getVouchers(currentRestaurant.id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* RESTAURANT PORTAL HEADER */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border border-slate-800">
        <div className="flex items-center gap-4">
          <img
            src={currentRestaurant.coverImage}
            alt={currentRestaurant.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-emerald-500/50 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <Store className="w-3 h-3" /> Đối Tác Đã Kích Hoạt
              </span>
              <span className="text-xs text-slate-400">Hotline: {currentRestaurant.phone}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black mt-1 text-white">{currentRestaurant.name}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{currentRestaurant.address}</p>
          </div>
        </div>

        {/* Quick Switch between Registered Partner Restaurants */}
        <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 text-xs flex flex-col gap-1.5 w-full md:w-auto">
          <span className="font-semibold text-slate-400">Chọn Chi Nhánh Quán Quản Lý:</span>
          <select
            value={selectedRestId}
            onChange={(e) => handleSelectRestaurant(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold focus:outline-none focus:border-emerald-500"
          >
            {allRestaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('reservations')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'reservations'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Đơn Đặt Bàn Nhóm ({reservations.length})</span>
          {reservations.some((r) => r.reservationStatus === 'SENT_TO_RESTAURANT') && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('menu')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'menu'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>Quản Lý Thực Đơn ({menuItems.length} món)</span>
        </button>

        <button
          onClick={() => setActiveTab('promotions')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'promotions'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Voucher & Khuyến Mãi Nhóm ({vouchers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'stats'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Thống Kê Doanh Thu & Hiệu Quả</span>
        </button>
      </div>

      {/* TAB 1: RESERVATIONS / NHẬN THÔNG TIN ĐẶT BÀN */}
      {activeTab === 'reservations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Danh Sách Nhóm Khách Chốt Đặt Bàn</h3>
              <p className="text-xs text-slate-500">
                Khi các nhóm người dùng thảo luận xong và bấm "Chốt Bàn", hệ thống tự động đẩy yêu cầu đến đây.
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200">
              Đang tiếp nhận thời gian thực
            </span>
          </div>

          {reservations.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">Chưa có đơn đặt bàn nào cho chi nhánh này</p>
              <p className="text-xs text-slate-400 mt-1">
                Khi các nhóm ăn chung trên app đủ người và chốt bàn, thông báo sẽ hiển thị ngay tại đây.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reservations.map((res) => {
                const isConfirmed = res.reservationStatus === 'CONFIRMED_BY_RESTAURANT';
                return (
                  <div
                    key={res.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-emerald-300 transition-colors"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{res.title}</span>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            isConfirmed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 animate-pulse'
                          }`}>
                            {isConfirmed ? '✓ Đã Xác Nhận Bàn' : '⚡ Chờ Xác Nhận'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-brand-600" />
                          <span>Giờ khách đến: <strong className="text-slate-800">{res.eatingTime}</strong></span>
                        </p>
                      </div>
                    </div>

                    {/* Voucher tag if any */}
                    {res.voucherApplied && (
                      <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs flex items-center justify-between">
                        <span className="font-bold text-red-800 flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5" /> Voucher: {res.voucherApplied.title}
                        </span>
                        <span className="font-extrabold text-red-600">{res.voucherApplied.discountValue}</span>
                      </div>
                    )}

                    {/* Payment & Order Mode Badge */}
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        {res.paymentInfo?.orderType === 'PRE_ORDER' ? '🍲 Đặt món trước trên App' : '📋 Đến quán gọi món'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                        res.paymentInfo?.paymentStatus === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {res.paymentInfo?.paymentStatus === 'PAID'
                          ? `✓ Đã Thanh Toán (${formatCurrency(res.paymentInfo.totalAmount)})`
                          : res.paymentInfo?.paymentMode === 'PRE_PAY'
                          ? `Chờ thanh toán trước (${formatCurrency(res.paymentInfo?.totalAmount || 0)})`
                          : 'Thanh toán sau khi ăn tại quán'}
                      </span>
                    </div>

                    {/* Pre-ordered dishes if any */}
                    {res.paymentInfo?.orderItems && res.paymentInfo.orderItems.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <span className="font-bold text-slate-700 block mb-1">
                          Các món khách đặt trước ({res.paymentInfo.orderItems.length} món):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {res.paymentInfo.orderItems.map((oi) => (
                            <span key={oi.id} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800 text-[11px]">
                              {oi.name} × <strong>{oi.quantity}</strong>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Group members list */}
                    <div>
                      <span className="text-xs font-bold text-slate-700 block mb-1.5">
                        Khách hàng trong bàn ({res.joinedMembers.length}/{res.targetSlots} người):
                      </span>
                      <div className="space-y-1.5">
                        {res.joinedMembers.map((m) => (
                          <div key={m.userId} className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 text-xs">
                            <img src={m.avatar} alt={m.name} className="w-6 h-6 rounded-full object-cover" />
                            <span className="font-semibold text-slate-800">{m.name}</span>
                            {m.isHost && <span className="text-[9px] bg-brand-100 text-brand-800 px-1 rounded font-bold">Trưởng nhóm</span>}
                            <span className="text-[10px] text-slate-400 italic truncate ml-auto">{m.introduction}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        Ghi chú: "{res.note}"
                      </span>
                      {!isConfirmed ? (
                        <button
                          onClick={() => handleConfirmReservation(res.id)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Tiếp Nhận & Giữ Bàn</span>
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                          ✓ Đã chuẩn bị bàn sẵn
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MENU MANAGEMENT / THAY ĐỔI MÓN ĂN */}
      {activeTab === 'menu' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Thực Đơn Món Ăn</h3>
              <p className="text-xs text-slate-500">Thêm món mới, điều chỉnh giá và trạng thái còn món/hết món.</p>
            </div>
            <button
              onClick={() => setIsAddingDish(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Món Mới</span>
            </button>
          </div>

          {/* Add dish form */}
          {isAddingDish && (
            <form onSubmit={handleAddDishSubmit} className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-emerald-900 uppercase">Thêm Món Ăn Mới Vào Thực Đơn</h4>
                <button type="button" onClick={() => setIsAddingDish(false)} className="text-xs text-slate-400 hover:text-slate-700">Đóng</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tên món</label>
                  <input
                    type="text"
                    required
                    value={dishName}
                    onChange={(e) => setDishName(e.target.value)}
                    placeholder="VD: Dẻ sườn bò ướp sốt"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Giá (VNĐ)</label>
                  <input
                    type="number"
                    required
                    value={dishPrice}
                    onChange={(e) => setDishPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Phân loại</label>
                  <input
                    type="text"
                    value={dishCategory}
                    onChange={(e) => setDishCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mô tả món ăn</label>
                <input
                  type="text"
                  value={dishDescription}
                  onChange={(e) => setDishDescription(e.target.value)}
                  placeholder="Mô tả hương vị, định lượng suất ăn..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs"
              >
                Lưu Món Ăn
              </button>
            </form>
          )}

          {/* Edit dish modal */}
          {editingDish && (
            <form onSubmit={handleUpdateDishSubmit} className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-amber-900 uppercase">Chỉnh Sửa Món: {editingDish.name}</h4>
                <button type="button" onClick={() => setEditingDish(null)} className="text-xs text-slate-400 hover:text-slate-700">Đóng</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Giá bán mới (VNĐ)</label>
                  <input
                    type="number"
                    value={editingDish.price}
                    onChange={(e) => setEditingDish({ ...editingDish, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Phân loại món</label>
                  <input
                    type="text"
                    value={editingDish.category}
                    onChange={(e) => setEditingDish({ ...editingDish, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mô tả</label>
                <input
                  type="text"
                  value={editingDish.description}
                  onChange={(e) => setEditingDish({ ...editingDish, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs shadow-xs"
              >
                Cập Nhật Món
              </button>
            </form>
          )}

          {/* Dish list grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border bg-white shadow-xs flex items-start gap-3 justify-between transition-colors ${
                  !item.isAvailable ? 'opacity-60 border-slate-200' : 'border-slate-200'
                }`}
              >
                <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{item.category}</span>
                    <span className={`text-[10px] font-bold px-1.5 rounded ${
                      item.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.isAvailable ? 'Còn món' : 'Hết món'}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 truncate mt-0.5">{item.name}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{item.description}</p>
                  <p className="font-extrabold text-xs text-emerald-700 mt-1">{formatCurrency(item.price)}</p>

                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setEditingDish(item)}
                      className="text-[10px] font-semibold text-slate-600 hover:text-amber-600 flex items-center gap-0.5"
                    >
                      <Edit2 className="w-3 h-3" /> Sửa
                    </button>
                    <button
                      onClick={() => handleToggleAvailability(item)}
                      className="text-[10px] font-semibold text-slate-600 hover:text-brand-600 flex items-center gap-0.5"
                    >
                      {item.isAvailable ? 'Đổi: Hết món' : 'Đổi: Còn món'}
                    </button>
                    <button
                      onClick={() => handleDeleteDish(item.id)}
                      className="text-[10px] font-semibold text-red-500 hover:text-red-700 ml-auto flex items-center gap-0.5"
                    >
                      <Trash2 className="w-3 h-3" /> Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PROMOTIONS & GROUP VOUCHERS / THÊM CHƯƠNG TRÌNH KHUYẾN MÃI */}
      {activeTab === 'promotions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Voucher Nhóm & Khuyến Mãi Của Nhà Hàng</h3>
              <p className="text-xs text-slate-500">Tạo ưu đãi yêu cầu số lượng khách tối thiểu để thu hút các nhóm ghép bàn.</p>
            </div>
            <button
              onClick={() => setIsAddingVoucher(true)}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-500/20 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Voucher Mới</span>
            </button>
          </div>

          {/* Add voucher form */}
          {isAddingVoucher && (
            <form onSubmit={handleAddVoucherSubmit} className="bg-red-50/60 p-5 rounded-2xl border border-red-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-red-900 uppercase">Tạo Chương Trình Khuyến Mãi Nhóm Mới</h4>
                <button type="button" onClick={() => setIsAddingVoucher(false)} className="text-xs text-slate-400 hover:text-slate-700">Đóng</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mã Voucher</label>
                  <input
                    type="text"
                    required
                    value={vCode}
                    onChange={(e) => setVCode(e.target.value)}
                    placeholder="VD: TEAM4_30OFF"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:border-red-500 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mức giảm</label>
                  <input
                    type="text"
                    required
                    value={vDiscount}
                    onChange={(e) => setVDiscount(e.target.value)}
                    placeholder="VD: Giảm 30% / Tặng Lẩu 0đ"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Số lượng khách tối thiểu</label>
                  <select
                    value={vMinSize}
                    onChange={(e) => setVMinSize(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:border-red-500"
                  >
                    <option value={3}>Từ 3 người trở lên</option>
                    <option value={4}>Từ 4 người trở lên</option>
                    <option value={6}>Từ 6 người trở lên</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tiêu đề chương trình</label>
                <input
                  type="text"
                  required
                  value={vTitle}
                  onChange={(e) => setVTitle(e.target.value)}
                  placeholder="VD: Giảm 30% Cho Nhóm Gom Bàn 4 Người"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Điều kiện & Mô tả</label>
                <input
                  type="text"
                  value={vDesc}
                  onChange={(e) => setVDesc(e.target.value)}
                  placeholder="Điều kiện áp dụng giờ vàng, ngày áp dụng..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:border-red-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs shadow-xs"
              >
                Phát Hành Voucher
              </button>
            </form>
          )}

          {/* Vouchers list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vouchers.map((v) => (
              <div key={v.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-800 border">
                      {v.code}
                    </span>
                    <span className="text-xs font-extrabold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full">
                      {v.discountValue}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 mt-2">{v.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{v.description}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Yêu cầu: Nhóm từ {v.minGroupSize} khách</span>
                  <span>HSD: {v.expiryDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: STATS / THỐNG KÊ DOANH THU & HIỆU QUẢ CHI TIẾT */}
      {activeTab === 'stats' && (() => {
        // Mock detailed daily data
        const dailyStats = [
          { day: 'Thứ 2', date: '11/10', gmv: 2800000, net: 2520000, tables: 4, guests: 16, status: 'Ổn định' },
          { day: 'Thứ 3', date: '12/10', gmv: 3200000, net: 2880000, tables: 5, guests: 20, status: 'Ổn định' },
          { day: 'Thứ 4', date: '13/10', gmv: 3650000, net: 3285000, tables: 5, guests: 22, status: 'Tăng trưởng' },
          { day: 'Thứ 5', date: '14/10', gmv: 4100000, net: 3690000, tables: 6, guests: 26, status: 'Đông khách' },
          { day: 'Thứ 6', date: '15/10', gmv: 5400000, net: 4860000, tables: 8, guests: 34, status: 'Đỉnh điểm' },
          { day: 'Thứ 7', date: '16/10', gmv: 5850000, net: 5265000, tables: 9, guests: 38, status: 'Kỷ lục' },
          { day: 'Chủ Nhật', date: '17/10', gmv: 3450000, net: 3105000, tables: 5, guests: 20, status: 'Ổn định' },
        ];

        // Detailed bills breakdown
        const tableBills = [
          {
            id: 'BILL-8901',
            sessionCode: 'SS-8801',
            customerHost: 'Nguyễn Văn Minh (Haidilao Fan)',
            time: '19:30 - Hôm nay',
            groupSize: 4,
            items: ['Nước Lẩu Cà Chua & Lẩu Thái (2 Ngăn)', 'Thịt Bò Mỹ Cuộn Haidilao x2', 'Múa Mì Biểu Diễn x2', 'Trà Sữa Trân Châu x4'],
            grossAmount: 890000,
            voucherDiscount: 100000,
            commissionFee: 89000,
            netPayout: 801000,
            paymentMethod: 'Chạm Đũa Pay / VietQR',
            status: 'PAID'
          },
          {
            id: 'BILL-8902',
            sessionCode: 'SS-8802',
            customerHost: 'Trần Thị Thu Thảo (VIP 5.0★)',
            time: '18:15 - Hôm nay',
            groupSize: 5,
            items: ['Nước Lẩu Xương & Nấm Đặc Biệt', 'Ba Chỉ Bò Mỹ Thượng Hạng x3', 'Tôm Thẻ Tươi Sống', 'Nước Ngọt Lon x5'],
            grossAmount: 1150000,
            voucherDiscount: 150000,
            commissionFee: 115000,
            netPayout: 1035000,
            paymentMethod: 'Chuyển Khoản Trực Tiếp',
            status: 'PAID'
          },
          {
            id: 'BILL-8903',
            sessionCode: 'SS-8803',
            customerHost: 'Lê Hoàng Nam (Designer)',
            time: '12:00 - Trưa nay',
            groupSize: 4,
            items: ['Combo Trưa Văn Phòng 4 Người', 'Thịt Heo Iberico Nhúng', 'Trà Quế Hoa Hạt Sen x4'],
            grossAmount: 720000,
            voucherDiscount: 80000,
            commissionFee: 72000,
            netPayout: 648000,
            paymentMethod: 'Chạm Đũa Pay',
            status: 'PAID'
          },
          {
            id: 'BILL-8904',
            sessionCode: 'SS-8804',
            customerHost: 'Phạm Quỳnh Anh',
            time: '20:00 - Tối qua',
            groupSize: 6,
            items: ['Lẩu Tứ Xuyên Siêu Cay 4 Ngăn', 'Thịt Dê Úc & Bò Wagyu', 'Bia Craft IPA x6', 'Tàu Hũ Phô Mai'],
            grossAmount: 1680000,
            voucherDiscount: 200000,
            commissionFee: 168000,
            netPayout: 1512000,
            paymentMethod: 'Thẻ Visa / Master',
            status: 'PAID'
          },
          {
            id: 'BILL-8905',
            sessionCode: 'SS-8805',
            customerHost: 'Đặng Quốc Bảo (IT Lead)',
            time: '19:00 - Tối qua',
            groupSize: 4,
            items: ['Lẩu Cà Chua Chua Ngọt', 'Combo Nấm Quý Tươi Ngon', 'Múa Mì Nghệ Thuật x1', 'Trà Trái Cây x4'],
            grossAmount: 850000,
            voucherDiscount: 100000,
            commissionFee: 85000,
            netPayout: 765000,
            paymentMethod: 'Chạm Đũa Pay',
            status: 'PENDING_SETTLEMENT'
          }
        ];

        // Top 5 dishes detailed breakdown
        const topDishesBreakdown = [
          { rank: 1, name: 'Nước Lẩu Cà Chua & Lẩu Thái Chua Cay (2 Ngăn)', category: 'Nước Lẩu', orders: 48, price: 135000, totalRevenue: 6480000, share: 22.8 },
          { rank: 2, name: 'Thịt Bò Mỹ Cuộn Haidilao Đặc Biệt', category: 'Thịt Nhúng', orders: 56, price: 189000, totalRevenue: 10584000, share: 37.2 },
          { rank: 3, name: 'Múa Mì Nghệ Thuật Biểu Diễn Tại Bàn', category: 'Mì & Tinh Bột', orders: 62, price: 45000, totalRevenue: 2790000, share: 9.8 },
          { rank: 4, name: 'Tôm Sú & Bạch Tuộc Sốt Cay Nhúng Lẩu', category: 'Hải Sản', orders: 28, price: 165000, totalRevenue: 4620000, share: 16.2 },
          { rank: 5, name: 'Trà Sữa Trân Châu Tươi & Trà Trái Cây', category: 'Đồ Uống', orders: 95, price: 35000, totalRevenue: 3325000, share: 11.7 },
        ];

        const filteredBills = tableBills.filter(b => 
          b.customerHost.toLowerCase().includes(statsSearchQuery.toLowerCase()) ||
          b.sessionCode.toLowerCase().includes(statsSearchQuery.toLowerCase()) ||
          b.id.toLowerCase().includes(statsSearchQuery.toLowerCase())
        );

        return (
          <div className="space-y-6">
            {/* Top Header & Filter Toolbar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-3xl border-2 border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)]">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 text-white shadow-md">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-slate-900 tracking-tight flex items-center gap-2">
                      <span>Báo Cáo Doanh Thu & Hiệu Quả Gom Bàn F&B</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase">
                        Real-time Analytics
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Thống kê đa chiều về dòng tiền, hoa hồng sàn Chạm Đũa, cơ cấu món ăn & tỷ lệ lấp đầy giờ vàng
                    </p>
                  </div>
                </div>
              </div>

              {/* Controls: Time filters & Export actions */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Time Range Selector */}
                <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
                  {(['7d', '30d', 'month', 'last_month'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setStatsTimeRange(r)}
                      className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                        statsTimeRange === r
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {r === '7d' && '7 Ngày Qua'}
                      {r === '30d' && '30 Ngày Gần Nhất'}
                      {r === 'month' && 'Tháng Này'}
                      {r === 'last_month' && 'Tháng Trước'}
                    </button>
                  ))}
                </div>

                {/* Print & Export buttons */}
                <button
                  onClick={() => window.print()}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 flex items-center gap-1.5 transition-colors"
                  title="In báo cáo doanh thu"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">In Phiếu</span>
                </button>
                <button
                  onClick={() => alert('Hệ thống đang xuất file Excel Báo Cáo Doanh Thu & Quyết Toán Hoa Hồng...')}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black shadow-xs flex items-center gap-1.5 transition-all"
                  title="Tải file Excel"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Xuất Excel</span>
                </button>
              </div>
            </div>

            {/* 6 Top Financial KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
              {/* Card 1: Gross GMV */}
              <div className="bg-white p-4 rounded-3xl border-2 border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Tổng Doanh Thu Gộp
                </span>
                <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  28.450.000đ
                </div>
                <div className="text-[11px] text-emerald-600 font-black flex items-center gap-1 pt-0.5">
                  <TrendingUp className="w-3 h-3" />
                  <span>+22.4% so tháng trước</span>
                </div>
                <span className="text-[10px] text-slate-400 block pt-1 border-t border-slate-100">
                  Tổng giá trị bill bàn ăn
                </span>
              </div>

              {/* Card 2: Net Payout */}
              <div className="bg-white p-4 rounded-3xl border-2 border-emerald-300 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.15)] ring-2 ring-emerald-100 space-y-1">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Thực Nhận Về Quán
                </span>
                <div className="text-xl sm:text-2xl font-black text-emerald-600 tracking-tight">
                  25.605.000đ
                </div>
                <div className="text-[11px] text-slate-600 font-bold flex items-center gap-1 pt-0.5">
                  <Percent className="w-3 h-3 text-amber-500" />
                  <span>Phí sàn 10%: 2.845.000đ</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-bold block pt-1 border-t border-emerald-100">
                  90% doanh thu thực giữ lại
                </span>
              </div>

              {/* Card 3: Tables served */}
              <div className="bg-white p-4 rounded-3xl border-2 border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Số Bàn Nhóm Phục Vụ
                </span>
                <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  42 bàn
                </div>
                <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 pt-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>100% đến đúng giờ</span>
                </div>
                <span className="text-[10px] text-slate-400 block pt-1 border-t border-slate-100">
                  0 bàn hủy giờ chót
                </span>
              </div>

              {/* Card 4: Avg Group Size */}
              <div className="bg-white p-4 rounded-3xl border-2 border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Quy Mô Nhóm TB
                </span>
                <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  4.2 người
                </div>
                <div className="text-[11px] text-slate-700 font-bold flex items-center gap-1 pt-0.5">
                  <Users className="w-3 h-3 text-brand-500" />
                  <span>176 thực khách đón nhận</span>
                </div>
                <span className="text-[10px] text-slate-400 block pt-1 border-t border-slate-100">
                  Tối ưu bàn lớn 4-6 chỗ
                </span>
              </div>

              {/* Card 5: AOV - Average Order Value */}
              <div className="bg-white p-4 rounded-3xl border-2 border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Giá Trị TB / Bàn
                </span>
                <div className="text-xl sm:text-2xl font-black text-amber-600 tracking-tight">
                  677.000đ
                </div>
                <div className="text-[11px] text-slate-600 font-bold flex items-center gap-1 pt-0.5">
                  <Receipt className="w-3 h-3 text-slate-400" />
                  <span>~161.000đ / người</span>
                </div>
                <span className="text-[10px] text-slate-400 block pt-1 border-t border-slate-100">
                  Tăng +14.2% chi tiêu gọi món
                </span>
              </div>

              {/* Card 6: Rating */}
              <div className="bg-white p-4 rounded-3xl border-2 border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Đánh Giá Thực Khách
                </span>
                <div className="text-xl sm:text-2xl font-black text-amber-500 tracking-tight flex items-center gap-1">
                  <span>★ {currentRestaurant.rating}</span>
                  <span className="text-xs text-slate-400 font-semibold">/ 5.0</span>
                </div>
                <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 pt-0.5">
                  <span>98% hài lòng tuyệt đối</span>
                </div>
                <span className="text-[10px] text-slate-400 block pt-1 border-t border-slate-100">
                  Từ {currentRestaurant.reviewCount} lượt review
                </span>
              </div>
            </div>

            {/* Interactive Daily Revenue & Booking Growth Chart */}
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-base text-slate-900 tracking-tight">
                      Biểu Đồ Doanh Thu & Số Lượng Bàn Ăn Theo Ngày
                    </h4>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 uppercase">
                      Weekly Peak Trend
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Theo dõi điểm rơi doanh thu trong tuần: Thứ Sáu & Thứ Bảy là khung giờ bùng nổ nhóm ăn ghép
                  </p>
                </div>

                {/* Metric toggle */}
                <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
                  <button
                    onClick={() => setStatsMetric('revenue')}
                    className={`px-3 py-1.5 rounded-xl transition-all ${
                      statsMetric === 'revenue'
                        ? 'bg-brand-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    💰 Doanh Thu (VNĐ)
                  </button>
                  <button
                    onClick={() => setStatsMetric('tables')}
                    className={`px-3 py-1.5 rounded-xl transition-all ${
                      statsMetric === 'tables'
                        ? 'bg-brand-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🍽️ Bàn Ghép
                  </button>
                </div>
              </div>

              {/* Bar Visual Chart */}
              <div className="grid grid-cols-7 gap-2 sm:gap-4 pt-4">
                {dailyStats.map((item, idx) => {
                  const maxVal = statsMetric === 'revenue' ? 6000000 : 10;
                  const currentVal = statsMetric === 'revenue' ? item.gmv : item.tables;
                  const heightPercent = Math.round((currentVal / maxVal) * 100);
                  const isPeak = idx === 5 || idx === 4; // T6 & T7
                  const isHovered = statsHoveredDay === idx;

                  return (
                    <div
                      key={item.day}
                      onMouseEnter={() => setStatsHoveredDay(idx)}
                      onMouseLeave={() => setStatsHoveredDay(null)}
                      className={`group flex flex-col items-center justify-end p-2.5 rounded-2xl transition-all cursor-pointer ${
                        isHovered
                          ? 'bg-amber-50 ring-2 ring-brand-500'
                          : isPeak
                          ? 'bg-amber-50/50'
                          : 'bg-slate-50 hover:bg-slate-100/80'
                      }`}
                    >
                      {/* Value label */}
                      <span className="text-[11px] font-black text-slate-800 mb-2 truncate">
                        {statsMetric === 'revenue' ? `${(item.gmv / 1000000).toFixed(1)}Tr` : `${item.tables} bàn`}
                      </span>

                      {/* Bar Container */}
                      <div className="w-full bg-slate-200/80 rounded-xl h-40 flex items-end p-1 overflow-hidden relative">
                        <div
                          className={`w-full rounded-lg transition-all duration-500 ${
                            isPeak
                              ? 'bg-gradient-to-t from-brand-600 via-amber-500 to-amber-400 shadow-md'
                              : 'bg-gradient-to-t from-slate-600 to-slate-400 group-hover:from-brand-500 group-hover:to-amber-400'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>

                      {/* Day Label */}
                      <span className="text-xs font-black text-slate-800 mt-2.5 block">{item.day}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">{item.date}</span>
                    </div>
                  );
                })}
              </div>

              {/* Hover Highlight Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/80 to-orange-50/60 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-slate-700 font-medium">
                    {statsHoveredDay !== null ? (
                      <>
                        <strong className="text-slate-900">{dailyStats[statsHoveredDay].day} ({dailyStats[statsHoveredDay].date})</strong>: Doanh thu gộp <strong>{formatCurrency(dailyStats[statsHoveredDay].gmv)}</strong> &bull; Thực nhận quán: <strong className="text-emerald-700">{formatCurrency(dailyStats[statsHoveredDay].net)}</strong> &bull; Phục vụ: <strong>{dailyStats[statsHoveredDay].tables} bàn ghép ({dailyStats[statsHoveredDay].guests} khách)</strong>.
                      </>
                    ) : (
                      <>
                        Điểm sáng doanh thu: <strong className="text-slate-900">Thứ Bảy</strong> đạt đỉnh với <strong>5.850.000đ (9 bàn ghép / 38 thực khách)</strong>. Tỷ lệ lấp bàn tiệc nhóm đạt tối đa 100%.
                      </>
                    )}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-brand-600 whitespace-nowrap">
                  Hoa hồng Chạm Đũa áp dụng: 10%
                </span>
              </div>
            </div>

            {/* 4 Deep Analytics Breakdown Modules */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Module 1: Revenue by Customer Channel */}
              <div className="bg-white p-6 rounded-3xl border-2 border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-brand-600" />
                    <h4 className="font-black text-sm text-slate-900">Cơ Cấu Doanh Thu Theo Nguồn Khách</h4>
                  </div>
                  <span className="text-xs font-bold text-slate-400">30 ngày qua</span>
                </div>

                <div className="space-y-3 pt-1 text-xs">
                  {/* Channel 1 */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-slate-800 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-brand-500 inline-block" />
                        Gom Bàn Ghép Chạm Đũa (Match Tự Động)
                      </span>
                      <span className="text-brand-600 font-black">68% &bull; 19.346.000đ</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-brand-500 h-2 rounded-full" style={{ width: '68%' }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>29 bàn đã hoàn tất</span>
                      <span>Quy mô trung bình 4.4 người</span>
                    </div>
                  </div>

                  {/* Channel 2 */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-slate-800 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                        Đặt Nhóm Giữ Chỗ Sớm (Pre-order Table)
                      </span>
                      <span className="text-amber-600 font-black">22% &bull; 6.259.000đ</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-amber-500 h-2 rounded-full" style={{ width: '22%' }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>9 bàn đã hoàn tất</span>
                      <span>Gọi sẵn combo trước khi đến</span>
                    </div>
                  </div>

                  {/* Channel 3 */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-slate-800 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block" />
                        Thực Khách Đi Kèm Phát Sinh (Add-on Walk-ins)
                      </span>
                      <span className="text-teal-600 font-black">10% &bull; 2.845.000đ</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-teal-500 h-2 rounded-full" style={{ width: '10%' }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>4 bàn ghép thêm bạn bè</span>
                      <span>Order thêm món ngoài suất ban đầu</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Module 2: Revenue by Menu Category */}
              <div className="bg-white p-6 rounded-3xl border-2 border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-amber-500" />
                    <h4 className="font-black text-sm text-slate-900">Cơ Cấu Doanh Thu Theo Danh Mục Menu</h4>
                  </div>
                  <span className="text-xs font-bold text-slate-400">Tháng này</span>
                </div>

                <div className="space-y-3 pt-1 text-xs">
                  {/* Category 1 */}
                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span className="text-slate-800">Nước Lẩu & Set Combo Nhóm</span>
                      <span className="text-slate-900 font-black">48% &bull; 13.656.000đ</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-brand-500 to-amber-500 h-2 rounded-full" style={{ width: '48%' }} />
                    </div>
                  </div>

                  {/* Category 2 */}
                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span className="text-slate-800">Thịt Nhúng & Hải Sản Tươi Sống</span>
                      <span className="text-slate-900 font-black">32% &bull; 9.104.000đ</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '32%' }} />
                    </div>
                  </div>

                  {/* Category 3 */}
                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span className="text-slate-800">Đồ Uống, Bia Craft & Tráng Miệng</span>
                      <span className="text-slate-900 font-black">14% &bull; 3.983.000đ</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-sky-500 h-2 rounded-full" style={{ width: '14%' }} />
                    </div>
                  </div>

                  {/* Category 4 */}
                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span className="text-slate-800">Món Khai Vị & Ăn Kèm Gọi Thêm</span>
                      <span className="text-slate-900 font-black">6% &bull; 1.707.000đ</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '6%' }} />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Món có tỷ suất lợi nhuận cao nhất: <strong className="text-slate-900">Nước Lẩu & Đồ Uống</strong></span>
                  <span className="text-brand-600 font-bold">Biên độ ~65%</span>
                </div>
              </div>

              {/* Module 3: Peak Time Occupancy & Table Turnover */}
              <div className="bg-white p-6 rounded-3xl border-2 border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-black text-sm text-slate-900">Tỷ Lệ Lấp Đầy Giờ Vàng Nhờ Gom Khách</h4>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                    Hiệu quả cao
                  </span>
                </div>

                <div className="space-y-3 pt-1 text-xs">
                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="text-slate-800">Trưa văn phòng (11:30 - 13:30)</span>
                      <span className="text-emerald-600 font-bold">88% lấp đầy &bull; 1h20m/bàn</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '88%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="text-slate-800">Tối sau giờ làm (18:00 - 20:30)</span>
                      <span className="text-emerald-600 font-bold">95% lấp đầy &bull; 1h50m/bàn</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-emerald-600 h-2.5 rounded-full" style={{ width: '95%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="text-slate-800">Khuya lai rai cuối tuần (21:00 - 23:00)</span>
                      <span className="text-amber-600 font-bold">74% lấp đầy &bull; 2h10m/bàn</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '74%' }} />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Khung giờ sinh lời nhiều nhất: <strong className="text-slate-900">19:00 - 20:30</strong></span>
                  <span className="text-slate-400">Đóng góp 42% doanh số</span>
                </div>
              </div>

              {/* Module 4: Top 5 Best Selling Items Detailed */}
              <div className="bg-white p-6 rounded-3xl border-2 border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    <h4 className="font-black text-sm text-slate-900">Món Ăn Bán Chạy & Doanh Số Đóng Góp</h4>
                  </div>
                  <span className="text-xs font-bold text-slate-400">Top 5 món</span>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {topDishesBreakdown.map((dish) => (
                    <div key={dish.rank} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-5 h-5 rounded-lg flex items-center justify-center font-black text-[10px] flex-shrink-0 ${
                          dish.rank === 1
                            ? 'bg-amber-400 text-slate-950'
                            : dish.rank === 2
                            ? 'bg-slate-200 text-slate-800'
                            : dish.rank === 3
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          #{dish.rank}
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{dish.name}</p>
                          <span className="text-[10px] text-slate-400">{dish.category} &bull; {dish.orders} lượt gọi</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="font-black text-emerald-600 block">
                          {formatCurrency(dish.totalRevenue)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          {dish.share}% doanh thu món
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* BẢNG KÊ CHI TIẾT TỪNG HÓA ĐƠN BÀN ĂN & ĐỐI SOÁT (CARD VS LIST TABLE) */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border-2 border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)]">
                <div>
                  <h4 className="font-black text-base text-slate-900 flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-brand-600" />
                    <span>Lịch Sử Hóa Đơn Bàn Ăn Ghép & Quyết Toán Hoa Hồng</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Chi tiết từng bàn tiệc: tổng bill, trợ giá voucher từ Chạm Đũa, hoa hồng sàn và số tiền thực nhận
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  {/* Search box */}
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Tìm mã hóa đơn, tên khách..."
                      value={statsSearchQuery}
                      onChange={(e) => setStatsSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-brand-500 font-medium"
                    />
                  </div>

                  {/* View Mode Switcher: Card vs List */}
                  <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold flex-shrink-0">
                    <button
                      onClick={() => setStatsViewMode('card')}
                      className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                        statsViewMode === 'card'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Chuyển sang dạng Thẻ (Card)"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Card</span>
                    </button>
                    <button
                      onClick={() => setStatsViewMode('list')}
                      className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                        statsViewMode === 'list'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Chuyển sang dạng Bảng Danh Sách (List Table)"
                    >
                      <List className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">List</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Table or Card View */}
              {statsViewMode === 'list' ? (
                <div className="bg-white rounded-3xl border-2 border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b-2 border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                          <th className="py-3.5 px-4">Mã Hóa Đơn & Bàn</th>
                          <th className="py-3.5 px-4">Khách Chủ Trì & Quy Mô</th>
                          <th className="py-3.5 px-4">Thực Đơn Gọi Chính</th>
                          <th className="py-3.5 px-4">Tổng Bill Gộp</th>
                          <th className="py-3.5 px-4">Voucher Sàn Trợ Giá</th>
                          <th className="py-3.5 px-4">Hoa Hồng Sàn (10%)</th>
                          <th className="py-3.5 px-4">Thực Nhận Quán</th>
                          <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredBills.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                              Không tìm thấy hóa đơn nào khớp tìm kiếm.
                            </td>
                          </tr>
                        ) : (
                          filteredBills.map((bill) => (
                            <tr key={bill.id} className="hover:bg-amber-50/40 transition-colors">
                              <td className="py-3 px-4">
                                <span className="font-mono font-black text-slate-900 text-xs block">{bill.id}</span>
                                <span className="text-[10px] text-slate-400 font-bold block">{bill.sessionCode} &bull; {bill.time}</span>
                              </td>
                              <td className="py-3 px-4">
                                <p className="font-bold text-slate-900 truncate max-w-[160px]">{bill.customerHost}</p>
                                <span className="inline-block mt-0.5 px-2 py-0.5 bg-brand-50 text-brand-700 rounded-md text-[10px] font-bold">
                                  👥 {bill.groupSize} người
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <p className="text-[11px] text-slate-700 line-clamp-1 max-w-[200px] font-medium" title={bill.items.join(', ')}>
                                  {bill.items.join(', ')}
                                </p>
                                <span className="text-[10px] text-slate-400">({bill.items.length} món đã phục vụ)</span>
                              </td>
                              <td className="py-3 px-4 font-black text-slate-900">
                                {formatCurrency(bill.grossAmount)}
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-rose-600 font-bold">
                                  -{formatCurrency(bill.voucherDiscount)}
                                </span>
                                <span className="text-[9px] text-slate-400 block">Sàn tài trợ 100%</span>
                              </td>
                              <td className="py-3 px-4 text-slate-700 font-bold">
                                -{formatCurrency(bill.commissionFee)}
                              </td>
                              <td className="py-3 px-4">
                                <span className="font-black text-emerald-600 text-sm">
                                  {formatCurrency(bill.netPayout)}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black inline-block ${
                                  bill.status === 'PAID'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800 animate-pulse'
                                }`}>
                                  {bill.status === 'PAID' ? '✓ Đã thanh toán' : '⏳ Chờ đối soát'}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* Card View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredBills.map((bill) => (
                    <div
                      key={bill.id}
                      className="bg-white rounded-3xl border-2 border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between"
                    >
                      <div className={`h-2 w-full ${bill.status === 'PAID' ? 'bg-emerald-500' : 'bg-amber-400'}`} />

                      <div className="p-5 space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="font-mono text-xs font-black text-slate-900 block">{bill.id}</span>
                            <span className="text-[11px] text-slate-400 font-semibold">{bill.time}</span>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                            bill.status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800 animate-pulse'
                          }`}>
                            {bill.status === 'PAID' ? '✓ Đã nhận tiền' : '⏳ Chờ đối soát'}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-black text-slate-900 truncate">{bill.customerHost}</span>
                            <span className="px-2 py-0.5 rounded-lg bg-brand-50 text-brand-700 font-bold text-[10px]">
                              {bill.groupSize} người
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                            {bill.items.join(' &bull; ')}
                          </p>
                        </div>

                        {/* Financial breakdown */}
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 font-semibold block">Tổng Bill:</span>
                            <strong className="text-slate-900 font-black">{formatCurrency(bill.grossAmount)}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-semibold block">Voucher Sàn:</span>
                            <strong className="text-rose-600 font-bold">-{formatCurrency(bill.voucherDiscount)}</strong>
                          </div>
                          <div className="pt-2 border-t border-slate-200/60">
                            <span className="text-[10px] text-slate-400 font-semibold block">Phí Sàn 10%:</span>
                            <strong className="text-slate-800 font-bold">-{formatCurrency(bill.commissionFee)}</strong>
                          </div>
                          <div className="pt-2 border-t border-slate-200/60">
                            <span className="text-[10px] text-emerald-700 font-bold block">Thực Nhận:</span>
                            <strong className="text-emerald-600 font-black text-sm">{formatCurrency(bill.netPayout)}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                        <span>Phương thức: <strong className="text-slate-800">{bill.paymentMethod}</strong></span>
                        <span className="font-bold text-brand-600">Mã bàn: {bill.sessionCode}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        );
      })()}

    </div>
  );
};
