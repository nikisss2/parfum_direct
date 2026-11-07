import React, { useEffect, useState } from 'react';
import { safeGetItem } from '../utils/storage';
import { useSearchParams, Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { fetchProductsByIds } from '../api/catalog';
import { ProductCard } from '../components/ProductCard';
import type { Perfume, SavedAddress } from '../types';
import {
  User as UserIcon,
  Heart,
  Package,
  LogOut,
  MapPin,
  Truck,
  ArrowRight,
  Plus,
  Trash2,
  Check,
  CreditCard,
  ExternalLink,
  Download,
  CheckCircle2,
  Lock,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  X
} from 'lucide-react';

export const AccountPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') as 'orders' | 'wishlist' | 'addresses' | 'profile' | 'loyalty' | null;

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
    changePassword,
    showToast,
  } = useShop();

  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'addresses' | 'profile' | 'loyalty'>(
    initialTab || 'orders'
  );

  const [bonusCard, setBonusCard] = useState<{
    cardNumber: string;
    balance: number;
    tier: string;
    cashback_percent?: number;
    cashbackPercent?: number;
    total_spent?: number;
  } | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetch(`/api/loyalty/card?userId=${encodeURIComponent(user.id)}`)
        .then(r => r.json())
        .then(data => {
          if (data && (data.cardNumber || data.card?.card_number)) {
            const rawCard = data.card || {};
            setBonusCard({
              cardNumber: data.cardNumber || rawCard.card_number || 'MA-••••-••••',
              balance: Number(data.balance ?? data.points ?? rawCard.balance ?? 500),
              tier: data.tier || rawCard.tier || 'Silver',
              cashbackPercent: data.cashbackPercent || rawCard.cashback_percent || 5,
              total_spent: data.totalSpent ?? rawCard.total_spent ?? 0,
            });
          }
        })
        .catch(() => {});
    }
  }, [user?.id, orders.length]);

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

  // Password change states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!oldPassword) {
      setPasswordError('Введите текущий пароль');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Новый пароль должен содержать минимум 6 символов');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Новые пароли не совпадают');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await changePassword(oldPassword, newPassword);
      if (res.ok) {
        setPasswordSuccess('Пароль успешно обновлен');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError((res as any).error || res.message || 'Ошибка смены пароля');
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Ошибка смены пароля');
    } finally {
      setPasswordLoading(false);
    }
  };

  // 152-FZ / GDPR operations
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleExportData = async () => {
    setExportLoading(true);
    try {
      const token = safeGetItem('parfum_auth_token');
      const res = await fetch('/api/user/export-data', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Не удалось выгрузить данные');
      const json = await res.json();
      const blob = new Blob([JSON.stringify(json.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `maison-arome-user-data-${user?.id || 'export'}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Ошибка выгрузки данных');
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Вы действительно хотите отозвать согласие на обработку данных и удалить аккаунт? Все личные данные будут безвозвратно удалены в соответствии со ст. 21 Федерального закона № 152-ФЗ.')) {
      return;
    }
    setDeleteLoading(true);
    try {
      const token = safeGetItem('parfum_auth_token');
      const res = await fetch('/api/user/delete-account', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Ошибка удаления аккаунта');
      alert(data.message || 'Аккаунт и персональные данные успешно удалены');
      logout();
    } catch (err: any) {
      alert(err.message || 'Ошибка удаления аккаунта');
    } finally {
      setDeleteLoading(false);
    }
  };

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
        const cleanEmail = authEmail.trim();
        const derivedName = authName.trim() || cleanEmail.split('@')[0];
        await register({
          email: cleanEmail,
          password: authPassword,
          fullName: derivedName,
          phone: authPhone.trim(),
          city: authCity.trim() || 'Москва',
          address: authAddress.trim(),
        });
      } else {
        await login(authEmail.trim(), authPassword);
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

  // If not logged in, show Auth Screen (Quiet Luxury)
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
        <div className="bg-[#F7F7F9] p-8 sm:p-10 rounded-[32px] border border-zinc-200/70 shadow-2xs space-y-6">
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-light text-zinc-950">
              Личный кабинет
            </h1>
            <p className="text-xs text-zinc-500 font-light text-delicate">
              Войдите для просмотра заказов, сохраненных ПВЗ и бонусов
            </p>
          </div>

          {/* Segmented Auth Selector */}
          <div className="flex rounded-full bg-white p-1 border border-zinc-200/80 shadow-2xs">
            <button
              onClick={() => { setAuthMode('login'); setAuthError(''); }}
              className={`w-1/2 py-2 text-xs font-normal rounded-full transition-all cursor-pointer ${
                authMode === 'login' ? 'bg-black text-white shadow-xs' : 'text-zinc-500 hover:text-black'
              }`}
            >
              Вход
            </button>
            <button
              onClick={() => { setAuthMode('register'); setAuthError(''); }}
              className={`w-1/2 py-2 text-xs font-normal rounded-full transition-all cursor-pointer ${
                authMode === 'register' ? 'bg-black text-white shadow-xs' : 'text-zinc-500 hover:text-black'
              }`}
            >
              Регистрация
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === 'register' && (
              <>
                <div>
                  <label className="block text-[11px] font-normal uppercase tracking-[0.14em] text-zinc-500 mb-1.5">Имя</label>
                  <input
                    type="text"
                    placeholder="Екатерина"
                    value={authName}
                    onChange={e => setAuthName(e.target.value)}
                    className="w-full text-xs px-4 py-3 rounded-full border border-zinc-200 bg-white outline-none focus:border-black transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-normal uppercase tracking-[0.14em] text-zinc-500 mb-1.5">Телефон</label>
                    <input
                      type="tel"
                      placeholder="+7 (999) 000-00-00"
                      value={authPhone}
                      onChange={e => setAuthPhone(e.target.value)}
                      className="w-full text-xs px-4 py-3 rounded-full border border-zinc-200 bg-white outline-none focus:border-black transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-normal uppercase tracking-[0.14em] text-zinc-500 mb-1.5">Город</label>
                    <input
                      type="text"
                      placeholder="Москва"
                      value={authCity}
                      onChange={e => setAuthCity(e.target.value)}
                      className="w-full text-xs px-4 py-3 rounded-full border border-zinc-200 bg-white outline-none focus:border-black transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-normal uppercase tracking-[0.14em] text-zinc-500 mb-1.5">Адрес ПВЗ СДЭК / Доставки</label>
                  <input
                    type="text"
                    placeholder="ул. Ленина, д. 10 или пункт СДЭК"
                    value={authAddress}
                    onChange={e => setAuthAddress(e.target.value)}
                    className="w-full text-xs px-4 py-3 rounded-full border border-zinc-200 bg-white outline-none focus:border-black transition-colors"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-normal uppercase tracking-[0.14em] text-zinc-500 mb-1.5">
                Email *
              </label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={authEmail}
                onChange={e => setAuthEmail(e.target.value)}
                className="w-full text-xs px-4 py-3 rounded-full border border-zinc-200 bg-white outline-none focus:border-black transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-normal uppercase tracking-[0.14em] text-zinc-500">Пароль *</label>
                {authMode === 'login' && (
                  <a
                    href="https://t.me/nikisss2?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5!%20%D0%AF%20%D0%B7%D0%B0%D0%B1%D1%8B%D0%BB%20%D0%BF%D0%B0%D1%80%D0%BE%D0%BB%D1%8C"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-zinc-400 hover:text-black transition-colors cursor-pointer"
                  >
                    Забыли пароль?
                  </a>
                )}
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={authPassword}
                onChange={e => setAuthPassword(e.target.value)}
                className="w-full text-xs px-4 py-3 rounded-full border border-zinc-200 bg-white outline-none focus:border-black transition-colors"
              />
            </div>

            {authError && (
              <div className="text-xs text-rose-600 font-light p-3 bg-rose-50 border border-rose-200/60 rounded-[16px]">
                {authError}
              </div>
            )}

            {authMode === 'register' && (
              <div className="text-[11px] text-zinc-500 leading-relaxed font-light text-delicate">
                Регистрируясь, вы принимаете условия{' '}
                <Link to="/terms" target="_blank" className="underline text-black">
                  Оферты
                </Link>{' '}
                и даете согласие на{' '}
                <Link to="/privacy" target="_blank" className="underline text-black">
                  обработку персональных данных (152-ФЗ)
                </Link>.
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="pill-btn-black w-full py-3.5 rounded-full text-xs uppercase tracking-[0.14em] transition-all shadow-md"
            >
              {authLoading ? 'Проверка...' : authMode === 'login' ? 'Войти в аккаунт' : 'Создать аккаунт'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const savedAddresses = user.savedAddresses || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Header Profile Bar (Quiet Luxury) */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-[#F7F7F8] border border-zinc-200/70 text-zinc-950 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-2xs">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-black text-white flex items-center justify-center font-normal text-xl sm:text-2xl shadow-xs">
            {(user.fullName || user.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-light text-zinc-950">
                {user.fullName || user.email || 'Пользователь'}
              </h1>
              {user.role === 'admin' && (
                <span className="px-2.5 py-0.5 rounded-full bg-black text-white text-[10px] font-medium uppercase tracking-[0.14em]">
                  Администратор
                </span>
              )}
            </div>
            <div className="text-xs text-zinc-500 mt-1 flex flex-wrap items-center gap-2 text-delicate font-light">
              <span>{user.email || '—'}</span>
              <span>·</span>
              <span>{user.phone || '—'}</span>
              {user.city && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-zinc-700">
                    <MapPin className="w-3 h-3 text-zinc-900" /> {user.city}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {user.role === 'admin' && (
            <>
              <Link
                to="/admin/crm"
                className="pill-btn-outline py-2 px-4 text-xs flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>CRM-система</span>
              </Link>
              <Link
                to="/admin"
                className="pill-btn-outline py-2 px-4 text-xs flex items-center gap-1.5"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Заказы</span>
              </Link>
            </>
          )}

          <button
            onClick={logout}
            className="pill-btn-outline py-2 px-4 text-xs flex items-center gap-1.5 text-zinc-600 hover:text-black cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Выйти</span>
          </button>
        </div>
      </div>

      {/* Tabs (Quiet Luxury Pills) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-2.5 rounded-full text-xs transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-black text-white font-normal shadow-xs'
              : 'pill-btn-outline py-2 px-4 font-light text-zinc-600'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Мои заказы ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`px-5 py-2.5 rounded-full text-xs transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'addresses'
              ? 'bg-black text-white font-normal shadow-xs'
              : 'pill-btn-outline py-2 px-4 font-light text-zinc-600'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Адреса и ПВЗ ({savedAddresses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          className={`px-5 py-2.5 rounded-full text-xs transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'wishlist'
              ? 'bg-black text-white font-normal shadow-xs'
              : 'pill-btn-outline py-2 px-4 font-light text-zinc-600'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>Избранное ({wishlist.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-5 py-2.5 rounded-full text-xs transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'bg-black text-white font-normal shadow-xs'
              : 'pill-btn-outline py-2 px-4 font-light text-zinc-600'
          }`}
        >
          <UserIcon className="w-3.5 h-3.5" />
          <span>Личные данные</span>
        </button>

        <button
          onClick={() => setActiveTab('loyalty')}
          className={`px-5 py-2.5 rounded-full text-xs transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'loyalty'
              ? 'bg-black text-white font-normal shadow-xs'
              : 'pill-btn-outline py-2 px-4 font-light text-zinc-600'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Бонусная карта ({Number(bonusCard?.balance ?? 500).toLocaleString('ru-RU')} ₽)</span>
        </button>
      </div>

      {/* TAB CONTENT */}
      <div>
        {/* 1. ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="p-12 text-center bg-[#F7F7F9] rounded-[28px] border border-zinc-200/60 space-y-4">
                <Package className="w-10 h-10 text-zinc-400 mx-auto stroke-[1.5]" />
                <h3 className="text-lg font-light text-zinc-900">У вас пока нет заказов</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto font-light text-delicate">
                  Выберите распивы от 1 мл или флаконы в каталоге и оформите первый заказ.
                </p>
                <Link
                  to="/catalog"
                  className="pill-btn-black py-3 px-7 text-xs inline-flex items-center gap-2"
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
                    className="p-6 rounded-[28px] bg-white border border-zinc-200/60 shadow-2xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-100 gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-normal text-sm sm:text-base text-zinc-950">
                            Заказ {order.orderNumber}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-normal uppercase tracking-[0.1em] ${
                              order.status === 'paid'
                                ? 'bg-emerald-50 text-emerald-800'
                                : order.status === 'sent'
                                ? 'bg-zinc-100 text-zinc-800'
                                : 'bg-amber-50 text-amber-800'
                            }`}
                          >
                            {order.statusLabel || order.status}
                          </span>
                        </div>
                        <div className="text-xs text-zinc-400 mt-1 text-delicate font-light">
                          Дата оформления: {order.date} · {order.deliveryMethod}
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <div className="font-medium text-base text-zinc-950 tabular-nums">
                          {(order.totalAmount || 0).toLocaleString('ru-RU')} ₽
                        </div>
                        <div className="text-[11px] text-zinc-500 font-light inline-flex items-center gap-1">
                          <span>{order.paymentMethod || 'Оплачен'}</span>
                          <Check className="w-3 h-3 text-emerald-600 inline" />
                        </div>
                      </div>
                    </div>

                    {/* Tracking Number */}
                    {order.trackingNumber && (
                      <div className="p-3.5 rounded-full bg-zinc-50 border border-zinc-200/60 flex items-center justify-between text-xs px-5">
                        <div className="flex items-center gap-2 text-zinc-700">
                          <Truck className="w-4 h-4 text-zinc-900" />
                          <span className="text-delicate font-light">Трек-номер:</span>
                          <strong className="tabular-nums text-zinc-900 font-medium">{order.trackingNumber}</strong>
                        </div>
                        <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-light">СДЭК / Почта России</span>
                      </div>
                    )}

                    {/* Items List */}
                    <div className="divide-y divide-zinc-100">
                      {(order.items || []).map((item, idx) => (
                        <div key={idx} className="py-3 flex items-center gap-4 text-xs">
                          <div className="w-12 h-14 bg-zinc-50 rounded-[12px] flex items-center justify-center p-1 shrink-0">
                            <img
                              src={item.image || '/assets/placeholder-product.svg'}
                              alt=""
                              className="w-full h-full object-contain mix-blend-multiply"
                              onError={e => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/assets/placeholder-product.svg';
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] uppercase font-normal tracking-[0.14em] text-zinc-400">{item.brand || 'Maison Arôme'}</div>
                            <div className="font-normal text-zinc-900 truncate">{item.name}</div>
                            <div className="text-zinc-500 text-[11px] text-delicate">{item.volumeLabel}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-normal text-zinc-900 tabular-nums">
                              {((item.price || 0) * (item.quantity || 1)).toLocaleString('ru-RU')} ₽
                            </div>
                            <div className="text-zinc-400 text-[11px]">{item.quantity || 1} шт.</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 text-[11px] text-zinc-400 flex flex-col sm:flex-row sm:items-center justify-between border-t border-zinc-100 font-light text-delicate gap-1">
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
                <h2 className="text-lg font-light text-zinc-950">
                  Сохраненные адреса и ПВЗ
                </h2>
                <p className="text-xs text-zinc-500 mt-1 font-light text-delicate">
                  Сохраняйте пункты выдачи СДЭК или Яндекс для быстрого оформления заказов
                </p>
              </div>

              <button
                onClick={() => setShowAddAddressModal(true)}
                className="pill-btn-black py-2.5 px-5 text-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Добавить адрес</span>
              </button>
            </div>

            {savedAddresses.length === 0 ? (
              <div className="p-12 text-center bg-[#F7F7F9] rounded-[28px] border border-zinc-200/60 space-y-4">
                <MapPin className="w-10 h-10 text-zinc-400 mx-auto stroke-[1.5]" />
                <h3 className="text-base font-light text-zinc-900">У вас пока нет сохраненных адресов</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto font-light text-delicate">
                  Добавьте ваш пункт выдачи СДЭК или домашний адрес для быстрого заказа.
                </p>
                <button
                  onClick={() => setShowAddAddressModal(true)}
                  className="pill-btn-black py-2.5 px-6 text-xs"
                >
                  Добавить первый адрес
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedAddresses.map(addr => (
                  <div
                    key={addr.id}
                    className={`p-6 rounded-[24px] border transition-all flex flex-col justify-between ${
                      addr.isDefault
                        ? 'bg-zinc-50 border-black shadow-2xs'
                        : 'bg-white border-zinc-200/70 hover:border-black'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-xs text-zinc-950">{addr.label}</span>
                          {addr.isDefault && (
                            <span className="px-2.5 py-0.5 rounded-full bg-black text-white text-[9px] font-normal uppercase tracking-wider">
                              Основной
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-400 font-light">
                          {addr.type === 'cdek_pvz' ? 'СДЭК ПВЗ' : 'Яндекс'}
                        </span>
                      </div>

                      <div className="text-xs text-zinc-800 font-medium">г. {addr.city}</div>
                      <div className="text-xs text-zinc-500 mt-1 leading-relaxed font-light text-delicate">{addr.address}</div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-zinc-100 flex items-center justify-between text-xs">
                      {!addr.isDefault ? (
                        <button
                          onClick={() => setDefaultAddress(addr.id)}
                          className="text-black hover:underline font-normal text-[11px]"
                        >
                          Сделать основным
                        </button>
                      ) : (
                        <span className="text-black font-normal text-[11px] flex items-center gap-1">
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
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
                <div className="bg-white rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-zinc-100 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                    <h3 className="font-light text-lg text-zinc-950">
                      Новый адрес или ПВЗ
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowAddAddressModal(false)}
                      className="text-zinc-400 hover:text-zinc-900 cursor-pointer p-1 rounded-full hover:bg-zinc-100 transition-colors"
                      aria-label="Закрыть"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleAddAddressSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-normal uppercase tracking-[0.14em] text-zinc-500 mb-1.5">
                        Название адреса *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Например: ПВЗ СДЭК рядом с домом"
                        value={newAddrLabel}
                        onChange={e => setNewAddrLabel(e.target.value)}
                        className="w-full text-xs px-4 py-2.5 rounded-full border border-zinc-200 outline-none focus:border-black transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-normal uppercase tracking-[0.14em] text-zinc-500 mb-1.5">
                          Тип доставки
                        </label>
                        <select
                          value={newAddrType}
                          onChange={e => setNewAddrType(e.target.value as any)}
                          className="w-full text-xs px-4 py-2.5 rounded-full border border-zinc-200 outline-none focus:border-black bg-white transition-colors"
                        >
                          <option value="cdek_pvz">ПВЗ СДЭК</option>
                          <option value="yandex_pvz">Яндекс Маркет</option>
                          <option value="courier">Курьер домой/офис</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-normal uppercase tracking-[0.14em] text-zinc-500 mb-1.5">
                          Город *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Москва"
                          value={newAddrCity}
                          onChange={e => setNewAddrCity(e.target.value)}
                          className="w-full text-xs px-4 py-2.5 rounded-full border border-zinc-200 outline-none focus:border-black transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-normal uppercase tracking-[0.14em] text-zinc-500 mb-1.5">
                        Точный адрес или номер отделения ПВЗ *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ул. Ленина, д. 15 или ПВЗ СДЭК MSK12"
                        value={newAddrAddress}
                        onChange={e => setNewAddrAddress(e.target.value)}
                        className="w-full text-xs px-4 py-2.5 rounded-full border border-zinc-200 outline-none focus:border-black transition-colors"
                      />
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-700 pt-1">
                      <input
                        type="checkbox"
                        checked={newAddrDefault}
                        onChange={e => setNewAddrDefault(e.target.checked)}
                        className="w-4 h-4 rounded-full accent-black"
                      />
                      <span className="text-[11px] font-light text-delicate">Сделать основным адресом доставки</span>
                    </label>

                    <div className="pt-3 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowAddAddressModal(false)}
                        className="pill-btn-outline py-2.5 px-5 text-xs"
                      >
                        Отмена
                      </button>
                      <button
                        type="submit"
                        className="pill-btn-black py-2.5 px-5 text-xs"
                      >
                        Сохранить
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
              <div className="p-12 text-center bg-[#F7F7F9] rounded-[28px] border border-zinc-200/60 space-y-4">
                <Heart className="w-10 h-10 text-zinc-400 mx-auto stroke-[1.5]" />
                <h3 className="text-lg font-light text-zinc-900">В избранном пока пусто</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto font-light text-delicate">
                  Нажимайте на сердечко в каталоге, чтобы сохранить понравившиеся ароматы.
                </p>
                <Link
                  to="/catalog"
                  className="pill-btn-black py-3 px-7 text-xs inline-flex items-center gap-2"
                >
                  <span>Перейти в каталог</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-zinc-50 border border-zinc-200/60 rounded-full px-5 py-3">
                  <div className="text-xs text-zinc-600 font-light text-delicate">
                    Поделитесь вашим списком желаний с близкими
                  </div>
                  <Link
                    to="/wishlist"
                    className="pill-btn-outline py-1.5 px-4 text-[11px]"
                  >
                    Поделиться вишлистом
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
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
          <div className="max-w-xl bg-white p-6 sm:p-8 rounded-[28px] border border-zinc-200/70 space-y-6 shadow-2xs">
            <div>
              <h2 className="text-lg font-light text-zinc-950">Личные данные</h2>
              <p className="text-xs text-zinc-500 mt-1 font-light text-delicate">Информация профиля используется для автозаполнения доставки</p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-[11px] font-normal uppercase tracking-[0.14em] text-zinc-500 mb-1.5">Имя и Фамилия</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={e => setProfileName(e.target.value)}
                  className="w-full text-xs px-4 py-2.5 rounded-full border border-zinc-200 outline-none focus:border-black transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-normal uppercase tracking-[0.14em] text-zinc-500 mb-1.5">Электронная почта</label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full text-xs px-4 py-2.5 rounded-full border border-zinc-200 bg-zinc-50 text-zinc-500 outline-none cursor-not-allowed font-light"
                />
              </div>

              <div>
                <label className="block text-[11px] font-normal uppercase tracking-[0.14em] text-zinc-500 mb-1.5">Номер телефона</label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={e => setProfilePhone(e.target.value)}
                  className="w-full text-xs px-4 py-2.5 rounded-full border border-zinc-200 outline-none focus:border-black transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-normal uppercase tracking-[0.14em] text-zinc-500 mb-1.5">Основной город</label>
                <input
                  type="text"
                  value={profileCity}
                  onChange={e => setProfileCity(e.target.value)}
                  className="w-full text-xs px-4 py-2.5 rounded-full border border-zinc-200 outline-none focus:border-black transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-normal uppercase tracking-[0.14em] text-zinc-500 mb-1.5">Адрес доставки по умолчанию</label>
                <input
                  type="text"
                  value={profileAddress}
                  onChange={e => setProfileAddress(e.target.value)}
                  className="w-full text-xs px-4 py-2.5 rounded-full border border-zinc-200 outline-none focus:border-black transition-colors"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="pill-btn-black py-3 px-7 text-xs"
                >
                  Сохранить изменения
                </button>
              </div>
            </form>

            {/* Безопасность и смена пароля */}
            <div className="pt-6 border-t border-zinc-200/70 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-normal text-zinc-950 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-zinc-700 stroke-[1.5]" />
                    Безопасность и смена пароля
                  </h3>
                </div>
              </div>

              <form onSubmit={handleChangePasswordSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-normal uppercase tracking-[0.14em] text-zinc-500 mb-1">
                    Текущий (старый) пароль *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={oldPassword}
                    onChange={e => setOldPassword(e.target.value)}
                    className="w-full text-xs px-4 py-2.5 rounded-full border border-zinc-200 outline-none focus:border-black transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-normal uppercase tracking-[0.14em] text-zinc-500 mb-1">
                      Новый пароль *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Новый пароль"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full text-xs px-4 py-2.5 rounded-full border border-zinc-200 outline-none focus:border-black transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-normal uppercase tracking-[0.14em] text-zinc-500 mb-1">
                      Повторите новый пароль *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Повтор пароля"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full text-xs px-4 py-2.5 rounded-full border border-zinc-200 outline-none focus:border-black transition-colors"
                    />
                  </div>
                </div>

                {passwordError && (
                  <div className="text-xs text-rose-600 font-light p-2.5 bg-rose-50 border border-rose-200 rounded-[16px]">
                    {passwordError}
                  </div>
                )}

                {passwordSuccess && (
                  <div className="text-xs text-emerald-700 font-light p-2.5 bg-emerald-50 border border-emerald-200 rounded-[16px] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="pill-btn-black py-2.5 px-6 text-xs disabled:opacity-50"
                  >
                    {passwordLoading ? 'Сохранение...' : 'Обновить пароль'}
                  </button>
                </div>
              </form>
            </div>

            {/* 152-ФЗ и GDPR */}
            <div className="bg-[#F7F7F9] border border-zinc-200/70 p-6 rounded-[24px]">
              <div className="flex items-center gap-3 mb-3">
                <ShieldCheck className="w-5 h-5 text-zinc-900 stroke-[1.5]" />
                <h3 className="text-sm font-normal text-zinc-900">
                  Управление данными (152-ФЗ)
                </h3>
              </div>

              <p className="text-xs text-zinc-500 leading-relaxed mb-4 font-light text-delicate">
                Ваши данные надежно защищены. Вы можете выгрузить свои данные в формате JSON или удалить профиль в любое время.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleExportData}
                  disabled={exportLoading}
                  className="pill-btn-outline py-2 px-4 text-xs inline-flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{exportLoading ? 'Выгрузка...' : 'Скачать данные (JSON)'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  className="text-xs text-rose-600 hover:text-rose-700 py-2 px-3 font-light cursor-pointer"
                >
                  {deleteLoading ? 'Удаление...' : 'Удалить аккаунт'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. LOYALTY CARD TAB */}
        {activeTab === 'loyalty' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Virtual Card Visual */}
              <div className="lg:col-span-5">
                <div className="relative overflow-hidden rounded-[28px] p-7 text-white shadow-xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border border-white/10 aspect-[1.58/1] flex flex-col justify-between">
                  <div className="flex items-center justify-between z-10">
                    <div>
                      <span className="text-[10px] tracking-[0.2em] uppercase font-light text-amber-300 block">
                        Privilège Club
                      </span>
                      <span className="font-serif text-lg tracking-wider text-white">
                        Maison Arôme
                      </span>
                    </div>
                    <span className="px-3 py-1 text-[9px] font-medium uppercase tracking-widest bg-amber-400 text-black rounded-full">
                      {orders.length >= 15 ? 'VIP 10%' : orders.length >= 5 ? 'Постоянный 7%' : 'Базовый 5%'}
                    </span>
                  </div>

                  {/* Card Number */}
                  <div className="z-10 my-auto">
                    <div className="font-sans tabular-nums text-base tracking-[0.25em] text-zinc-300 font-light">
                      {bonusCard?.cardNumber || '7789 •••• •••• 4201'}
                    </div>
                  </div>

                  {/* Card Footer: Holder & Balance */}
                  <div className="flex items-end justify-between z-10">
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-zinc-400 font-light">Владелец</div>
                      <div className="text-xs uppercase font-normal tracking-wider text-white">
                        {user.fullName || 'Клубный клиент'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] uppercase tracking-wider text-zinc-400 font-light">Бонусный баланс</div>
                      <div className="text-xl font-normal tabular-nums text-amber-300">
                        {(bonusCard?.balance ?? 500).toLocaleString('ru-RU')} ₽
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-zinc-500 px-1 text-delicate">
                  <span>1 бонус = 1 рубль скидки</span>
                  <Link to="/loyalty" className="text-black hover:underline flex items-center gap-1 font-normal">
                    Правила клуба <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Tier Progress & Rules */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white p-6 sm:p-7 rounded-[28px] border border-zinc-200/70 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-normal uppercase tracking-wider text-zinc-950">
                        Ваш статус: {orders.length >= 15 ? 'VIP' : orders.length >= 5 ? 'Постоянный' : 'Базовый'}
                      </h3>
                      <p className="text-xs text-zinc-500 mt-0.5 text-delicate">
                        {orders.length >= 15
                          ? 'Максимальный кэшбэк 10% на все покупки'
                          : orders.length >= 5
                          ? 'Повышенный кэшбэк 7%'
                          : 'Кэшбэк 5% на все заказы. Совершайте покупки для повышения уровня.'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-light text-black">
                        {orders.length >= 15 ? '10%' : orders.length >= 5 ? '7%' : '5%'}
                      </span>
                    </div>
                  </div>

                  {/* Orders counter progress */}
                  <div className="space-y-2 pt-2">
                    <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-black h-full rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${
                            orders.length >= 15
                              ? 100
                              : orders.length >= 5
                              ? 33 + ((orders.length - 5) / 10) * 67
                              : (orders.length / 5) * 33
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Privileges Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 bg-[#F7F7F9] rounded-[20px] border border-zinc-200/60 space-y-1">
                    <div className="text-[10px] uppercase tracking-wider text-zinc-400">Оплата баллами</div>
                    <div className="text-sm font-normal text-zinc-900">До 30% заказа</div>
                    <p className="text-[11px] text-zinc-500 font-light text-delicate">Списывайте накопленные бонусы</p>
                  </div>

                  <div className="p-4 bg-[#F7F7F9] rounded-[20px] border border-zinc-200/60 space-y-1">
                    <div className="text-[10px] uppercase tracking-wider text-zinc-400">Приветственный бонус</div>
                    <div className="text-sm font-normal text-zinc-900">500 ₽ на счёт</div>
                    <p className="text-[11px] text-zinc-500 font-light text-delicate">Сразу при регистрации</p>
                  </div>

                  <div className="p-4 bg-[#F7F7F9] rounded-[20px] border border-zinc-200/60 space-y-1">
                    <div className="text-[10px] uppercase tracking-wider text-zinc-400">День рождения</div>
                    <div className="text-sm font-normal text-zinc-900">+1000 бонусов</div>
                    <p className="text-[11px] text-zinc-500 font-light text-delicate">Действуют 30 дней</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Link
                    to="/catalog"
                    className="pill-btn-black py-2.5 px-6 text-xs"
                  >
                    В каталог
                  </Link>
                  <Link
                    to="/loyalty"
                    className="pill-btn-outline py-2.5 px-5 text-xs"
                  >
                    Все правила программы
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
