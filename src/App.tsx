import React, { Suspense, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ShopProvider } from './context/ShopContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/Toast';
import { BackToTopButton } from './components/BackToTopButton';
import { ErrorBoundary } from './components/ErrorBoundary';
import {
  AboutPage,
  DeliveryPage,
  HowToDecantPage,
  ContactsPage,
  PrivacyPage,
  FAQPage,
} from './pages/StaticPages';

const HomePage = React.lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const CatalogPage = React.lazy(() => import('./pages/CatalogPage').then(m => ({ default: m.CatalogPage })));
const ProductPage = React.lazy(() => import('./pages/ProductPage').then(m => ({ default: m.ProductPage })));
const AromaBoxPage = React.lazy(() => import('./pages/AromaBoxPage').then(m => ({ default: m.AromaBoxPage })));
const ReviewsPage = React.lazy(() => import('./pages/ReviewsPage').then(m => ({ default: m.ReviewsPage })));
const CartPage = React.lazy(() => import('./pages/CartPage').then(m => ({ default: m.CartPage })));
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const OrderSuccessPage = React.lazy(() =>
  import('./pages/OrderSuccessPage').then(m => ({ default: m.OrderSuccessPage }))
);
const AccountPage = React.lazy(() => import('./pages/AccountPage').then(m => ({ default: m.AccountPage })));
const WishlistPage = React.lazy(() => import('./pages/WishlistPage').then(m => ({ default: m.WishlistPage })));
const AdminPage = React.lazy(() => import('./pages/AdminPage').then(m => ({ default: m.AdminPage })));

// Scroll to top on route change
function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname, search]);

  return null;
}

export default function App() {
  return (
    <HashRouter>
      <ShopProvider>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-white text-zinc-900 selection:bg-zinc-900 selection:text-white antialiased font-sans">
          <Header />

          <div className="flex-1">
            <ErrorBoundary>
              <Suspense
                fallback={
                  <div className="max-w-7xl mx-auto px-4 py-20 animate-pulse">
                    <div className="h-8 bg-zinc-100 rounded w-1/3 mb-4" />
                    <div className="h-64 bg-zinc-100 rounded" />
                  </div>
                }
              >
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/catalog" element={<CatalogPage />} />
                  <Route path="/product/:slug" element={<ProductPage />} />
                  <Route path="/aromabox" element={<AromaBoxPage />} />
                  <Route path="/reviews" element={<ReviewsPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/order-success/:orderNumber" element={<OrderSuccessPage />} />
                  <Route path="/account" element={<AccountPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/delivery" element={<DeliveryPage />} />
                  <Route path="/how-to-decant" element={<HowToDecantPage />} />
                  <Route path="/contacts" element={<ContactsPage />} />
                  <Route path="/faq" element={<FAQPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="*" element={<HomePage />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </div>

          <Footer />
          <BackToTopButton />
          <ToastContainer />
        </div>
      </ShopProvider>
    </HashRouter>
  );
}
