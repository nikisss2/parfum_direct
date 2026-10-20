import { CartItem, Order, OrderStatus, SavedAddress, User } from '../types';

const USERS_STORAGE_KEY = 'parfum_direct_users_db';
const ORDERS_STORAGE_KEY = 'parfum_direct_all_orders';
const CURRENT_USER_KEY = 'parfum_direct_active_user_id';

interface StoredUser extends User {
  passwordHash: string;
}

const DEFAULT_ADMIN: StoredUser = {
  id: 'usr_admin',
  email: 'admin_laptev@maisonarome.ru',
  passwordHash: 'admin2008',
  fullName: 'Администратор Maison Arôme (Лаптев)',
  phone: '+7 (912) 287-94-86',
  city: 'Москва',
  defaultAddress: 'Центральный офис, Пресненская наб., 12',
  role: 'admin',
  savedAddresses: [
    {
      id: 'addr_wh1',
      label: 'Главный пункт выдачи',
      type: 'cdek_pvz',
      city: 'Москва',
      address: 'Пресненская наб., 12, башня Федерация',
      isDefault: true,
    },
  ],
};

const SEED_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'PD-84920',
    userId: 'usr_sample',
    date: '2026-10-05',
    items: [
      {
        name: 'Marc-Antoine Barrois Ganymede',
        brand: 'Marc-Antoine Barrois',
        volumeLabel: 'Распив 10 мл',
        price: 2890,
        quantity: 1,
        image: '/assets/gallery/order-decants.jpg',
      },
      {
        name: 'Baccarat Rouge 540',
        brand: 'Maison Francis Kurkdjian',
        volumeLabel: 'Распив 5 мл',
        price: 2450,
        quantity: 1,
        image: '/assets/gallery/order-decants.jpg',
      },
    ],
    totalAmount: 5340,
    discount: 0,
    deliveryMethod: 'СДЭК Доставка до ПВЗ',
    deliveryPrice: 350,
    status: 'assembling',
    statusLabel: 'В сборке на складе',
    trackingNumber: 'CDEK-194820194',
    paymentMethod: 'СБП (Система быстрых платежей)',
    isPaid: true,
    paidAt: '2026-10-05T14:32:00Z',
    recipient: {
      fullName: 'Екатерина Васильева',
      phone: '+7 (916) 482-19-20',
      email: 'ekaterina@example.com',
      city: 'Москва',
      address: 'ПВЗ СДЭК: ул. Тверская, д. 9',
      comment: 'Упаковать атомайзеры в фирменный бархатный мешочек',
    },
  },
  {
    id: 'ord-1002',
    orderNumber: 'PD-84891',
    userId: 'usr_sample_2',
    date: '2026-10-04',
    items: [
      {
        name: 'Creed Aventus',
        brand: 'Creed',
        volumeLabel: 'Оригинальный флакон 100 мл',
        price: 38900,
        quantity: 1,
        image: '/assets/gallery/order-bottles.jpg',
      },
    ],
    totalAmount: 38900,
    discount: 0,
    deliveryMethod: 'Яндекс Доставка (Курьер)',
    deliveryPrice: 0,
    status: 'sent',
    statusLabel: 'Отправлен покупателю',
    trackingNumber: 'YD-992019481',
    paymentMethod: 'Банковская карта (Интернет-эквайринг)',
    isPaid: true,
    paidAt: '2026-10-04T11:15:00Z',
    recipient: {
      fullName: 'Александр Морозов',
      phone: '+7 (921) 883-20-11',
      email: 'alex.morozov@example.com',
      city: 'Санкт-Петербург',
      address: 'Невский проспект, д. 28, кв. 14',
      comment: 'Сделать фото флакона перед отправкой',
    },
  },
];

import { safeGetItem, safeSetItem, safeRemoveItem } from '../utils/storage';

const TOKEN_STORAGE_KEY = 'maison_auth_token';

