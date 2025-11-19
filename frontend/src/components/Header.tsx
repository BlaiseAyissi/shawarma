import React, { useState } from 'react';
import { ShoppingCartIcon, UserIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationBell from './NotificationBell';

const Header: React.FC = () => {
  const { items, toggleCart } = useCart();
  const { user, isAuthenticated, logout, showAuthModal } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="bg-white shadow-sm border-b border-secondary-100 sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <img
                src="/logo2.jpeg"
                alt="The House of Shawarma Logo"
                className="w-10 h-10 rounded-lg object-cover"
              />
              <div>
                <h1 className="text-xl font-display font-bold text-secondary-900">
                  The House of Shawarma
                </h1>
                <p className="text-xs text-secondary-500 hidden sm:block">
                  {t('header.tagline')}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#about" className="text-secondary-700 hover:text-primary-600 font-medium transition-colors">
              {t('header.about')}
            </a>
            <a href="#contact" className="text-secondary-700 hover:text-primary-600 font-medium transition-colors">
              {t('header.contact')}
            </a>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="text-sm font-medium text-secondary-600 hover:text-primary-600 transition-colors"
            >
              {language === 'fr' ? 'EN' : 'FR'}
            </button>

            {/* Notifications (only for authenticated users) */}
            {isAuthenticated && <NotificationBell />}

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-secondary-700 hover:text-primary-600 transition-colors">
                  <UserIcon className="w-5 h-5" />
                  <span className="hidden sm:block font-medium">{user?.name}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-secondary-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-2">
                    <a href="/profile" className="block px-4 py-2 text-sm text-secondary-700 hover:bg-gray-50">
                      {t('header.profile')}
                    </a>
                    <a href="/orders" className="block px-4 py-2 text-sm text-secondary-700 hover:bg-gray-50">
                      {t('header.orders')}
                    </a>
                    {user?.role === 'admin' && (
                      <a href="/admin" className="block px-4 py-2 text-sm text-primary-600 hover:bg-gray-50">
                        Administration
                      </a>
                    )}
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                    >
                      {t('header.logout')}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => showAuthModal('login')}
                className="text-secondary-700 hover:text-primary-600 font-medium transition-colors"
              >
                {t('header.login')}
              </button>
            )}

            {/* Cart Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleCart}
              className="relative p-2 text-secondary-700 hover:text-primary-600 transition-colors"
            >
              <ShoppingCartIcon className="w-6 h-6" />
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                >
                  {itemCount}
                </motion.span>
              )}
            </motion.button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-secondary-700 hover:text-primary-600 transition-colors"
            >
              {isMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-secondary-100 py-4"
            >
              <nav className="flex flex-col space-y-4">
                <a href="#menu" className="text-secondary-700 hover:text-primary-600 font-medium transition-colors">
                  {t('header.menu')}
                </a>
                <a href="#about" className="text-secondary-700 hover:text-primary-600 font-medium transition-colors">
                  {t('header.about')}
                </a>
                <a href="#contact" className="text-secondary-700 hover:text-primary-600 font-medium transition-colors">
                  {t('header.contact')}
                </a>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;