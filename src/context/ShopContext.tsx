import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem, Order, OrderStatus, Perfume, SavedAddress, ToastMessage, User, VolumeOption } from '../types';
import { fetchProductsByIds } from '../api/catalog';
import { db } from '../services/db';

interface ShopContextType {
  cart: CartItem[];
  wishlist: string[];
  user: User | null;
  orders: Order[];
  allOrders: Order[];
  toasts: ToastMessage[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  addToCart: (perfume: Perfume, volumeOption: VolumeOption, quantity?: number) => void;
  addCustomCartItem: (item: {
    id?: string;
    perfumeId?: string;
    name: string;
    brand: string;
    image: string;
    volumeType?: string;
    volumeLabel: string;
    volumeMl?: number;
    price: number;
    quantity?: number;
  }) => void;
  updateCartQuantity: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  toggleWishlist: (perfumeId: string, productHint?: Pick<Perfume, 'name' | 'brand' | 'images'>) => void;
  isInWishlist: (perfumeId: string) => boolean;
  importWishlist: (ids: string[]) => void;
  clearWishlist: () => void;
  login: (email: string, password?: string) => Promise<User>;
  register: (data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    city?: string;
    address?: string;
  }) => Promise<User>;
  logout: () => void;
  updateProfile: (data: Partial<Pick<User, 'fullName' | 'phone' | 'city' | 'defaultAddress'>>) => void;
  addSavedAddress: (address: Omit<SavedAddress, 'id'>) => SavedAddress[];
  deleteSavedAddress: (addressId: string) => SavedAddress[];
  setDefaultAddress: (addressId: string) => SavedAddress[];
  createOrder: (data: {
    items: Order['items'];
    totalAmount: number;
    discount: number;
    deliveryMethod: string;
    deliveryPrice: number;
    paymentMethod: string;
    isPaid?: boolean;
    recipient: Order['recipient'];
  }) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, trackingNumber?: string) => void;
  deleteOrder: (orderId: string) => void;
  showToast: (title: string, message: string, type?: ToastMessage['type'], image?: string) => void;
  dismissToast: (id: string) => void;
  cartTotalCount: number;
  cartTotalPrice: number;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('parfum_direct_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [user, setUser] = useState<User | null>(() => {
    return db.getActiveUser();
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const active = db.getActiveUser();
    if (active) return db.getUserWishlist(active.id);
    const guest = localStorage.getItem('parfum_direct_guest_wishlist');
    return guest ? JSON.parse(guest) : [];
  });

  const [allOrders, setAllOrders] = useState<Order[]>(() => {
    return db.getAllOrders();
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem('parfum_direct_cart', JSON.stringify(cart));
  }, [cart]);

  // Sync wishlist to user's storage in db
  useEffect(() => {
    if (user) {
      db.saveUserWishlist(user.id, wishlist);
    } else {
      localStorage.setItem('parfum_direct_guest_wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, user]);

  const showToast = useCallback(
    (title: string, message: string, type: ToastMessage['type'] = 'success', image?: string) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts(prev => [...prev, { id, title, message, type, image }]);
      setTimeout(() => {
        dismissToast(id);
      }, 3800);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToCart = (perfume: Perfume, volumeOption: VolumeOption, quantity = 1) => {
    const cartItemId = `${perfume.id}-${volumeOption.type}`;
    setCart(prev => {
      const existing = prev.find(item => item.id === cartItemId);
      if (existing) {
        return prev.map(item =>
          item.id === cartItemId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [
        ...prev,
        {
          id: cartItemId,
          perfumeId: perfume.id,
          name: perfume.name,
          brand: perfume.brand,
          image: perfume.images[0],
          volumeType: volumeOption.type,
          volumeLabel: volumeOption.label,
          volumeMl: volumeOption.volumeMl,
          price: volumeOption.price,
          quantity,
        },
      ];
    });

    showToast(
      'Добавлено в корзину',
      `${perfume.brand} ${perfume.name} (${volumeOption.label})`,
      'success',
      perfume.images[0]
    );
  };

  const addCustomCartItem = (item: {
    id?: string;
    perfumeId?: string;
    name: string;
    brand: string;
    image: string;
    volumeType?: string;
    volumeLabel: string;
    volumeMl?: number;
    price: number;
    quantity?: number;
  }) => {
    const id = item.id || `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newItem: CartItem = {
      id,
      perfumeId: item.perfumeId || id,
      name: item.name,
      brand: item.brand,
      image: item.image,
      volumeType: item.volumeType || 'custom',
      volumeLabel: item.volumeLabel,
      volumeMl: item.volumeMl || 0,
      price: item.price,
      quantity: item.quantity || 1,
    };

    setCart(prev => [newItem, ...prev]);
    showToast('Добавлено в корзину', item.name, 'success', item.image);
  };

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.id === cartItemId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
    showToast('Удалено', 'Товар удален из корзины', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (
    perfumeId: string,
    productHint?: Pick<Perfume, 'name' | 'brand' | 'images'>
  ) => {
    setWishlist(prev => {
      const exists = prev.includes(perfumeId);
      const next = exists ? prev.filter(id => id !== perfumeId) : [...prev, perfumeId];
      if (exists) {
        showToast('Удалено из избранного', 'Товар убран из списка желаний', 'info');
      } else {
        const show = (hint: Pick<Perfume, 'name' | 'brand' | 'images'>) => {
          showToast('В избранном', `${hint.brand} ${hint.name}`, 'success', hint.images[0]);
        };
        if (productHint) show(productHint);
        else fetchProductsByIds([perfumeId]).then(list => list[0] && show(list[0])).catch(() => {});
      }
      return next;
    });
  };

  const isInWishlist = (perfumeId: string) => wishlist.includes(perfumeId);

  const importWishlist = (newIds: string[]) => {
    if (!newIds || newIds.length === 0) return;
    setWishlist(prev => {
      const merged = Array.from(new Set([...prev, ...newIds]));
      return merged;
    });
    showToast('Вишлист сохранен', `Добавлено ${newIds.length} ароматов в ваш список`, 'success');
  };

  const clearWishlist = () => {
    setWishlist([]);
    showToast('Вишлист очищен', 'Все ароматы удалены из избранного', 'info');
  };

  // Authentication & Profile
  const login = async (email: string, password = 'password123'): Promise<User> => {
    const loggedUser = db.login(email, password);
    setUser(loggedUser);
    setWishlist(db.getUserWishlist(loggedUser.id));
    setAllOrders(db.getAllOrders());
    showToast('Успешный вход', `С возвращением, ${loggedUser.fullName}!`, 'success');
    return loggedUser;
  };

  const register = async (data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    city?: string;
    address?: string;
  }): Promise<User> => {
    const newUser = db.register(data);
    setUser(newUser);
    setWishlist([]);
    setAllOrders(db.getAllOrders());
    showToast('Регистрация успешна', `Добро пожаловать в Parfum Direct, ${newUser.fullName}!`, 'success');
    return newUser;
  };

  const logout = () => {
    db.logout();
    setUser(null);
    setWishlist([]);
    showToast('Выход', 'Вы вышли из личного кабинета', 'info');
  };

  const updateProfile = (data: Partial<Pick<User, 'fullName' | 'phone' | 'city' | 'defaultAddress'>>) => {
    if (!user) return;
    const updated = db.updateUserProfile(user.id, data);
    setUser(updated);
    showToast('Профиль обновлен', 'Данные успешно сохранены в базе', 'success');
  };

  const addSavedAddress = (address: Omit<SavedAddress, 'id'>) => {
    if (!user) return [];
    const updatedList = db.addSavedAddress(user.id, address);
    setUser(prev => prev ? { ...prev, savedAddresses: updatedList } : null);
    showToast('Адрес сохранен', `${address.label}: ${address.address}`, 'success');
    return updatedList;
  };

  const deleteSavedAddress = (addressId: string) => {
    if (!user) return [];
    const updatedList = db.deleteSavedAddress(user.id, addressId);
    setUser(prev => prev ? { ...prev, savedAddresses: updatedList } : null);
    showToast('Адрес удален', 'Адрес ПВЗ удален из списка', 'info');
    return updatedList;
  };

  const setDefaultAddress = (addressId: string) => {
    if (!user) return [];
    const updatedList = db.setDefaultAddress(user.id, addressId);
    setUser(prev => prev ? { ...prev, savedAddresses: updatedList } : null);
    showToast('Адрес по умолчанию', 'Основной адрес ПВЗ обновлен', 'success');
    return updatedList;
  };

  // Orders
  const createOrder = (data: {
    items: Order['items'];
    totalAmount: number;
    discount: number;
    deliveryMethod: string;
    deliveryPrice: number;
    paymentMethod: string;
    isPaid?: boolean;
    recipient: Order['recipient'];
  }): Order => {
    const isPaid = data.isPaid !== undefined ? data.isPaid : true;
    const status: OrderStatus = isPaid ? 'paid' : 'assembling';
    const statusLabel = isPaid ? 'Оплачен онлайн' : 'В сборке на складе';

    const newOrder = db.createOrder({
      userId: user?.id,
      items: data.items,
      totalAmount: data.totalAmount,
      discount: data.discount,
      deliveryMethod: data.deliveryMethod,
      deliveryPrice: data.deliveryPrice,
      paymentMethod: data.paymentMethod || 'СБП (Система быстрых платежей)',
      isPaid,
      paidAt: isPaid ? new Date().toISOString() : undefined,
      status,
      statusLabel,
      recipient: data.recipient,
      trackingNumber: `PD-TRACK-${Math.floor(10000000 + Math.random() * 90000000)}`,
    });

    setAllOrders(db.getAllOrders());
    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, trackingNumber?: string) => {
    db.updateOrderStatus(orderId, status, trackingNumber);
    setAllOrders(db.getAllOrders());
    showToast('Заказ обновлен', `Статус заказа изменен на: ${status}`, 'success');
  };

  const deleteOrder = (orderId: string) => {
    db.deleteOrder(orderId);
    setAllOrders(db.getAllOrders());
    showToast('Заказ удален', 'Заказ исключен из базы', 'info');
  };

  // Current user's orders
  const orders = user
    ? allOrders.filter(o => o.userId === user.id || o.recipient.email.toLowerCase() === user.email.toLowerCase())
    : [];

  const cartTotalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <ShopContext.Provider
      value={{
        cart,
        wishlist,
        user,
        orders,
        allOrders,
        toasts,
        searchQuery,
        setSearchQuery,
        addToCart,
        addCustomCartItem,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        toggleWishlist,
        isInWishlist,
        importWishlist,
        clearWishlist,
        login,
        register,
        logout,
        updateProfile,
        addSavedAddress,
        deleteSavedAddress,
        setDefaultAddress,
        createOrder,
        updateOrderStatus,
        deleteOrder,
        showToast,
        dismissToast,
        cartTotalCount,
        cartTotalPrice,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