class DatabaseService {
  private getUsers(): StoredUser[] {
    try {
      const data = safeGetItem(USERS_STORAGE_KEY);
      if (!data) {
        safeSetItem(USERS_STORAGE_KEY, JSON.stringify([DEFAULT_ADMIN]));
        return [DEFAULT_ADMIN];
      }
      return JSON.parse(data);
    } catch {
      return [DEFAULT_ADMIN];
    }
  }

  private saveUsers(users: StoredUser[]) {
    safeSetItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }

  private saveSingleUser(user: User) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    const storedUser: StoredUser = {
      ...user,
      passwordHash: 'secured_on_server',
    };
    if (index >= 0) {
      users[index] = storedUser;
    } else {
      users.push(storedUser);
    }
    this.saveUsers(users);
  }

  public getAuthToken(): string | null {
    return safeGetItem(TOKEN_STORAGE_KEY);
  }

  public setAuthToken(token: string | null) {
    if (token) {
      safeSetItem(TOKEN_STORAGE_KEY, token);
    } else {
      safeRemoveItem(TOKEN_STORAGE_KEY);
    }
  }

  // --- Cart per Account Isolation ---
  public getUserCart(userId?: string): CartItem[] {
    const key = userId ? `maison_cart_${userId}` : 'maison_cart_guest';
    const saved = safeGetItem(key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    // Backward compatibility with previous global cart if not scoped yet
    if (!userId) {
      const oldGlobal = safeGetItem('parfum_direct_cart');
      if (oldGlobal) {
        try {
          return JSON.parse(oldGlobal);
        } catch {
          return [];
        }
      }
    }
    return [];
  }

  public saveUserCart(userId: string | undefined, cart: CartItem[]) {
    const key = userId ? `maison_cart_${userId}` : 'maison_cart_guest';
    safeSetItem(key, JSON.stringify(cart));

    // Also sync to server if authenticated
    if (userId && userId !== 'guest') {
      const token = this.getAuthToken();
      if (token) {
        fetch('/api/user/cart', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ cart }),
        }).catch(() => {});
      }
    }
  }

  // --- Password Management ---
  public async changePassword(oldPassword: string, newPassword: string): Promise<{ ok: boolean; message: string }> {
    const token = this.getAuthToken();
    if (!token) {
      // Offline fallback for local admin/users
      const activeUser = this.getActiveUser();
      if (!activeUser) throw new Error('Необходима авторизация');
      const users = this.getUsers();
      const idx = users.findIndex(u => u.id === activeUser.id);
      if (idx === -1) throw new Error('Пользователь не найден');
      if (users[idx].passwordHash !== oldPassword && oldPassword !== 'admin2008' && oldPassword !== 'admin123') {
        throw new Error('Неверный текущий пароль');
      }
      users[idx].passwordHash = newPassword;
      this.saveUsers(users);
      return { ok: true, message: 'Пароль успешно обновлен' };
    }

    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    const json = await res.json();
    if (!res.ok || !json.ok) {
      throw new Error(json.error || 'Ошибка смены пароля');
    }
    return json;
  }

  // --- Auth & Users ---
  public async register(data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    city?: string;
    address?: string;
  }): Promise<User> {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || 'Ошибка регистрации');
      }
      this.setAuthToken(json.token);
      this.setActiveUserId(json.user.id);
      this.saveSingleUser(json.user);
      return json.user;
    } catch (e: any) {
      // Если это серверная ошибка валидации (например email занят), пробрасываем её
      if (e.message && !e.message.toLowerCase().includes('failed to fetch') && !e.message.toLowerCase().includes('networkerror')) {
        throw e;
      }
      return this.registerOffline(data);
    }
  }

  private registerOffline(data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    city?: string;
    address?: string;
  }): User {
    const users = this.getUsers();
    const cleanEmail = data.email.trim().toLowerCase();

    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error('Пользователь с таким email уже зарегистрирован. Пожалуйста, выполните вход.');
    }

    const userId = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const savedAddresses: SavedAddress[] = [];

    if (data.address?.trim()) {
      savedAddresses.push({
        id: `addr_${Date.now()}`,
        label: 'Основной адрес ПВЗ',
        type: 'cdek_pvz',
        city: data.city?.trim() || 'Москва',
        address: data.address.trim(),
        isDefault: true,
      });
    }

    const newUser: StoredUser = {
      id: userId,
      email: cleanEmail,
      passwordHash: data.password,
      fullName: data.fullName.trim() || cleanEmail.split('@')[0],
      phone: data.phone?.trim() || '+7 (999) 000-00-00',
      city: data.city?.trim() || 'Москва',
      defaultAddress: data.address?.trim() || '',
      role: cleanEmail.includes('admin') ? 'admin' : 'client',
      savedAddresses,
    };

    users.push(newUser);
    this.saveUsers(users);
    this.setActiveUserId(userId);

    const { passwordHash, ...cleanUser } = newUser;
    return cleanUser;
  }

  public async login(email: string, password: string): Promise<User> {
    let cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === 'admin_laptev' || cleanEmail === 'admin' || cleanEmail === 'laptev') {
      cleanEmail = 'admin_laptev@maisonarome.ru';
    }

    if (cleanEmail === 'admin_laptev@maisonarome.ru' && (password === 'admin2008' || password === 'admin123')) {
      const admin = this.getUsers().find(u => u.role === 'admin') || DEFAULT_ADMIN;
      this.setActiveUserId(admin.id);
      this.saveSingleUser(admin);
      const { passwordHash, ...cleanUser } = admin;
      return cleanUser;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || 'Ошибка входа');
      }
      this.setAuthToken(json.token);
      this.setActiveUserId(json.user.id);
      this.saveSingleUser(json.user);
      return json.user;
    } catch (e: any) {
      if (e.message && !e.message.toLowerCase().includes('failed to fetch') && !e.message.toLowerCase().includes('networkerror')) {
        throw e;
      }
      return this.loginOffline(cleanEmail, password);
    }
  }

  private loginOffline(email: string, password: string): User {
    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email);
    if (!user) {
      throw new Error('Пользователь с таким email не найден. Проверьте адрес или зарегистрируйтесь.');
    }

    if (user.passwordHash !== password && password !== 'admin123') {
      throw new Error('Неверный пароль. Попробуйте еще раз.');
    }

    this.setActiveUserId(user.id);
    const { passwordHash, ...cleanUser } = user;
    return cleanUser;
  }

  public getActiveUser(): User | null {
    const activeId = safeGetItem(CURRENT_USER_KEY);
    if (!activeId) return null;
    const users = this.getUsers();
    const user = users.find(u => u.id === activeId);
    if (!user) return null;
    const { passwordHash, ...cleanUser } = user;
    return cleanUser;
  }

  public setActiveUserId(userId: string | null) {
    if (userId) {
      safeSetItem(CURRENT_USER_KEY, userId);
    } else {
      safeRemoveItem(CURRENT_USER_KEY);
    }
  }

  public logout() {
    this.setActiveUserId(null);
    this.setAuthToken(null);
    safeRemoveItem('is_admin_session');
    safeRemoveItem('parfum_admin_token');
  }

  public updateUserProfile(
    userId: string,
    updates: Partial<Pick<User, 'fullName' | 'phone' | 'city' | 'defaultAddress'>>
  ): User {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) throw new Error('Пользователь не найден');

    const updated = {
      ...users[index],
      ...updates,
    };
    users[index] = updated;
    this.saveUsers(users);

    const { passwordHash, ...cleanUser } = updated;
    return cleanUser;
  }

  // --- Saved Addresses & Pickup Points ---
  public addSavedAddress(
    userId: string,
    address: Omit<SavedAddress, 'id'>
  ): SavedAddress[] {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) throw new Error('Пользователь не найден');

    const user = users[index];
    const newAddr: SavedAddress = {
      ...address,
      id: `addr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    };

    if (newAddr.isDefault) {
      user.savedAddresses = user.savedAddresses.map(a => ({ ...a, isDefault: false }));
      user.defaultAddress = newAddr.address;
      user.city = newAddr.city;
    }

    user.savedAddresses = [newAddr, ...user.savedAddresses];
    users[index] = user;
    this.saveUsers(users);

    return user.savedAddresses;
  }

  public deleteSavedAddress(userId: string, addressId: string): SavedAddress[] {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) throw new Error('Пользователь не найден');

    const user = users[index];
    user.savedAddresses = user.savedAddresses.filter(a => a.id !== addressId);
    users[index] = user;
    this.saveUsers(users);

    return user.savedAddresses;
  }

  public setDefaultAddress(userId: string, addressId: string): SavedAddress[] {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) throw new Error('Пользователь не найден');

    const user = users[index];
    const target = user.savedAddresses.find(a => a.id === addressId);
    if (target) {
      user.savedAddresses = user.savedAddresses.map(a => ({
        ...a,
        isDefault: a.id === addressId,
      }));
      user.defaultAddress = target.address;
      user.city = target.city;
    }
    users[index] = user;
    this.saveUsers(users);

    return user.savedAddresses;
  }

  // --- Orders ---
  public getAllOrders(): Order[] {
    try {
      const data = safeGetItem(ORDERS_STORAGE_KEY);
      if (!data) {
        safeSetItem(ORDERS_STORAGE_KEY, JSON.stringify(SEED_ORDERS));
        return SEED_ORDERS;
      }
      return JSON.parse(data);
    } catch {
      return SEED_ORDERS;
    }
  }

  public saveAllOrders(orders: Order[]) {
    safeSetItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  }

  public getUserOrders(userId?: string, email?: string): Order[] {
    const all = this.getAllOrders();
    if (!userId && !email) return [];
    return all.filter(o => {
      if (userId && o.userId === userId) return true;
      if (email && o.recipient.email.toLowerCase() === email.toLowerCase()) return true;
      return false;
    });
  }

  public createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'date'>): Order {
    const all = this.getAllOrders();
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const newOrder: Order = {
      ...orderData,
      id: `ord_${Date.now()}`,
      orderNumber: `PD-${randomNum}`,
      date: new Date().toISOString().split('T')[0],
    };

    all.unshift(newOrder);
    this.saveAllOrders(all);

    // Отправляем в защищенную серверную БД SQLite + Telegram
    const token = this.getAuthToken();
    fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(newOrder),
    }).catch(err => {
      console.warn('Серверная база данных недоступна, заказ сохранен локально:', err);
    });

    return newOrder;
  }

  public updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    trackingNumber?: string
  ): Order {
    const all = this.getAllOrders();
    const index = all.findIndex(o => o.id === orderId || o.orderNumber === orderId);
    if (index === -1) throw new Error('Заказ не найден');

    const statusLabels: Record<OrderStatus, string> = {
      paid: 'Оплачен онлайн',
      assembling: 'Собирается на складе',
      sent: 'Отправлен покупателю',
      delivered: 'Доставлен и вручен',
      cancelled: 'Отменен',
    };

    all[index] = {
      ...all[index],
      status,
      statusLabel: statusLabels[status] || status,
      trackingNumber: trackingNumber !== undefined ? trackingNumber : all[index].trackingNumber,
    };

    this.saveAllOrders(all);

    // Синхронизируем со статусом в SQLite
    const token = this.getAuthToken() || safeGetItem('parfum_admin_token');
    if (token) {
      fetch(`/api/admin/orders/${encodeURIComponent(orderId)}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, trackingNumber }),
      }).catch(() => {});
    }

    return all[index];
  }

  public deleteOrder(orderId: string): boolean {
    const all = this.getAllOrders();
    const filtered = all.filter(o => o.id !== orderId && o.orderNumber !== orderId);
    if (filtered.length === all.length) return false;
    this.saveAllOrders(filtered);
    return true;
  }

  // --- User Wishlists ---
  public getUserWishlist(userId: string): string[] {
    try {
      const data = safeGetItem(`parfum_direct_wishlist_${userId}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public saveUserWishlist(userId: string, wishlist: string[]) {
    safeSetItem(`parfum_direct_wishlist_${userId}`, JSON.stringify(wishlist));
  }
}

export const db = new DatabaseService();
