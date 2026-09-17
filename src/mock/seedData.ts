import { User, Restaurant, MenuItem, GroupVoucher, DiningSession, UserPost, AppNotification } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user_1',
    name: 'Nguyễn Hoàng Tuấn',
    email: 'tuan.nguyen@foodie.vn',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    role: 'user',
    bio: 'Dân văn phòng mê lẩu nướng & ẩm thực đường phố. Thích giao lưu bạn mới, ăn khoẻ và vui tính!',
    foodPreferences: ['Lẩu & Nướng', 'Ăn cay cấp 3', 'Buffet hải sản', 'Budget 150k - 250k', 'Không ăn mắm tôm'],
    friends: ['user_2', 'user_3', 'user_4'],
    trustScore: 4.9,
    totalMealsJoined: 18,
    location: {
      lat: 10.7769,
      lng: 106.7009,
      address: 'Quận 1, TP. Hồ Chí Minh'
    }
  },
  {
    id: 'user_2',
    name: 'Trần Thảo Mai',
    email: 'mai.tran@foodie.vn',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'user',
    bio: 'Food reviewer nghiệp dư, chuyên săn voucher giảm giá nhóm. Không ngại ăn cay!',
    foodPreferences: ['Món Hàn Quốc', 'Thích ngọt', 'Trà sữa', 'Thích chụp ảnh check-in'],
    friends: ['user_1', 'user_3'],
    trustScore: 5.0,
    totalMealsJoined: 24,
    location: {
      lat: 10.7725,
      lng: 106.6980,
      address: 'Quận 1, TP. Hồ Chí Minh'
    }
  },
  {
    id: 'user_3',
    name: 'Lê Quốc Bảo',
    email: 'bao.le@foodie.vn',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    role: 'user',
    bio: 'Tín đồ ẩm thực Nhật & ốc Sài Gòn. Thích đi nhóm 4-6 người ăn cho đã.',
    foodPreferences: ['Sushi & Sashimi', 'Ốc Sài Gòn', 'Bia thủ công', 'Budget thoải mái'],
    friends: ['user_1', 'user_2'],
    trustScore: 4.8,
    totalMealsJoined: 12,
    location: {
      lat: 10.7810,
      lng: 106.6950,
      address: 'Quận 3, TP. Hồ Chí Minh'
    }
  },
  {
    id: 'user_4',
    name: 'Đặng Minh Anh',
    email: 'minhanh@foodie.vn',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    role: 'user',
    bio: 'Sinh viên năm cuối, tìm hội ăn uống giá sinh viên, chia bill sòng phẳng.',
    foodPreferences: ['Ăn vặt', 'Mì cay', 'Lẩu bò', 'Budget dưới 120k'],
    friends: ['user_1'],
    trustScore: 4.7,
    totalMealsJoined: 9,
    location: {
      lat: 10.7650,
      lng: 106.6820,
      address: 'Quận 5, TP. Hồ Chí Minh'
    }
  },
  // Restaurant User Accounts (for logging in directly as partner)
  {
    id: 'user_rest_1',
    name: 'Quản Lý Haidilao Bitexco',
    email: 'manager@haidilao.vn',
    avatar: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=80',
    role: 'restaurant',
    restaurantId: 'rest_1',
    bio: 'Tài khoản chính thức của Haidilao chi nhánh Bitexco Tower.',
    foodPreferences: ['Lẩu Trung Hoa'],
    friends: [],
    trustScore: 5.0,
    totalMealsJoined: 0,
    location: {
      lat: 10.7719,
      lng: 106.7044,
      address: 'Tầng 3, Bitexco Financial Tower, Quận 1'
    }
  },
  {
    id: 'user_rest_2',
    name: 'Bếp Trưởng Gogi House',
    email: 'gogi.saigon@redsun.vn',
    avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&auto=format&fit=crop&q=80',
    role: 'restaurant',
    restaurantId: 'rest_2',
    bio: 'Quản lý vận hành quán nướng Gogi House chi nhánh Nguyễn Huệ.',
    foodPreferences: ['Nướng BBQ Hàn Quốc'],
    friends: [],
    trustScore: 4.9,
    totalMealsJoined: 0,
    location: {
      lat: 10.7745,
      lng: 106.7032,
      address: 'Nguyễn Huệ, Quận 1'
    }
  }
];

