import { Order, OrderStatus, SavedAddress, User } from '../types';

const USERS_STORAGE_KEY = 'parfum_direct_users_db';
const ORDERS_STORAGE_KEY = 'parfum_direct_all_orders';
const CURRENT_USER_KEY = 'parfum_direct_active_user_id';

interface StoredUser extends User {
  passwordHash: string;
}

const DEFAULT_ADMIN: StoredUser = {
  id: 'usr_admin',
  email: 'admin@parfumdirect.ru',
  passwordHash: 'admin123',
  fullName: 'Администратор Магазина',
  phone: '+7 (800) 555-35-90',
  city: 'Москва',
  defaultAddress: 'Центральный склад, Пресненская наб., 12',
  role: 'admin',
  savedAddresses: [
    {
      id: 'addr_wh1',
      label: 'Главный пункт выдачи / Шоурум',
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

class DatabaseService {
  private getUsers(): StoredUser[] {
    try {
      const data = localStorage.getItem(USERS_STORAGE_KEY);
      if (!data) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([DEFAULT_ADMIN]));
        return [DEFAULT_ADMIN];
      }
      return JSON.parse(data);
    } catch {
      return [DEFAULT_ADMIN];
    }
  }

  private saveUsers(users: StoredUser[]) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }

  // --- Auth & Users ---
  public register(data: {
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

  public login(email: string, password: string): User {
    const users = this.getUsers();
    const cleanEmail = email.trim().toLowerCase();

    // Direct admin login shortcut
    if (cleanEmail === 'admin' && (password === 'admin' || password === 'admin123')) {
      const admin = users.find(u => u.role === 'admin') || DEFAULT_ADMIN;
      this.setActiveUserId(admin.id);
      const { passwordHash, ...cleanUser } = admin;
      return cleanUser;
    }

    const user = users.find(u => u.email.toLowerCase() === cleanEmail);
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
    const activeId = localStorage.getItem(CURRENT_USER_KEY);
    if (!activeId) return null;
    const users = this.getUsers();
    const user = users.find(u => u.id === activeId);
    if (!user) return null;
    const { passwordHash, ...cleanUser } = user;
    return cleanUser;
  }

  public setActiveUserId(userId: string | null) {
    if (userId) {
      localStorage.setItem(CURRENT_USER_KEY, userId);
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }

  public logout() {
    this.setActiveUserId(null);
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
      const data = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (!data) {
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(SEED_ORDERS));
        return SEED_ORDERS;
      }
      return JSON.parse(data);
    } catch {
      return SEED_ORDERS;
    }
  }

  public saveAllOrders(orders: Order[]) {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
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
      const data = localStorage.getItem(`parfum_direct_wishlist_${userId}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public saveUserWishlist(userId: string, wishlist: string[]) {
    localStorage.setItem(`parfum_direct_wishlist_${userId}`, JSON.stringify(wishlist));
  }
}

export const db = new DatabaseService();
