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
  Lock,
  LayoutDashboard,
  CreditCard,
  Coins,
  ExternalLink,
  Download,
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
          if (data && data.cardNumber) setBonusCard(data);
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
      setPasswordError('Укажите ваш текущий старый пароль');
      return;
    }
    if (!newPassword || newPassword.length < 4) {
      setPasswordError('Новый пароль должен содержать минимум 4 символа');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Новый пароль и подтверждение не совпадают');
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword(oldPassword, newPassword);
      setPasswordSuccess('Пароль успешно изменен');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Ошибка смены пароля');
    } finally {
      setPasswordLoading(false);
    }
  };

  // 152-ФЗ / GDPR: Выгрузка и удаление персональных данных
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleExportData = async () => {
    setExportLoading(true);
    try {
      const token = localStorage.getItem('parfum_auth_token');
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
      const token = localStorage.getItem('parfum_auth_token');
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
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                {authMode === 'login' ? 'Email или логин *' : 'Email *'}
              </label>
              <input
                type={authMode === 'login' ? 'text' : 'email'}
                required
                placeholder={authMode === 'login' ? 'name@example.com или логин' : 'name@example.com'}
                value={authEmail}
                onChange={e => setAuthEmail(e.target.value)}
                className="w-full text-xs px-3.5 py-3 rounded-none border border-zinc-300 outline-none focus:border-black transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700">Пароль *</label>
                {authMode === 'login' && (
                  <a
                    href="https://t.me/nikisss2?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5!%20%D0%AF%20%D0%B7%D0%B0%D0%B1%D1%8B%D0%BB%20%D0%BF%D0%B0%D1%80%D0%BE%D0%BB%D1%8C%20%D0%BE%D1%82%20%D0%B0%D0%BA%D0%BA%D0%B0%D1%83%D0%BD%D1%82%D0%B0%20Maison%20Ar%C3%B4me.%20%D0%9F%D0%BE%D0%BC%D0%BE%D0%B3%D0%B8%D1%82%D0%B5%20%D0%B2%D0%BE%D1%81%D1%81%D1%82%D0%B0%D0%BD%D0%BE%D0%B2%D0%B8%D1%82%D1%8C%20%D0%B4%D0%BE%D1%81%D1%82%D1%83%D0%BF."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-zinc-500 hover:text-black underline transition-colors cursor-pointer"
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
                className="w-full text-xs px-3.5 py-3 rounded-none border border-zinc-300 outline-none focus:border-black transition-colors"
              />
            </div>

            {authError && (
              <div className="text-xs text-rose-600 font-medium p-3 bg-rose-50 border border-rose-200 rounded-none">
                {authError}
              </div>
            )}

            {authMode === 'register' && (
              <div className="text-[11px] text-zinc-500 leading-tight">
                Создавая учетную запись, вы соглашаетесь с условиями{' '}
                <Link to="/terms" target="_blank" className="underline text-black font-semibold">
                  Пользовательского соглашения
                </Link>{' '}
                и даете согласие на{' '}
                <Link to="/privacy" target="_blank" className="underline text-black font-semibold">
                  обработку персональных данных (152-ФЗ)
                </Link>
                .
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-4 bg-black hover:bg-zinc-800 disabled:opacity-50 text-white rounded-none text-xs font-bold uppercase tracking-widest transition-all shadow-sm"
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

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {user.role === 'admin' && (
            <>
              <Link
                to="/admin/crm"
                className="px-4 py-2.5 rounded-none bg-amber-400 hover:bg-amber-300 text-black text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm hover:scale-[1.02]"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>CRM-система</span>
              </Link>
              <Link
                to="/admin"
                className="px-3.5 py-2.5 rounded-none bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors border border-white/20"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Заказы</span>
              </Link>
            </>
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

      {/* Admin CRM Quick Access Banner - Only visible to admin */}
      {user.role === 'admin' && (
        <div className="p-6 bg-gradient-to-r from-zinc-950 via-zinc-900 to-black text-white border-2 border-amber-400/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-amber-400 text-black text-[10px] font-black uppercase tracking-widest">
                Админ-доступ
              </span>
              <span className="text-xs text-amber-300/80 font-mono">SQLite WAL · Scrypt · Role Guard</span>
            </div>
            <h3 className="text-lg font-serif tracking-wide text-white">
              Корпоративная CRM-система Maison d'Arôme
            </h3>
            <p className="text-xs text-zinc-400 font-light max-w-2xl leading-relaxed">
              Управление заказами, воронка статусов (Новый → В сборке → Отправлен → Доставлен), база клиентов с расчётом LTV, трек-номера СДЭК, ручное оформление заказов из Telegram/WhatsApp и аудит безопасности.
            </p>
          </div>
          <Link
            to="/admin/crm"
            className="shrink-0 px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 hover:translate-x-0.5"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Открыть CRM-систему</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      )}

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

        <button
          onClick={() => setActiveTab('loyalty')}
          className={`pb-3 px-2 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'loyalty'
              ? 'border-black text-black'
              : 'border-transparent text-zinc-400 hover:text-black'
          }`}
        >
          <CreditCard className="w-4 h-4 text-amber-500" />
          <span>Бонусная карта ({bonusCard ? `${bonusCard.balance} ₽` : '500 ₽'})</span>
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

            {/* Безопасность и смена пароля */}
            <div className="pt-6 border-t border-zinc-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-zinc-800" />
                    Безопасность и смена пароля
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5 font-light">
                    Для смены пароля введите ваш текущий (старый) пароль
                  </p>
                </div>
                <a
                  href="https://t.me/nikisss2?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5!%20%D0%AF%20%D0%B7%D0%B0%D0%B1%D1%8B%D0%BB%20%D1%81%D1%82%D0%B0%D1%80%D1%8B%D0%B9%20%D0%BF%D0%B0%D1%80%D0%BE%D0%BB%D1%8C%20%D0%BE%D1%82%20%D0%B0%D0%BA%D0%BA%D0%B0%D1%83%D0%BD%D1%82%D0%B0%20Maison%20Ar%C3%B4me.%20%D0%9F%D0%BE%D0%BC%D0%BE%D0%B3%D0%B8%D1%82%D0%B5%20%D0%B2%D0%BE%D1%81%D1%81%D1%82%D0%B0%D0%BD%D0%BE%D0%B2%D0%B8%D1%82%D1%8C."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-zinc-500 hover:text-black underline transition-colors cursor-pointer shrink-0"
                >
                  Забыли пароль?
                </a>
              </div>

              <form onSubmit={handleChangePasswordSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Текущий (старый) пароль *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={oldPassword}
                    onChange={e => setOldPassword(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-none border border-zinc-300 outline-none focus:border-black transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
                      Новый пароль *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Новый пароль"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-none border border-zinc-300 outline-none focus:border-black transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
                      Повторите новый пароль *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Повтор пароля"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-none border border-zinc-300 outline-none focus:border-black transition-colors"
                    />
                  </div>
                </div>

                {passwordError && (
                  <div className="text-xs text-rose-600 font-medium p-2.5 bg-rose-50 border border-rose-200">
                    {passwordError}
                  </div>
                )}

                {passwordSuccess && (
                  <div className="text-xs text-emerald-700 font-medium p-2.5 bg-emerald-50 border border-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="px-6 py-3 bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                  >
                    {passwordLoading ? 'Сохранение...' : 'Обновить пароль'}
                  </button>

                  <a
                    href="https://t.me/nikisss2?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5!%20%D0%AF%20%D0%B7%D0%B0%D0%B1%D1%8B%D0%BB%20%D1%81%D1%82%D0%B0%D1%80%D1%8B%D0%B9%20%D0%BF%D0%B0%D1%80%D0%BE%D0%BB%D1%8C%20%D0%BE%D1%82%20%D0%B0%D0%BA%D0%BA%D0%B0%D1%83%D0%BD%D1%82%D0%B0%20Maison%20Ar%C3%B4me.%20%D0%9F%D0%BE%D0%BC%D0%BE%D0%B3%D0%B8%D1%82%D0%B5%20%D0%B2%D0%BE%D1%81%D1%81%D1%82%D0%B0%D0%BD%D0%BE%D0%B2%D0%B8%D1%82%D1%8C."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-zinc-500 hover:text-black flex items-center gap-1.5 transition-colors"
                  >
                    <span>Забыли пароль? Написать в Telegram @nikisss2</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </form>
            </div>

            {/* 152-ФЗ и GDPR: Управление персональными данными */}
            <div className="bg-white border border-zinc-200 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-zinc-900" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-zinc-900">
                    Управление данными и безопасность (152-ФЗ)
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Ваши права на доступ, выгрузку и отзыв согласия на обработку персональных данных
                  </p>
                </div>
              </div>

              <p className="text-xs text-zinc-600 leading-relaxed mb-6">
                В соответствии с требованиями Федерального закона РФ № 152-ФЗ «О персональных данных» и регламента GDPR, ваши данные хранятся в защищенном виде. Вы имеете законное право в любой момент скачать структурированный архив со всеми своими данными либо отозвать согласие и полностью удалить профиль.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleExportData}
                  disabled={exportLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-semibold border border-zinc-300 transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {exportLoading ? 'Формирование архива...' : 'Скачать мои данные (JSON)'}
                </button>

                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold border border-red-200 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {deleteLoading ? 'Удаление...' : 'Отозвать согласие и удалить аккаунт'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loyalty Card Tab */}
        {activeTab === 'loyalty' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Virtual Card Showcase */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Virtual Card Visual */}
              <div className="lg:col-span-5">
                <div className="relative overflow-hidden rounded-2xl p-7 text-white shadow-2xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border border-white/10 aspect-[1.58/1] flex flex-col justify-between">
                  <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-gradient-to-br from-amber-400/20 to-transparent blur-2xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between z-10">
                    <div>
                      <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-amber-400/90 block">
                        Privilège Club
                      </span>
                      <span className="font-serif text-lg tracking-wider text-white">
                        Maison d'Arôme
                      </span>
                    </div>
                    <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest bg-amber-400 text-black rounded-full">
                      {orders.length >= 15 ? 'VIP 10%' : orders.length >= 5 ? 'Постоянный 7%' : 'Базовый 5%'}
                    </span>
                  </div>

                  {/* Chip & Number */}
                  <div className="z-10 my-auto">
                    <div className="w-10 h-7 rounded-sm bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400 border border-amber-500/30 mb-4 opacity-90 shadow-inner" />
                    <div className="font-mono text-base tracking-[0.25em] text-zinc-200 font-medium">
                      {bonusCard?.cardNumber || '7789 •••• •••• 4201'}
                    </div>
                  </div>

                  {/* Card Footer: Holder & Balance */}
                  <div className="flex items-end justify-between z-10">
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-zinc-400 font-mono">Владелец</div>
                      <div className="text-xs uppercase font-bold tracking-wider text-white">
                        {user.fullName || 'Клубный клиент'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] uppercase tracking-wider text-zinc-400 font-mono">Бонусный баланс</div>
                      <div className="text-xl font-bold font-mono text-amber-300">
                        {(bonusCard?.balance ?? 500).toLocaleString('ru-RU')} ₽
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-zinc-500 px-1">
                  <span>1 бонус = 1 рубль скидки</span>
                  <Link to="/loyalty" className="text-black font-bold hover:underline flex items-center gap-1">
                    Правила программы <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Tier Progress & Rules */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white p-6 rounded-none border border-zinc-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950">
                        Ваш статус: {orders.length >= 15 ? 'VIP Privilège' : orders.length >= 5 ? 'Постоянный клиент' : 'Базовый'}
                      </h3>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {orders.length >= 15
                          ? 'Максимальный кэшбэк 10% на все покупки и персональный консультант'
                          : orders.length >= 5
                          ? 'Повышенный кэшбэк 7% и доступ к закрытым спецпредложениям'
                          : 'Кэшбэк 5% на все заказы. Сделайте ещё покупки для перехода на уровень 7%'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold font-mono text-black">
                        {orders.length >= 15 ? '10%' : orders.length >= 5 ? '7%' : '5%'}
                      </span>
                      <span className="block text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Кэшбэк</span>
                    </div>
                  </div>

                  {/* Orders counter progress */}
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-zinc-600">Оформлено заказов: <strong>{orders.length}</strong></span>
                      <span className="text-zinc-500">
                        {orders.length < 5
                          ? `До статуса «Постоянный»: ещё ${5 - orders.length} зак.`
                          : orders.length < 15
                          ? `До статуса «VIP»: ещё ${15 - orders.length} зак.`
                          : 'Максимальный уровень достигнут!'}
                      </span>
                    </div>

                    <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden">
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

                    <div className="flex justify-between text-[10px] text-zinc-400 font-mono pt-1">
                      <span>Базовый (от 0)</span>
                      <span>Постоянный (от 5 заказов)</span>
                      <span>VIP (от 15 заказов)</span>
                    </div>
                  </div>
                </div>

                {/* Privileges Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 bg-zinc-50 border border-zinc-200 space-y-1">
                    <div className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Оплата баллами</div>
                    <div className="text-sm font-bold text-zinc-900">До 30% заказа</div>
                    <p className="text-[11px] text-zinc-500 font-light">Списывайте накопленные рубли прямо в корзине</p>
                  </div>

                  <div className="p-4 bg-zinc-50 border border-zinc-200 space-y-1">
                    <div className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Приветственный бонус</div>
                    <div className="text-sm font-bold text-zinc-900">500 ₽ на счёт</div>
                    <p className="text-[11px] text-zinc-500 font-light">Начисляются сразу при первой регистрации</p>
                  </div>

                  <div className="p-4 bg-zinc-50 border border-zinc-200 space-y-1">
                    <div className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">День рождения</div>
                    <div className="text-sm font-bold text-zinc-900">+1000 бонусов</div>
                    <p className="text-[11px] text-zinc-500 font-light">Подарочные баллы действуют 30 дней</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <Link
                    to="/catalog"
                    className="px-6 py-3.5 bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-widest transition-colors"
                  >
                    Перейти в каталог
                  </Link>
                  <Link
                    to="/loyalty"
                    className="px-6 py-3.5 border border-zinc-300 hover:border-black text-black text-xs font-bold uppercase tracking-widest transition-colors"
                  >
                    Все привилегии программы
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
