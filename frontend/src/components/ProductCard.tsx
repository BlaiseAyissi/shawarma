import React, { useState } from 'react';
import { PlusIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import ProductModal from './ProductModal';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    //console.log(product.sizeVariations[0].size)
    addToCart(product, [], product.sizeVariations[0].size, 1);
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="card cursor-pointer group"
        onClick={() => setIsModalOpen(true)}
      >
        {/* Image Container */}
        <div className="relative overflow-hidden">
          <img
            src={product.image || '/api/placeholder/300/200'}
            alt={product.name}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
          />
          
          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              whileHover={{ opacity: 1, scale: 1 }}
              className="bg-white text-primary-600 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
              onClick={handleQuickAdd}
            >
              <PlusIcon className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Favorite Button */}
          <button
            onClick={toggleFavorite}
            className="absolute top-3 right-3 p-2 bg-white bg-opacity-90 rounded-full shadow-sm hover:bg-opacity-100 transition-all duration-200"
          >
            {isFavorite ? (
              <HeartSolidIcon className="w-5 h-5 text-red-500" />
            ) : (
              <HeartIcon className="w-5 h-5 text-secondary-400" />
            )}
          </button>

          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <span className="bg-primary-500 text-white text-xs font-medium px-2 py-1 rounded-full">
              {product.category}
            </span>
          </div>

          {/* Multiple Images Indicator */}
          {product.images && product.images.length > 0 && (
            <div className="absolute bottom-3 right-3">
              <span className="bg-black bg-opacity-70 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center space-x-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                <span>{product.images.length + 1}</span>
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-display font-semibold text-lg text-secondary-900 group-hover:text-primary-600 transition-colors">
              {product.name}
            </h3>
            <span className="font-bold text-primary-600 text-lg">
              {formatPrice(product.basePrice)}
            </span>
          </div>
          
          <p className="text-secondary-600 text-sm mb-4 line-clamp-2">
            {product.description}
          </p>

          {/* Toppings Preview */}
          {product.toppings && product.toppings.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-secondary-500 mb-2">Garnitures disponibles:</p>
              <div className="flex flex-wrap gap-1">
                {product.toppings.slice(0, 3).map((topping) => (
                  <span
                    key={topping._id}
                    className="text-xs bg-secondary-100 text-secondary-600 px-2 py-1 rounded-full"
                  >
                    {topping.name}
                  </span>
                ))}
                {product.toppings.length > 3 && (
                  <span className="text-xs text-secondary-400 px-2 py-1">
                    +{product.toppings.length - 3} autres
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleQuickAdd}
              className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
            >
              {t('menu.quickAdd')}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(true);
              }}
              className="bg-secondary-100 hover:bg-secondary-200 text-secondary-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
            >
              {t('menu.customize')}
            </motion.button>
          </div>
        </div>

        {/* Hover Effect Border */}
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary-200 rounded-xl transition-colors duration-300 pointer-events-none" />
      </motion.div>

      {/* Product Modal */}
      <ProductModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default ProductCard;