import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  adminSaveProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminUpdateProductImage,
  fetchMeta,
  fetchProducts,
  fetchProductById,
  fetchTelegramConfig,
  saveTelegramConfigApi,
  sendTelegramTestApi,
  CatalogListItem,
} from '../api/catalog';
import {
  PRODUCT_KIND_OPTIONS,
  ProductKind,
  Gender,
  Perfume,
  OrderStatus,
  VolumeOption,
} from '../types';
import {
  Lock,
  PackagePlus,
  ArrowLeft,
  Image as ImageIcon,
  Upload,
  Search,
  Check,
  RefreshCw,
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Trash2,
  CreditCard,
  AlertCircle,
  TrendingUp,
  PackageCheck,
  MessageCircle,
  Edit3,
  Plus,
  Save,
  Sparkles,
  Percent,
  X,
  Bot,
  Send,
  Bell,
  Settings,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

const TOKEN_KEY = 'parfum_admin_token';

export const AdminPage: React.FC = () => {
  const { allOrders, updateOrderStatus, deleteOrder, user, showToast } = useShop();
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [authed, setAuthed] = useState(() => user?.role === 'admin');
  const [metaCount, setMetaCount] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [activeTab, setActiveTab] = useState<'orders' | 'edit' | 'create'>('orders');

  // Telegram bot notification settings
  const [telegramConfig, setTelegramConfig] = useState({
    enabled: false,
    botToken: '',
    chatId: '',
    managerUsername: 'nikisss2',
  });
  const [isSavingTg, setIsSavingTg] = useState(false);
  const [isTestingTg, setIsTestingTg] = useState(false);
  const [tgStatus, setTgStatus] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [showTgSettings, setShowTgSettings] = useState(false);

  // Orders tab states
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | OrderStatus>('all');
  const [editingTracking, setEditingTracking] = useState<Record<string, string>>({});

  // Product Edit & Photo management state
  const [searchEditQuery, setSearchEditQuery] = useState('');
  const [editSearchResults, setEditSearchResults] = useState<CatalogListItem[]>([]);
  const [isSearchingEdit, setIsSearchingEdit] = useState(false);
  const [editSearchStatus, setEditSearchStatus] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<CatalogListItem | null>(null);
  const [editingProduct, setEditingProduct] = useState<Perfume | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editStatus, setEditStatus] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    sku: '',
    brand: '',
    name: '',
    kind: 'perfume' as ProductKind,
    gender: 'unisex' as Gender,
    category: 'niche',
    minPrice: '',
    oldPrice: '',
    discountPercent: '',
    description: '',
    imageUrl: '',
    imageData: null as string | null,
    volumes: [] as VolumeOption[],
    topNotes: '',
    heartNotes: '',
    baseNotes: '',
    isHit: false,
    isNew: false,
  });

  const [form, setForm] = useState({
    sku: '',
    brand: '',
    name: '',
    kind: 'perfume' as ProductKind,
    gender: 'unisex' as Gender,
    volumeMl: '50',
    volumeLabel: '50 мл',
    price: '',
    description: '',
    category: 'niche',
    imageUrl: '',
    imageData: '' as string | null,
    isHit: false,
    isNew: false,
  });

  const verifyToken = async (t: string) => {
    const res = await fetch('/api/admin/reload', {
      method: 'POST',
      headers: { 'x-admin-token': t },
    });
    if (!res.ok) throw new Error('invalid');
    const m = await fetchMeta();
    setMetaCount(m.count);
    setAuthed(true);
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      setAuthed(true);
      fetchMeta().then(m => setMetaCount(m.count)).catch(() => {});
    } else if (token) {
      verifyToken(token).catch(() => setAuthed(false));
    }
  }, [user, token]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(TOKEN_KEY, token);
    verifyToken(token).catch(() =>
      setStatus('Неверный токен или API не запущен (npm run api / npm run dev:all)')
    );
  };

  useEffect(() => {
    if (authed && token) {
      fetchTelegramConfig(token)
        .then(res => {
          if (res.ok && res.config) setTelegramConfig(res.config);
        })
        .catch(() => {});
    }
  }, [authed, token]);

  const handleSaveTgConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingTg(true);
    setTgStatus(null);
    try {
      const res = await saveTelegramConfigApi(token, telegramConfig);
      if (res.ok) {
        setTelegramConfig(res.config);
        setTgStatus({ text: 'Настройки Telegram-бота успешно сохранены!', type: 'success' });
        showToast('Telegram настроен', 'Параметры бота сохранены', 'success');
      }
    } catch (err) {
      setTgStatus({ text: err instanceof Error ? err.message : 'Ошибка сохранения настроек', type: 'error' });
    } finally {
      setIsSavingTg(false);
    }
  };

  const handleTestTg = async () => {
    setIsTestingTg(true);
    setTgStatus(null);
    try {
      const res = await sendTelegramTestApi(token);
      if (res.ok) {
        setTgStatus({ text: 'Тестовое сообщение успешно доставлено в Telegram! Бот работает отлично.', type: 'success' });
        showToast('Тест доставлен', 'Проверьте ваш Telegram', 'success');
      } else {
        setTgStatus({ text: 'Не удалось отправить тест. Убедитесь, что вы нажали /start в боте и верно ввели Chat ID.', type: 'error' });
      }
    } catch (err) {
      setTgStatus({ text: err instanceof Error ? err.message : 'Ошибка отправки теста', type: 'error' });
    } finally {
      setIsTestingTg(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    const price = Number(form.price);
    const volumeMl = Number(form.volumeMl) || 1;
    const genderLabels: Record<Gender, string> = {
      unisex: 'Унисекс',
      female: 'Женский',
      male: 'Мужской',
    };
    const kindLabel = PRODUCT_KIND_OPTIONS.find(k => k.id === form.kind)?.label || form.kind;

    const payload: Partial<Perfume> & { minPrice?: number } = {
      sku: form.sku.trim(),
      brand: form.brand.trim(),
      name: form.name.trim(),
      kind: form.kind,
      kindLabel,
      gender: form.gender,
      genderLabel: genderLabels[form.gender],
      description: form.description.trim() || form.name,
      category: form.kind === 'perfume' ? form.category : form.kind,
      categoryName: form.kind === 'perfume' ? 'Парфюмерия' : kindLabel,
      minPrice: price,
      isHit: form.isHit,
      isNew: form.isNew,
      images: form.imageData || form.imageUrl ? [form.imageData || form.imageUrl] : undefined,
      volumes: [
        {
          type: `vol_${volumeMl}_ml`,
          label: form.volumeLabel || `${volumeMl} мл`,
          volumeMl,
          price,
          inStock: true,
        },
      ],
    };

    try {
      await adminSaveProduct(token, payload as Record<string, unknown>);
      setStatus('Товар сохранён в catalog.custom.json');
      setForm(f => ({ ...f, sku: '', name: '', price: '', imageUrl: '', imageData: null }));
      fetchMeta().then(m => setMetaCount(m.count));
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Ошибка сохранения (проверьте ADMIN_TOKEN на сервере)');
    } finally {
      setSaving(false);
    }
  };

  const handleSearchEdit = async (queryToSearch?: string) => {
    const q = (queryToSearch ?? searchEditQuery).trim();
    if (!q) return;
    setIsSearchingEdit(true);
    setEditSearchStatus(null);
    try {
      const res = await fetchProducts({ q, limit: 18 });
      setEditSearchResults(res.items);
      if (res.items.length === 0) {
        setEditSearchStatus('Товары по данному запросу не найдены');
      }
    } catch {
      setEditSearchStatus('Ошибка поиска товаров');
    } finally {
      setIsSearchingEdit(false);
    }
  };

  const handleSelectProductToEdit = async (item: CatalogListItem) => {
    setSelectedProduct(item);
    setIsLoadingProduct(true);
    setEditStatus(null);
    try {
      const full = await fetchProductById(item.id);
      setEditingProduct(full);
      setEditForm({
        sku: full.sku || '',
        brand: full.brand || item.brand,
        name: full.name || item.name,
        kind: (full.kind as ProductKind) || 'perfume',
        gender: (full.gender as Gender) || 'unisex',
        category: full.category || 'niche',
        minPrice: String(full.minPrice || item.minPrice || 0),
        oldPrice: full.oldPrice ? String(full.oldPrice) : '',
        discountPercent: full.discountPercent ? String(full.discountPercent) : '',
        description: full.description || '',
        imageUrl: full.images?.[0] || item.image || '',
        imageData: null,
        volumes: Array.isArray(full.volumes) && full.volumes.length ? [...full.volumes] : [
          {
            type: 'vol_50_ml',
            label: '50 мл (флакон)',
            volumeMl: 50,
            price: full.minPrice || item.minPrice || 0,
            inStock: true,
          },
        ],
        topNotes: (full.notes?.top || []).join(', '),
        heartNotes: (full.notes?.heart || []).join(', '),
        baseNotes: (full.notes?.base || []).join(', '),
        isHit: Boolean(full.isHit),
        isNew: Boolean(full.isNew),
      });
    } catch (err) {
      setEditStatus({
        text: 'Не удалось загрузить детальные данные товара',
        type: 'error',
      });
    } finally {
      setIsLoadingProduct(false);
    }
  };

  const handleUpdateVolume = (index: number, patch: Partial<VolumeOption>) => {
    setEditForm(prev => {
      const nextVols = [...prev.volumes];
      nextVols[index] = { ...nextVols[index], ...patch };
      return { ...prev, volumes: nextVols };
    });
  };

  const handleRemoveVolume = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      volumes: prev.volumes.filter((_, i) => i !== index),
    }));
  };

  const handleAddVolumePreset = (preset: { label: string; volumeMl: number }) => {
    setEditForm(prev => {
      const basePrice = Number(prev.minPrice) || 5000;
      let estPrice = basePrice;
      if (preset.volumeMl === 5) estPrice = Math.max(890, Math.round((basePrice * 0.18) / 10) * 10);
      else if (preset.volumeMl === 10) estPrice = Math.max(1490, Math.round((basePrice * 0.32) / 10) * 10);
      else if (preset.volumeMl === 100) estPrice = Math.round((basePrice * 1.5) / 10) * 10;

      const newVol: VolumeOption = {
        type: `vol_${preset.volumeMl}_ml_${Date.now()}`,
        label: preset.label,
        volumeMl: preset.volumeMl,
        price: estPrice,
        inStock: true,
      };
      return {
        ...prev,
        volumes: [...prev.volumes, newVol],
      };
    });
  };

  const handleApplyDiscountPreset = (percent: number) => {
    const minP = Number(editForm.minPrice) || 0;
    if (minP <= 0) return;
    const oldP = Math.round((minP * (1 + percent / 100)) / 10) * 10;
    setEditForm(prev => ({
      ...prev,
      oldPrice: String(oldP),
      discountPercent: String(percent),
    }));
  };

  const handleClearDiscount = () => {
    setEditForm(prev => ({
      ...prev,
      oldPrice: '',
      discountPercent: '',
    }));
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const res = ev.target?.result as string;
      setEditForm(f => ({ ...f, imageData: res, imageUrl: '' }));
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isCreateForm = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const res = ev.target?.result as string;
      if (isCreateForm) {
        setForm(f => ({ ...f, imageData: res, imageUrl: '' }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProductEdit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingProduct) return;

    setEditSaving(true);
    setEditStatus(null);

    const minPrice = Number(editForm.minPrice) || (editForm.volumes[0]?.price ?? 0);
    const oldPrice = editForm.oldPrice ? Number(editForm.oldPrice) : undefined;
    const discountPercent = editForm.discountPercent ? Number(editForm.discountPercent) : undefined;

    const top = editForm.topNotes.split(',').map(s => s.trim()).filter(Boolean);
    const heart = editForm.heartNotes.split(',').map(s => s.trim()).filter(Boolean);
    const base = editForm.baseNotes.split(',').map(s => s.trim()).filter(Boolean);
    const allNotes = Array.from(new Set([...top, ...heart, ...base]));

    const genderLabels: Record<Gender, string> = {
      unisex: 'Унисекс',
      female: 'Женский',
      male: 'Мужской',
    };
    const kindLabel = PRODUCT_KIND_OPTIONS.find(k => k.id === editForm.kind)?.label || editForm.kind;

    const payload: Record<string, unknown> = {
      name: editForm.name.trim(),
      brand: editForm.brand.trim(),
      sku: editForm.sku.trim(),
      kind: editForm.kind,
      kindLabel,
      gender: editForm.gender,
      genderLabel: genderLabels[editForm.gender],
      category: editForm.kind === 'perfume' ? editForm.category : editForm.kind,
      categoryName: editForm.kind === 'perfume'
        ? (editForm.category === 'arabian' ? 'Арабская парфюмерия' : editForm.category === 'luxury' ? 'Люксовая парфюмерия' : 'Нишевая парфюмерия')
        : kindLabel,
      description: editForm.description.trim() || editForm.name.trim(),
      minPrice,
      oldPrice,
      discountPercent,
      volumes: editForm.volumes,
      notes: { top, heart, base },
      allNotes,
      isHit: editForm.isHit,
      isNew: editForm.isNew,
      imageUrl: editForm.imageUrl.trim() || undefined,
      imageData: editForm.imageData || undefined,
    };

    try {
      const res = await adminUpdateProduct(token, editingProduct.id, payload);
      setEditingProduct(res.product);
      setEditStatus({
        text: `Товар «${res.product.name}» успешно сохранён! Изменения применены в каталоге.`,
        type: 'success',
      });
      showToast('Товар сохранён', `Изменения для «${res.product.name}» сохранены`, 'success');

      // Update in search results
      const resolvedImg = res.product.images?.[0] || editForm.imageUrl || editingProduct.images?.[0];
      setEditSearchResults(prev =>
        prev.map(item =>
          item.id === editingProduct.id
            ? {
                ...item,
                name: res.product.name,
                brand: res.product.brand,
                minPrice: res.product.minPrice ?? item.minPrice,
                oldPrice: res.product.oldPrice,
                discountPercent: res.product.discountPercent,
                image: resolvedImg,
                isHit: res.product.isHit,
                isNew: res.product.isNew,
              }
            : item
        )
      );

      // Refresh meta count
      fetchMeta().then(m => setMetaCount(m.count)).catch(() => {});
    } catch (err) {
      setEditStatus({
        text: err instanceof Error ? err.message : 'Ошибка при сохранении изменений товара',
        type: 'error',
      });
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!editingProduct) return;
    if (!window.confirm(`Вы уверены, что хотите удалить товар «${editingProduct.name}»?`)) return;
    try {
      await adminDeleteProduct(token, editingProduct.id);
      showToast('Удалено', `Товар «${editingProduct.name}» удалён`, 'info');
      setEditingProduct(null);
      setSelectedProduct(null);
      setEditSearchResults(prev => prev.filter(p => p.id !== editingProduct.id));
      fetchMeta().then(m => setMetaCount(m.count)).catch(() => {});
    } catch (err) {
      showToast('Ошибка', err instanceof Error ? err.message : 'Не удалось удалить товар', 'error');
    }
  };

  // Orders calculations
  const totalRevenue = allOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const filteredOrders = allOrders.filter(o => {
    if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) return false;
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase().trim();
      const matchNum = o.orderNumber.toLowerCase().includes(q);
      const matchName = o.recipient.fullName.toLowerCase().includes(q);
      const matchPhone = o.recipient.phone.toLowerCase().includes(q);
      const matchCity = o.recipient.city.toLowerCase().includes(q);
      return matchNum || matchName || matchPhone || matchCity;
    }
    return true;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-none text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-300">
            <CreditCard className="w-3 h-3" />
            Оплачен онлайн
          </span>
        );
      case 'assembling':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-none text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-900 border border-amber-300">
            <Clock className="w-3 h-3" />
            В сборке
          </span>
        );
      case 'sent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-none text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-900 border border-zinc-400">
            <Truck className="w-3 h-3" />
            Отправлен
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-none text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-950 border border-emerald-400">
            <CheckCircle2 className="w-3 h-3" />
            Доставлен
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-none text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-300">
            <AlertCircle className="w-3 h-3" />
            Отменен
          </span>
        );
      default:
        return null;
    }
  };

  if (!authed) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white p-8 rounded-none border border-zinc-900 shadow-sm space-y-4">
          <h1 className="text-xl font-normal font-serif mb-2 flex items-center gap-2 uppercase tracking-wide">
            <Lock className="w-5 h-5" />
            Вход для администратора
          </h1>
          <p className="text-xs text-zinc-500 mb-6 leading-relaxed font-light">
            Вы можете войти под аккаунтом администратора <code>admin@maisonarome.ru</code> / <code>admin123</code> на странице аккаунта или ввести сервисный токен API:
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="Admin token (из .env)"
              className="w-full border border-zinc-300 rounded-none px-3.5 py-3 text-xs outline-none focus:border-black font-mono transition-colors"
            />
            {status && <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-none">{status}</p>}
            <button type="submit" className="w-full py-4 bg-black text-white rounded-none text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors shadow-sm">
              Войти в админ-панель
            </button>
            <div className="pt-2 flex justify-between text-xs text-zinc-500 uppercase tracking-wider text-[11px]">
              <Link to="/account" className="text-black hover:underline font-bold">
                Войти как admin@maisonarome.ru
              </Link>
              <Link to="/" className="hover:text-black flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" /> На сайт
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-normal font-serif flex items-center gap-2 text-zinc-950 uppercase tracking-wide">
            <Lock className="w-6 h-6 text-zinc-900" />
            Панель управления магазином
          </h1>
          <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider text-[11px]">
            Мониторинг заказов, обработка статусов, каталог ({metaCount != null ? `${metaCount.toLocaleString('ru-RU')} позиций` : 'активен'})
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/catalog"
            className="px-4 py-2.5 rounded-none border border-zinc-300 bg-white hover:bg-zinc-100 text-xs font-bold uppercase tracking-wider text-black transition-colors"
          >
            В каталог
          </Link>
          <Link
            to="/account"
            className="px-4 py-2.5 rounded-none bg-black hover:bg-zinc-800 text-xs font-bold uppercase tracking-wider text-white transition-colors"
          >
            Мой аккаунт
          </Link>
        </div>
      </div>

      {/* Primary Tabs */}
      <div className="flex border-b border-zinc-200 mb-6 gap-2 overflow-x-auto text-xs uppercase tracking-wider font-bold">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'orders'
              ? 'border-black text-black'
              : 'border-transparent text-zinc-500 hover:text-black'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Поступающие заказы ({allOrders.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('edit')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'edit'
              ? 'border-black text-black'
              : 'border-transparent text-zinc-500 hover:text-black'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>Редактировать товар (фото, цена, объемы)</span>
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'create'
              ? 'border-black text-black'
              : 'border-transparent text-zinc-500 hover:text-black'
          }`}
        >
          <PackagePlus className="w-4 h-4" />
          <span>Добавить новый товар</span>
        </button>
      </div>

      {/* Tab 1: Orders Management */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Telegram Notification Integration Banner */}
          <div className="p-4 sm:p-5 rounded-none border border-zinc-200 bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-none bg-zinc-100 flex items-center justify-center text-zinc-900 border border-zinc-200 shrink-0">
                  <Bot className="w-5 h-5 text-black" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-950">
                      Уведомления о заказах в Telegram в ЛС
                    </span>
                    {telegramConfig.enabled && telegramConfig.botToken && telegramConfig.chatId ? (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300">
                        Подключено ✓
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-zinc-100 text-zinc-600 border border-zinc-300">
                        Не настроено
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500 font-light mt-0.5">
                    Каждый новый заказ с сайта мгновенно приходит вам в личные сообщения Telegram со всеми данными и кнопками связи.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <button
                  type="button"
                  onClick={() => setShowTgSettings(prev => !prev)}
                  className="px-3.5 py-2 text-xs font-bold uppercase tracking-wider border border-zinc-300 hover:border-black bg-white text-zinc-900 transition-colors flex items-center gap-1.5"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>{showTgSettings ? 'Скрыть настройки' : 'Настроить бота'}</span>
                </button>
              </div>
            </div>

            {/* Collapsible Settings Form */}
            {showTgSettings && (
              <form onSubmit={handleSaveTgConfig} className="mt-4 pt-4 border-t border-zinc-100 space-y-4 animate-in fade-in">
                <div className="p-3.5 bg-zinc-50 border border-zinc-200 text-xs text-zinc-700 space-y-1.5 font-light">
                  <div className="font-bold uppercase tracking-wider text-zinc-900 text-[11px]">
                    Инструкция по настройке за 2 минуты:
                  </div>
                  <div>1. Откройте в Telegram официального бота <b>@BotFather</b> и отправьте команду <code>/newbot</code>. Введите имя и юзернейм бота и скопируйте полученный <b>HTTP API Token</b>.</div>
                  <div>2. Нажмите <code>/start</code> в диалоге с вашим созданным ботом, чтобы разрешить ему писать вам в лс.</div>
                  <div>3. Откройте бота <b>@userinfobot</b> и скопируйте ваш <b>Id</b> (это ваш числовой Chat ID, например: <code>987654321</code>).</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-700">
                    Bot Token (от @BotFather) *
                    <input
                      type="text"
                      placeholder="1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ"
                      value={telegramConfig.botToken}
                      onChange={e => setTelegramConfig({ ...telegramConfig, botToken: e.target.value })}
                      className="mt-1.5 w-full border border-zinc-300 rounded-none px-3 py-2 text-xs font-mono outline-none focus:border-black"
                    />
                  </label>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-700">
                    Ваш Chat ID (от @userinfobot) *
                    <input
                      type="text"
                      placeholder="Например: 987654321"
                      value={telegramConfig.chatId}
                      onChange={e => setTelegramConfig({ ...telegramConfig, chatId: e.target.value })}
                      className="mt-1.5 w-full border border-zinc-300 rounded-none px-3 py-2 text-xs font-mono outline-none focus:border-black"
                    />
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold uppercase tracking-wider text-zinc-900">
                    <input
                      type="checkbox"
                      checked={telegramConfig.enabled}
                      onChange={e => setTelegramConfig({ ...telegramConfig, enabled: e.target.checked })}
                      className="rounded-none accent-black w-4 h-4"
                    />
                    <span>Включить автоматическую отправку заказов в Telegram</span>
                  </label>
                </div>

                {tgStatus && (
                  <div
                    className={`p-3 text-xs font-medium border ${
                      tgStatus.type === 'success'
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                        : 'bg-rose-50 text-rose-900 border-rose-300'
                    }`}
                  >
                    {tgStatus.text}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSavingTg}
                    className="px-5 py-2.5 bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition-colors flex items-center gap-1.5"
                  >
                    {isSavingTg ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>Сохранить настройки</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTestTg}
                    disabled={isTestingTg || !telegramConfig.botToken || !telegramConfig.chatId}
                    className="px-5 py-2.5 border border-zinc-300 hover:border-black bg-white text-zinc-900 text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition-colors flex items-center gap-1.5"
                  >
                    {isTestingTg ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Проверить отправку теста в TG</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* KPI Dashboard */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-4 rounded-none bg-white border border-zinc-200">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Всего заказов</div>
              <div className="text-xl font-serif text-zinc-950 mt-1">{allOrders.length}</div>
            </div>
            <div className="p-4 rounded-none bg-emerald-50/60 border border-emerald-200">
              <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">Оплачено онлайн</div>
              <div className="text-xl font-serif text-emerald-950 mt-1">
                {allOrders.filter(o => o.status === 'paid').length}
              </div>
            </div>
            <div className="p-4 rounded-none bg-amber-50/60 border border-amber-200">
              <div className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">В сборке</div>
              <div className="text-xl font-serif text-amber-950 mt-1">
                {allOrders.filter(o => o.status === 'assembling').length}
              </div>
            </div>
            <div className="p-4 rounded-none bg-zinc-50 border border-zinc-200">
              <div className="text-[10px] font-bold text-zinc-800 uppercase tracking-widest">Отправлено</div>
              <div className="text-xl font-serif text-zinc-950 mt-1">
                {allOrders.filter(o => o.status === 'sent').length}
              </div>
            </div>
            <div className="p-4 rounded-none bg-teal-50/60 border border-teal-200">
              <div className="text-[10px] font-bold text-teal-800 uppercase tracking-widest">Доставлено</div>
              <div className="text-xl font-serif text-teal-950 mt-1">
                {allOrders.filter(o => o.status === 'delivered').length}
              </div>
            </div>
            <div className="p-4 rounded-none bg-zinc-950 text-white border border-zinc-900">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                Выручка
              </div>
              <div className="text-base sm:text-lg font-serif mt-1 text-emerald-400 truncate">
                {totalRevenue.toLocaleString('ru-RU')} ₽
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-none border border-zinc-200">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Поиск по номеру, имени или телефону..."
                value={orderSearch}
                onChange={e => setOrderSearch(e.target.value)}
                className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-none bg-zinc-50 border border-zinc-200 outline-none focus:border-black transition-colors"
              />
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
              {[
                { id: 'all', label: 'Все' },
                { id: 'paid', label: 'Оплачены' },
                { id: 'assembling', label: 'В сборке' },
                { id: 'sent', label: 'Отправлены' },
                { id: 'delivered', label: 'Доставлены' },
                { id: 'cancelled', label: 'Отменены' },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setOrderStatusFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-none text-xs font-bold uppercase tracking-wider transition-colors border ${
                    orderStatusFilter === tab.id
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-zinc-600 border-zinc-200 hover:border-black hover:text-black'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-none border border-zinc-200 space-y-3">
              <ShoppingBag className="w-10 h-10 text-zinc-300 mx-auto" />
              <div className="text-sm font-bold text-zinc-800">
                {allOrders.length === 0
                  ? 'Входящих заказов пока нет'
                  : 'Заказов с выбранными параметрами не найдено'}
              </div>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Оформите тестовый заказ на сайте, и он моментально появится в этой панели со статусом «Оплачен онлайн».
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map(order => {
                const currentTracking =
                  editingTracking[order.id] !== undefined
                    ? editingTracking[order.id]
                    : (order.trackingNumber || '');

                return (
                  <div
                    key={order.id}
                    className="p-6 bg-white rounded-none border border-zinc-200 shadow-none space-y-4 transition-all hover:border-black"
                  >
                    {/* Header: Number, Date, Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-base font-bold font-serif text-zinc-950 uppercase tracking-wide">
                          №{order.orderNumber}
                        </span>
                        <span className="text-xs text-zinc-400 uppercase tracking-wider text-[11px]">от {order.date}</span>
                        {getStatusBadge(order.status)}
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Status Change Dropdown */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 hidden sm:inline">Статус:</span>
                          <select
                            value={order.status}
                            onChange={e => {
                              const newStatus = e.target.value as OrderStatus;
                              updateOrderStatus(order.id, newStatus, order.trackingNumber);
                              showToast('Статус обновлен', `Заказ ${order.orderNumber} обновлен`, 'success');
                            }}
                            className="text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-none border border-zinc-300 bg-white hover:border-black outline-none text-zinc-900 cursor-pointer transition-colors"
                          >
                            <option value="paid">💳 Оплачен онлайн</option>
                            <option value="assembling">🧪 В сборке (отлив атомайзеров)</option>
                            <option value="sent">🚚 Отправлен в доставку</option>
                            <option value="delivered">✅ Доставлен покупателю</option>
                            <option value="cancelled">❌ Отменен</option>
                          </select>
                        </div>

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Удалить заказ №${order.orderNumber}?`)) {
                              deleteOrder(order.id);
                              showToast('Заказ удален', `Заказ №${order.orderNumber} удален`, 'info');
                            }
                          }}
                          className="p-2 rounded-none text-zinc-400 hover:text-black border border-transparent hover:border-zinc-300 transition-colors"
                          title="Удалить заказ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Middle: Recipient & Tracking */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Recipient Details */}
                      <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-none space-y-2">
                        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                          Получатель & Контакты
                        </div>
                        <div className="font-bold text-zinc-900 uppercase tracking-wide">{order.recipient.fullName}</div>
                        <div className="flex flex-wrap items-center gap-3 text-zinc-700">
                          <a href={`tel:${order.recipient.phone}`} className="flex items-center gap-1 hover:text-black font-mono">
                            <Phone className="w-3.5 h-3.5 text-zinc-500" />
                            <span>{order.recipient.phone}</span>
                          </a>
                          <a
                            href={`https://wa.me/${order.recipient.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-none bg-emerald-100 text-emerald-900 text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-200 transition-colors"
                          >
                            <MessageCircle className="w-3 h-3" />
                            WhatsApp
                          </a>
                        </div>
                        <div className="flex items-center gap-1 text-zinc-500 font-mono text-[11px]">
                          <Mail className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{order.recipient.email}</span>
                        </div>
                      </div>

                      {/* Delivery & Tracking */}
                      <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-none space-y-2">
                        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                          Доставка и Трек-номер
                        </div>
                        <div className="font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-black" />
                          <span>{order.deliveryMethod}</span>
                        </div>
                        <div className="flex items-start gap-1.5 text-zinc-600 font-light">
                          <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                          <span>{order.recipient.city}, {order.recipient.address}</span>
                        </div>

                        {/* Tracking editor */}
                        <div className="pt-1.5 flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Трек-номер отправления..."
                            value={currentTracking}
                            onChange={e =>
                              setEditingTracking(prev => ({ ...prev, [order.id]: e.target.value }))
                            }
                            className="px-3 py-2 text-xs rounded-none border border-zinc-300 bg-white font-mono flex-1 outline-none focus:border-black transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              updateOrderStatus(order.id, order.status, currentTracking);
                              showToast('Трек-номер сохранен', `Трек ${currentTracking} сохранен`, 'success');
                            }}
                            className="px-4 py-2 bg-black hover:bg-zinc-800 text-white text-[10px] font-bold uppercase tracking-widest rounded-none transition-colors shrink-0"
                          >
                            Сохранить
                          </button>
                        </div>
                      </div>
                    </div>

                    {order.recipient.comment && (
                      <div className="text-xs text-zinc-700 bg-zinc-50 p-3 rounded-none border border-zinc-200 font-light">
                        <strong className="font-bold uppercase tracking-wider text-[10px] block mb-0.5">Комментарий клиента:</strong> {order.recipient.comment}
                      </div>
                    )}

                    {/* Order Items */}
                    <div className="pt-2 border-t border-zinc-100">
                      <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">
                        Товары в заказе ({order.items.length} поз.)
                      </div>
                      <div className="divide-y divide-zinc-100">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-3 min-w-0">
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt=""
                                  className="w-10 h-12 object-cover rounded-none border border-zinc-200 shrink-0"
                                />
                              )}
                              <div className="truncate">
                                <div className="font-bold text-zinc-900 truncate uppercase tracking-tight">
                                  {item.brand} — {item.name}
                                </div>
                                <div className="text-[11px] text-zinc-500 uppercase tracking-wider">
                                  {item.volumeLabel} × {item.quantity} шт.
                                </div>
                              </div>
                            </div>
                            <div className="font-bold text-zinc-900 shrink-0">
                              {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-3 mt-2 border-t border-zinc-100 flex items-center justify-between text-xs sm:text-sm font-bold text-zinc-950">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-normal text-zinc-500 uppercase tracking-wider text-[11px]">Способ оплаты:</span>
                          <span className="text-xs text-zinc-900 font-bold uppercase tracking-wider bg-zinc-100 px-2.5 py-1 rounded-none border border-zinc-200">
                            {order.paymentMethod || 'СБП / Онлайн'}
                          </span>
                        </div>
                        <div className="text-base sm:text-lg font-serif">
                          Итого: {order.totalAmount.toLocaleString('ru-RU')} ₽
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Edit Existing Product */}
      {activeTab === 'edit' && (
        <div className="space-y-6">
          {/* Search product for editing */}
          <div className="p-6 rounded-none border border-zinc-200 bg-white space-y-4">
            <div className="space-y-1">
              <h2 className="text-base font-normal font-serif text-zinc-900 uppercase tracking-wide flex items-center gap-2">
                <Search className="w-4 h-4 text-black" />
                Найти товар для редактирования
              </h2>
              <p className="text-xs text-zinc-500 font-light">
                Введите название аромата, бренд или артикул (например: Creed, Lost Cherry, Angels Share, Ganymede, Khamrah).
              </p>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                handleSearchEdit();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                placeholder="Поиск по 45 000+ товаров..."
                value={searchEditQuery}
                onChange={e => setSearchEditQuery(e.target.value)}
                className="flex-1 text-xs border border-zinc-300 rounded-none px-3.5 py-3 outline-none focus:border-black bg-zinc-50 transition-colors"
              />
              <button
                type="submit"
                disabled={isSearchingEdit}
                className="px-6 py-3 bg-black hover:bg-zinc-800 text-white rounded-none text-xs font-bold uppercase tracking-widest disabled:opacity-50 transition-colors flex items-center gap-1.5"
              >
                {isSearchingEdit ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Поиск…</span>
                  </>
                ) : (
                  <span>Найти</span>
                )}
              </button>
            </form>

            {/* Quick chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mr-1">Быстрый выбор:</span>
              {['Creed', 'Lost Cherry', 'Angels Share', 'Ganymede', 'Baccarat', 'Khamrah', 'Amouage'].map(chip => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    setSearchEditQuery(chip);
                    handleSearchEdit(chip);
                  }}
                  className="px-2.5 py-1 text-[11px] font-medium border border-zinc-200 hover:border-black bg-white hover:bg-zinc-50 text-zinc-700 transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>

            {editSearchStatus && (
              <p className="text-xs text-zinc-900 bg-zinc-50 border border-zinc-200 p-3 rounded-none font-medium">
                {editSearchStatus}
              </p>
            )}

            {/* Results Grid */}
            {editSearchResults.length > 0 && !selectedProduct && (
              <div className="pt-2">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2.5">
                  Результаты поиска ({editSearchResults.length}):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
                  {editSearchResults.map(prod => (
                    <div
                      key={prod.id}
                      className="p-3 rounded-none border border-zinc-200 hover:border-black bg-white flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={prod.image}
                          alt=""
                          className="w-12 h-14 object-cover rounded-none border border-zinc-200 shrink-0"
                        />
                        <div className="min-w-0 text-xs">
                          <div className="text-[10px] uppercase font-bold text-zinc-400 truncate">
                            {prod.brand}
                          </div>
                          <div className="font-bold text-zinc-900 truncate uppercase tracking-tight">{prod.name}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-zinc-900 font-mono font-bold">
                              {(prod.minPrice || 0).toLocaleString('ru-RU')} ₽
                            </span>
                            {prod.oldPrice && prod.oldPrice > (prod.minPrice || 0) && (
                              <span className="text-[10px] text-zinc-400 font-mono line-through">
                                {prod.oldPrice.toLocaleString('ru-RU')} ₽
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSelectProductToEdit(prod)}
                        className="px-3 py-2 bg-zinc-900 hover:bg-black text-white text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors shrink-0 flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Править</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Loading indicator when loading full product */}
          {isLoadingProduct && (
            <div className="p-8 border border-zinc-200 bg-white text-center space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-zinc-600" />
              <div className="text-xs uppercase tracking-wider font-bold text-zinc-700">
                Загрузка полных параметров товара…
              </div>
            </div>
          )}

          {/* Comprehensive Product Editor */}
          {editingProduct && !isLoadingProduct && (
            <form onSubmit={handleSaveProductEdit} className="p-6 sm:p-8 rounded-none border border-zinc-900 bg-white space-y-8 animate-in fade-in">
              {/* Header with Title and Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
                <div className="flex items-center gap-3">
                  <img
                    src={editForm.imageData || editForm.imageUrl || editingProduct.images?.[0]}
                    alt=""
                    className="w-14 h-16 object-cover border border-zinc-200 shrink-0"
                  />
                  <div>
                    <span className="text-[10px] uppercase font-black text-olive-dark tracking-widest block">
                      Редактирование карточки товара
                    </span>
                    <h3 className="text-lg font-bold text-zinc-950 uppercase tracking-tight">
                      {editingProduct.brand} — {editingProduct.name}
                    </h3>
                    <div className="text-[11px] text-zinc-500 font-mono">
                      ID: {editingProduct.id} {editingProduct.sku ? `• Артикул: ${editingProduct.sku}` : ''}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={`/product/${editingProduct.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider border border-zinc-200 hover:border-black text-zinc-700 hover:text-black transition-colors flex items-center gap-1.5"
                    title="Открыть карточку товара на сайте"
                  >
                    <span>На сайте</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct(null);
                      setSelectedProduct(null);
                    }}
                    className="px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider border border-zinc-200 hover:border-black text-zinc-700 hover:text-black transition-colors"
                  >
                    Выбрать другой
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteProduct}
                    className="px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider border border-rose-200 hover:border-rose-400 text-rose-700 hover:bg-rose-50 transition-colors flex items-center gap-1"
                    title="Удалить товар"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Удалить</span>
                  </button>
                </div>
              </div>

              {/* Status banner */}
              {editStatus && (
                <div
                  className={`p-4 rounded-none text-xs font-bold uppercase tracking-wider border ${
                    editStatus.type === 'success'
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                      : 'bg-rose-50 text-rose-900 border-rose-300'
                  }`}
                >
                  {editStatus.text}
                </div>
              )}

              {/* SECTION 1: Основные параметры */}
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-widest text-zinc-900 border-b border-zinc-100 pb-2 flex items-center gap-2">
                  <span>1. Основные параметры</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-700">
                    Бренд *
                    <input
                      required
                      value={editForm.brand}
                      onChange={e => setEditForm({ ...editForm, brand: e.target.value })}
                      className="mt-1.5 w-full border border-zinc-300 rounded-none px-3.5 py-3 text-xs font-normal outline-none focus:border-black transition-colors"
                    />
                  </label>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-700">
                    Название модели *
                    <input
                      required
                      value={editForm.name}
                      onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                      className="mt-1.5 w-full border border-zinc-300 rounded-none px-3.5 py-3 text-xs font-normal outline-none focus:border-black transition-colors"
                    />
                  </label>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-700">
                    Артикул / SKU
                    <input
                      value={editForm.sku}
                      onChange={e => setEditForm({ ...editForm, sku: e.target.value })}
                      className="mt-1.5 w-full border border-zinc-300 rounded-none px-3.5 py-3 text-xs font-normal outline-none focus:border-black transition-colors"
                      placeholder="SKU-12345"
                    />
                  </label>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-700">
                    Вид товара
                    <select
                      value={editForm.kind}
                      onChange={e => setEditForm({ ...editForm, kind: e.target.value as ProductKind })}
                      className="mt-1.5 w-full border border-zinc-300 rounded-none px-3.5 py-3 text-xs font-normal bg-white outline-none focus:border-black transition-colors"
                    >
                      {PRODUCT_KIND_OPTIONS.map(k => (
                        <option key={k.id} value={k.id}>
                          {k.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-700">
                    Пол
                    <select
                      value={editForm.gender}
                      onChange={e => setEditForm({ ...editForm, gender: e.target.value as Gender })}
                      className="mt-1.5 w-full border border-zinc-300 rounded-none px-3.5 py-3 text-xs font-normal bg-white outline-none focus:border-black transition-colors"
                    >
                      <option value="unisex">Унисекс</option>
                      <option value="female">Женский</option>
                      <option value="male">Мужской</option>
                    </select>
                  </label>
                  {editForm.kind === 'perfume' && (
                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-700">
                      Категория парфюмерии
                      <select
                        value={editForm.category}
                        onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                        className="mt-1.5 w-full border border-zinc-300 rounded-none px-3.5 py-3 text-xs font-normal bg-white outline-none focus:border-black transition-colors"
                      >
                        <option value="niche">Нишевая</option>
                        <option value="arabian">Арабская</option>
                        <option value="luxury">Люксовая</option>
                      </select>
                    </label>
                  )}
                </div>
              </div>

              {/* SECTION 2: Цены и скидки */}
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-widest text-zinc-900 border-b border-zinc-100 pb-2 flex items-center justify-between">
                  <span>2. Базовая цена и Скидка</span>
                  <span className="text-[10px] text-zinc-400 font-normal">Зачёркнутая цена создаёт плашку скидки</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-700">
                    Базовая цена (₽) *
                    <input
                      required
                      type="number"
                      value={editForm.minPrice}
                      onChange={e => setEditForm({ ...editForm, minPrice: e.target.value })}
                      className="mt-1.5 w-full border border-zinc-300 rounded-none px-3.5 py-3 text-xs font-normal outline-none focus:border-black transition-colors"
                    />
                  </label>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-700">
                    Старая цена (зачёркнутая ₽)
                    <input
                      type="number"
                      value={editForm.oldPrice}
                      onChange={e => {
                        const oldP = Number(e.target.value);
                        const minP = Number(editForm.minPrice);
                        let disc = '';
                        if (oldP > minP && minP > 0) {
                          disc = String(Math.round(((oldP - minP) / oldP) * 100));
                        }
                        setEditForm({ ...editForm, oldPrice: e.target.value, discountPercent: disc });
                      }}
                      className="mt-1.5 w-full border border-zinc-300 rounded-none px-3.5 py-3 text-xs font-normal outline-none focus:border-black transition-colors"
                      placeholder="Например: 24000"
                    />
                  </label>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-700">
                    Процент скидки (%)
                    <input
                      type="number"
                      value={editForm.discountPercent}
                      onChange={e => setEditForm({ ...editForm, discountPercent: e.target.value })}
                      className="mt-1.5 w-full border border-zinc-300 rounded-none px-3.5 py-3 text-xs font-normal outline-none focus:border-black transition-colors"
                      placeholder="Например: 10"
                    />
                  </label>
                </div>

                {/* Discount Presets */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Пресеты скидки:</span>
                  <button
                    type="button"
                    onClick={() => handleApplyDiscountPreset(7)}
                    className="px-2.5 py-1 text-[11px] border border-zinc-200 hover:border-black bg-white hover:bg-zinc-50 font-bold transition-colors"
                  >
                    +7% скидка
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyDiscountPreset(10)}
                    className="px-2.5 py-1 text-[11px] border border-zinc-200 hover:border-black bg-white hover:bg-zinc-50 font-bold transition-colors"
                  >
                    +10% скидка
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyDiscountPreset(15)}
                    className="px-2.5 py-1 text-[11px] border border-zinc-200 hover:border-black bg-white hover:bg-zinc-50 font-bold transition-colors"
                  >
                    +15% скидка
                  </button>
                  {editForm.oldPrice && (
                    <button
                      type="button"
                      onClick={handleClearDiscount}
                      className="px-2.5 py-1 text-[11px] border border-zinc-200 text-rose-700 hover:border-rose-400 font-bold transition-colors"
                    >
                      Сбросить скидку
                    </button>
                  )}
                </div>
              </div>

              {/* SECTION 3: Фотография товара */}
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-widest text-zinc-900 border-b border-zinc-100 pb-2">
                  <span>3. Фотография товара</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Current Preview */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 block">
                      Текущее / Выбранное фото:
                    </span>
                    <div className="w-36 h-44 rounded-none border border-zinc-200 overflow-hidden bg-zinc-50 flex items-center justify-center">
                      <img
                        src={editForm.imageData || editForm.imageUrl || editingProduct.images?.[0]}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* URL or Upload */}
                  <div className="sm:col-span-2 space-y-4">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 block mb-1.5">
                        Прямой URL изображения (с ЗЯ, Fragrantica или др.)
                      </label>
                      <input
                        type="url"
                        value={editForm.imageUrl}
                        onChange={e => setEditForm({ ...editForm, imageUrl: e.target.value, imageData: null })}
                        className="w-full border border-zinc-300 rounded-none px-3.5 py-3 text-xs font-normal outline-none focus:border-black transition-colors"
                        placeholder="https://..."
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 block mb-1.5">
                        Или загрузить новый файл с компьютера:
                      </label>
                      <label className="flex items-center gap-2 px-3.5 py-3 border border-dashed border-zinc-300 rounded-none cursor-pointer hover:border-black text-xs text-zinc-600 transition-colors">
                        <Upload className="w-4 h-4 text-black" />
                        <span className="uppercase tracking-wider text-[11px] font-bold">
                          {editForm.imageData ? 'Файл выбран ✓' : 'Выбрать JPEG / PNG / WebP'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleEditFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 4: Описание товара */}
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-widest text-zinc-900 border-b border-zinc-100 pb-2">
                  <span>4. Описание аромата</span>
                </div>
                <textarea
                  rows={4}
                  value={editForm.description}
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full border border-zinc-300 rounded-none px-3.5 py-3 text-xs font-normal outline-none focus:border-black transition-colors"
                  placeholder="Опишите характер аромата, шлейф, стойкость и ключевые ноты..."
                />
              </div>

              {/* SECTION 5: Объёмы и цены (Volumes Manager) */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-2">
                  <div className="text-xs font-bold uppercase tracking-widest text-zinc-900">
                    5. Варианты объёма (Отливанты / Флаконы / Тестеры)
                  </div>
                  <span className="text-[10px] text-zinc-400">
                    Управляйте форматами и ценами для карточки
                  </span>
                </div>

                {/* Volumes list */}
                <div className="space-y-2.5">
                  {editForm.volumes.map((vol, idx) => (
                    <div
                      key={vol.type || idx}
                      className="p-3 border border-zinc-200 bg-zinc-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                        <div>
                          <label className="text-[10px] font-bold uppercase text-zinc-500 block mb-1">
                            Подпись кнопки
                          </label>
                          <input
                            type="text"
                            value={vol.label}
                            onChange={e => handleUpdateVolume(idx, { label: e.target.value })}
                            className="w-full text-xs border border-zinc-300 rounded-none px-2.5 py-1.5 bg-white outline-none focus:border-black"
                            placeholder="50 мл (флакон)"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase text-zinc-500 block mb-1">
                            Объём (мл)
                          </label>
                          <input
                            type="number"
                            value={vol.volumeMl}
                            onChange={e => handleUpdateVolume(idx, { volumeMl: Number(e.target.value) })}
                            className="w-full text-xs border border-zinc-300 rounded-none px-2.5 py-1.5 bg-white outline-none focus:border-black"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase text-zinc-500 block mb-1">
                            Цена (₽)
                          </label>
                          <input
                            type="number"
                            value={vol.price}
                            onChange={e => handleUpdateVolume(idx, { price: Number(e.target.value) })}
                            className="w-full text-xs border border-zinc-300 rounded-none px-2.5 py-1.5 bg-white outline-none focus:border-black font-mono font-bold"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3 justify-end shrink-0 pt-2 sm:pt-4">
                        <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={vol.inStock}
                            onChange={e => handleUpdateVolume(idx, { inStock: e.target.checked })}
                            className="rounded-none accent-black"
                          />
                          <span>В наличии</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemoveVolume(idx)}
                          className="p-1.5 text-zinc-400 hover:text-rose-600 transition-colors"
                          title="Удалить этот объём"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Add Volume Presets */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    + Добавить объём:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAddVolumePreset({ label: '5 мл (отливант)', volumeMl: 5 })}
                    className="px-2.5 py-1.5 text-[11px] font-bold border border-zinc-200 hover:border-black bg-white hover:bg-zinc-50 transition-colors"
                  >
                    + 5 мл (отливант)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddVolumePreset({ label: '10 мл (отливант)', volumeMl: 10 })}
                    className="px-2.5 py-1.5 text-[11px] font-bold border border-zinc-200 hover:border-black bg-white hover:bg-zinc-50 transition-colors"
                  >
                    + 10 мл (отливант)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddVolumePreset({ label: '50 мл (флакон)', volumeMl: 50 })}
                    className="px-2.5 py-1.5 text-[11px] font-bold border border-zinc-200 hover:border-black bg-white hover:bg-zinc-50 transition-colors"
                  >
                    + 50 мл (флакон)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddVolumePreset({ label: '100 мл (флакон)', volumeMl: 100 })}
                    className="px-2.5 py-1.5 text-[11px] font-bold border border-zinc-200 hover:border-black bg-white hover:bg-zinc-50 transition-colors"
                  >
                    + 100 мл (флакон)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddVolumePreset({ label: '100 мл (тестер)', volumeMl: 100 })}
                    className="px-2.5 py-1.5 text-[11px] font-bold border border-zinc-200 hover:border-black bg-white hover:bg-zinc-50 transition-colors"
                  >
                    + 100 мл (тестер)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddVolumePreset({ label: '30 мл (флакон)', volumeMl: 30 })}
                    className="px-2.5 py-1.5 text-[11px] font-bold border border-zinc-200 hover:border-black bg-white hover:bg-zinc-50 transition-colors"
                  >
                    + Свой объём
                  </button>
                </div>
              </div>

              {/* SECTION 6: Ноты аромата */}
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-widest text-zinc-900 border-b border-zinc-100 pb-2">
                  <span>6. Пирамида нот аромата</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-700">
                    Верхние ноты (через запятую)
                    <input
                      value={editForm.topNotes}
                      onChange={e => setEditForm({ ...editForm, topNotes: e.target.value })}
                      className="mt-1.5 w-full border border-zinc-300 rounded-none px-3.5 py-3 text-xs font-normal outline-none focus:border-black transition-colors"
                      placeholder="Бергамот, Ананас, Яблоко"
                    />
                  </label>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-700">
                    Ноты сердца (через запятую)
                    <input
                      value={editForm.heartNotes}
                      onChange={e => setEditForm({ ...editForm, heartNotes: e.target.value })}
                      className="mt-1.5 w-full border border-zinc-300 rounded-none px-3.5 py-3 text-xs font-normal outline-none focus:border-black transition-colors"
                      placeholder="Береза, Пачули, Жасмин"
                    />
                  </label>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-700">
                    Базовые ноты (через запятую)
                    <input
                      value={editForm.baseNotes}
                      onChange={e => setEditForm({ ...editForm, baseNotes: e.target.value })}
                      className="mt-1.5 w-full border border-zinc-300 rounded-none px-3.5 py-3 text-xs font-normal outline-none focus:border-black transition-colors"
                      placeholder="Мускус, Дубовый мох, Серая амбра"
                    />
                  </label>
                </div>
              </div>

              {/* SECTION 7: Маркетинговые бейджи */}
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-widest text-zinc-900 border-b border-zinc-100 pb-2">
                  <span>7. Маркетинговые бейджи</span>
                </div>
                <div className="flex flex-wrap gap-6 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer uppercase tracking-wider text-[11px] font-bold">
                    <input
                      type="checkbox"
                      checked={editForm.isHit}
                      onChange={e => setEditForm({ ...editForm, isHit: e.target.checked })}
                      className="rounded-none accent-[#5A6B32] w-4 h-4"
                    />
                    <span className="inline-flex items-center gap-1.5">
                      Хит продаж <span className="text-[10px] bg-[#5A6B32] text-white px-1.5 py-0.5">ХИТ</span>
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer uppercase tracking-wider text-[11px] font-bold">
                    <input
                      type="checkbox"
                      checked={editForm.isNew}
                      onChange={e => setEditForm({ ...editForm, isNew: e.target.checked })}
                      className="rounded-none accent-black w-4 h-4"
                    />
                    <span>Новинка</span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-zinc-200">
                <button
                  type="submit"
                  disabled={editSaving}
                  className="w-full py-4 bg-black hover:bg-zinc-800 text-white rounded-none text-xs font-bold uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  {editSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Сохранение изменений…</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Сохранить изменения в товаре</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Tab 3: Create Product */}
      {activeTab === 'create' && (
        <form onSubmit={handleSubmit} className="space-y-4 p-6 sm:p-8 rounded-none border border-zinc-200 bg-white">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-2">
            Заполните параметры нового товара для каталога:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-700">
              Артикул / SKU (необязательно)
              <input
                value={form.sku}
                onChange={e => setForm({ ...form, sku: e.target.value })}
                className="mt-1.5 w-full border border-zinc-300 rounded-none px-3.5 py-3 text-xs font-normal outline-none focus:border-black transition-colors"
                placeholder="CUSTOM-001"
              />
            </label>
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-700">
              Бренд *
              <input
                required
                value={form.brand}
                onChange={e => setForm({ ...form, brand: e.target.value })}
                className="mt-1.5 w-full border border-zinc-300 rounded-none px-3.5 py-3 text-xs font-normal outline-none focus:border-black transition-colors"
                placeholder="Creed"
              />
            </label>
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 sm:col-span-2">
              Название товара *
              <input
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="mt-1.5 w-full border border-zinc-300 rounded-none px-3.5 py-3 text-xs font-normal outline-none focus:border-black transition-colors"
                placeholder="Aventus Absolu"
              />
            </label>
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-700">
              Вид товара
              <select
                value={form.kind}
                onChange={e => setForm({ ...form, kind: e.target.value as ProductKind })}
                className="mt-1.5 w-full border border-zinc-300 rounded-none px-3.5 py-3 text-xs font-normal bg-white outline-none focus:border-black transition-colors"
              >
                {PRODUCT_KIND_OPTIONS.map(k => (
                  <option key={k.id} value={k.id}>{k.label}</option>
                ))}
              </select>
            </label>
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-700">
              Пол
              <select
                value={form.gender}
                onChange={e => setForm({ ...form, gender: e.target.value as Gender })}
                className="mt-1.5 w-full border border-zinc-300 rounded-none px-3.5 py-3 text-xs font-normal bg-white outline-none focus:border-black transition-colors"
              >
                <option value="unisex">Унисекс</option>
                <option value="female">Женский</option>
                <option value="male">Мужской</option>
              </select>
            </label>
            {form.kind === 'perfume' && (
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-700">
                Категория парфюмерии
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="mt-1.5 w-full border border-zinc-300 rounded-none px-3.5 py-3 text-xs font-normal bg-white outline-none focus:border-black transition-colors"
                >
                  <option value="niche">Нишевая</option>
                  <option value="arabian">Арабская</option>
                  <option value="luxury">Люксовая</option>
                </select>
              </label>
            )}
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-700">
              Объём (мл)
              <input
                value={form.volumeMl}
                onChange={e => setForm({ ...form, volumeMl: e.target.value, volumeLabel: `${e.target.value} мл` })}
                className="mt-1.5 w-full border border-zinc-300 rounded-none px-3.5 py-3 text-xs font-normal outline-none focus:border-black transition-colors"
                placeholder="50"
              />
            </label>
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-700">
              Цена (₽) *
              <input
                required
                type="number"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                className="mt-1.5 w-full border border-zinc-300 rounded-none px-3.5 py-3 text-xs font-normal outline-none focus:border-black transition-colors"
                placeholder="15000"
              />
            </label>
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 sm:col-span-2">
              URL картинки
              <input
                type="url"
                value={form.imageUrl}
                onChange={e => setForm({ ...form, imageUrl: e.target.value, imageData: null })}
                className="mt-1.5 w-full border border-zinc-300 rounded-none px-3.5 py-3 text-xs font-normal outline-none focus:border-black transition-colors"
                placeholder="https://..."
              />
            </label>
            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 block mb-1.5">
                Или загрузить картинку с устройства
              </label>
              <label className="flex items-center gap-2 px-3.5 py-3 border border-dashed border-zinc-300 rounded-none cursor-pointer hover:border-black text-xs text-zinc-600 transition-colors">
                <Upload className="w-4 h-4 text-black" />
                <span className="uppercase tracking-wider text-[11px] font-bold">{form.imageData ? 'Файл выбран ✓' : 'Выбрать JPEG / PNG / WebP'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => handleFileChange(e, true)}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 block">
            Описание
            <textarea
              rows={3}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="mt-1.5 w-full border border-zinc-300 rounded-none px-3.5 py-3 text-xs font-normal outline-none focus:border-black transition-colors"
              placeholder="Ноты аромата, характер, стойкость..."
            />
          </label>

          <div className="flex flex-wrap gap-4 text-xs">
            <label className="flex items-center gap-2 cursor-pointer uppercase tracking-wider text-[11px] font-bold">
              <input type="checkbox" checked={form.isHit} onChange={e => setForm({ ...form, isHit: e.target.checked })} className="rounded-none accent-black" />
              Хит продаж
            </label>
            <label className="flex items-center gap-2 cursor-pointer uppercase tracking-wider text-[11px] font-bold">
              <input type="checkbox" checked={form.isNew} onChange={e => setForm({ ...form, isNew: e.target.checked })} className="rounded-none accent-black" />
              Новинка
            </label>
          </div>

          {status && <p className="text-xs text-zinc-900 bg-zinc-50 border border-zinc-300 p-3 rounded-none font-medium">{status}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 bg-black hover:bg-zinc-800 text-white rounded-none text-xs font-bold uppercase tracking-widest disabled:opacity-50 transition-colors shadow-sm"
          >
            {saving ? 'Сохранение…' : 'Добавить в каталог'}
          </button>
        </form>
      )}

      <p className="text-[11px] text-zinc-400 mt-6 leading-relaxed">
        Импорт прайса: положите CSV в <code>data/source/price-list.csv</code> и выполните{' '}
        <code>npm run import:catalog</code>. Перезапуск API подхватит новый файл.
      </p>
    </div>
  );
};
