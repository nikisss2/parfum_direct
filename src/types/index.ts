export type Category = 'niche' | 'arabian' | 'luxury' | string;
export type Gender = 'unisex' | 'female' | 'male';

export type ProductKind = 'perfume' | 'skincare' | 'haircare' | 'makeup' | 'bodycare';

export interface VolumeOption {
  type: string;
  label: string;
  volumeMl: number;
  price: number;
  inStock: boolean;
}

export interface PerfumeNotes {
  top: string[];
  heart: string[];
  base: string[];
}

export interface Perfume {
  id: string;
  slug: string;
  sku?: string;
  name: string;
  brand: string;
  kind: ProductKind;
  kindLabel: string;
  category: Category;
  categoryName: string;
  gender: Gender;
  genderLabel: string;
  concentration: string;
  description: string;
  images: string[];
  notes: PerfumeNotes;
  allNotes: string[];
  longevity?: number;
  sillage?: 'Интимный' | 'Средний' | 'Заметный' | 'Шлейфовый';
  isHit?: boolean;
  isNew?: boolean;
  rating: number;
  reviewsCount: number;
  minPrice?: number;
  oldPrice?: number;
  discountPercent?: number;
  volumes: VolumeOption[];
}

export interface CartItem {
  id: string;
  perfumeId: string;
  name: string;
  brand: string;
  image: string;
  volumeType: string;
  volumeLabel: string;
  volumeMl: number;
  price: number;
  quantity: number;
}

export interface OrderItem {
  name: string;
  brand: string;
  volumeLabel: string;
  price: number;
  quantity: number;
  image: string;
}

export type OrderStatus = 'paid' | 'assembling' | 'sent' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  date: string;
  items: OrderItem[];
  totalAmount: number;
  discount: number;
  deliveryMethod: string;
  deliveryPrice: number;
  status: OrderStatus;
  statusLabel: string;
  trackingNumber?: string;
  paymentMethod: string;
  isPaid: boolean;
  paidAt?: string;
  recipient: {
    fullName: string;
    phone: string;
    telegram?: string;
    email: string;
    city: string;
    address: string;
    comment?: string;
  };
}

export interface SavedAddress {
  id: string;
  label: string;
  type: 'cdek_pvz' | 'yandex_pvz' | 'ozon_pvz' | 'courier';
  city: string;
  address: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  city: string;
  defaultAddress: string;
  savedAddresses: SavedAddress[];
  role?: 'client' | 'admin';
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  title: string;
  message: string;
  image?: string;
}

export const PRODUCT_KIND_OPTIONS: { id: ProductKind; label: string }[] = [
  { id: 'perfume', label: 'Парфюмерия' },
  { id: 'skincare', label: 'Уход за кожей' },
  { id: 'haircare', label: 'Уход за волосами' },
  { id: 'makeup', label: 'Макияж' },
  { id: 'bodycare', label: 'Уход за телом' },
];
