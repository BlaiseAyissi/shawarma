import React from 'react';
import { XMarkIcon, MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

const Cart: React.FC = () => {
  const { items, isOpen, total, closeCart, updateQuantity, removeFromCart } = useCart();
  const { isAuthenticated, showAuthModal } = useAuth();
  const { t } = useLanguage();


  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getItemPrice = (item: any) => {
    const basePrice = item.product.basePrice;
    const sizePrice = item.sizePrice || 0;
    const toppingsPrice = item.selectedToppings.reduce((sum: number, topping: any) => sum + topping.price, 0);
    return (basePrice + sizePrice + toppingsPrice) * item.quantity;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />

          {/* Cart Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-secondary-100">
              <h2 className="text-xl font-display font-semibold text-secondary-900">
                {t('cart.title')}
              </h2>
              <button
                onClick={closeCart}
                className="p-2 text-secondary-400 hover:text-secondary-600 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🛒</span>
                  </div>
                  <p className="text-secondary-500 mb-2">{t('cart.empty')}</p>
                  <p className="text-sm text-secondary-400">
                    {t('cart.emptyDesc')}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="card p-4"
                    >
                      <div className="flex items-start space-x-4">
                        <img
                          src={item.product.image || '/api/placeholder/80/80'}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-secondary-900 truncate">
                            {item.product.name}
                          </h3>
                          <p className="text-sm text-secondary-500 capitalize">
                            {t('cart.size')} {item.sizeName || item.size}
                          </p>
                          {item.selectedToppings.length > 0 && (
                            <p className="text-xs text-secondary-400 mt-1">
                              + {item.selectedToppings.map(t => t.name).join(', ')}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => updateQuantity(index, item.quantity - 1)}
                                className="p-1 text-secondary-400 hover:text-secondary-600 transition-colors"
                              >
                                <MinusIcon className="w-4 h-4" />
                              </button>
                              <span className="font-medium text-secondary-900 min-w-[2rem] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(index, item.quantity + 1)}
                                className="p-1 text-secondary-400 hover:text-secondary-600 transition-colors"
                              >
                                <PlusIcon className="w-4 h-4" />
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(index)}
                              className="p-1 text-red-400 hover:text-red-600 transition-colors"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-secondary-900">
                            {formatPrice(getItemPrice(item))}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-secondary-100 p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-secondary-900">{t('cart.total')}</span>
                  <span className="text-xl font-bold text-primary-600">
                    {formatPrice(total)}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (!isAuthenticated) {
                      showAuthModal('login');
                    } else {
                      // Trigger checkout modal
                      window.dispatchEvent(new CustomEvent('openCheckout'));
                    }
                  }}
                  className="w-full btn-primary"
                >
                  {t('cart.placeOrder')}
                </motion.button>
                <button
                  onClick={closeCart}
                  className="w-full btn-secondary"
                >
                  {t('cart.continueShopping')}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Cart;