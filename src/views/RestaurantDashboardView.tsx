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
  AlertCircle
} from 'lucide-react';
import { Restaurant, MenuItem, GroupVoucher, DiningSession, User } from '../types';
import { storageService } from '../services/storageService';
import { formatCurrency } from '../utils/geo';

interface RestaurantDashboardViewProps {
  currentUser: User;
}

export const RestaurantDashboardView: React.FC<RestaurantDashboardViewProps> = ({
  currentUser
}) => {
  const allRestaurants = storageService.getRestaurants().filter((r) => r.isRegisteredOnSystem);
  
  // Choose active restaurant: if user is restaurant manager, pick their restaurant, else default to Haidilao
  const [selectedRestId, setSelectedRestId] = useState<string>(
    currentUser.restaurantId || allRestaurants[0]?.id || 'rest_1'
  );

  const [activeTab, setActiveTab] = useState<'reservations' | 'menu' | 'promotions'>('reservations');

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
      description: vDesc.trim() || `Ưu đãi dành cho nhóm từ ${vMinSize} người trở lên khi ghép bàn trên DineTogether.`,
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

    </div>
  );
};