export const INITIAL_RESTAURANTS: Restaurant[] = [
  {
    id: 'rest_1',
    name: 'Haidilao Hotpot - Bitexco',
    category: 'Lẩu Trung Hoa',
    address: 'Tầng 3, Tháp Tài Chính Bitexco, 2 Hải Triều, Q.1, TP.HCM',
    lat: 10.7719,
    lng: 106.7044,
    rating: 4.9,
    reviewCount: 1420,
    priceRange: '250.000đ - 400.000đ/người',
    coverImage: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80',
    isRegisteredOnSystem: true,
    phone: '028 2253 9156',
    openHours: '10:00 - 02:00',
    activeDealsCount: 2,
    description: 'Thương hiệu lẩu nổi tiếng thế giới với dịch vụ đỉnh cao, múa mì nghệ thuật và đa dạng loại nước lẩu.'
  },
  {
    id: 'rest_2',
    name: 'Gogi House - Quán Thịt Nướng Hàn Quốc',
    category: 'Nướng BBQ Hàn Quốc',
    address: 'Số 45 Nguyễn Huệ, P. Bến Nghé, Quận 1, TP.HCM',
    lat: 10.7745,
    lng: 106.7032,
    rating: 4.8,
    reviewCount: 980,
    priceRange: '200.000đ - 350.000đ/người',
    coverImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
    isRegisteredOnSystem: true,
    phone: '028 7300 7338',
    openHours: '10:30 - 22:00',
    activeDealsCount: 1,
    description: 'Thịt bò Mỹ hảo hạng nướng trên than hồng, kèm các món panchan không giới hạn đúng điệu Seoul.'
  },
  {
    id: 'rest_3',
    name: 'Ốc Đào - Đặc Sản Ốc & Hải Sản Sài Gòn',
    category: 'Ốc & Hải Sản',
    address: 'Hẻm 212B Nguyễn Trãi, P. Nguyễn Cư Trinh, Quận 1, TP.HCM',
    lat: 10.7634,
    lng: 106.6865,
    rating: 4.7,
    reviewCount: 650,
    priceRange: '100.000đ - 180.000đ/người',
    coverImage: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=800&auto=format&fit=crop&q=80',
    isRegisteredOnSystem: false, // Quán vỉa hè / gia đình chưa đăng ký tài khoản
    phone: '090 943 7033',
    openHours: '11:00 - 22:30',
    activeDealsCount: 1,
    description: 'Địa chỉ ăn ốc trứ danh của dân Sài Gòn. Sốt me, sốt bơ tỏi thần thánh chấm bánh mì giòn rụm.'
  },
  {
    id: 'rest_4',
    name: 'Tiệm Lẩu Bò Nhà Gỗ Sài Gòn',
    category: 'Lẩu Bò & Đặc Sản',
    address: '162 Lý Chính Thắng, Phường 9, Quận 3, TP.HCM',
    lat: 10.7876,
    lng: 106.6854,
    rating: 4.6,
    reviewCount: 512,
    priceRange: '120.000đ - 200.000đ/người',
    coverImage: 'https://images.unsplash.com/photo-1547928576-965be7f5f6a7?w=800&auto=format&fit=crop&q=80',
    isRegisteredOnSystem: true,
    phone: '097 912 3456',
    openHours: '16:00 - 23:00',
    activeDealsCount: 2,
    description: 'Hương vị lẩu bò Đà Lạt nguyên bản giữa lòng Sài Gòn, thịt bò mềm ngọt ngập tràn rau nấm tươi.'
  },
  {
    id: 'rest_5',
    name: 'K-Pub - Korean Grill & Beer Chợ Lớn',
    category: 'Nướng BBQ & Bia',
    address: 'Tầng 4 Hùng Vương Plaza, 126 Hồng Bàng, Quận 5, TP.HCM',
    lat: 10.7565,
    lng: 106.6621,
    rating: 4.7,
    reviewCount: 430,
    priceRange: '180.000đ - 260.000đ/người',
    coverImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80',
    isRegisteredOnSystem: false, // Quán đối tác offline
    phone: '028 7300 6622',
    openHours: '10:00 - 22:00',
    activeDealsCount: 1,
    description: 'Nướng đường phố phong cách thùng phuy xứ Hàn với buffet thịt ba chỉ không giới hạn.'
  }
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  // Haidilao
  {
    id: 'menu_1',
    restaurantId: 'rest_1',
    name: 'Nước Lẩu Cà Chua & Lẩu Thái Chua Cay (2 Ngăn)',
    price: 135000,
    category: 'Nước Lẩu',
    image: 'https://images.unsplash.com/photo-1547928576-965be7f5f6a7?w=500&auto=format&fit=crop&q=80',
    description: 'Vị cà chua thanh đậm đà và Thái chua cay thảo mộc kích thích vị giác.',
    isAvailable: true
  },
  {
    id: 'menu_2',
    restaurantId: 'rest_1',
    name: 'Thịt Bò Mỹ Cuộn Haidilao Đặc Biệt',
    price: 189000,
    category: 'Thịt Nhúng',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80',
    description: 'Bò nhập khẩu thái mỏng vừa ăn, vân mỡ đều, nhúng 15 giây là mềm tan.',
    isAvailable: true
  },
  {
    id: 'menu_3',
    restaurantId: 'rest_1',
    name: 'Múa Mì Nghệ Thuật Biểu Diễn Tại Bàn',
    price: 45000,
    category: 'Mì & Tinh Bột',
    image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=500&auto=format&fit=crop&q=80',
    description: 'Màn biểu diễn vui nhộn của nghệ nhân cùng dải mì dẻo dai thơm ngon.',
    isAvailable: true
  },
  // Gogi House
  {
    id: 'menu_4',
    restaurantId: 'rest_2',
    name: 'Dẻ Sườn Bò Mỹ Sốt Galbi Hoàng Gia',
    price: 219000,
    category: 'Thịt Bò Nướng',
    image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=500&auto=format&fit=crop&q=80',
    description: 'Ướp sốt mật ong và lê Hàn Quốc 48 tiếng, nướng xèo xèo thơm nức.',
    isAvailable: true
  },
  {
    id: 'menu_5',
    restaurantId: 'rest_2',
    name: 'Canh Kim Chi Thịt Heo Nóng Hổi',
    price: 89000,
    category: 'Canh & Cơm',
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=500&auto=format&fit=crop&q=80',
    description: 'Canh chua thanh ấm bụng kèm đậu hũ non và thịt ba chỉ mềm béo.',
    isAvailable: true
  },
  // Lẩu bò Nhà Gỗ
  {
    id: 'menu_6',
    restaurantId: 'rest_4',
    name: 'Lẩu Bò Thập Cẩm Size Lớn (Cho 4-5 người)',
    price: 320000,
    category: 'Món Lẩu Chính',
    image: 'https://images.unsplash.com/photo-1547928576-965be7f5f6a7?w=500&auto=format&fit=crop&q=80',
    description: 'Nạm bò, gân giòn, đuôi bò hầm thảo mộc Đà Lạt thơm lừng kèm tàu hũ ky.',
    isAvailable: true
  }
];

