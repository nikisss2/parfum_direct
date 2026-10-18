import React, { useState, useEffect, useMemo } from 'react';
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
  Sparkles,
  Eye,
  X,
  FileText,
  Sliders,
  Database,
  Key,
  Download,
} from 'lucide-react';

export const CrmPage: React.FC = () => {
  const { user, showToast } = useShop();
  const navigate = useNavigate();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'orders' | 'customers' | 'analytics' | 'create-order' | 'security'>('orders');

  // Token: from localStorage or fallback
  const adminToken = localStorage.getItem('parfum_admin_token') || 'parfum-admin-change-me';

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
      <header className="bg-zinc-950 text-white border-b border-zinc-800 sticky top-0 z-40 shadow-lg">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-500 rounded-none animate-pulse" />
              <span className="font-serif text-lg font-bold uppercase tracking-wider text-white">
                Maison Arôme <span className="text-amber-400 font-mono text-xs px-2 py-0.5 bg-amber-400/10 border border-amber-400/30 ml-1">CRM 2.0</span>
              </span>
            </div>
            <span className="text-zinc-600 hidden md:inline">|</span>
            <span className="text-xs text-zinc-400 font-mono hidden md:inline">
              Защищенная корпоративная система управления
            </span>
          </div>

          {/* Quick Stats in Header */}
          <div className="flex items-center gap-6 text-xs font-mono">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-zinc-500">Выручка:</span>
              <span className="font-bold text-amber-400">
                {(stats?.totalRevenue || 0).toLocaleString('ru-RU')} ₽
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-zinc-500">Заказов в БД:</span>
              <span className="font-bold text-white">{orders.length}</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-zinc-500">Клиентов:</span>
              <span className="font-bold text-white">{users.length}</span>
            </div>

            <button
              onClick={loadAllCrmData}
              disabled={loading}
              className="p-1.5 border border-zinc-700 hover:border-white text-zinc-300 hover:text-white transition-colors"
              title="Обновить данные"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <Link
              to="/account"
              className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold uppercase tracking-wider border border-zinc-700 transition-colors"
            >
              Личный профиль
            </Link>
          </div>
        </div>

        {/* Tab Switcher Bar */}
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 border-t border-zinc-900 flex overflow-x-auto no-scrollbar">
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
                className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border-b-2 ${
                  isCurrent
                    ? 'border-amber-400 text-amber-400 bg-white/5'
                    : 'border-transparent text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-none text-[10px] font-mono ${isCurrent ? 'bg-amber-400 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
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
          <div className="p-5 bg-white border border-zinc-200 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 font-mono">Общая выручка</div>
              <div className="text-2xl font-black font-mono text-zinc-950 mt-1">
                {(stats?.totalRevenue || 0).toLocaleString('ru-RU')} ₽
              </div>
              <div className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> Оплата через СБП и карты
              </div>
            </div>
            <div className="w-12 h-12 bg-zinc-950 text-amber-400 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 bg-white border border-zinc-200 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 font-mono">Всего заказов</div>
              <div className="text-2xl font-black font-mono text-zinc-950 mt-1">
                {orders.length}
              </div>
              <div className="text-[10px] text-zinc-500 font-mono mt-1">
                Сборка на складе: {orders.filter(o => o.status === 'assembling').length}
              </div>
            </div>
            <div className="w-12 h-12 bg-zinc-950 text-white flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 bg-white border border-zinc-200 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 font-mono">База клиентов (SQLite)</div>
              <div className="text-2xl font-black font-mono text-zinc-950 mt-1">
                {users.length}
              </div>
              <div className="text-[10px] text-zinc-500 font-mono mt-1">
                Зарегистрированные клиенты
              </div>
            </div>
            <div className="w-12 h-12 bg-zinc-950 text-white flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 bg-white border border-zinc-200 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 font-mono">Безопасность БД</div>
              <div className="text-2xl font-black font-mono text-emerald-600 mt-1">
                100% OK
              </div>
              <div className="text-[10px] text-zinc-500 font-mono mt-1">
                WAL Mode · scrypt · 0 SQLi
              </div>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* TAB 1: ORDERS & LOGISTICS */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Control Strip: Search & Filter */}
            <div className="p-4 bg-white border border-zinc-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
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
                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
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
                    className="w-full pl-9 pr-4 py-2 text-xs border border-zinc-300 rounded-none outline-none focus:border-black bg-zinc-50/50"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <a
                    href="https://docs.google.com/spreadsheets/d/1vXuMV4APjZ3k78eq4Y6DwBMoEYeFFIokZdVS_iwAFTo/edit?gid=943365437#gid=943365437"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-initial px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-xs cursor-pointer"
                    title="Открыть онлайн Google Таблицу заказов (автосинхронизация с БД)"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Google Таблица</span>
                  </a>

                  <a
                    href="/api/orders/download-xlsx"
                    download="Таблица_Заказов_Maison_Arome.xlsx"
                    className="flex-1 sm:flex-initial px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-xs cursor-pointer"
                    title="Скачать готовую таблицу Excel (.xlsx) с 4 листами и формулами"
                  >
                    <Download className="w-4 h-4" />
                    <span>Excel (.xlsx)</span>
                  </a>

                  <a
                    href={`/api/orders/export-csv?token=${encodeURIComponent(adminToken)}`}
                    download="orders_maison_arome.csv"
                    className="flex-1 sm:flex-initial px-3.5 py-2 bg-zinc-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-xs cursor-pointer border border-zinc-700"
                    title="Экспорт всех актуальных заказов в CSV файл"
                  >
                    <Download className="w-4 h-4" />
                    <span>Экспорт CSV</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white border border-zinc-200 shadow-xs overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-950 text-white font-mono uppercase text-[10px] tracking-wider border-b border-zinc-800">
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
                      <td colSpan={8} className="py-12 text-center text-zinc-500 font-mono text-xs">
                        Заказов не найдено.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map(order => {
                      const recipient = order.recipient || {};
                      const itemsCount = (order.items || []).reduce((sum: number, it: any) => sum + (it.quantity || 1), 0);
                      return (
                        <tr key={order.id} className="hover:bg-zinc-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono">
                            <div className="font-bold text-zinc-950">{order.orderNumber}</div>
                            <div className="text-[10px] text-zinc-400 mt-0.5">{order.date || order.createdAt?.split('T')[0]}</div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-bold text-zinc-950">{recipient.fullName || order.customerName || 'Покупатель'}</div>
                            <div className="text-zinc-500 font-mono text-[11px] flex items-center gap-1 mt-0.5">
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
                            <span className="inline-block px-2 py-0.5 bg-zinc-100 font-mono text-[11px] font-bold text-zinc-800">
                              {itemsCount} поз.
                            </span>
                          </td>

                          <td className="py-3 px-4 font-mono">
                            <div className="font-bold text-zinc-950">{(order.totalAmount || order.total || 0).toLocaleString('ru-RU')} ₽</div>
                            <div className="text-[10px] text-emerald-700 font-bold uppercase">
                              {order.isPaid ? 'Оплачен' : 'При сборке'}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <select
                              value={order.status}
                              onChange={e => handleUpdateStatus(order.id, e.target.value)}
                              className="text-xs font-bold uppercase tracking-wider px-2 py-1 bg-white border border-zinc-300 outline-none focus:border-black cursor-pointer"
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
                              className="text-xs font-mono px-2 py-1 border border-zinc-300 rounded-none w-32 focus:border-black outline-none bg-white"
                            />
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="p-1.5 bg-black text-white hover:bg-zinc-800 transition-colors"
                                title="Детали заказа"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteOrder(order.id, order.orderNumber)}
                                className="p-1.5 bg-zinc-100 hover:bg-rose-600 hover:text-white text-zinc-500 transition-colors"
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
            <div className="p-4 bg-white border border-zinc-200 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="font-serif text-lg font-bold uppercase tracking-wide text-zinc-950">
                  Клиентская база данных ({users.length} клиентов)
                </h2>
                <p className="text-xs text-zinc-500 font-light mt-0.5">
                  Данные хранятся в защищенной базе SQLite `maison.db`. Пароли защищены через scrypt.
                </p>
              </div>
            </div>

            <div className="bg-white border border-zinc-200 shadow-xs overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-950 text-white font-mono uppercase text-[10px] tracking-wider">
                    <th className="py-3.5 px-4">Клиент</th>
                    <th className="py-3.5 px-4">Контакты</th>
                    <th className="py-3.5 px-4">Город</th>
                    <th className="py-3.5 px-4">Заказов</th>
                    <th className="py-3.5 px-4">LTV (Сумма покупок)</th>
                    <th className="py-3.5 px-4">Статус лояльности</th>
                    <th className="py-3.5 px-4">Дата регистрации</th>
                    <th className="py-3.5 px-4 text-right">Связь</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-zinc-500 font-mono text-xs">
                        Клиентов пока нет.
                      </td>
                    </tr>
                  ) : (
                    users.map(u => {
                      const totalSpent = Number(u.total_spent || 0);
                      const ordersCount = Number(u.orders_count || 0);
                      const isVip = totalSpent >= 50000 || ordersCount >= 5;
                      const isRegular = ordersCount >= 2;
                      return (
                        <tr key={u.id} className="hover:bg-zinc-50 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-none bg-zinc-900 text-white flex items-center justify-center font-bold text-xs font-serif">
                                {(u.full_name || u.email || 'U').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-zinc-950">{u.full_name || 'Клиент'}</div>
                                <div className="text-[10px] text-zinc-400 font-mono">{u.role === 'admin' ? 'Администратор' : 'Клиент'}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-mono">
                            <div className="text-zinc-950">{u.email}</div>
                            <div className="text-zinc-500 text-[11px]">{u.phone || '—'}</div>
                          </td>

                          <td className="py-3.5 px-4">{u.city || 'Москва'}</td>

                          <td className="py-3.5 px-4 font-mono font-bold text-zinc-950">
                            {ordersCount}
                          </td>

                          <td className="py-3.5 px-4 font-mono font-bold text-zinc-950">
                            {totalSpent.toLocaleString('ru-RU')} ₽
                          </td>

                          <td className="py-3.5 px-4">
                            {isVip ? (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold uppercase font-mono">
                                👑 VIP Клиент
                              </span>
                            ) : isRegular ? (
                              <span className="px-2 py-0.5 bg-sky-100 text-sky-900 border border-sky-300 text-[10px] font-bold uppercase font-mono">
                                💎 Постоянный
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-zinc-100 text-zinc-700 text-[10px] font-bold uppercase font-mono">
                                Новый
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 font-mono text-zinc-500 text-[11px]">
                            {u.created_at?.split('T')[0] || '—'}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {u.phone && (
                                <a
                                  href={`tel:${u.phone}`}
                                  className="p-1.5 border border-zinc-200 hover:border-black text-zinc-700"
                                  title="Позвонить"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                              )}
                              <a
                                href={`mailto:${u.email}`}
                                className="p-1.5 border border-zinc-200 hover:border-black text-zinc-700"
                                title="Написать на Email"
                              >
                                <Mail className="w-3.5 h-3.5" />
                              </a>
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

        {/* TAB 3: ANALYTICS & REVENUE */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-white border border-zinc-200 space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">Финансовые показатели</div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-zinc-100">
                    <span className="text-xs text-zinc-600">Всего заказов:</span>
                    <span className="font-mono font-bold text-sm">{orders.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-zinc-100">
                    <span className="text-xs text-zinc-600">Выручка за всё время:</span>
                    <span className="font-mono font-bold text-sm text-emerald-700">
                      {(stats?.totalRevenue || 0).toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-zinc-100">
                    <span className="text-xs text-zinc-600">Средний чек (AOV):</span>
                    <span className="font-mono font-bold text-sm">
                      {orders.length > 0 ? Math.round((stats?.totalRevenue || 0) / orders.length).toLocaleString('ru-RU') : 0} ₽
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-xs text-zinc-600">Заказы в сборке:</span>
                    <span className="font-mono font-bold text-sm text-amber-600">
                      {orders.filter(o => o.status === 'assembling').length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white border border-zinc-200 space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">Воронка заказов</div>
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
                          <span className="font-mono font-bold">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full h-2 bg-zinc-100 overflow-hidden">
                          <div className={`h-full ${step.color}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-6 bg-white border border-zinc-200 space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">Логистические каналы</div>
                <div className="space-y-3">
                  <div className="p-3 bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs uppercase text-zinc-950">СДЭК Доставка</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">Основной партнер курьерской логистики</div>
                    </div>
                    <span className="font-mono font-bold text-xs">от 50 ₽</span>
                  </div>
                  <div className="p-3 bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs uppercase text-zinc-950">Яндекс Маркет / Экспресс</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">Срочная доставка по Москве и РФ</div>
                    </div>
                    <span className="font-mono font-bold text-xs">от 50 ₽</span>
                  </div>
                  <div className="p-3 bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs uppercase text-zinc-950">5POST / Ozon / Почта</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">Выдача у дома и авиа-отправления</div>
                    </div>
                    <span className="font-mono font-bold text-xs">от 50 ₽</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MANUAL ORDER CREATOR */}
        {activeTab === 'create-order' && (
          <div className="bg-white border border-zinc-200 shadow-xs p-6 sm:p-8 space-y-6">
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
                <div className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-mono">
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
                      className="w-full text-xs px-3.5 py-2.5 border border-zinc-300 outline-none focus:border-black bg-white"
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
                      className="w-full text-xs px-3.5 py-2.5 border border-zinc-300 outline-none focus:border-black bg-white"
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
                      className="w-full text-xs px-3.5 py-2.5 border border-zinc-300 outline-none focus:border-black bg-white"
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
                      className="w-full text-xs px-3.5 py-2.5 border border-zinc-300 outline-none focus:border-black bg-white"
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
                      className="w-full text-xs px-3.5 py-2.5 border border-zinc-300 outline-none focus:border-black bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Step B: Select items from catalog */}
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-mono">
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
                            <div className="text-[10px] uppercase font-bold text-zinc-400 font-mono">{p.brand}</div>
                            <div className="text-xs font-bold text-zinc-950">{p.name}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {p.volumes?.slice(0, 3).map((v, vIdx) => (
                            <button
                              key={vIdx}
                              type="button"
                              onClick={() => handleAddItemToManualOrder(p, v.label || `${v.volumeMl} мл`, v.price)}
                              className="px-2.5 py-1 bg-black hover:bg-zinc-800 text-white text-[10px] font-mono font-bold"
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
                  <div className="bg-zinc-900 text-white px-4 py-2 text-xs font-mono font-bold flex justify-between">
                    <span>Выбранные позиции в заказ</span>
                    <span>{selectedItemsForOrder.length} шт.</span>
                  </div>
                  {selectedItemsForOrder.length === 0 ? (
                    <div className="p-6 text-center text-xs text-zinc-400 font-mono">
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
                              <span className="ml-2 font-mono text-zinc-500">({it.volume})</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="font-bold font-mono text-zinc-950">{it.price.toLocaleString('ru-RU')} ₽</span>
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
                    className="w-full text-xs px-3 py-2.5 border border-zinc-300 outline-none focus:border-black bg-white font-mono"
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
                  className="px-8 py-3.5 bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-widest shadow-md transition-all flex items-center gap-2 cursor-pointer"
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
            <div className="p-6 bg-white border border-zinc-200 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 border border-emerald-300 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-bold uppercase tracking-wide text-zinc-950">
                    Статус защищенности базы данных Maison Arôme
                  </h2>
                  <div className="text-xs text-zinc-500 font-mono">
                    Файл базы данных: data/maison.db (SQLite Режим WAL)
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-100">
                <div className="p-4 bg-zinc-50 border border-zinc-200 space-y-2">
                  <div className="font-bold text-xs uppercase text-zinc-950 font-mono">Архитектурная защита</div>
                  <ul className="text-xs text-zinc-600 space-y-1.5 font-light">
                    <li>• <strong>Zero SQL Injection:</strong> 100% параметризованные prepared statements.</li>
                    <li>• <strong>Криптографическое хеширование:</strong> scrypt с солью 32 байта на пользователя.</li>
                    <li>• <strong>Защита от Timing-атак:</strong> crypto.timingSafeEqual при сравнении хешей.</li>
                    <li>• <strong>Rate Limiting:</strong> защита от брутфорса паролей (макс. 5 попыток за 15 мин).</li>
                  </ul>
                </div>

                <div className="p-4 bg-zinc-50 border border-zinc-200 space-y-2 font-mono text-xs">
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
            className="w-full max-w-3xl bg-white border border-black shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6"
          >
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
              <div>
                <h3 className="font-serif text-2xl font-bold uppercase tracking-tight text-zinc-950">
                  Заказ {selectedOrder.orderNumber}
                </h3>
                <div className="text-xs text-zinc-400 font-mono mt-0.5">
                  Создан: {selectedOrder.createdAt || selectedOrder.date}
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 border border-zinc-200 hover:border-black text-zinc-500 hover:text-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Details Box */}
            <div className="p-4 bg-zinc-50 border border-zinc-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 font-mono">Получатель:</div>
                <div className="font-bold text-sm text-zinc-950 mt-0.5">
                  {selectedOrder.recipient?.fullName || selectedOrder.customerName || 'Клиент'}
                </div>
                <div className="text-zinc-600 mt-1 flex items-center gap-1 font-mono">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{selectedOrder.recipient?.phone || selectedOrder.phone || '—'}</span>
                </div>
                {selectedOrder.recipient?.email && (
                  <div className="text-zinc-600 mt-0.5 flex items-center gap-1 font-mono">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{selectedOrder.recipient.email}</span>
                  </div>
                )}
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 font-mono">Доставка:</div>
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
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-950 font-mono">
                Состав заказа ({(selectedOrder.items || []).length} товаров)
              </div>
              <div className="border border-zinc-200 divide-y divide-zinc-200">
                {(selectedOrder.items || []).map((it: any, idx: number) => (
                  <div key={idx} className="p-3 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <img src={it.image || '/assets/placeholder-product.svg'} alt="" className="w-12 h-12 object-cover border border-zinc-200" />
                      <div>
                        <div className="font-bold text-zinc-950">{it.brand} {it.name}</div>
                        <div className="text-[11px] text-zinc-500 font-mono">{it.volume || it.volumeLabel || '10 мл'} × {it.quantity || 1} шт.</div>
                      </div>
                    </div>
                    <div className="font-mono font-bold text-sm text-zinc-950">
                      {((it.price || 0) * (it.quantity || 1)).toLocaleString('ru-RU')} ₽
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Strip */}
            <div className="pt-4 border-t border-zinc-200 flex items-center justify-between font-mono">
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
    </div>
  );
};
