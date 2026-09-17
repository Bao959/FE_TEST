import {
  User,
  Restaurant,
  MenuItem,
  GroupVoucher,
  DiningSession,
  UserPost,
  AppNotification,
  ChatMessage
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_RESTAURANTS,
  INITIAL_MENU_ITEMS,
  INITIAL_VOUCHERS,
  INITIAL_DINING_SESSIONS,
  INITIAL_POSTS,
  INITIAL_NOTIFICATIONS
} from '../mock/seedData';

const STORAGE_KEYS = {
  USERS: 'dinetogether_users_v1',
  RESTAURANTS: 'dinetogether_restaurants_v1',
  MENU_ITEMS: 'dinetogether_menu_items_v1',
  VOUCHERS: 'dinetogether_vouchers_v1',
  SESSIONS: 'dinetogether_sessions_v1',
  POSTS: 'dinetogether_posts_v1',
  NOTIFICATIONS: 'dinetogether_notifications_v1',
  CURRENT_USER_ID: 'dinetogether_current_user_id_v1'
};

class StorageService {
  constructor() {
    this.initDatabase();
  }

  public initDatabase(forceReset: boolean = false) {
    if (forceReset || !localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      localStorage.setItem(STORAGE_KEYS.RESTAURANTS, JSON.stringify(INITIAL_RESTAURANTS));
      localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(INITIAL_MENU_ITEMS));
      localStorage.setItem(STORAGE_KEYS.VOUCHERS, JSON.stringify(INITIAL_VOUCHERS));
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(INITIAL_DINING_SESSIONS));
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(INITIAL_POSTS));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, 'user_1'); // Default user: Nguyễn Hoàng Tuấn
    }
  }

  public resetAllData(): void {
    this.initDatabase(true);
    window.location.reload();
  }

  // Current Auth User
  public getCurrentUser(): User {
    const users = this.getUsers();
    const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || 'user_1';
    const found = users.find((u) => u.id === currentId);
    return found || users[0];
  }

  public setCurrentUserId(userId: string): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
  }

  // Users
  public getUsers(): User[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : INITIAL_USERS;
  }

  public getUser(userId: string): User | undefined {
    return this.getUsers().find((u) => u.id === userId);
  }

  public updateUser(updatedUser: User): void {
    const users = this.getUsers().map((u) => (u.id === updatedUser.id ? updatedUser : u));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  public createUser(userData: Partial<User>): User {
    const users = this.getUsers();
    const newUser: User = {
      id: `user_${Date.now()}`,
      name: userData.name || 'Người dùng mới',
      email: userData.email || 'user@foodie.vn',
      avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
      role: userData.role || 'user',
      restaurantId: userData.restaurantId,
      bio: userData.bio || 'Yêu thích ẩm thực và kết bạn bốn phương!',
      foodPreferences: userData.foodPreferences || ['Lẩu & Nướng', 'Ăn vặt'],
      friends: ['user_1', 'user_2'],
      trustScore: 5.0,
      totalMealsJoined: 0,
      location: userData.location || {
        lat: 10.7769,
        lng: 106.7009,
        address: 'Quận 1, TP. Hồ Chí Minh'
      }
    };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return newUser;
  }

  // Restaurants
  public getRestaurants(): Restaurant[] {
    const raw = localStorage.getItem(STORAGE_KEYS.RESTAURANTS);
    return raw ? JSON.parse(raw) : INITIAL_RESTAURANTS;
  }

  public getRestaurant(id: string): Restaurant | undefined {
    return this.getRestaurants().find((r) => r.id === id);
  }

  public updateRestaurant(restaurant: Restaurant): void {
    const list = this.getRestaurants().map((r) => (r.id === restaurant.id ? restaurant : r));
    localStorage.setItem(STORAGE_KEYS.RESTAURANTS, JSON.stringify(list));
  }

  // Menu Items
  public getMenuItems(restaurantId?: string): MenuItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.MENU_ITEMS);
    const list: MenuItem[] = raw ? JSON.parse(raw) : INITIAL_MENU_ITEMS;
    if (restaurantId) {
      return list.filter((item) => item.restaurantId === restaurantId);
    }
    return list;
  }

  public addMenuItem(item: Omit<MenuItem, 'id'>): MenuItem {
    const list = this.getMenuItems();
    const newItem: MenuItem = {
      ...item,
      id: `menu_${Date.now()}`
    };
    list.push(newItem);
    localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(list));
    return newItem;
  }

  public updateMenuItem(item: MenuItem): void {
    const list = this.getMenuItems().map((m) => (m.id === item.id ? item : m));
    localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(list));
  }

  public deleteMenuItem(id: string): void {
    const list = this.getMenuItems().filter((m) => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(list));
  }

  // Vouchers
  public getVouchers(restaurantId?: string): GroupVoucher[] {
    const raw = localStorage.getItem(STORAGE_KEYS.VOUCHERS);
    const list: GroupVoucher[] = raw ? JSON.parse(raw) : INITIAL_VOUCHERS;
    if (restaurantId) {
      return list.filter((v) => v.restaurantId === restaurantId);
    }
    return list;
  }

  public addVoucher(voucher: Omit<GroupVoucher, 'id'>): GroupVoucher {
    const list = this.getVouchers();
    const newVoucher: GroupVoucher = {
      ...voucher,
      id: `voucher_${Date.now()}`
    };
    list.push(newVoucher);
    localStorage.setItem(STORAGE_KEYS.VOUCHERS, JSON.stringify(list));

    // Update restaurant deal count
    const restaurants = this.getRestaurants();
    const targetRest = restaurants.find((r) => r.id === voucher.restaurantId);
    if (targetRest) {
      targetRest.activeDealsCount = (targetRest.activeDealsCount || 0) + 1;
      this.updateRestaurant(targetRest);
    }

    return newVoucher;
  }

  // Dining Sessions
  public getSessions(): DiningSession[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    const sessions: DiningSession[] = raw ? JSON.parse(raw) : INITIAL_DINING_SESSIONS;
    let modified = false;
    sessions.forEach((s) => {
      if (!s.paymentInfo) {
        this.recalculatePaymentInfo(s);
        modified = true;
      }
    });
    if (modified) {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    }
    return sessions;
  }

  public getSession(id: string): DiningSession | undefined {
    return this.getSessions().find((s) => s.id === id);
  }

  public createSession(sessionData: Omit<DiningSession, 'id' | 'createdAt' | 'discussionMessages' | 'joinedMembers' | 'invitedFriends' | 'reservationStatus'>, creator: User, invitedFriendIds: string[] = []): DiningSession {
    const sessions = this.getSessions();
    const allUsers = this.getUsers();

    const invitedFriends = invitedFriendIds.map((friendId) => {
      const friend = allUsers.find((u) => u.id === friendId);
      return {
        userId: friendId,
        name: friend?.name || 'Bạn bè',
        avatar: friend?.avatar || '',
        status: 'PENDING' as const
      };
    });

    const newSession: DiningSession = {
      ...sessionData,
      id: `session_${Date.now()}`,
      joinedMembers: [
        {
          userId: creator.id,
          name: creator.name,
          avatar: creator.avatar,
          isHost: true,
          readyToLock: true,
          introduction: `Xin chào! Mình là ${creator.name}, người tạo bàn ăn này. Rất vui được gặp các bạn!`
        }
      ],
      invitedFriends,
      status: 'RECRUITING',
      discussionMessages: [
        {
          id: `msg_${Date.now()}`,
          userId: creator.id,
          userName: creator.name,
          userAvatar: creator.avatar,
          message: `Chào cả nhà! Mình vừa tạo bàn tìm bạn ăn chung tại ${sessionData.restaurantName}. Mọi người cùng tham gia nhé!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ],
      reservationStatus: 'NONE',
      createdAt: new Date().toISOString()
    };

    sessions.unshift(newSession);
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));

    // Send notifications to invited friends
    invitedFriendIds.forEach((friendId) => {
      this.addNotification({
        userId: friendId,
        title: 'Lời mời đi ăn chung! 🍲',
        content: `${creator.name} đã mời bạn tham gia bàn ăn tại ${sessionData.restaurantName} lúc ${sessionData.eatingTime}.`,
        type: 'INVITE',
        sessionId: newSession.id,
        isRead: false
      });
    });

    return newSession;
  }

  public joinSession(sessionId: string, user: User, introduction?: string): DiningSession | null {
    const sessions = this.getSessions();
    const targetSession = sessions.find((s) => s.id === sessionId);
    if (!targetSession) return null;

    // Check if already in
    const isAlreadyMember = targetSession.joinedMembers.some((m) => m.userId === user.id);
    if (!isAlreadyMember) {
      targetSession.joinedMembers.push({
        userId: user.id,
        name: user.name,
        avatar: user.avatar,
        isHost: false,
        readyToLock: false,
        introduction: introduction || `Chào mọi người, mình là ${user.name}. Rất háo hức được đi ăn chung!`
      });

      // Add system message
      targetSession.discussionMessages.push({
        id: `msg_${Date.now()}`,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        message: `${user.name} đã tham gia bàn ăn! 👋`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: true
      });

      // If introduction was provided, add it as a message
      if (introduction) {
        targetSession.discussionMessages.push({
          id: `msg_intro_${Date.now()}`,
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatar,
          message: `Giới thiệu bản thân: "${introduction}"`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }

      // Check if slots are now full
      if (targetSession.joinedMembers.length >= targetSession.targetSlots) {
        targetSession.status = 'FULL_DISCUSSING';

        // Notify host
        this.addNotification({
          userId: targetSession.hostId,
          title: 'Bàn ăn của bạn đã đủ người! 🥳',
          content: `Bàn tại ${targetSession.restaurantName} đã đủ ${targetSession.targetSlots} người. Mở phòng thảo luận để chuẩn bị chốt bàn nhé!`,
          type: 'SESSION_FULL',
          sessionId: targetSession.id,
          isRead: false
        });
      }
    }

    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    return targetSession;
  }

  public leaveSession(sessionId: string, userId: string): void {
    const sessions = this.getSessions();
    const target = sessions.find((s) => s.id === sessionId);
    if (!target) return;

    target.joinedMembers = target.joinedMembers.filter((m) => m.userId !== userId);
    if (target.status === 'FULL_DISCUSSING' && target.joinedMembers.length < target.targetSlots) {
      target.status = 'RECRUITING';
    }
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  }

  public sendSessionMessage(sessionId: string, user: User, message: string): void {
    const sessions = this.getSessions();
    const target = sessions.find((s) => s.id === sessionId);
    if (!target) return;

    target.discussionMessages.push({
      id: `msg_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  }

  public updateSessionSettings(sessionId: string, newTime: string, newTargetSlots: number): void {
    const sessions = this.getSessions();
    const target = sessions.find((s) => s.id === sessionId);
    if (!target) return;

    const oldTime = target.eatingTime;
    const oldSlots = target.targetSlots;

    target.eatingTime = newTime;
    target.targetSlots = newTargetSlots;

    target.discussionMessages.push({
      id: `msg_sys_${Date.now()}`,
      userId: 'system',
      userName: 'Hệ thống',
      userAvatar: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=80',
      message: `🔔 Thay đổi bàn ăn: Giờ hẹn (${oldTime} ➔ ${newTime}), Số lượng (${oldSlots} ➔ ${newTargetSlots} người)`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true
    });

    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  }

  public lockSession(sessionId: string): DiningSession | null {
    const sessions = this.getSessions();
    const target = sessions.find((s) => s.id === sessionId);
    if (!target) return null;

    target.status = 'LOCKED';

    if (target.isRestaurantRegistered) {
      target.reservationStatus = 'SENT_TO_RESTAURANT';
      // Create notification for restaurant owner
      const restaurantUsers = this.getUsers().filter(
        (u) => u.role === 'restaurant' && u.restaurantId === target.restaurantId
      );
      restaurantUsers.forEach((rUser) => {
        this.addNotification({
          userId: rUser.id,
          title: '🛎️ Có đơn đặt bàn nhóm mới!',
          content: `Nhóm ${target.joinedMembers.length} người của ${target.hostName} vừa chốt bàn lúc ${target.eatingTime}. Voucher: ${target.voucherApplied?.title || 'Không kèm voucher'}.`,
          type: 'SESSION_FULL',
          sessionId: target.id,
          isRead: false
        });
      });
    }

    target.discussionMessages.push({
      id: `msg_lock_${Date.now()}`,
      userId: 'system',
      userName: 'Hệ thống',
      userAvatar: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=80',
      message: target.isRestaurantRegistered
        ? `🎉 BÀN ĂN ĐÃ ĐƯỢC CHỐT! Hệ thống đã tự động gửi yêu cầu đặt bàn sang Quản lý nhà hàng ${target.restaurantName}.`
        : `🎉 BÀN ĂN ĐÃ ĐƯỢC CHỐT! Nhà hàng này chưa liên kết trực tiếp trên hệ thống, vui lòng cùng bầu chọn 1 thành viên gọi điện giữ chỗ trước nhé!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true
    });

    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    return target;
  }

  public appointBooker(sessionId: string, bookerId: string, bookerName: string): void {
    const sessions = this.getSessions();
    const target = sessions.find((s) => s.id === sessionId);
    if (!target) return;

    target.appointedBookerId = bookerId;
    target.appointedBookerName = bookerName;
    target.reservationStatus = 'MANUAL_BOOKED';

    target.discussionMessages.push({
      id: `msg_booker_${Date.now()}`,
      userId: 'system',
      userName: 'Hệ thống',
      userAvatar: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=80',
      message: `📞 ${bookerName} đã nhận nhiệm vụ gọi điện đặt trước bàn ăn cho cả nhóm!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true
    });

    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  }

  // Quick simulation: auto-fill strangers into a table for testing
  public autoFillStrangers(sessionId: string): DiningSession | null {
    const sessions = this.getSessions();
    const target = sessions.find((s) => s.id === sessionId);
    if (!target) return null;

    const availablePool = this.getUsers().filter(
      (u) => u.role === 'user' && !target.joinedMembers.some((m) => m.userId === u.id)
    );

    const needed = target.targetSlots - target.joinedMembers.length;
    for (let i = 0; i < needed && i < availablePool.length; i++) {
      const u = availablePool[i];
      target.joinedMembers.push({
        userId: u.id,
        name: u.name,
        avatar: u.avatar,
        isHost: false,
        readyToLock: true,
        introduction: `Chào bạn, mình là ${u.name}! Thấy bàn này hợp vị quá nên join liền nè.`
      });
      target.discussionMessages.push({
        id: `msg_auto_${Date.now()}_${i}`,
        userId: u.id,
        userName: u.name,
        userAvatar: u.avatar,
        message: `Chào cả nhóm! Mình vừa ghép vào bàn, rất mong được gặp mọi người.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }

    if (target.joinedMembers.length >= target.targetSlots) {
      target.status = 'FULL_DISCUSSING';
    }

    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    return target;
  }

  // Restaurant Portal Reservations
  public getRestaurantReservations(restaurantId: string): DiningSession[] {
    return this.getSessions().filter(
      (s) => s.restaurantId === restaurantId && (s.status === 'LOCKED' || s.reservationStatus === 'SENT_TO_RESTAURANT' || s.reservationStatus === 'CONFIRMED_BY_RESTAURANT')
    );
  }

  public confirmRestaurantReservation(sessionId: string): void {
    const sessions = this.getSessions();
    const target = sessions.find((s) => s.id === sessionId);
    if (!target) return;

    target.reservationStatus = 'CONFIRMED_BY_RESTAURANT';
    target.discussionMessages.push({
      id: `msg_rest_confirm_${Date.now()}`,
      userId: 'restaurant',
      userName: target.restaurantName,
      userAvatar: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100&auto=format&fit=crop&q=80',
      message: `✅ Nhà hàng ${target.restaurantName} ĐÃ XÁC NHẬN giữ bàn cho nhóm của bạn! Hẹn gặp quý khách đúng giờ.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true
    });

    // Notify host
    this.addNotification({
      userId: target.hostId,
      title: 'Nhà hàng đã xác nhận bàn! 🎉',
      content: `${target.restaurantName} đã nhận đơn và giữ chỗ cho nhóm của bạn vào lúc ${target.eatingTime}.`,
      type: 'RESERVATION_CONFIRMED',
      sessionId: target.id,
      isRead: false
    });

    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  }

  // Social Posts
  public getPosts(): UserPost[] {
    const raw = localStorage.getItem(STORAGE_KEYS.POSTS);
    return raw ? JSON.parse(raw) : INITIAL_POSTS;
  }

  public createPost(post: Omit<UserPost, 'id' | 'createdAt' | 'likes'>): UserPost {
    const posts = this.getPosts();
    const newPost: UserPost = {
      ...post,
      id: `post_${Date.now()}`,
      likes: 0,
      createdAt: 'Vừa xong'
    };
    posts.unshift(newPost);
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    return newPost;
  }

  public likePost(postId: string): void {
    const posts = this.getPosts();
    const p = posts.find((item) => item.id === postId);
    if (p) {
      p.likes += 1;
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    }
  }

  // Notifications
  public getNotifications(userId: string): AppNotification[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const list: AppNotification[] = raw ? JSON.parse(raw) : INITIAL_NOTIFICATIONS;
    return list.filter((n) => n.userId === userId);
  }

  public addNotification(notification: Omit<AppNotification, 'id' | 'createdAt'>): void {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const list: AppNotification[] = raw ? JSON.parse(raw) : INITIAL_NOTIFICATIONS;
    list.unshift({
      ...notification,
      id: `notif_${Date.now()}`,
      createdAt: 'Vừa xong'
    });
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
  }

  // Payment & Order Management
  public recalculatePaymentInfo(session: DiningSession): void {
    if (!session.paymentInfo) {
      session.paymentInfo = {
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
    }

    const pi = session.paymentInfo;
    let subtotal = 0;
    if (pi.orderType === 'PRE_ORDER') {
      subtotal = pi.orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    } else {
      subtotal = pi.customBillAmount || 0;
    }

    let discount = 0;
    if (session.voucherApplied) {
      const vText = session.voucherApplied.discountValue;
      if (vText.includes('%')) {
        const match = vText.match(/(\d+)%/);
        if (match) {
          const percent = parseInt(match[1], 10);
          discount = Math.round((subtotal * percent) / 100);
        }
      } else if (vText.includes('Đi 4') || vText.includes('Tính 3')) {
        discount = Math.round(subtotal * 0.25);
      } else {
        discount = 60000;
      }
    }

    pi.subtotal = subtotal;
    pi.discountAmount = Math.min(discount, subtotal);
    pi.totalAmount = Math.max(0, subtotal - pi.discountAmount);
    
    const memberCount = Math.max(1, session.joinedMembers.length);
    pi.amountPerPerson = Math.round(pi.totalAmount / memberCount);

    const allMembersPaid =
      session.joinedMembers.length > 0 &&
      session.joinedMembers.every((m) => pi.paidMembers[m.userId]?.paid);

    if (allMembersPaid && pi.totalAmount > 0) {
      pi.paymentStatus = 'PAID';
      session.status = 'COMPLETED';
    } else if (Object.values(pi.paidMembers).some((p) => p.paid)) {
      pi.paymentStatus = 'PARTIALLY_PAID';
    }
  }

  public addOrderItem(sessionId: string, menuItem: MenuItem, user: User, quantity: number = 1): DiningSession | null {
    const sessions = this.getSessions();
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return null;

    if (!session.paymentInfo) {
      this.recalculatePaymentInfo(session);
    }

    const existing = session.paymentInfo!.orderItems.find((i) => i.menuItemId === menuItem.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      session.paymentInfo!.orderItems.push({
        id: `order_item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity,
        addedByUserId: user.id,
        addedByUserName: user.name
      });
    }

    session.discussionMessages.push({
      id: `msg_order_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      message: `🍲 Đã thêm món: ${menuItem.name} (${quantity} suất) vào thực đơn bàn!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true
    });

    this.recalculatePaymentInfo(session);
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    return session;
  }

  public updateOrderItemQuantity(sessionId: string, orderItemId: string, delta: number): DiningSession | null {
    const sessions = this.getSessions();
    const session = sessions.find((s) => s.id === sessionId);
    if (!session || !session.paymentInfo) return null;

    const itemIndex = session.paymentInfo.orderItems.findIndex((i) => i.id === orderItemId);
    if (itemIndex > -1) {
      session.paymentInfo.orderItems[itemIndex].quantity += delta;
      if (session.paymentInfo.orderItems[itemIndex].quantity <= 0) {
        session.paymentInfo.orderItems.splice(itemIndex, 1);
      }
    }

    this.recalculatePaymentInfo(session);
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    return session;
  }

  public updatePaymentConfig(sessionId: string, orderType: 'PRE_ORDER' | 'DINE_IN_ORDER', paymentMode: 'PRE_PAY' | 'POST_PAY'): DiningSession | null {
    const sessions = this.getSessions();
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return null;

    if (!session.paymentInfo) {
      this.recalculatePaymentInfo(session);
    }

    session.paymentInfo!.orderType = orderType;
    session.paymentInfo!.paymentMode = paymentMode;

    const orderText = orderType === 'PRE_ORDER' ? 'Đặt trước món trên App' : 'Đến quán gọi món trực tiếp';
    const payText = paymentMode === 'PRE_PAY' ? 'Thanh toán trước' : 'Ăn xong mới thanh toán';

    session.discussionMessages.push({
      id: `msg_paycfg_${Date.now()}`,
      userId: 'system',
      userName: 'Hệ thống',
      userAvatar: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=80',
      message: `💳 Cập nhật thanh toán: ${orderText} • ${payText}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true
    });

    this.recalculatePaymentInfo(session);
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    return session;
  }

  public updateCustomBillAmount(sessionId: string, amount: number): DiningSession | null {
    const sessions = this.getSessions();
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return null;

    if (!session.paymentInfo) {
      this.recalculatePaymentInfo(session);
    }

    session.paymentInfo!.customBillAmount = amount;
    this.recalculatePaymentInfo(session);
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    return session;
  }

  public payMemberShare(sessionId: string, userId: string, userName: string): DiningSession | null {
    const sessions = this.getSessions();
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return null;

    if (!session.paymentInfo) {
      this.recalculatePaymentInfo(session);
    }

    const pi = session.paymentInfo!;
    pi.paidMembers[userId] = {
      paid: true,
      paidAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      transactionId: `TX_${Date.now().toString().slice(-6)}`
    };

    session.discussionMessages.push({
      id: `msg_paid_share_${Date.now()}`,
      userId: userId,
      userName: userName,
      userAvatar: session.joinedMembers.find((m) => m.userId === userId)?.avatar || '',
      message: `💰 ${userName} đã thanh toán thành công phần tiền chia (${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pi.amountPerPerson)})!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true
    });

    this.recalculatePaymentInfo(session);
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    return session;
  }

  public payFullBill(sessionId: string, paidByUserId?: string, paidByName?: string): DiningSession | null {
    const sessions = this.getSessions();
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return null;

    if (!session.paymentInfo) {
      this.recalculatePaymentInfo(session);
    }

    const pi = session.paymentInfo!;
    session.joinedMembers.forEach((m) => {
      pi.paidMembers[m.userId] = {
        paid: true,
        paidAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        transactionId: `TX_${Date.now().toString().slice(-6)}`
      };
    });

    pi.paymentStatus = 'PAID';
    session.status = 'COMPLETED';

    session.discussionMessages.push({
      id: `msg_paid_full_${Date.now()}`,
      userId: 'system',
      userName: 'Hệ thống',
      userAvatar: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=80',
      message: `🎉 TOÀN BỘ BÀN ĂN ĐÃ THANH TOÁN THÀNH CÔNG! ${paidByName ? `${paidByName} đã đại diện thanh toán.` : 'Hóa đơn đã được quyết toán.'} Chúc mọi người có bữa ăn ngon miệng và nhiều niềm vui!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true
    });

    // Notify restaurant
    if (session.isRestaurantRegistered) {
      const restUsers = this.getUsers().filter((u) => u.role === 'restaurant' && u.restaurantId === session.restaurantId);
      restUsers.forEach((ru) => {
        this.addNotification({
          userId: ru.id,
          title: '💵 Đơn đặt bàn đã thanh toán thành công!',
          content: `Bàn ${session.title} (${session.joinedMembers.length} khách) đã thanh toán tổng cộng ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pi.totalAmount)}.`,
          type: 'RESERVATION_CONFIRMED',
          sessionId: session.id,
          isRead: false
        });
      });
    }

    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    return session;
  }

  public markNotificationAsRead(id: string): void {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const list: AppNotification[] = raw ? JSON.parse(raw) : INITIAL_NOTIFICATIONS;
    const item = list.find((n) => n.id === id);
    if (item) {
      item.isRead = true;
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    }
  }
}

export const storageService = new StorageService();