export const INITIAL_VOUCHERS: GroupVoucher[] = [
  {
    id: 'voucher_1',
    restaurantId: 'rest_1',
    restaurantName: 'Haidilao Hotpot - Bitexco',
    code: 'HDL4FRIENDS',
    title: 'Giảm 30% Tổng Hoá Đơn Khi Đi Nhóm 4 Người',
    description: 'Áp dụng cho các nhóm đặt bàn từ 4 thành viên trở lên qua DineTogether vào các khung giờ vàng.',
    discountValue: 'Giảm 30%',
    minGroupSize: 4,
    expiryDate: '30/10/2026',
    bannerImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'voucher_2',
    restaurantId: 'rest_2',
    restaurantName: 'Gogi House - Nướng Hàn Quốc',
    code: 'GOGI_COMBO4',
    title: 'Đi 4 Tính Tiền 3 (Tặng 1 Suất Buffet Nướng 349k)',
    description: 'Mở khoá ưu đãi đặc biệt khi gom đủ bàn 4 người yêu thích thịt bò nướng chuẩn Hàn.',
    discountValue: 'Đi 4 Tính 3',
    minGroupSize: 4,
    expiryDate: '15/11/2026',
    bannerImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'voucher_3',
    restaurantId: 'rest_4',
    restaurantName: 'Tiệm Lẩu Bò Nhà Gỗ',
    code: 'NHAGO_GROUP5',
    title: 'Tặng 1 Đĩa Bắp Bò Hoa & Free Tráng Miệng Cho Nhóm 4+',
    description: 'Thưởng thức nồi lẩu bò trứ danh, nhận ngay đĩa bắp bò thượng hạng khi lập team 4 người.',
    discountValue: 'Tặng Bò Thượng Hạng',
    minGroupSize: 4,
    expiryDate: '25/10/2026',
    bannerImage: 'https://images.unsplash.com/photo-1547928576-965be7f5f6a7?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'voucher_4',
    restaurantId: 'rest_3',
    restaurantName: 'Ốc Đào - Hải Sản Sài Gòn',
    code: 'OCDAO_15',
    title: 'Giảm 15% Hoá Đơn & Tặng Bánh Mì Bơ Tỏi Cho Bàn 3 Người',
    description: 'Tụ tập bạn ăn ốc, càn quét menu ốc hương hoàng kim, ốc móng tay xào rau muống.',
    discountValue: 'Giảm 15%',
    minGroupSize: 3,
    expiryDate: '20/10/2026',
    bannerImage: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=600&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_DINING_SESSIONS: DiningSession[] = [
  {
    id: 'session_1',
    title: 'Lập team ăn lẩu Haidilao mở khoá voucher giảm 30%!',
    restaurantId: 'rest_1',
    restaurantName: 'Haidilao Hotpot - Bitexco',
    restaurantAddress: 'Tầng 3, Bitexco Financial Tower, Q.1',
    restaurantImage: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80',
    isRestaurantRegistered: true,
    hostId: 'user_2',
    hostName: 'Trần Thảo Mai',
    hostAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    targetSlots: 4,
    joinedMembers: [
      {
        userId: 'user_2',
        name: 'Trần Thảo Mai',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        isHost: true,
        readyToLock: true,
        introduction: 'Mình là Mai, mê nước lẩu cà chua và thích ăn cay! Rất vui được gặp mọi người.'
      },
      {
        userId: 'user_3',
        name: 'Lê Quốc Bảo',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
        isHost: false,
        readyToLock: true,
        introduction: 'Bảo đây, mình thích gọi thịt bò và xem múa mì. Đi nhóm 4 người chia tiền siêu hạt dẻ!'
      },
      {
        userId: 'user_4',
        name: 'Đặng Minh Anh',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        isHost: false,
        readyToLock: false,
        introduction: 'Chào các anh chị, em là sinh viên, đang thèm Haidilao mà bạn bè bận hết nên join vào đây ạ!'
      }
    ],
    invitedFriends: [
      {
        userId: 'user_1',
        name: 'Nguyễn Hoàng Tuấn',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        status: 'PENDING'
      }
    ],
    eatingTime: '19:30 - Tối nay',
    note: 'Cần tìm thêm đúng 1 bạn nữa là đủ 4 người để kích hoạt voucher giảm 30% tổng bill! Mọi người hòa đồng, chia bill sòng phẳng qua QR nha.',
    voucherApplied: INITIAL_VOUCHERS[0],
    status: 'RECRUITING',
    discussionMessages: [
      {
        id: 'msg_1',
        userId: 'user_2',
        userName: 'Trần Thảo Mai',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        message: 'Chào mọi người! Mình vừa tạo bàn này để lấy voucher 30% nè.',
        timestamp: '17:30'
      },
      {
        id: 'msg_2',
        userId: 'user_3',
        userName: 'Lê Quốc Bảo',
        userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
        message: 'Quá đã! Mình có mặt đúng 19:30 nhé. Nhớ gọi ngăn lẩu chua cay nha.',
        timestamp: '17:35'
      }
    ],
    reservationStatus: 'NONE',
    createdAt: '2026-09-17T17:00:00.000Z'
  },
  {
    id: 'session_2',
    title: 'Gom nhóm 4 người ăn Gogi nướng than hoa - Đi 4 Tính 3',
    restaurantId: 'rest_2',
    restaurantName: 'Gogi House - Nướng Hàn Quốc',
    restaurantAddress: 'Số 45 Nguyễn Huệ, Quận 1',
    restaurantImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
    isRestaurantRegistered: true,
    hostId: 'user_1',
    hostName: 'Nguyễn Hoàng Tuấn',
    hostAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    targetSlots: 4,
    joinedMembers: [
      {
        userId: 'user_1',
        name: 'Nguyễn Hoàng Tuấn',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        isHost: true,
        readyToLock: true,
        introduction: 'Tuấn chào cả nhà, mình thích ăn thịt dẻ sườn và uống soju nho!'
      },
      {
        userId: 'user_2',
        name: 'Trần Thảo Mai',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        isHost: false,
        readyToLock: true,
        introduction: 'Mình thích ăn panchan và canh kim chi nóng hổi.'
      }
    ],
    invitedFriends: [],
    eatingTime: '20:00 - Ngày mai',
    note: 'Đi ăn nướng giải tỏa áp lực cuối tuần. Đang có deal đi 4 tính tiền 3 cực hời tính ra chỉ ~220k/người no nê!',
    voucherApplied: INITIAL_VOUCHERS[1],
    status: 'RECRUITING',
    discussionMessages: [
      {
        id: 'msg_201',
        userId: 'user_1',
        userName: 'Nguyễn Hoàng Tuấn',
        userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        message: 'Mình đã set lịch 20:00 mai, các bạn tham gia cùng nhé!',
        timestamp: '16:00'
      }
    ],
    reservationStatus: 'NONE',
    createdAt: '2026-09-17T16:00:00.000Z'
  },
  {
    id: 'session_3',
    title: 'Càn quét Ốc Đào Nguyễn Trãi - Cần 3 bạn vui tính',
    restaurantId: 'rest_3',
    restaurantName: 'Ốc Đào - Hải Sản Sài Gòn',
    restaurantAddress: 'Hẻm 212B Nguyễn Trãi, Quận 1',
    restaurantImage: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=600&auto=format&fit=crop&q=80',
    isRestaurantRegistered: false, // Non-registered restaurant for voting flow test
    hostId: 'user_3',
    hostName: 'Lê Quốc Bảo',
    hostAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    targetSlots: 3,
    joinedMembers: [
      {
        userId: 'user_3',
        name: 'Lê Quốc Bảo',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
        isHost: true,
        readyToLock: true,
        introduction: 'Ăn ốc là phải đi đông mới gọi được chục món khác nhau ăn thử!'
      },
      {
        userId: 'user_4',
        name: 'Đặng Minh Anh',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        isHost: false,
        readyToLock: true,
        introduction: 'Em thích sốt trứng muối chấm bánh mì ạ.'
      },
      {
        userId: 'user_1',
        name: 'Nguyễn Hoàng Tuấn',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        isHost: false,
        readyToLock: true,
        introduction: 'Tuấn cũng thèm ốc hương bơ tỏi lắm rồi!'
      }
    ],
    invitedFriends: [],
    eatingTime: '18:30 - Tối nay',
    note: 'Bàn đã đủ người! Mọi người đang trong phòng thảo luận để thống nhất và bầu 1 bạn gọi điện giữ bàn.',
    voucherApplied: INITIAL_VOUCHERS[3],
    status: 'FULL_DISCUSSING', // Already full to showcase discussion room
    discussionMessages: [
      {
        id: 'msg_301',
        userId: 'user_3',
        userName: 'Lê Quốc Bảo',
        userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
        message: 'Hello cả nhà, bàn đã đủ 3 người rồi nè!',
        timestamp: '18:00'
      },
      {
        id: 'msg_302',
        userId: 'user_4',
        userName: 'Đặng Minh Anh',
        userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        message: 'Dạ 18:30 em qua kịp ạ, quán này không có trên app thì ai gọi điện đặt trước nhỉ?',
        timestamp: '18:02'
      }
    ],
    reservationStatus: 'NONE',
    createdAt: '2026-09-17T15:30:00.000Z'
  }
];

export const INITIAL_POSTS: UserPost[] = [
  {
    id: 'post_1',
    userId: 'user_1',
    userName: 'Nguyễn Hoàng Tuấn',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    content: 'Hôm qua ghép bàn thành công với 3 bạn mới tại Haidilao! Ăn được tận 4 loại nước lẩu và chia tiền ra mỗi người có 210k. Ứng dụng quá tiện lợi cho người thích ăn đông như mình!',
    restaurantName: 'Haidilao Hotpot - Bitexco',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80',
    likes: 28,
    createdAt: 'Hôm qua, 21:40'
  },
  {
    id: 'post_2',
    userId: 'user_2',
    userName: 'Trần Thảo Mai',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    content: 'Review nhẹ deal Đi 4 tính tiền 3 ở Gogi House: Thịt bò nướng than hoa mềm ngọt, panchan đầy ắp. Hội ăn chung hôm nay bạn nào cũng lịch sự và đúng giờ. Sẽ tiếp tục tạo bàn trên app!',
    restaurantName: 'Gogi House - Quán Thịt Nướng Hàn Quốc',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
    likes: 45,
    createdAt: '2 ngày trước'
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_1',
    userId: 'user_1',
    title: 'Lời mời đi ăn chung từ bạn bè! 🍲',
    content: 'Trần Thảo Mai vừa mời bạn tham gia bàn ăn lẩu tại Haidilao Bitexco lúc 19:30 tối nay.',
    type: 'INVITE',
    sessionId: 'session_1',
    isRead: false,
    createdAt: '10 phút trước'
  },
  {
    id: 'notif_2',
    userId: 'user_1',
    title: 'Bàn ăn đã đủ người! 🥳',
    content: 'Bàn Ốc Đào của Lê Quốc Bảo đã đủ 3 thành viên, mời bạn vào phòng thảo luận để chốt thời gian.',
    type: 'SESSION_FULL',
    sessionId: 'session_3',
    isRead: false,
    createdAt: '30 phút trước'
  }
];
