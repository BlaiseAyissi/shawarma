import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LanguageProvider } from './context/LanguageContext';
import { NotificationProvider } from './context/NotificationContext';
import { DataProvider } from './context/DataContext';
import Header from './components/Header';
import Cart from './components/Cart';
import Menu from './components/Menu';
import Hero from './components/Hero';
import AuthModal from './components/AuthModal';
import CheckoutModal from './components/CheckoutModal';
import NotificationPanel from './components/NotificationPanel';
import AdminRoute from './components/AdminRoute';
import UserProfile from './components/UserProfile';
import UserOrders from './components/UserOrders';
//import DebugPanel from './components/DebugPanel';
import OrderSyncManager from './components/OrderSyncManager';
import './i18n';

const HomePage = () => (
  <>
    <Header />
    <main>
      <Hero />
      <Menu />
    </main>
    <Cart />
  </>
);

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <DataProvider>
          <NotificationProvider>
            <CartProvider>
              <Router>
                <OrderSyncManager />
                <div className="min-h-screen bg-gray-50 overflow-x-hidden w-full">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/admin" element={<AdminRoute />} />
                    <Route path="/profile" element={<UserProfile />} />
                    <Route path="/orders" element={<UserOrders />} />
                  </Routes>
                  <AuthModal />
                  <CheckoutModal />
                  <NotificationPanel />
                  {/*<DebugPanel />*/}
                  <Toaster
                    position="top-right"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: '#363636',
                        color: '#fff',
                      },
                      success: {
                        style: {
                          background: '#10b981',
                        },
                      },
                      error: {
                        style: {
                          background: '#ef4444',
                        },
                      },
                    }}
                  />
                </div>
              </Router>
            </CartProvider>
          </NotificationProvider>
        </DataProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
