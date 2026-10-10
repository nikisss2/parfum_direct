import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { fetchProductsByIds } from '../api/catalog';
import { ProductCard } from '../components/ProductCard';
import type { Perfume, SavedAddress } from '../types';
import {
  User as UserIcon,
  ShoppingBag,
  Heart,
  Package,
  LogOut,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Truck,
  ArrowRight,
  Plus,
  Trash2,
  Check,
  Star,
  Settings,
  Lock
} from 'lucide-react';

export const AccountPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') as 'orders' | 'wishlist' | 'addresses' | 'profile' | null;

  const {
    user,
    login,
    register,
    logout,
    orders,
    wishlist,
    updateProfile,
    addSavedAddress,
    deleteSavedAddress,
    setDefaultAddress,
    showToast,
  } = useShop();

  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'addresses' | 'profile'>(
    initialTab || 'orders'
  );

  // Auth form states
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authCity, setAuthCity] = useState('');
  const [authAddress, setAuthAddress] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Profile edit states
  const [profileName, setProfileName] = useState(user?.fullName || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileCity, setProfileCity] = useState(user?.city || '');
  const [profileAddress, setProfileAddress] = useState(user?.defaultAddress || '');

  // Add new address form states
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newAddrLabel, setNewAddrLabel] = useState('');
  const [newAddrType, setNewAddrType] = useState<SavedAddress['type']>('cdek_pvz');
  const [newAddrCity, setNewAddrCity] = useState(user?.city || 'Москва');
  const [newAddrAddress, setNewAddrAddress] = useState('');
  const [newAddrDefault, setNewAddrDefault] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileName(user.fullName);
      setProfilePhone(user.phone);
      setProfileCity(user.city);
      setProfileAddress(user.defaultAddress);
    }
  }, [user]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      if (!authEmail.trim() || !authEmail.includes('@')) {
        throw new Error('Укажите корректный email адрес');
      }
      if (!authPassword || authPassword.length < 4) {
        throw new Error('Пароль должен содержать не менее 4 символов');
      }

      if (authMode === 'register') {
        if (!authName.trim()) throw new Error('Укажите ваше имя');
        await register({
          email: authEmail,
          password: authPassword,
          fullName: authName,
          phone: authPhone,
          city: authCity,
          address: authAddress,
        });
      } else {
        await login(authEmail, authPassword);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Ошибка авторизации');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      fullName: profileName,
      phone: profilePhone,
      city: profileCity,
      defaultAddress: profileAddress,
    });
  };

  const handleAddAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrLabel.trim() || !newAddrAddress.trim()) {
      showToast('Ошибка', 'Заполните название и адрес ПВЗ', 'error');
      return;
    }

    addSavedAddress({
      label: newAddrLabel.trim(),
      type: newAddrType,
      city: newAddrCity.trim() || 'Москва',
      address: newAddrAddress.trim(),
      isDefault: newAddrDefault || (user?.savedAddresses?.length === 0),
    });

    setNewAddrLabel('');
    setNewAddrAddress('');
    setNewAddrDefault(false);
    setShowAddAddressModal(false);
  };

  const [wishlistPerfumes, setWishlistPerfumes] = useState<Perfume[]>([]);

  useEffect(() => {
    if (!wishlist.length) {
      setWishlistPerfumes([]);
      return;
    }
    fetchProductsByIds(wishlist).then(setWishlistPerfumes).catch(() => setWishlistPerfumes([]));
  }, [wishlist]);

  // If not logged in, show Auth Screen
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white p-8 rounded-none border border-zinc-900 shadow-sm space-y-6">
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl font-normal font-serif text-zinc-950 uppercase tracking-wide">
              Личный кабинет
            </h1>
            <p className="text-xs text-zinc-500 font-light">
              Войдите для просмотра истории заказов, сохраненных ПВЗ и избранного
            </p>
          </div>

          {/* Segmented Auth Selector */}
          <div className="flex rounded-none bg-zinc-100 p-1 border border-zinc-200">
            <button
              onClick={() => { setAuthMode('login'); setAuthError(''); }}
              className={`w-1/2 py-2.5 text-xs font-bold uppercase tracking-wider rounded-none transition-colors ${
                authMode === 'login' ? 'bg-black text-white shadow-xs' : 'text-zinc-600 hover:text-black'
              }`}
            >
              Вход
            </button>
            <button
              onClick={() => { setAuthMode('register'); setAuthError(''); }}
              className={`w-1/2 py-2.5 text-xs font-bold uppercase tracking-wider rounded-none transition-colors ${
                authMode === 'register' ? 'bg-black text-white shadow-xs' : 'text-zinc-600 hover:text-black'
              }`}
            >
              Регистрация
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === 'register' && (
              <>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">Имя и Фамилия *</label>
                  <input
                    type="text"
                    required
                    placeholder="Екатерина Смирнова"
                    value={authName}
                    onChange={e => setAuthName(e.target.value)}
                    className="w-full text-xs px-3.5 py-3 rounded-none border border-zinc-300 outline-none focus:border-black transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">Телефон</label>
                    <input
                      type="tel"
                      placeholder="+7 (999) 000-00-00"
                      value={authPhone}
                      onChange={e => setAuthPhone(e.target.value)}
                      className="w-full text-xs px-3.5 py-3 rounded-none border border-zinc-300 outline-none focus:border-black transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">Город</label>
                    <input
                      type="text"
                      placeholder="Москва"
                      value={authCity}
                      onChange={e => setAuthCity(e.target.value)}
                      className="w-full text-xs px-3.5 py-3 rounded-none border border-zinc-300 outline-none focus:border-black transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">Адрес ПВЗ СДЭК / Доставки</label>
                  <input
                    type="text"
                    placeholder="ул. Ленина, д. 10 или пункт СДЭК"
                    value={authAddress}
                    onChange={e => setAuthAddress(e.target.value)}
                    className="w-full text-xs px-3.5 py-3 rounded-none border border-zinc-300 outline-none focus:border-black transition-colors"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">Email *</label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={authEmail}
                onChange={e => setAuthEmail(e.target.value)}
                className="w-full text-xs px-3.5 py-3 rounded-none border border-zinc-300 outline-none focus:border-black transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">Пароль *</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={authPassword}
                onChange={e => setAuthPassword(e.target.value)}
                className="w-full text-xs px-3.5 py-3 rounded-none border border-zinc-300 outline-none focus:border-black transition-colors"
              />
            </div>

            {authError && (
              <div className="text-xs text-rose-600 font-medium p-3 bg-rose-50 border border-rose-200 rounded-none">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-4 bg-black hover:bg-zinc-800 disabled:opacity-50 text-white rounded-none text-xs font-bold uppercase tracking-widest transition-all shadow-sm"
            >
              {authLoading ? 'Проверка...' : authMode === 'login' ? 'Войти в аккаунт' : 'Создать аккаунт'}
            </button>

            {/* Quick Demo Accounts */}
            <div className="pt-3 border-t border-zinc-100 flex flex-col gap-2 text-center">
              <button
                type="button"
                onClick={() => login('client@maisonarome.ru', 'password123')}
                className="text-xs text-black hover:underline font-bold uppercase tracking-wider"
              >
                Быстрый вход: Тестовый клиент
              </button>
              <button
                type="button"
                onClick={() => login('admin@maisonarome.ru', 'admin123')}
                className="text-xs text-zinc-500 hover:text-black font-medium tracking-wide"
              >
                Вход администратора (Управление заказами)
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const savedAddresses = user.savedAddresses || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Profile Bar */}
      <div className="p-6 sm:p-8 rounded-none bg-zinc-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-zinc-900 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-none bg-white/10 text-white border border-white/20 flex items-center justify-center font-bold text-2xl font-serif">
            {(user.fullName || user.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-normal font-serif uppercase tracking-wide">
                {user.fullName || user.email || 'Пользователь'}
              </h1>
              {user.role === 'admin' && (
                <span className="px-2.5 py-0.5 rounded-none bg-amber-400 text-black text-[10px] font-black uppercase tracking-widest">
                  Администратор
                </span>
              )}
            </div>
            <div className="text-xs text-zinc-400 mt-1 flex flex-wrap items-center gap-3 uppercase tracking-wider text-[11px]">
              <span>{user.email || '—'}</span>
              <span>·</span>
              <span>{user.phone || '—'}</span>
              {user.city && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-zinc-300">
                    <MapPin className="w-3 h-3 text-white" /> {user.city}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {user.role === 'admin' && (
            <Link
              to="/admin"
              className="px-4 py-2.5 rounded-none bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Settings className="w-4 h-4" />
              <span>Панель управления заказами</span>
            </Link>
          )}

          <button
            onClick={logout}
            className="px-4 py-2.5 rounded-none bg-white/10 hover:bg-white/20 text-zinc-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors border border-white/10"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Выйти</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-zinc-200 gap-2 sm:gap-6 text-xs uppercase tracking-wider font-bold">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-2 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'border-black text-black'
              : 'border-transparent text-zinc-400 hover:text-black'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Мои заказы ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 px-2 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'addresses'
              ? 'border-black text-black'
              : 'border-transparent text-zinc-400 hover:text-black'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Адреса и ПВЗ ({savedAddresses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          className={`pb-3 px-2 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'wishlist'
              ? 'border-black text-black'
              : 'border-transparent text-zinc-400 hover:text-black'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Избранное ({wishlist.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-2 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'border-black text-black'
              : 'border-transparent text-zinc-400 hover:text-black'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Личные данные</span>
        </button>
      </div>

      {/* TAB CONTENT */}
      <div>
        {/* 1. ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="p-12 text-center bg-zinc-50 rounded-none border border-zinc-200 space-y-4">
                <Package className="w-12 h-12 text-zinc-400 mx-auto" />
                <h3 className="text-lg font-normal font-serif text-zinc-900 uppercase tracking-wide">У вас пока нет заказов</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto font-light">
                  Выберите распивы от 3 мл, аромабоксы или флаконы в каталоге и оформите первый заказ с онлайн-оплатой.
                </p>
                <Link
                  to="/catalog"
                  className="inline-flex items-center gap-2 px-7 py-4 bg-black text-white rounded-none text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors"
                >
                  <span>Перейти в каталог</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div
                    key={order.id}
                    className="p-6 rounded-none bg-white border border-zinc-200 hover:border-black transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-100 gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-zinc-950 uppercase tracking-wide">
                            Заказ {order.orderNumber}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-widest border ${
                              order.status === 'paid'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : order.status === 'sent'
                                ? 'bg-zinc-100 text-zinc-800 border-zinc-300'
                                : 'bg-amber-50 text-amber-800 border-amber-300'
                            }`}
                          >
                            {order.statusLabel || order.status}
                          </span>
                        </div>
                        <div className="text-xs text-zinc-400 mt-1 uppercase tracking-wider text-[11px]">
                          Дата оформления: {order.date} · {order.deliveryMethod}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-base text-zinc-950">
                          {(order.totalAmount || 0).toLocaleString('ru-RU')} ₽
                        </div>
                        <div className="text-[11px] text-zinc-600 font-bold uppercase tracking-wider">
                          {order.paymentMethod || 'Оплачен'} ✓
                        </div>
                      </div>
                    </div>

                    {/* Tracking Number */}
                    {order.trackingNumber && (
                      <div className="p-3.5 rounded-none bg-zinc-50 border border-zinc-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-zinc-700">
                          <Truck className="w-4 h-4 text-black" />
                          <span className="uppercase tracking-wider text-[11px] font-medium">Трек-номер для отслеживания:</span>
                          <strong className="font-mono text-zinc-900 tracking-wider">{order.trackingNumber}</strong>
                        </div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest">СДЭК / Почта России</span>
                      </div>
                    )}

                    {/* Items List */}
                    <div className="divide-y divide-zinc-100">
                      {(order.items || []).map((item, idx) => (
                        <div key={idx} className="py-3 flex items-center gap-4 text-xs">
                          <img
                            src={item.image || '/assets/placeholder-product.svg'}
                            alt=""
                            className="w-12 h-14 object-cover rounded-none border border-zinc-200 shrink-0"
                            onError={e => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/assets/placeholder-product.svg';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">{item.brand || 'Maison Arôme'}</div>
                            <div className="font-bold text-zinc-900 truncate uppercase tracking-tight">{item.name}</div>
                            <div className="text-zinc-500 text-[11px] uppercase tracking-wider">{item.volumeLabel}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-zinc-900">
                              {((item.price || 0) * (item.quantity || 1)).toLocaleString('ru-RU')} ₽
                            </div>
                            <div className="text-zinc-400 text-[11px]">{item.quantity || 1} шт.</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 text-[11px] text-zinc-500 flex flex-col sm:flex-row sm:items-center justify-between border-t border-zinc-100 uppercase tracking-wider gap-1">
                      <span>
                        Адрес доставки: {order.recipient?.city || 'Россия'}, {order.recipient?.address || 'ПВЗ'}
                      </span>
                      <span>
                        Получатель: {order.recipient?.fullName || 'Покупатель'} ({order.recipient?.phone || '—'})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. SAVED ADDRESSES TAB */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-normal font-serif text-zinc-950 uppercase tracking-wide">
                  Сохраненные адреса и ПВЗ
                </h2>
                <p className="text-xs text-zinc-500 mt-1 font-light">
                  Сохраняйте пункты выдачи СДЭК, Яндекс Маркет или домашний адрес для быстрого оформления в 1 клик
                </p>
              </div>

              <button
                onClick={() => setShowAddAddressModal(true)}
                className="px-5 py-3 rounded-none bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Добавить адрес ПВЗ</span>
              </button>
            </div>

            {savedAddresses.length === 0 ? (
              <div className="p-12 text-center bg-zinc-50 rounded-none border border-zinc-200 space-y-4">
                <MapPin className="w-12 h-12 text-zinc-400 mx-auto" />
                <h3 className="text-base font-normal font-serif text-zinc-900 uppercase tracking-wide">У вас пока нет сохраненных адресов</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto font-light">
                  Добавьте ваш любимый пункт выдачи СДЭК или домашний адрес, чтобы не вводить его каждый раз при заказе.
                </p>
                <button
                  onClick={() => setShowAddAddressModal(true)}
                  className="px-6 py-3.5 bg-black text-white rounded-none text-xs font-bold uppercase tracking-widest hover:bg-zinc-800"
                >
                  Добавить первый адрес
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedAddresses.map(addr => (
                  <div
                    key={addr.id}
                    className={`p-6 rounded-none border transition-all relative flex flex-col justify-between ${
                      addr.isDefault
                        ? 'bg-zinc-50 border-black ring-1 ring-black'
                        : 'bg-white border-zinc-200 hover:border-black'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs uppercase tracking-wider text-zinc-950">{addr.label}</span>
                          {addr.isDefault && (
                            <span className="px-2 py-0.5 rounded-none bg-black text-white text-[9px] font-bold uppercase tracking-widest">
                              По умолчанию
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                          {addr.type === 'cdek_pvz'
                            ? 'СДЭК ПВЗ'
                            : addr.type === 'yandex_pvz'
                            ? 'Яндекс'
                            : addr.type === 'ozon_pvz'
                            ? 'Ozon'
                            : 'Курьер'}
                        </span>
                      </div>

                      <div className="text-xs text-zinc-800 font-bold uppercase tracking-wider">г. {addr.city}</div>
                      <div className="text-xs text-zinc-600 mt-1 leading-relaxed font-light">{addr.address}</div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-zinc-100 flex items-center justify-between text-xs">
                      {!addr.isDefault ? (
                        <button
                          onClick={() => setDefaultAddress(addr.id)}
                          className="text-black hover:underline font-bold uppercase tracking-wider text-[10px]"
                        >
                          Сделать основным
                        </button>
                      ) : (
                        <span className="text-black font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" /> Основной адрес
                        </span>
                      )}

                      <button
                        onClick={() => deleteSavedAddress(addr.id)}
                        className="text-zinc-400 hover:text-black transition-colors p-1"
                        title="Удалить адрес"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Modal: Add new address */}
            {showAddAddressModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
                <div className="bg-white rounded-none max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-zinc-900 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                    <h3 className="font-normal font-serif text-lg text-zinc-950 uppercase tracking-wide">
                      Новый адрес или ПВЗ
                    </h3>
                    <button
                      onClick={() => setShowAddAddressModal(false)}
                      className="text-zinc-400 hover:text-zinc-900 text-sm font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleAddAddressSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                        Название адреса *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Например: ПВЗ СДЭК рядом с домом, Работа"
                        value={newAddrLabel}
                        onChange={e => setNewAddrLabel(e.target.value)}
                        className="w-full text-xs px-3.5 py-3 rounded-none border border-zinc-300 outline-none focus:border-black transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                          Тип доставки
                        </label>
                        <select
                          value={newAddrType}
                          onChange={e => setNewAddrType(e.target.value as any)}
                          className="w-full text-xs px-3 py-3 rounded-none border border-zinc-300 outline-none focus:border-black bg-white transition-colors"
                        >
                          <option value="cdek_pvz">ПВЗ СДЭК</option>
                          <option value="yandex_pvz">Яндекс Маркет</option>
                          <option value="ozon_pvz">Ozon ПВЗ</option>
                          <option value="courier">Курьер домой/офис</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                          Город *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Москва"
                          value={newAddrCity}
                          onChange={e => setNewAddrCity(e.target.value)}
                          className="w-full text-xs px-3.5 py-3 rounded-none border border-zinc-300 outline-none focus:border-black transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                        Точный адрес или номер отделения ПВЗ *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ул. Ленина, д. 15 или ПВЗ СДЭК MSK12"
                        value={newAddrAddress}
                        onChange={e => setNewAddrAddress(e.target.value)}
                        className="w-full text-xs px-3.5 py-3 rounded-none border border-zinc-300 outline-none focus:border-black transition-colors"
                      />
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-700 pt-1">
                      <input
                        type="checkbox"
                        checked={newAddrDefault}
                        onChange={e => setNewAddrDefault(e.target.checked)}
                        className="w-4 h-4 rounded-none text-black accent-black"
                      />
                      <span className="uppercase tracking-wider text-[11px] font-medium">Сделать основным адресом доставки</span>
                    </label>

                    <div className="pt-3 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowAddAddressModal(false)}
                        className="px-5 py-3 text-xs text-zinc-600 hover:text-black font-bold uppercase tracking-wider"
                      >
                        Отмена
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-3.5 bg-black text-white rounded-none text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors"
                      >
                        Сохранить в базу
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. WISHLIST TAB */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlistPerfumes.length === 0 ? (
              <div className="p-12 text-center bg-zinc-50 rounded-none border border-zinc-200 space-y-4">
                <Heart className="w-12 h-12 text-zinc-400 mx-auto" />
                <h3 className="text-lg font-normal font-serif text-zinc-900 uppercase tracking-wide">В избранном пока пусто</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto font-light">
                  Нажимайте на сердечко в каталоге, чтобы сохранить понравившиеся ароматы в список желаний.
                </p>
                <Link
                  to="/catalog"
                  className="inline-flex items-center gap-2 px-7 py-4 bg-black text-white rounded-none text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors"
                >
                  <span>Перейти в каталог</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-zinc-50 border border-zinc-200 p-3 sm:p-4">
                  <div className="text-xs font-medium text-zinc-700">
                    Хотите отправить этот список друзьям или заказать через Telegram?
                  </div>
                  <Link
                    to="/wishlist"
                    className="px-3.5 py-2 bg-black text-white hover:bg-zinc-800 text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 shrink-0"
                  >
                    <span>Открыть вишлист и поделиться</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {wishlistPerfumes.map(perfume => (
                    <ProductCard key={perfume.id} perfume={perfume} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="max-w-xl bg-white p-6 sm:p-8 rounded-none border border-zinc-200 space-y-6">
            <div>
              <h2 className="text-lg font-normal font-serif text-zinc-950 uppercase tracking-wide">Личные данные</h2>
              <p className="text-xs text-zinc-500 mt-1 font-light">Информация профиля используется для автозаполнения доставки</p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">Имя и Фамилия</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={e => setProfileName(e.target.value)}
                  className="w-full text-xs px-3.5 py-3 rounded-none border border-zinc-300 outline-none focus:border-black transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">Электронная почта</label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full text-xs px-3.5 py-3 rounded-none border border-zinc-200 bg-zinc-50 text-zinc-500 outline-none cursor-not-allowed font-light"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">Номер телефона</label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={e => setProfilePhone(e.target.value)}
                  className="w-full text-xs px-3.5 py-3 rounded-none border border-zinc-300 outline-none focus:border-black transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">Основной город</label>
                <input
                  type="text"
                  value={profileCity}
                  onChange={e => setProfileCity(e.target.value)}
                  className="w-full text-xs px-3.5 py-3 rounded-none border border-zinc-300 outline-none focus:border-black transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">Адрес доставки по умолчанию</label>
                <input
                  type="text"
                  value={profileAddress}
                  onChange={e => setProfileAddress(e.target.value)}
                  className="w-full text-xs px-3.5 py-3 rounded-none border border-zinc-300 outline-none focus:border-black transition-colors"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-7 py-4 bg-black hover:bg-zinc-800 text-white rounded-none text-xs font-bold uppercase tracking-widest transition-all shadow-xs"
                >
                  Сохранить изменения
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
