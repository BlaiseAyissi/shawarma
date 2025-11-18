import React, { useState } from 'react';
import { XMarkIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, Topping } from '../types';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

interface ProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const { t } = useLanguage();
  
  // Get available size variations
  const availableSizes = product.sizeVariations.filter(sv => sv.available);
  const [selectedSize, setSelectedSize] = useState<string>(availableSizes[0]?.size || '');
  const [selectedToppings, setSelectedToppings] = useState<Topping[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [customizations, setCustomizations] = useState('');
  
  // Image carousel state
  const allImages = [product.image, ...(product.images || [])].filter(Boolean);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };
  
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const calculateTotalPrice = () => {
    const sizeVariation = product.sizeVariations.find(sv => sv.size === selectedSize);
    const sizePrice = sizeVariation?.price || 0;
    const basePrice = product.basePrice + sizePrice;
    const toppingsPrice = selectedToppings.reduce((sum, topping) => sum + topping.price, 0);
    return (basePrice + toppingsPrice) * quantity;
  };

  const toggleTopping = (topping: Topping) => {
    setSelectedToppings(prev => {
      const exists = prev.find(t => t._id === topping._id);
      if (exists) {
        return prev.filter(t => t._id !== topping._id);
      } else {
        return [...prev, topping];
      }
    });
  };

  const handleAddToCart = () => {
    addToCart(product, selectedToppings, selectedSize, quantity);
    onClose();
    // Reset form
    setSelectedSize('medium');
    setSelectedToppings([]);
    setQuantity(1);
    setCustomizations('');
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
            onClick={onClose}
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
              {/* Header with Image Carousel */}
              <div className="relative">
                <img
                  src={allImages[currentImageIndex] || '/api/placeholder/600/300'}
                  alt={`${product.name} - Image ${currentImageIndex + 1}`}
                  className="w-full h-64 object-cover rounded-t-2xl"
                />
                
                {/* Navigation Arrows */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white bg-opacity-90 rounded-full shadow-sm hover:bg-opacity-100 transition-all duration-200"
                    >
                      <svg className="w-5 h-5 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white bg-opacity-90 rounded-full shadow-sm hover:bg-opacity-100 transition-all duration-200"
                    >
                      <svg className="w-5 h-5 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    
                    {/* Image Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                      {allImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === currentImageIndex 
                              ? 'bg-white w-6' 
                              : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
                
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 bg-white bg-opacity-90 rounded-full shadow-sm hover:bg-opacity-100 transition-all duration-200 z-10"
                >
                  <XMarkIcon className="w-6 h-6 text-secondary-600" />
                </button>
                <div className="absolute top-4 left-4">
                  <span className="bg-primary-500 text-white text-sm font-medium px-3 py-1 rounded-full">
                    {product.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Product Info */}
                <div className="mb-6">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-2xl font-display font-bold text-secondary-900">
                      {product.name}
                    </h2>
                    <span className="text-2xl font-bold text-primary-600">
                      {formatPrice(product.basePrice)}
                    </span>
                  </div>
                  <p className="text-secondary-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Size Selection */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-secondary-900 mb-3">
                    {t('product.size')}
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {availableSizes.map((size) => (
                      <motion.button
                        key={size.size}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedSize(size.size)}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          selectedSize === size.size
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-secondary-200 hover:border-secondary-300'
                        }`}
                      >
                        <div className="text-center">
                          <p className="font-semibold">{size.name}</p>
                          <p className="text-sm text-secondary-500 mt-1">
                            {formatPrice(product.basePrice + size.price)}
                          </p>
                          {size.price > 0 && (
                            <p className="text-xs text-secondary-400 mt-1">
                              +{formatPrice(size.price)}
                            </p>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Toppings */}
                {product.toppings && product.toppings.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-3">
                      {t('product.toppings')} ({selectedToppings.length} {t('product.toppingsSelected')})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {product.toppings.map((topping) => (
                        <motion.button
                          key={topping._id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toggleTopping(topping)}
                          disabled={!topping.available}
                          className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                            selectedToppings.find(t => t._id === topping._id)
                              ? 'border-primary-500 bg-primary-50'
                              : topping.available
                              ? 'border-secondary-200 hover:border-secondary-300'
                              : 'border-secondary-100 bg-secondary-50 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className={`font-medium ${
                              selectedToppings.find(t => t._id === topping._id)
                                ? 'text-primary-700'
                                : 'text-secondary-900'
                            }`}>
                              {topping.name}
                            </span>
                            <span className="text-sm font-semibold text-secondary-600">
                              +{formatPrice(topping.price)}
                            </span>
                          </div>
                          {!topping.available && (
                            <p className="text-xs text-red-500 mt-1">{t('product.unavailable')}</p>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Instructions */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-secondary-900 mb-3">
                    {t('product.instructions')}
                  </h3>
                  <textarea
                    value={customizations}
                    onChange={(e) => setCustomizations(e.target.value)}
                    placeholder={t('product.instructionsPlaceholder')}
                    className="w-full p-3 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>

                {/* Quantity and Add to Cart */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="font-semibold text-secondary-900">{t('product.quantity')}</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2 text-secondary-400 hover:text-secondary-600 transition-colors"
                      >
                        <MinusIcon className="w-5 h-5" />
                      </button>
                      <span className="font-semibold text-lg text-secondary-900 min-w-[3rem] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-2 text-secondary-400 hover:text-secondary-600 transition-colors"
                      >
                        <PlusIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddToCart}
                    className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                  >
                    {t('product.addToCart')} • {formatPrice(calculateTotalPrice())}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProductModal;