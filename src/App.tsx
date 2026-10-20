import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ShopProvider } from './context/ShopContext';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/Toast';
import { BackToTopButton } from './components/BackToTopButton';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CookieBanner } from './components/CookieBanner';

const AboutPage = React.lazy(() => import('./pages/StaticPages').then(m => ({ default: m.AboutPage })));
const DeliveryPage = React.lazy(() => import('./pages/StaticPages').then(m => ({ default: m.DeliveryPage })));
const HowToDecantPage = React.lazy(() => import('./pages/StaticPages').then(m => ({ default: m.HowToDecantPage })));
const ContactsPage = React.lazy(() => import('./pages/StaticPages').then(m => ({ default: m.ContactsPage })));
const PrivacyPage = React.lazy(() => import('./pages/StaticPages').then(m => ({ default: m.PrivacyPage })));
const TermsPage = React.lazy(() => import('./pages/StaticPages').then(m => ({ default: m.TermsPage })));
const OfferPage = React.lazy(() => import('./pages/StaticPages').then(m => ({ default: m.OfferPage })));
const FAQPage = React.lazy(() => import('./pages/StaticPages').then(m => ({ default: m.FAQPage })));

import { HomePage } from './pages/HomePage';
const CatalogPage = React.lazy(() => import('./pages/CatalogPage').then(m => ({ default: m.CatalogPage })));
const ProductPage = React.lazy(() => import('./pages/ProductPage').then(m => ({ default: m.ProductPage })));
const AromaBoxPage = React.lazy(() => import('./pages/AromaBoxPage').then(m => ({ default: m.AromaBoxPage })));
const ReviewsPage = React.lazy(() => import('./pages/ReviewsPage').then(m => ({ default: m.ReviewsPage })));
const GalleryPage = React.lazy(() => import('./pages/GalleryPage').then(m => ({ default: m.GalleryPage })));
const CartPage = React.lazy(() => import('./pages/CartPage').then(m => ({ default: m.CartPage })));
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const OrderSuccessPage = React.lazy(() =>
  import('./pages/OrderSuccessPage').then(m => ({ default: m.OrderSuccessPage }))
);
const AccountPage = React.lazy(() => import('./pages/AccountPage').then(m => ({ default: m.AccountPage })));
const WishlistPage = React.lazy(() => import('./pages/WishlistPage').then(m => ({ default: m.WishlistPage })));
const AdminPage = React.lazy(() => import('./pages/AdminPage').then(m => ({ default: m.AdminPage })));
const CrmPage = React.lazy(() => import('./pages/CrmPage').then(m => ({ default: m.CrmPage })));
const OrderTrackPage = React.lazy(() => import('./pages/OrderTrackPage').then(m => ({ default: m.OrderTrackPage })));
const WhyCheaperPage = React.lazy(() => import('./pages/WhyCheaperPage').then(m => ({ default: m.WhyCheaperPage })));
const GiftCertificatesPage = React.lazy(() => import('./pages/GiftCertificatesPage').then(m => ({ default: m.GiftCertificatesPage })));
const LoyaltyPage = React.lazy(() => import('./pages/LoyaltyPage').then(m => ({ default: m.LoyaltyPage })));

// Scroll to top on route change
function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // If incoming link has hash from old version (e.g. /#/product/...), convert to clean pathname
    if (window.location.hash && window.location.hash.startsWith('#/')) {
      const cleanPath = window.location.hash.replace(/^#/, '');
      window.history.replaceState(null, '', cleanPath);
      window.location.href = cleanPath;
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname, search]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ShopProvider>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col bg-white text-zinc-900 selection:bg-amber-900 selection:text-amber-50 antialiased font-sans transition-colors duration-200">
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
                  <Route path="/gallery" element={<GalleryPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/order-success/:orderNumber" element={<OrderSuccessPage />} />
                  <Route path="/account" element={<AccountPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/admin/crm" element={<CrmPage />} />
                  <Route path="/crm" element={<CrmPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/delivery" element={<DeliveryPage />} />
                  <Route path="/how-to-decant" element={<HowToDecantPage />} />
                  <Route path="/contacts" element={<ContactsPage />} />
                  <Route path="/faq" element={<FAQPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/offer" element={<OfferPage />} />
                  <Route path="/why-cheaper" element={<WhyCheaperPage />} />
                  <Route path="/certificates" element={<GiftCertificatesPage />} />
                  <Route path="/loyalty" element={<LoyaltyPage />} />
                  <Route path="/track" element={<OrderTrackPage />} />
                  <Route path="*" element={<HomePage />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </div>

          <Footer />
          <BackToTopButton />
          <ToastContainer />
          <CookieBanner />
        </div>
      </ShopProvider>
    </ThemeProvider>
  </BrowserRouter>
  );
}
