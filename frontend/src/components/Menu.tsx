import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import ProductCard from './ProductCard';
import { Product } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';

const Menu: React.FC = () => {
  const { t } = useLanguage();
  const { products: allProducts, categories: allCategories, isLoading: dataLoading } = useData();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter only available products - memoize to prevent infinite loops
  const products = React.useMemo(() => allProducts.filter(p => p.available), [allProducts]);
  
  // Debug logging - removed products from dependencies to prevent loop
  useEffect(() => {
    console.log('Menu component - Data state:', {
      allProducts: allProducts.length,
      availableProducts: products.length,
      categories: allCategories.length,
      isLoading: dataLoading
    });
  }, [allProducts.length, products.length, allCategories.length, dataLoading]);

  const categories = React.useMemo(() => [
    { id: 'all', name: t('menu.categories.all'), count: products.length },
    ...allCategories
      .filter(cat => cat.available)
      .map(cat => ({
        id: cat.name,
        name: cat.name,
        count: products.filter(p => p.category === cat.name).length
      }))
  ], [products, allCategories, t]);

  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  useEffect(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchTerm]);

  return (
    <section id="menu" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-display font-bold text-secondary-900 mb-4">
            {t('menu.title')}
          </h2>
          <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
            {t('menu.description')}
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto mb-6">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
            <input
              type="text"
              placeholder={t('menu.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${selectedCategory === category.id
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-white text-secondary-700 border border-secondary-200 hover:border-primary-300 hover:text-primary-600'
                  }`}
              >
                {category.name}
                <span className="ml-2 text-sm opacity-75">({category.count})</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Products Grid */}
        {dataLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="card animate-pulse">
                <div className="h-48 bg-secondary-200 rounded-t-xl" />
                <div className="p-6">
                  <div className="h-4 bg-secondary-200 rounded mb-2" />
                  <div className="h-3 bg-secondary-200 rounded mb-4 w-3/4" />
                  <div className="h-8 bg-secondary-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FunnelIcon className="w-8 h-8 text-secondary-400" />
            </div>
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">
              {t('menu.noResults')}
            </h3>
            <p className="text-secondary-600 mb-4">
              {t('menu.noResultsDesc')}
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="btn-primary"
            >
              {t('menu.resetFilters')}
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default Menu;