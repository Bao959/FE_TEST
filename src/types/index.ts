export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar: string;
  role: 'user' | 'restaurant';
  restaurantId?: string;
  bio: string;
  foodPreferences: string[];
  favoriteBudget?: string;
  friends: string[]; // List of User IDs
  trustScore: number;
  totalMealsJoined: number;
  profileCompletionPercent?: number;
  isProfileCompleted?: boolean;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  isAvailable: boolean;
}

export interface GroupVoucher {
  id: string;
  restaurantId: string;
  restaurantName: string;
  code: string;
  title: string;
  description: string;
  discountValue: string;
  minGroupSize: number;
  expiryDate: string;
  bannerImage: string;
}

export interface Restaurant {
  id: string;
  name: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
  rating: number;
  reviewCount: number;
  priceRange: string;
  coverImage: string;
  isRegisteredOnSystem: boolean;
  phone: string;
  openHours: string;
  activeDealsCount: number;
  description: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  message: string;
  timestamp: string;
  isSystem?: boolean;
}

export interface JoinedMember {
  userId: string;
  name: string;
  avatar: string;
  isHost: boolean;
  readyToLock: boolean;
  introduction?: string;
}

export interface InvitedFriend {
  userId: string;
  name: string;
  avatar: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  addedByUserId: string;
  addedByUserName: string;
}

export interface PaymentInfo {
  orderType: 'PRE_ORDER' | 'DINE_IN_ORDER'; // Chọn đặt món trước hoặc tới quán gọi món
  paymentMode: 'PRE_PAY' | 'POST_PAY'; // Thanh toán trước hoặc sau khi ăn xong
  orderItems: OrderItem[];
  customBillAmount?: number;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  amountPerPerson: number;
  paymentStatus: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';
  paidMembers: {
    [userId: string]: {
      paid: boolean;
      paidAt?: string;
      transactionId?: string;
    };
  };
}

export interface DiningSession {
  id: string;
  title: string;
  restaurantId: string;
  restaurantName: string;
  restaurantAddress: string;
  restaurantImage: string;
  isRestaurantRegistered: boolean;
  hostId: string;
  hostName: string;
  hostAvatar: string;
  targetSlots: number;
  joinedMembers: JoinedMember[];
  invitedFriends: InvitedFriend[];
  eatingTime: string;
  note: string;
  voucherApplied?: GroupVoucher;
  status: 'RECRUITING' | 'FULL_DISCUSSING' | 'LOCKED' | 'COMPLETED' | 'CANCELLED';
  discussionMessages: ChatMessage[];
  appointedBookerId?: string;
  appointedBookerName?: string;
  reservationStatus: 'NONE' | 'SENT_TO_RESTAURANT' | 'CONFIRMED_BY_RESTAURANT' | 'MANUAL_BOOKED';
  paymentInfo?: PaymentInfo;
  createdAt: string;
}

export interface UserPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  restaurantName?: string;
  image?: string;
  likes: number;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string; // target user
  title: string;
  content: string;
  type: 'INVITE' | 'SESSION_FULL' | 'RESERVATION_CONFIRMED' | 'NEW_MESSAGE' | 'GENERAL';
  sessionId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface FutureDiningPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  cravingDish: string;
  preferredArea: string;
  targetDate: string;
  lat: number;
  lng: number;
  restaurantSuggestion?: string;
  targetSlots: number;
  joinedUsers: Array<{
    userId: string;
    userName: string;
    userAvatar: string;
    note?: string;
  }>;
  budgetPerPerson: string;
  description: string;
  createdAt: string;
}

