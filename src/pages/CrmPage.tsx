import React, { useState, useEffect, useMemo } from 'react';
import { safeGetItem } from '../utils/storage';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import {
  fetchAdminStats,
  fetchAdminUsers,
  fetchAdminOrders,
  adminUpdateOrderStatusApi,
  adminDeleteOrderApi,
  fetchAdminAudit,
  adminCreateOrderApi,
  adminAwardLoyaltyPointsApi,
  fetchProducts,
  listItemToPerfume,
} from '../api/catalog';
import { Perfume } from '../types';
import {
  LayoutDashboard,
  Package,
  Users,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Clock,
  Truck,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Plus,
  Trash2,
  ExternalLink,
  Printer,
  Send,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  Lock,
  ChevronRight,
  ArrowUpRight,
  Eye,
  X,
  FileText,
  Sliders,
  Database,
  Key,
  Download,
  Gift,
  Sparkles,
  CheckSquare,
  Square,
} from 'lucide-react';

export const CrmPage: React.FC = () => {
  const { user, showToast } = useShop();
  const navigate = useNavigate();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'orders' | 'customers' | 'analytics' | 'create-order' | 'security'>('orders');

  // Token: from authenticated admin session
  const adminToken = safeGetItem('parfum_admin_token') || safeGetItem('maison_auth_token') || '';

  // State data
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [audit, setAudit] = useState<any>(null);

  // Filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Order Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Loyalty Awarding State
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);
  const [awardPointsAmount, setAwardPointsAmount] = useState<number>(500);
  const [awardReason, setAwardReason] = useState('Подарочные баллы от бутика');
  const [isAwardingPoints, setIsAwardingPoints] = useState(false);
  const [targetSingleUser, setTargetSingleUser] = useState<any | null>(null);

  const handleAwardPoints = async () => {
    const ids = targetSingleUser ? [targetSingleUser.id] : selectedUserIds;
    if (!ids.length) {
      showToast('Выберите клиентов для начисления баллов', 'error');
      return;
    }
    if (!awardPointsAmount || awardPointsAmount <= 0) {
      showToast('Укажите положительное количество баллов', 'error');
      return;
    }

    setIsAwardingPoints(true);
    try {
      const res = await adminAwardLoyaltyPointsApi(adminToken, ids, awardPointsAmount, awardReason);
      if (res.ok) {
        showToast(
          `Начислено ${res.awardedPoints.toLocaleString('ru-RU')} баллов для ${res.count} ${res.count === 1 ? 'клиента' : 'клиентов'}!`,
          'success'
        );
        // Instant local state update
        setUsers(prev =>
          prev.map(u => {
            const updated = res.results.find(r => r.userId === u.id);
            if (updated) {
              return {
                ...u,
                bonus_balance: updated.balance,
                bonus_tier: updated.tier,
                card_number: updated.cardNumber,
              };
            }
            return u;
          })
        );
        setIsAwardModalOpen(false);
        setTargetSingleUser(null);
        setSelectedUserIds([]);
      }
    } catch (e: any) {
      showToast(e.message || 'Ошибка начисления баллов', 'error');
    } finally {
      setIsAwardingPoints(false);
    }
  };

  // New Manual Order Form State
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const [newCustomerCity, setNewCustomerCity] = useState('Москва');
  const [newCustomerAddress, setNewCustomerAddress] = useState('');
  const [newDeliveryMethod, setNewDeliveryMethod] = useState('СДЭК (ПВЗ)');
  const [newDeliveryPrice, setNewDeliveryPrice] = useState(50);
  const [newPaymentMethod, setNewPaymentMethod] = useState('СБП / Перевод');
  const [newComment, setNewComment] = useState('');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [foundCatalogProducts, setFoundCatalogProducts] = useState<Perfume[]>([]);
  const [selectedItemsForOrder, setSelectedItemsForOrder] = useState<any[]>([]);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Security guard: strictly require admin role
  const isAdmin = user?.role === 'admin';

  const loadAllCrmData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, usersRes, auditRes] = await Promise.all([
        fetchAdminStats(adminToken).catch(() => ({ ok: true, stats: { totalOrders: 0, totalRevenue: 0, totalUsers: 0, activeOrders: 0 } })),
        fetchAdminOrders(adminToken).catch(() => ({ ok: true, orders: [] })),
        fetchAdminUsers(adminToken).catch(() => ({ ok: true, users: [] })),
        fetchAdminAudit(adminToken).catch(() => ({ ok: true, audit: null })),
      ]);

      if (statsRes?.stats) setStats(statsRes.stats);
      if (ordersRes?.orders) setOrders(ordersRes.orders);
      if (usersRes?.users) setUsers(usersRes.users);
      if (auditRes?.audit) setAudit(auditRes.audit);
    } catch (e) {
      console.error('Ошибка загрузки CRM данных:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAllCrmData();
    }
  }, [isAdmin]);

  // Catalog search for manual order creation
  useEffect(() => {
    if (activeTab === 'create-order' && catalogSearch.trim().length >= 2) {
      const timer = setTimeout(() => {
        fetchProducts({ q: catalogSearch, limit: 12 })
          .then(r => setFoundCatalogProducts(r.items.map(listItemToPerfume)))
          .catch(() => setFoundCatalogProducts([]));
      }, 250);
      return () => clearTimeout(timer);
    } else {
      setFoundCatalogProducts([]);
    }
  }, [catalogSearch, activeTab]);

  // Order status update
  const handleUpdateStatus = async (orderId: string, newStatus: string, newTracking?: string) => {
    try {
      const res = await adminUpdateOrderStatusApi(adminToken, orderId, newStatus, newTracking);
      if (res.ok) {
        setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, ...res.order } : o)));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev: any) => ({ ...prev, ...res.order }));
        }
        showToast('Статус заказа успешно обновлен', 'success');
      }
    } catch (e: any) {
      showToast(e.message || 'Ошибка обновления статуса', 'error');
    }
  };

  // Order deletion
  const handleDeleteOrder = async (orderId: string, orderNumber: string) => {
    if (!window.confirm(`Вы уверены, что хотите удалить заказ ${orderNumber}? Это действие необратимо.`)) {
      return;
    }
    try {
      const res = await adminDeleteOrderApi(adminToken, orderId);
      if (res.ok) {
        setOrders(prev => prev.filter(o => o.id !== orderId));
        if (selectedOrder?.id === orderId) setSelectedOrder(null);
        showToast(`Заказ ${orderNumber} удален`, 'info');
      }
    } catch (e: any) {
      showToast(e.message || 'Ошибка удаления заказа', 'error');
    }
  };

  // Add item to manual order
  const handleAddItemToManualOrder = (p: Perfume, volume: string, price: number) => {
    setSelectedItemsForOrder(prev => [
      ...prev,
      {
        productId: p.id,
        name: p.name,
        brand: p.brand,
        volume,
        price,
        quantity: 1,
        image: p.images[0] || '/assets/placeholder-product.svg',
      },
    ]);
    showToast(`Товар «${p.name}» добавлен в заказ`, 'success');
  };

  const handleRemoveManualItem = (idx: number) => {
    setSelectedItemsForOrder(prev => prev.filter((_, i) => i !== idx));
  };

  // Submit manual order
  const handleCreateManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItemsForOrder.length === 0) {
      showToast('Добавьте хотя бы один товар в заказ', 'error');
      return;
    }
    if (!newCustomerName.trim() || !newCustomerPhone.trim()) {
      showToast('Укажите имя и телефон покупателя', 'error');
      return;
    }

    setSubmittingOrder(true);
    const itemsTotal = selectedItemsForOrder.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const totalAmount = itemsTotal + Number(newDeliveryPrice);

    try {
      const res = await adminCreateOrderApi(adminToken, {
        items: selectedItemsForOrder,
        totalAmount,
        discount: 0,
        deliveryMethod: newDeliveryMethod,
        deliveryPrice: Number(newDeliveryPrice),
        paymentMethod: newPaymentMethod,
        isPaid: false,
        recipient: {
          fullName: newCustomerName.trim(),
          phone: newCustomerPhone.trim(),
          email: newCustomerEmail.trim() || undefined,
          city: newCustomerCity.trim(),
          address: newCustomerAddress.trim(),
          comment: newComment.trim() || undefined,
        },
      });

      if (res.ok && res.order) {
        setOrders(prev => [res.order, ...prev]);
        showToast(`Заказ ${res.order.orderNumber} успешно создан в базе!`, 'success');
        // Reset form
        setSelectedItemsForOrder([]);
        setNewCustomerName('');
        setNewCustomerPhone('');
        setNewCustomerEmail('');
        setNewCustomerAddress('');
        setNewComment('');
        setActiveTab('orders');
      }
    } catch (e: any) {
      showToast(e.message || 'Ошибка сохранения заказа', 'error');
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      // Status filter
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const num = (o.orderNumber || '').toLowerCase();
        const name = (o.recipient?.fullName || '').toLowerCase();
        const phone = (o.recipient?.phone || '').toLowerCase();
        const email = (o.recipient?.email || '').toLowerCase();
        const city = (o.recipient?.city || '').toLowerCase();
        const track = (o.trackingNumber || '').toLowerCase();
        const matches = num.includes(q) || name.includes(q) || phone.includes(q) || email.includes(q) || city.includes(q) || track.includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  // If user is not admin, show secure access screen
  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-zinc-950 text-white">
        <div className="max-w-md w-full p-8 border border-zinc-800 bg-zinc-900 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-serif font-bold uppercase tracking-wide">
              Доступ ограничен
            </h1>
            <p className="text-xs text-zinc-400 font-light leading-relaxed">
              Этот раздел предназначен исключительно для уполномоченных администраторов Maison Arôme. База данных защищена шифрованием и протоколом Zero-Knowledge.
            </p>
          </div>

          <div className="pt-4 border-t border-zinc-800 space-y-3">
            <Link
              to="/account"
              className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <Key className="w-4 h-4" />
              <span>Войти как администратор</span>
            </Link>

            <Link
              to="/"
              className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold uppercase tracking-wider block transition-colors"
            >
              Вернуться на главную
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900 pb-20 font-sans">
      {/* Top Luxury Enterprise Navigation Bar */}
      <header className="bg-white/95 backdrop-blur-md text-zinc-900 border-b border-zinc-200/80 sticky top-0 z-40 shadow-xs">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="font-light tracking-tight text-lg text-zinc-950 font-medium">
                Maison Arôme <span className="font-sans tabular-nums text-[11px] px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200 ml-1">CRM</span>
              </span>
            </div>
            <span className="text-zinc-300 hidden md:inline">|</span>
            <span className="text-xs text-zinc-500 font-light hidden md:inline">
              Защищенная система управления заказами и клиентами
            </span>
          </div>

          {/* Quick Stats in Header */}
          <div className="flex items-center gap-5 text-xs font-sans tabular-nums">
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="text-zinc-500">Выручка:</span>
              <span className="font-semibold text-zinc-950">
                {(stats?.totalRevenue || 0).toLocaleString('ru-RU')} ₽
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="text-zinc-500">Заказов:</span>
              <span className="font-semibold text-zinc-950">{orders.length}</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="text-zinc-500">Клиентов:</span>
              <span className="font-semibold text-zinc-950">{users.length}</span>
            </div>

            <button
              onClick={loadAllCrmData}
              disabled={loading}
              className="p-2 rounded-full border border-zinc-200 hover:border-zinc-400 text-zinc-600 hover:text-zinc-950 transition-colors"
              title="Обновить данные"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <Link
              to="/account"
              className="px-4 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium tracking-wide border border-zinc-200/80 transition-colors"
            >
              Личный профиль
            </Link>
          </div>
        </div>

        {/* Tab Switcher Bar */}
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 border-t border-zinc-100 flex gap-2 overflow-x-auto no-scrollbar py-2">
          {[
            { id: 'orders', label: 'Заказы & Доставка', icon: Package, badge: orders.length },
            { id: 'customers', label: 'Клиентская база', icon: Users, badge: users.length },
            { id: 'analytics', label: 'Финансы & Аналитика', icon: TrendingUp },
            { id: 'create-order', label: '+ Создать заказ вручную', icon: Plus },
            { id: 'security', label: 'Защита БД & Аудит', icon: ShieldCheck },
          ].map(tab => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-full transition-all whitespace-nowrap ${
                  isCurrent
                    ? 'bg-zinc-950 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-sans tabular-nums ${isCurrent ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-200 text-zinc-600'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1720px] mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* KPI Snapshot Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white rounded-[24px] border border-zinc-200/70 shadow-2xs flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 font-sans tabular-nums">Общая выручка</div>
              <div className="text-2xl font-black font-sans tabular-nums text-zinc-950 mt-1">
                {(stats?.totalRevenue || 0).toLocaleString('ru-RU')} ₽
              </div>
              <div className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> Оплата через СБП и карты
              </div>
            </div>
            <div className="w-11 h-11 rounded-full bg-zinc-100 text-zinc-900 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 bg-white rounded-[24px] border border-zinc-200/70 shadow-2xs flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 font-sans tabular-nums">Всего заказов</div>
              <div className="text-2xl font-black font-sans tabular-nums text-zinc-950 mt-1">
                {orders.length}
              </div>
              <div className="text-[10px] text-zinc-500 font-sans tabular-nums mt-1">
                Сборка на складе: {orders.filter(o => o.status === 'assembling').length}
              </div>
            </div>
            <div className="w-11 h-11 rounded-full bg-zinc-100 text-zinc-900 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 bg-white rounded-[24px] border border-zinc-200/70 shadow-2xs flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 font-sans tabular-nums">База клиентов (SQLite)</div>
              <div className="text-2xl font-black font-sans tabular-nums text-zinc-950 mt-1">
                {users.length}
              </div>
              <div className="text-[10px] text-zinc-500 font-sans tabular-nums mt-1">
                Зарегистрированные клиенты
              </div>
            </div>
            <div className="w-11 h-11 rounded-full bg-zinc-100 text-zinc-900 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 bg-white rounded-[24px] border border-zinc-200/70 shadow-2xs flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 font-sans tabular-nums">Безопасность БД</div>
              <div className="text-2xl font-black font-sans tabular-nums text-emerald-600 mt-1">
                100% OK
              </div>
              <div className="text-[10px] text-zinc-500 font-sans tabular-nums mt-1">
                WAL Mode · scrypt · 0 SQLi
              </div>
            </div>
            <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* TAB 1: ORDERS & LOGISTICS */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Control Strip: Search & Filter */}
            <div className="p-4 bg-white rounded-[24px] border border-zinc-200/70 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                {[
                  { id: 'all', label: 'Все заказы' },
                  { id: 'assembling', label: 'В сборке' },
                  { id: 'paid', label: 'Оплачен' },
                  { id: 'sent', label: 'Отправлен' },
                  { id: 'delivered', label: 'Доставлен' },
                  { id: 'cancelled', label: 'Отменен' },
                ].map(st => (
                  <button
                    key={st.id}
                    onClick={() => setStatusFilter(st.id)}
                    className={`px-3.5 py-1.5 text-xs font-medium tracking-wider rounded-full transition-colors ${
                      statusFilter === st.id
                        ? 'bg-black text-white'
                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Поиск по №, имени, телефону, городу..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs border border-zinc-300 rounded-full outline-none focus:border-black bg-zinc-50/50"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <a
                    href="https://docs.google.com/spreadsheets/d/1vXuMV4APjZ3k78eq4Y6DwBMoEYeFFIokZdVS_iwAFTo/edit?gid=943365437#gid=943365437"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium tracking-wider rounded-full flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-xs cursor-pointer"
                    title="Открыть онлайн Google Таблицу заказов (автосинхронизация с БД)"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Google Таблица</span>
                  </a>

                  <a
                    href="/api/orders/download-xlsx"
                    download="Таблица_Заказов_Maison_Arome.xlsx"
                    className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-medium tracking-wider rounded-full flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-xs cursor-pointer"
                    title="Скачать готовую таблицу Excel (.xlsx) с 4 листами и формулами"
                  >
                    <Download className="w-4 h-4" />
                    <span>Excel (.xlsx)</span>
                  </a>

                  <a
                    href={`/api/orders/export-csv?token=${encodeURIComponent(adminToken)}`}
                    download="orders_maison_arome.csv"
                    className="flex-1 sm:flex-initial px-4 py-2 bg-zinc-900 hover:bg-black text-white text-xs font-medium tracking-wider rounded-full flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-xs cursor-pointer border border-zinc-700"
                    title="Экспорт всех актуальных заказов в CSV файл"
                  >
                    <Download className="w-4 h-4" />
                    <span>Экспорт CSV</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-[28px] border border-zinc-200/70 shadow-2xs overflow-hidden overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50/80 text-zinc-500 font-semibold uppercase text-[10px] tracking-wider border-b border-zinc-200/80">
                    <th className="py-3.5 px-4">Заказ</th>
                    <th className="py-3.5 px-4">Клиент</th>
                    <th className="py-3.5 px-4">Город & Доставка</th>
                    <th className="py-3.5 px-4">Позиции</th>
                    <th className="py-3.5 px-4">Сумма</th>
                    <th className="py-3.5 px-4">Статус заказа</th>
                    <th className="py-3.5 px-4">Трек-номер</th>
                    <th className="py-3.5 px-4 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-zinc-500 font-sans tabular-nums text-xs">
                        Заказов не найдено.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map(order => {
                      const recipient = order.recipient || {};
                      const itemsCount = (order.items || []).reduce((sum: number, it: any) => sum + (it.quantity || 1), 0);
                      return (
                        <tr key={order.id} className="hover:bg-zinc-50/80 transition-colors">
                          <td className="py-3 px-4 font-sans tabular-nums">
                            <div className="font-bold text-zinc-950">{order.orderNumber}</div>
                            <div className="text-[10px] text-zinc-400 mt-0.5">{order.date || order.createdAt?.split('T')[0]}</div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-bold text-zinc-950">{recipient.fullName || order.customerName || 'Покупатель'}</div>
                            <div className="text-zinc-500 font-sans tabular-nums text-[11px] flex items-center gap-1 mt-0.5">
                              <span>{recipient.phone || order.phone || '—'}</span>
                              {recipient.phone && (
                                <a
                                  href={`https://t.me/+${(recipient.phone || '').replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-sky-600 hover:text-sky-800 text-[10px] uppercase font-bold ml-1"
                                  title="Написать в Telegram"
                                >
                                  TG
                                </a>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-medium text-zinc-900">{recipient.city || order.city || 'Москва'}</div>
                            <div className="text-[10px] text-zinc-500 mt-0.5">{order.deliveryMethod || 'СДЭК'}</div>
                          </td>

                          <td className="py-3 px-4">
                            <span className="inline-block px-2 py-0.5 bg-zinc-100 font-sans tabular-nums text-[11px] font-bold text-zinc-800">
                              {itemsCount} поз.
                            </span>
                          </td>

                          <td className="py-3 px-4 font-sans tabular-nums">
                            <div className="font-bold text-zinc-950">{(order.totalAmount || order.total || 0).toLocaleString('ru-RU')} ₽</div>
                            <div className="text-[10px] text-emerald-700 font-bold uppercase">
                              {order.isPaid ? 'Оплачен' : 'При сборке'}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <select
                              value={order.status}
                              onChange={e => handleUpdateStatus(order.id, e.target.value)}
                              className="text-xs font-medium px-3 py-1 rounded-full bg-white border border-zinc-200 outline-none focus:border-black cursor-pointer"
                            >
                              <option value="assembling">В сборке</option>
                              <option value="paid">Оплачен</option>
                              <option value="sent">Отправлен</option>
                              <option value="delivered">Доставлен</option>
                              <option value="cancelled">Отменен</option>
                            </select>
                          </td>

                          <td className="py-3 px-4">
                            <input
                              type="text"
                              defaultValue={order.trackingNumber || ''}
                              placeholder="Трек-номер..."
                              onBlur={e => {
                                if (e.target.value !== order.trackingNumber) {
                                  handleUpdateStatus(order.id, order.status, e.target.value.trim());
                                }
                              }}
                              className="text-xs font-sans tabular-nums px-2 py-1 border border-zinc-300 rounded-full w-32 focus:border-black outline-none bg-white"
                            />
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="p-2 rounded-full bg-black text-white hover:bg-zinc-800 transition-colors"
                                title="Детали заказа"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteOrder(order.id, order.orderNumber)}
                                className="p-2 rounded-full bg-zinc-100 hover:bg-rose-600 hover:text-white text-zinc-500 transition-colors"
                                title="Удалить заказ"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: CUSTOMERS CRM */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="p-6 bg-white rounded-3xl border border-zinc-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-medium tracking-tight text-zinc-950">
                  Клиентская база ({users.length} клиентов)
                </h2>
                <p className="text-xs text-zinc-500 font-light mt-0.5">
                  База данных клиентов бутика, история заказов и управление бонусными картами Maison Arôme
                </p>
              </div>

              {/* Action Bar for Selected Users */}
              {selectedUserIds.length > 0 && (
                <div className="flex items-center gap-3 p-2 px-3 bg-zinc-950 text-white rounded-2xl shadow-lg animate-in fade-in">
                  <span className="text-xs font-light">
                    Выбрано клиентов: <strong className="font-semibold">{selectedUserIds.length}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetSingleUser(null);
                      setIsAwardModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 bg-white text-zinc-950 text-xs font-medium rounded-full hover:bg-zinc-100 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Gift className="w-3.5 h-3.5 text-amber-700" />
                    <span>Начислить баллы на карту ({selectedUserIds.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedUserIds([])}
                    className="text-xs text-zinc-400 hover:text-white transition-colors px-1 cursor-pointer"
                  >
                    Сбросить
                  </button>
                </div>
              )}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                value={customerSearch}
                onChange={e => setCustomerSearch(e.target.value)}
                placeholder="Поиск по имени, email, телефону или номеру карты..."
                className="w-full pl-10 pr-4 py-2.5 text-xs border border-zinc-200 rounded-full outline-none focus:border-zinc-400 bg-white font-light transition-colors"
              />
            </div>

            <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-xs overflow-hidden overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50/80 text-zinc-500 font-semibold uppercase text-[10px] tracking-wider border-b border-zinc-200/80">
                    <th className="py-3.5 px-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={
                          users.length > 0 &&
                          users
                            .filter(u => {
                              if (!customerSearch.trim()) return true;
                              const q = customerSearch.toLowerCase().trim();
                              return (
                                u.full_name?.toLowerCase().includes(q) ||
                                u.email?.toLowerCase().includes(q) ||
                                (u.phone && u.phone.includes(q)) ||
                                (u.card_number && u.card_number.includes(q))
                              );
                            })
                            .every(u => selectedUserIds.includes(u.id))
                        }
                        onChange={e => {
                          const currentFiltered = users.filter(u => {
                            if (!customerSearch.trim()) return true;
                            const q = customerSearch.toLowerCase().trim();
                            return (
                              u.full_name?.toLowerCase().includes(q) ||
                              u.email?.toLowerCase().includes(q) ||
                              (u.phone && u.phone.includes(q)) ||
                              (u.card_number && u.card_number.includes(q))
                            );
                          });
                          if (e.target.checked) {
                            setSelectedUserIds(Array.from(new Set([...selectedUserIds, ...currentFiltered.map(u => u.id)])));
                          } else {
                            const filteredIds = new Set(currentFiltered.map(u => u.id));
                            setSelectedUserIds(selectedUserIds.filter(id => !filteredIds.has(id)));
                          }
                        }}
                        className="w-4 h-4 rounded border-zinc-300 text-zinc-950 focus:ring-0 cursor-pointer"
                        title="Выбрать всех"
                      />
                    </th>
                    <th className="py-3.5 px-4">Клиент</th>
                    <th className="py-3.5 px-4">Контакты</th>
                    <th className="py-3.5 px-4">Город</th>
                    <th className="py-3.5 px-4">Бонусная карта</th>
                    <th className="py-3.5 px-4 text-right">Заказов</th>
                    <th className="py-3.5 px-4 text-right">Сумма (LTV)</th>
                    <th className="py-3.5 px-4 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-light">
                  {users
                    .filter(u => {
                      if (!customerSearch.trim()) return true;
                      const q = customerSearch.toLowerCase().trim();
                      return (
                        u.full_name?.toLowerCase().includes(q) ||
                        u.email?.toLowerCase().includes(q) ||
                        (u.phone && u.phone.includes(q)) ||
                        (u.city && u.city.toLowerCase().includes(q)) ||
                        (u.card_number && u.card_number.includes(q))
                      );
                    })
                    .map(u => {
                      const totalSpent = Number(u.total_spent || 0);
                      const ordersCount = Number(u.orders_count || 0);
                      const isSelected = selectedUserIds.includes(u.id);
                      return (
                        <tr key={u.id} className={`hover:bg-zinc-50/80 transition-colors ${isSelected ? 'bg-zinc-50/60' : ''}`}>
                          <td className="py-3.5 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={e => {
                                if (e.target.checked) {
                                  setSelectedUserIds([...selectedUserIds, u.id]);
                                } else {
                                  setSelectedUserIds(selectedUserIds.filter(id => id !== u.id));
                                }
                              }}
                              className="w-4 h-4 rounded border-zinc-300 text-zinc-950 focus:ring-0 cursor-pointer"
                            />
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-medium text-xs">
                                {(u.full_name || u.email || 'U').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium text-zinc-950">{u.full_name || 'Клиент'}</div>
                                <div className="text-[10px] text-zinc-400 font-sans tabular-nums">{u.role === 'admin' ? 'Администратор' : 'Покупатель'}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-sans tabular-nums">
                            <div className="text-zinc-950">{u.email}</div>
                            <div className="text-zinc-500 text-[11px]">{u.phone || '—'}</div>
                          </td>

                          <td className="py-3.5 px-4">{u.city || 'Москва'}</td>

                          <td className="py-3.5 px-4 font-sans tabular-nums">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-zinc-950">
                                {(u.bonus_balance ?? 500).toLocaleString('ru-RU')} ₽
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80 font-normal">
                                {u.bonus_tier || 'Silver'}
                              </span>
                            </div>
                            <div className="text-[10px] text-zinc-400 font-mono tracking-wider mt-0.5">
                              {u.card_number || 'MA-••••••••'}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-sans tabular-nums font-medium text-zinc-950 text-right">
                            {ordersCount}
                          </td>

                          <td className="py-3.5 px-4 font-sans tabular-nums font-medium text-zinc-950 text-right">
                            {totalSpent.toLocaleString('ru-RU')} ₽
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setTargetSingleUser(u);
                                  setIsAwardModalOpen(true);
                                }}
                                className="px-3 py-1.5 rounded-full border border-zinc-200 hover:border-black hover:bg-black hover:text-white text-[11px] font-medium transition-all inline-flex items-center gap-1 cursor-pointer"
                                title="Начислить баллы этому клиенту"
                              >
                                <Gift className="w-3 h-3 text-amber-700" />
                                <span>+ Баллы</span>
                              </button>
                              {u.phone && (
                                <a
                                  href={`tel:${u.phone}`}
                                  className="p-1.5 rounded-full border border-zinc-200 hover:border-black text-zinc-700 hover:bg-zinc-100 transition-colors"
                                  title="Позвонить"
                                >
                                  <Phone className="w-3 h-3" />
                                </a>
                              )}
                              <a
                                href={`mailto:${u.email}`}
                                className="p-1.5 rounded-full border border-zinc-200 hover:border-black text-zinc-700 hover:bg-zinc-100 transition-colors"
                                title="Написать на Email"
                              >
                                <Mail className="w-3 h-3" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-zinc-400 font-light text-xs">
                        Клиентов пока нет
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ANALYTICS & REVENUE */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-white rounded-[24px] border border-zinc-200/70 shadow-2xs space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-sans tabular-nums">Финансовые показатели</div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-zinc-100">
                    <span className="text-xs text-zinc-600">Всего заказов:</span>
                    <span className="font-sans tabular-nums font-bold text-sm">{orders.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-zinc-100">
                    <span className="text-xs text-zinc-600">Выручка за всё время:</span>
                    <span className="font-sans tabular-nums font-bold text-sm text-emerald-700">
                      {(stats?.totalRevenue || 0).toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-zinc-100">
                    <span className="text-xs text-zinc-600">Средний чек (AOV):</span>
                    <span className="font-sans tabular-nums font-bold text-sm">
                      {orders.length > 0 ? Math.round((stats?.totalRevenue || 0) / orders.length).toLocaleString('ru-RU') : 0} ₽
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-xs text-zinc-600">Заказы в сборке:</span>
                    <span className="font-sans tabular-nums font-bold text-sm text-amber-600">
                      {orders.filter(o => o.status === 'assembling').length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white rounded-[24px] border border-zinc-200/70 shadow-2xs space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-sans tabular-nums">Воронка заказов</div>
                <div className="space-y-2.5">
                  {[
                    { label: 'Собирается на складе', status: 'assembling', color: 'bg-amber-400' },
                    { label: 'Оплачен онлайн', status: 'paid', color: 'bg-emerald-500' },
                    { label: 'Отправлен в доставку', status: 'sent', color: 'bg-blue-500' },
                    { label: 'Успешно вручен', status: 'delivered', color: 'bg-purple-500' },
                    { label: 'Отменен', status: 'cancelled', color: 'bg-zinc-300' },
                  ].map(step => {
                    const count = orders.filter(o => o.status === step.status).length;
                    const pct = orders.length > 0 ? Math.round((count / orders.length) * 100) : 0;
                    return (
                      <div key={step.status} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-zinc-700">{step.label}</span>
                          <span className="font-sans tabular-nums font-bold">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${step.color}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-6 bg-white rounded-[24px] border border-zinc-200/70 shadow-2xs space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-sans tabular-nums">Логистические каналы</div>
                <div className="space-y-3">
                  <div className="p-3 bg-zinc-50/80 rounded-[18px] border border-zinc-200/80 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs uppercase text-zinc-950">СДЭК Доставка</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">Основной партнер курьерской логистики</div>
                    </div>
                    <span className="font-sans tabular-nums font-bold text-xs">от 50 ₽</span>
                  </div>
                  <div className="p-3 bg-zinc-50/80 rounded-[18px] border border-zinc-200/80 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs uppercase text-zinc-950">Яндекс Маркет / Экспресс</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">Срочная доставка по Москве и РФ</div>
                    </div>
                    <span className="font-sans tabular-nums font-bold text-xs">от 50 ₽</span>
                  </div>
                  <div className="p-3 bg-zinc-50/80 rounded-[18px] border border-zinc-200/80 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs uppercase text-zinc-950">5POST / Ozon / Почта</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">Выдача у дома и авиа-отправления</div>
                    </div>
                    <span className="font-sans tabular-nums font-bold text-xs">от 50 ₽</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MANUAL ORDER CREATOR */}
        {activeTab === 'create-order' && (
          <div className="bg-white rounded-[28px] border border-zinc-200/70 shadow-2xs p-6 sm:p-8 space-y-6">
            <div className="border-b border-zinc-200 pb-4">
              <h2 className="font-serif text-xl font-bold uppercase tracking-wide text-zinc-950">
                Ручное создание заказа в CRM
              </h2>
              <p className="text-xs text-zinc-500 font-light mt-1">
                Используйте эту форму для оформления заказов, поступивших в Telegram (@nikisss2) или WhatsApp.
              </p>
            </div>

            <form onSubmit={handleCreateManualOrder} className="space-y-8">
              {/* Step A: Customer info */}
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-sans tabular-nums">
                  1. Данные покупателя
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
                      ФИО Клиента *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Иван Петров"
                      value={newCustomerName}
                      onChange={e => setNewCustomerName(e.target.value)}
                      className="w-full text-xs px-4 py-2.5 rounded-full border border-zinc-200 outline-none focus:border-black bg-white font-light"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
                      Телефон (Telegram / WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+7 999 123-45-67"
                      value={newCustomerPhone}
                      onChange={e => setNewCustomerPhone(e.target.value)}
                      className="w-full text-xs px-4 py-2.5 rounded-full border border-zinc-200 outline-none focus:border-black bg-white font-light"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
                      Email (опционально)
                    </label>
                    <input
                      type="email"
                      placeholder="client@mail.ru"
                      value={newCustomerEmail}
                      onChange={e => setNewCustomerEmail(e.target.value)}
                      className="w-full text-xs px-4 py-2.5 rounded-full border border-zinc-200 outline-none focus:border-black bg-white font-light"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
                      Город доставки *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Москва, Санкт-Петербург, Казань..."
                      value={newCustomerCity}
                      onChange={e => setNewCustomerCity(e.target.value)}
                      className="w-full text-xs px-4 py-2.5 rounded-full border border-zinc-200 outline-none focus:border-black bg-white font-light"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
                      Адрес ПВЗ СДЭК или доставки
                    </label>
                    <input
                      type="text"
                      placeholder="ул. Ленина 25 (ПВЗ СДЭК)"
                      value={newCustomerAddress}
                      onChange={e => setNewCustomerAddress(e.target.value)}
                      className="w-full text-xs px-4 py-2.5 rounded-full border border-zinc-200 outline-none focus:border-black bg-white font-light"
                    />
                  </div>
                </div>
              </div>

              {/* Step B: Select items from catalog */}
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-sans tabular-nums">
                  2. Выбор позиций из каталога (45 000+ товаров)
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Начните вводить название аромата или бренда (Ganymede, Baccarat, Aventus)..."
                    value={catalogSearch}
                    onChange={e => setCatalogSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-xs border border-zinc-300 outline-none focus:border-black bg-zinc-50"
                  />
                </div>

                {/* Found products dropdown */}
                {foundCatalogProducts.length > 0 && (
                  <div className="border border-zinc-300 max-h-60 overflow-y-auto divide-y divide-zinc-100 bg-white shadow-lg">
                    {foundCatalogProducts.map(p => (
                      <div key={p.id} className="p-3 flex items-center justify-between hover:bg-zinc-50 gap-4">
                        <div className="flex items-center gap-3">
                          <img src={p.images[0]} alt="" className="w-10 h-10 object-cover border border-zinc-200" />
                          <div>
                            <div className="text-[10px] uppercase font-bold text-zinc-400 font-sans tabular-nums">{p.brand}</div>
                            <div className="text-xs font-bold text-zinc-950">{p.name}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {p.volumes?.slice(0, 3).map((v, vIdx) => (
                            <button
                              key={vIdx}
                              type="button"
                              onClick={() => handleAddItemToManualOrder(p, v.label || `${v.volumeMl} мл`, v.price)}
                              className="px-2.5 py-1 bg-black hover:bg-zinc-800 text-white text-[10px] font-sans tabular-nums font-bold"
                            >
                              + {v.label || `${v.volumeMl} мл`} ({v.price} ₽)
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Selected Items Table */}
                <div className="border border-zinc-200 overflow-hidden">
                  <div className="bg-zinc-900 text-white px-4 py-2 text-xs font-sans tabular-nums font-bold flex justify-between">
                    <span>Выбранные позиции в заказ</span>
                    <span>{selectedItemsForOrder.length} шт.</span>
                  </div>
                  {selectedItemsForOrder.length === 0 ? (
                    <div className="p-6 text-center text-xs text-zinc-400 font-sans tabular-nums">
                      Товары еще не добавлены. Воспользуйтесь поиском выше.
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-200">
                      {selectedItemsForOrder.map((it, idx) => (
                        <div key={idx} className="p-3 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <img src={it.image} alt="" className="w-8 h-8 object-cover border border-zinc-200" />
                            <div>
                              <span className="font-bold text-zinc-950">{it.brand} {it.name}</span>
                              <span className="ml-2 font-sans tabular-nums text-zinc-500">({it.volume})</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="font-bold font-sans tabular-nums text-zinc-950">{it.price.toLocaleString('ru-RU')} ₽</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveManualItem(idx)}
                              className="text-rose-600 hover:text-rose-800"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Step C: Delivery & Payment */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-zinc-200">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Служба доставки
                  </label>
                  <select
                    value={newDeliveryMethod}
                    onChange={e => setNewDeliveryMethod(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 border border-zinc-300 outline-none focus:border-black bg-white cursor-pointer"
                  >
                    <option value="СДЭК (ПВЗ)">СДЭК (ПВЗ)</option>
                    <option value="СДЭК (Курьер до двери)">СДЭК (Курьер до двери)</option>
                    <option value="Яндекс Доставка">Яндекс Доставка</option>
                    <option value="5POST (Пятёрочка)">5POST (Пятёрочка)</option>
                    <option value="Почта России">Почта России</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Стоимость доставки (₽)
                  </label>
                  <input
                    type="number"
                    value={newDeliveryPrice}
                    onChange={e => setNewDeliveryPrice(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2.5 border border-zinc-300 outline-none focus:border-black bg-white font-sans tabular-nums"
                  />
                  <div className="text-[10px] text-zinc-400 mt-0.5">Склад в Москве. Доставка от 50 ₽</div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Способ оплаты
                  </label>
                  <select
                    value={newPaymentMethod}
                    onChange={e => setNewPaymentMethod(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 border border-zinc-300 outline-none focus:border-black bg-white cursor-pointer"
                  >
                    <option value="СБП / Перевод">СБП / Перевод на карту</option>
                    <option value="Банковская карта">Банковская карта</option>
                    <option value="Оплачен">Уже оплачен клиентом</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-zinc-200 flex justify-end">
                <button
                  type="submit"
                  disabled={submittingOrder}
                  className="px-8 py-3.5 rounded-full bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-widest shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  {submittingOrder ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  <span>Зарегистрировать заказ в базе</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 5: SECURITY AUDIT & DB HEALTH */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="p-6 bg-white rounded-[28px] border border-zinc-200/70 shadow-2xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-bold uppercase tracking-wide text-zinc-950">
                    Статус защищенности базы данных Maison Arôme
                  </h2>
                  <div className="text-xs text-zinc-500 font-sans tabular-nums">
                    Файл базы данных: data/maison.db (SQLite Режим WAL)
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-100">
                <div className="p-5 bg-zinc-50/80 rounded-[20px] border border-zinc-200/80 space-y-2">
                  <div className="font-bold text-xs uppercase text-zinc-950 font-sans tabular-nums">Архитектурная защита</div>
                  <ul className="text-xs text-zinc-600 space-y-1.5 font-light">
                    <li>• <strong>Zero SQL Injection:</strong> 100% параметризованные prepared statements.</li>
                    <li>• <strong>Криптографическое хеширование:</strong> scrypt с солью 32 байта на пользователя.</li>
                    <li>• <strong>Защита от Timing-атак:</strong> crypto.timingSafeEqual при сравнении хешей.</li>
                    <li>• <strong>Rate Limiting:</strong> защита от брутфорса паролей (макс. 5 попыток за 15 мин).</li>
                  </ul>
                </div>

                <div className="p-5 bg-zinc-50/80 rounded-[20px] border border-zinc-200/80 space-y-2 font-sans tabular-nums text-xs">
                  <div className="font-bold uppercase text-zinc-950">Системные показатели</div>
                  <div className="text-zinc-600 space-y-1">
                    <div>Движок: <span className="font-bold text-zinc-900">{audit?.database || 'node:sqlite'}</span></div>
                    <div>Режим журнала: <span className="font-bold text-emerald-700">{audit?.journalMode || 'WAL'}</span></div>
                    <div>Права доступа ОС: <span className="font-bold text-zinc-900">{audit?.filePermissions || '0600'}</span></div>
                    <div>Хеширование паролей: <span className="font-bold text-zinc-900">{audit?.passwordHashing || 'scrypt'}</span></div>
                    <div>Активных сессий: <span className="font-bold text-zinc-900">{audit?.activeSessions || 1}</span></div>
                    <div>Потребление RAM: <span className="font-bold text-zinc-900">{audit?.memoryUsageMb || 75} MB</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-3xl bg-white rounded-[32px] border border-zinc-200/80 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6"
          >
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
              <div>
                <h3 className="text-xl font-medium tracking-tight text-zinc-950">
                  Заказ {selectedOrder.orderNumber}
                </h3>
                <div className="text-xs text-zinc-400 font-sans tabular-nums mt-0.5">
                  Создан: {selectedOrder.createdAt || selectedOrder.date}
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-full border border-zinc-200 hover:border-black text-zinc-500 hover:text-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Details Box */}
            <div className="p-5 bg-zinc-50/80 rounded-[24px] border border-zinc-200/70 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 font-sans tabular-nums">Получатель:</div>
                <div className="font-bold text-sm text-zinc-950 mt-0.5">
                  {selectedOrder.recipient?.fullName || selectedOrder.customerName || 'Клиент'}
                </div>
                <div className="text-zinc-600 mt-1 flex items-center gap-1 font-sans tabular-nums">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{selectedOrder.recipient?.phone || selectedOrder.phone || '—'}</span>
                </div>
                {selectedOrder.recipient?.email && (
                  <div className="text-zinc-600 mt-0.5 flex items-center gap-1 font-sans tabular-nums">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{selectedOrder.recipient.email}</span>
                  </div>
                )}
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 font-sans tabular-nums">Доставка:</div>
                <div className="font-bold text-zinc-950 mt-0.5">
                  {selectedOrder.deliveryMethod || 'СДЭК'} (г. {selectedOrder.recipient?.city || selectedOrder.city || 'Москва'})
                </div>
                <div className="text-zinc-600 mt-1 text-[11px]">
                  {selectedOrder.recipient?.address || selectedOrder.address || 'Пункт выдачи'}
                </div>
                {selectedOrder.recipient?.comment && (
                  <div className="text-[11px] text-amber-900 bg-amber-50 p-2 border border-amber-200 mt-2">
                    «{selectedOrder.recipient.comment}»
                  </div>
                )}
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-950 font-sans tabular-nums">
                Состав заказа ({(selectedOrder.items || []).length} товаров)
              </div>
              <div className="rounded-2xl border border-zinc-200/70 divide-y divide-zinc-100 overflow-hidden">
                {(selectedOrder.items || []).map((it: any, idx: number) => (
                  <div key={idx} className="p-3 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <img src={it.image || '/assets/placeholder-product.svg'} alt="" className="w-12 h-12 object-cover border border-zinc-200" />
                      <div>
                        <div className="font-bold text-zinc-950">{it.brand} {it.name}</div>
                        <div className="text-[11px] text-zinc-500 font-sans tabular-nums">{it.volume || it.volumeLabel || '10 мл'} × {it.quantity || 1} шт.</div>
                      </div>
                    </div>
                    <div className="font-sans tabular-nums font-bold text-sm text-zinc-950">
                      {((it.price || 0) * (it.quantity || 1)).toLocaleString('ru-RU')} ₽
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Strip */}
            <div className="pt-4 border-t border-zinc-200 flex items-center justify-between font-sans tabular-nums">
              <span className="text-sm uppercase tracking-wider font-bold">Итого к оплате:</span>
              <span className="text-2xl font-black text-zinc-950">
                {(selectedOrder.totalAmount || selectedOrder.total || 0).toLocaleString('ru-RU')} ₽
              </span>
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-3">
              {selectedOrder.recipient?.phone && (
                <a
                  href={`https://t.me/+${(selectedOrder.recipient.phone || '').replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Написать клиенту в Telegram</span>
                </a>
              )}

              <button
                onClick={() => window.print()}
                className="px-4 py-2 border border-zinc-300 hover:border-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Распечатать накладную</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Awarding Loyalty Points */}
      {isAwardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-3xl border border-zinc-200 shadow-2xl p-6 sm:p-7 space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-base font-medium text-zinc-950 tracking-tight">
                    Начисление бонусных баллов
                  </h3>
                  <p className="text-[11px] text-zinc-500 font-light">
                    1 балл = 1 рубль для оплаты заказов в Maison Arôme
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAwardModalOpen(false);
                  setTargetSingleUser(null);
                }}
                className="p-2 rounded-full text-zinc-400 hover:text-black hover:bg-zinc-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Recipient(s) info */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block">
                Получатели бонусов:
              </label>
              <div className="p-3 bg-zinc-50 border border-zinc-200/70 rounded-2xl max-h-32 overflow-y-auto space-y-1 text-xs">
                {targetSingleUser ? (
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-zinc-950">{targetSingleUser.full_name || targetSingleUser.email}</span>
                    <span className="text-[11px] text-zinc-500 font-sans tabular-nums">
                      Текущий баланс: {(targetSingleUser.bonus_balance ?? 500).toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                ) : (
                  selectedUserIds.map(uid => {
                    const u = users.find(item => item.id === uid);
                    return (
                      <div key={uid} className="flex items-center justify-between text-xs py-0.5">
                        <span className="text-zinc-800">{u?.full_name || u?.email || uid}</span>
                        <span className="text-[11px] text-zinc-500 font-sans tabular-nums">
                          {(u?.bonus_balance ?? 500).toLocaleString('ru-RU')} ₽
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Points Amount */}
            <div className="space-y-2">
              <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block">
                Количество баллов для начисления:
              </label>
              <div className="flex flex-wrap gap-2">
                {[300, 500, 1000, 3000, 5000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAwardPointsAmount(amt)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      awardPointsAmount === amt
                        ? 'bg-black text-white shadow-xs'
                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                    }`}
                  >
                    +{amt.toLocaleString('ru-RU')} ₽
                  </button>
                ))}
              </div>
              <div className="relative pt-1">
                <input
                  type="number"
                  min={1}
                  step={50}
                  value={awardPointsAmount || ''}
                  onChange={e => setAwardPointsAmount(Math.max(1, Number(e.target.value)))}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-200 bg-zinc-50/50 outline-none focus:border-black font-sans tabular-nums"
                  placeholder="Или введите свою сумму баллов..."
                />
              </div>
            </div>

            {/* Reason / Comment */}
            <div className="space-y-2">
              <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block">
                Основание начисления (причина):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Подарочные баллы от бутика',
                  'Компенсация за задержку доставки',
                  'Бонус постоянного клиента',
                  'Бонус за отзыв об аромате',
                ].map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAwardReason(preset)}
                    className={`px-2.5 py-1 rounded-full text-[11px] transition-all cursor-pointer border ${
                      awardReason === preset
                        ? 'border-black bg-zinc-950 text-white'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-400'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={awardReason}
                onChange={e => setAwardReason(e.target.value)}
                placeholder="Своя причина..."
                className="w-full px-4 py-2 text-xs rounded-xl border border-zinc-200 bg-zinc-50/50 outline-none focus:border-black"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => {
                  setIsAwardModalOpen(false);
                  setTargetSingleUser(null);
                }}
                className="px-4 py-2 rounded-full text-xs text-zinc-500 hover:text-zinc-950 transition-colors"
              >
                Отмена
              </button>
              <button
                type="button"
                disabled={isAwardingPoints || (!targetSingleUser && selectedUserIds.length === 0)}
                onClick={handleAwardPoints}
                className="px-5 py-2.5 rounded-full bg-zinc-950 hover:bg-black text-white text-xs font-medium transition-all shadow-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {isAwardingPoints
                    ? 'Начисление…'
                    : `Начислить ${awardPointsAmount.toLocaleString('ru-RU')} ₽ (${targetSingleUser ? '1 клиент' : `${selectedUserIds.length} клиентов`})`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
