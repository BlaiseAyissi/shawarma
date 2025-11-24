import React, { useState, useEffect } from 'react';
import { XMarkIcon, CreditCardIcon, DevicePhoneMobileIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';
import { useData } from '../context/DataContext';
import { settingsAPI } from '../services/api';
import toast from 'react-hot-toast';

const CheckoutModal: React.FC = () => {
  const { items, total, clearCart, closeCart } = useCart();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { addNotification } = useNotifications();
  const { addOrder } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'momo' | 'om' | 'cash'>('momo');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: user?.address || '',
    neighborhood: '',
    city: '',
    phone: user?.phone || '',
    instructions: ''
  });
  const [errors, setErrors] = useState({
    street: false,
    neighborhood: false,
    city: false,
    phone: false
  });
  const [touched, setTouched] = useState({
    street: false,
    neighborhood: false,
    city: false,
    phone: false
  });
  const [cities, setCities] = useState<string[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
  const [deliveryFee, setDeliveryFee] = useState(500);

  // Load WhatsApp number and cities
  useEffect(() => {
    const loadData = async () => {
      try {
        const [settings, citiesList] = await Promise.all([
          settingsAPI.get(),
          import('../services/api').then(m => m.deliveryZonesAPI.getCities())
        ]);
        setWhatsappNumber(settings.whatsappNumber);
        setCities(citiesList);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  // Load neighborhoods when city changes
  useEffect(() => {
    const loadNeighborhoods = async () => {
      if (deliveryAddress.city) {
        try {
          const { deliveryZonesAPI } = await import('../services/api');
          const neighborhoodsList = await deliveryZonesAPI.getNeighborhoods(deliveryAddress.city);
          setNeighborhoods(neighborhoodsList);
        } catch (error) {
          console.error('Error loading neighborhoods:', error);
          setNeighborhoods([]);
        }
      } else {
        setNeighborhoods([]);
      }
    };
    loadNeighborhoods();
  }, [deliveryAddress.city]);

  // Calculate delivery fee when city and neighborhood are selected
  useEffect(() => {
    const calculateFee = async () => {
      if (deliveryAddress.city && deliveryAddress.neighborhood) {
        try {
          const { deliveryZonesAPI } = await import('../services/api');
          const feeData = await deliveryZonesAPI.calculateFee(
            deliveryAddress.city,
            deliveryAddress.neighborhood
          );
          setDeliveryFee(feeData.deliveryFee);
        } catch (error) {
          console.error('Error calculating fee:', error);
          setDeliveryFee(500); // Default fee
        }
      }
    };
    calculateFee();
  }, [deliveryAddress.city, deliveryAddress.neighborhood]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const finalTotal = total + deliveryFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDeliveryAddress({
      ...deliveryAddress,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: false
      });
    }
  };

  const handleBlur = (field: keyof typeof errors) => {
    setTouched({
      ...touched,
      [field]: true
    });
    
    // Validate on blur
    const value = deliveryAddress[field];
    setErrors({
      ...errors,
      [field]: !value || value.trim().length === 0
    });
  };

  const validateForm = () => {
    const newErrors = {
      street: !deliveryAddress.street || deliveryAddress.street.trim().length < 5,
      neighborhood: !deliveryAddress.neighborhood,
      city: !deliveryAddress.city,
      phone: !deliveryAddress.phone || deliveryAddress.phone.trim().length === 0
    };
    
    setErrors(newErrors);
    setTouched({
      street: true,
      neighborhood: true,
      city: true,
      phone: true
    });
    
    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submitting
    if (!validateForm()) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    setIsLoading(true);

    try {
      // Create order via backend API
      // Backend expects: items, paymentMethod, deliveryAddress
      const orderData = {
        items: items.map(item => ({
          productId: item.product._id,
          quantity: item.quantity,
          size: item.size,
          selectedToppings: item.selectedToppings?.map(t => t._id) || [],
          customizations: item.customizations || ''
        })),
        paymentMethod,
        deliveryAddress: {
          street: deliveryAddress.street,
          neighborhood: deliveryAddress.neighborhood,
          city: deliveryAddress.city,
          phone: deliveryAddress.phone,
          instructions: deliveryAddress.instructions
        }
      };

      console.log('Sending order data:', JSON.stringify(orderData, null, 2));
      const createdOrder: any = await addOrder(orderData as any);

      if (createdOrder) {
        // Customer notification - Order is PENDING, not confirmed
        addNotification({
          type: 'order_placed',
          title: 'Commande reçue',
          message: `Votre commande ${createdOrder.orderNumber} a été reçue et est en attente de confirmation`,
          orderNumber: createdOrder.orderNumber,
          orderId: createdOrder._id,
          targetRole: 'customer',
          userId: user?._id,
          priority: 'high'
        });

        // Admin notification - New order needs confirmation
        addNotification({
          type: 'order_placed',
          title: 'Nouvelle commande à confirmer',
          message: `Commande ${createdOrder.orderNumber} de ${user?.name} - ${formatPrice(finalTotal)} (EN ATTENTE)`,
          orderNumber: createdOrder.orderNumber,
          orderId: createdOrder._id,
          targetRole: 'admin',
          priority: 'high'
        });

        toast.success('Commande passée avec succès! Redirection vers WhatsApp...');

        // Redirect to WhatsApp with order details
        const whatsappMessage = `🛒 *Nouvelle Commande*\n\n` +
          `🗃️ *Numéro de commande:* ${createdOrder.orderNumber}\n` +
          `👤 *Client:* ${user?.name}\n` +
          `📞 *Téléphone:* ${deliveryAddress.phone}\n` +
          `📍 *Adresse:* ${deliveryAddress.street}, ${deliveryAddress.city}\n\n` +
          `🍽️ *Articles:*\n` +
          items.map(item =>
            `• ${item.quantity}x ${item.product.name} (${item.sizeName})\n` +
            (item.selectedToppings.length > 0 ? `  Garnitures: ${item.selectedToppings.map(t => t.name).join(', ')}\n` : '')
          ).join('') +
          `\n💰 *Total:* ${formatPrice(finalTotal)}\n` +
          `💳 *Mode de paiement:* ${paymentMethod === 'momo' ? 'MTN Mobile Money' : paymentMethod === 'om' ? 'Orange Money' : paymentMethod === 'cash' ? 'Espèces' : 'Carte bancaire'}\n\n` +
          (deliveryAddress.instructions ? `📝 *Instructions:* ${deliveryAddress.instructions}\n\n` : '') +
          `Merci de confirmer la commande! 🙏`;

        const encodedMessage = encodeURIComponent(whatsappMessage);
        const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;

        // Open WhatsApp - use different method for mobile
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (isMobile) {
          // On mobile, use direct navigation for better compatibility
          window.location.href = whatsappUrl;
        } else {
          // On desktop, open in new tab
          window.open(whatsappUrl, '_blank');
        }
      }

      clearCart();
      closeCart();
      setIsOpen(false);

      // Reset form
      setDeliveryAddress({
        street: user?.address || '',
        neighborhood: '',
        city: '',
        phone: user?.phone || '',
        instructions: ''
      });
      setErrors({
        street: false,
        neighborhood: false,
        city: false,
        phone: false
      });
      setTouched({
        street: false,
        neighborhood: false,
        city: false,
        phone: false
      });
    } catch (error) {
      console.error('Order creation error:', error);
      toast.error('Erreur lors de la commande');
    } finally {
      setIsLoading(false);
    }
  };

  // This would be triggered from Cart component
  React.useEffect(() => {
    const handleCheckout = () => setIsOpen(true);
    window.addEventListener('openCheckout', handleCheckout);
    return () => window.removeEventListener('openCheckout', handleCheckout);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-secondary-100">
                <h2 className="text-2xl font-display font-bold text-secondary-900">
                  {t('checkout.title')}
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-secondary-400 hover:text-secondary-600 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left Column - Delivery & Payment */}
                  <div className="space-y-6">
                    {/* Delivery Address */}
                    <div>
                      <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                        {t('checkout.deliveryAddress')}
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <select
                            name="city"
                            value={deliveryAddress.city}
                            onChange={(e) => {
                              handleInputChange(e);
                              setDeliveryAddress({ ...deliveryAddress, city: e.target.value, neighborhood: '' });
                            }}
                            onBlur={() => handleBlur('city')}
                            required
                            className={`input-field ${touched.city && errors.city ? 'border-red-500 ring-2 ring-red-200' : ''}`}
                          >
                            <option value="">Sélectionner une ville</option>
                            {cities.map((city) => (
                              <option key={city} value={city}>
                                {city}
                              </option>
                            ))}
                          </select>
                          {touched.city && errors.city && (
                            <p className="text-red-500 text-sm mt-1">La ville est obligatoire</p>
                          )}
                        </div>
                        <div>
                          <select
                            name="neighborhood"
                            value={deliveryAddress.neighborhood}
                            onChange={handleInputChange}
                            onBlur={() => handleBlur('neighborhood')}
                            required
                            disabled={!deliveryAddress.city || neighborhoods.length === 0}
                            className={`input-field ${touched.neighborhood && errors.neighborhood ? 'border-red-500 ring-2 ring-red-200' : ''} ${!deliveryAddress.city || neighborhoods.length === 0 ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                          >
                            <option value="">
                              {!deliveryAddress.city 
                                ? 'Sélectionner d\'abord une ville' 
                                : neighborhoods.length === 0 
                                ? 'Chargement...' 
                                : 'Sélectionner un quartier'}
                            </option>
                            {neighborhoods.map((neighborhood) => (
                              <option key={neighborhood} value={neighborhood}>
                                {neighborhood}
                              </option>
                            ))}
                          </select>
                          {touched.neighborhood && errors.neighborhood && (
                            <p className="text-red-500 text-sm mt-1">Le quartier est obligatoire</p>
                          )}
                        </div>
                        <div>
                          <input
                            type="text"
                            name="street"
                            value={deliveryAddress.street}
                            onChange={handleInputChange}
                            onBlur={() => handleBlur('street')}
                            required
                            className={`input-field ${touched.street && errors.street ? 'border-red-500 ring-2 ring-red-200' : ''}`}
                            placeholder="Numéro et nom de rue..."
                          />
                          {touched.street && errors.street && (
                            <p className="text-red-500 text-sm mt-1">L'adresse doit contenir au moins 5 caractères</p>
                          )}
                        </div>
                        <div>
                          <input
                            type="tel"
                            name="phone"
                            value={deliveryAddress.phone}
                            onChange={handleInputChange}
                            onBlur={() => handleBlur('phone')}
                            required
                            className={`input-field ${touched.phone && errors.phone ? 'border-red-500 ring-2 ring-red-200' : ''}`}
                            placeholder="Téléphone"
                          />
                          {touched.phone && errors.phone && (
                            <p className="text-red-500 text-sm mt-1">Le numéro de téléphone est obligatoire</p>
                          )}
                        </div>
                        <textarea
                          name="instructions"
                          value={deliveryAddress.instructions}
                          onChange={handleInputChange}
                          rows={3}
                          className="input-field resize-none"
                          placeholder="Instructions de livraison (optionnel)"
                        />
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                      <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                        {t('checkout.paymentMethod')}
                      </h3>
                      <div className="space-y-3">

                        <label className="flex items-center p-4 border border-secondary-200 rounded-lg cursor-pointer hover:border-primary-300 transition-colors">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="momo"
                            checked={paymentMethod === 'momo'}
                            onChange={(e) => setPaymentMethod(e.target.value as any)}
                            className="mr-3"
                          />
                          <DevicePhoneMobileIcon className="w-5 h-5 mr-3 text-secondary-600" />
                          <span className="font-medium">MTN Mobile Money</span>
                        </label>

                        <label className="flex items-center p-4 border border-secondary-200 rounded-lg cursor-pointer hover:border-primary-300 transition-colors">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="om"
                            checked={paymentMethod === 'om'}
                            onChange={(e) => setPaymentMethod(e.target.value as any)}
                            className="mr-3"
                          />
                          <DevicePhoneMobileIcon className="w-5 h-5 mr-3 text-orange-600" />
                          <span className="font-medium">Orange Money</span>
                        </label>

                        <label className="flex items-center p-4 border border-secondary-200 rounded-lg cursor-pointer hover:border-primary-300 transition-colors">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="cash"
                            checked={paymentMethod === 'cash'}
                            onChange={(e) => setPaymentMethod(e.target.value as any)}
                            className="mr-3"
                          />
                          <BanknotesIcon className="w-5 h-5 mr-3 text-secondary-600" />
                          <span className="font-medium">{t('checkout.cashOnDelivery')}</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Order Summary */}
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                      {t('checkout.orderSummary')}
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                      {/* Items */}
                      <div className="space-y-3">
                        {items.map((item, index) => (
                          <div key={index} className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium text-secondary-900">{item.product.name}</p>
                              <p className="text-sm text-secondary-500">
                                {item.quantity}x • {item.size}
                              </p>
                              {item.selectedToppings.length > 0 && (
                                <p className="text-xs text-secondary-400">
                                  + {item.selectedToppings.map(t => t.name).join(', ')}
                                </p>
                              )}
                            </div>
                            <span className="font-medium text-secondary-900">
                              {formatPrice(
                                (item.product.basePrice + (item.sizePrice || 0) +
                                  item.selectedToppings.reduce((sum, t) => sum + t.price, 0)) * item.quantity
                              )}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Totals */}
                      <div className="border-t border-secondary-200 pt-4 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-secondary-600">{t('checkout.subtotal')}</span>
                          <span className="font-medium">{formatPrice(total)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-secondary-600">{t('checkout.deliveryFee')}</span>
                          <span className="font-medium">{formatPrice(deliveryFee)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-secondary-900 border-t border-secondary-200 pt-2">
                          <span>{t('checkout.total')}</span>
                          <span className="text-primary-600">{formatPrice(finalTotal)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Place Order Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading}
                      className="w-full btn-primary mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Traitement...
                        </div>
                      ) : (
                        `${t('checkout.placeOrder')} • ${formatPrice(finalTotal)}`
                      )}
                    </motion.button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CheckoutModal;