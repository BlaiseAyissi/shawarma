import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  XMarkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useData } from '../../context/DataContext';
import { Topping } from '../../types';

const ToppingManagement: React.FC = () => {
  const { 
    toppings: allToppings, 
    addTopping, 
    updateTopping, 
    deleteTopping,
    isLoading 
  } = useData();

  const [filteredToppings, setFilteredToppings] = useState<Topping[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedTopping, setSelectedTopping] = useState<Topping | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Légumes',
    description: '',
    available: true
  });

  const toppingCategories = ['Légumes', 'Sauces', 'Fromages', 'Viandes', 'Épices', 'Autres'];

  // Initialize filtered toppings
  useEffect(() => {
    setFilteredToppings(allToppings);
  }, [allToppings]);

  // Filter toppings
  useEffect(() => {
    let filtered = allToppings;
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(t => t.category === categoryFilter);
    }
    setFilteredToppings(filtered);
  }, []);

  // Filter toppings
  useEffect(() => {
    let filtered = allToppings;

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((topping: Topping) => topping.category === categoryFilter);
    }

    setFilteredToppings(filtered);
  }, [allToppings, categoryFilter]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      name: '',
      price: '',
      category: 'Légumes',
      description: '',
      available: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (topping: Topping) => {
    setModalMode('edit');
    setSelectedTopping(topping);
    setFormData({
      name: topping.name,
      price: topping.price.toString(),
      category: topping.category || 'Autres',
      description: topping.description || '',
      available: topping.available
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const toppingData = {
      name: formData.name,
      price: parseFloat(formData.price),
      category: formData.category,
      description: formData.description,
      available: formData.available
    };

    if (modalMode === 'create') {
      addTopping(toppingData);
    } else {
      updateTopping(selectedTopping!._id, toppingData);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (toppingId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette garniture?')) {
      deleteTopping(toppingId);
    }
  };

  const toggleToppingAvailability = (toppingId: string) => {
    const topping = allToppings.find(t => t._id === toppingId);
    if (topping) {
      updateTopping(toppingId, { available: !topping.available });
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Légumes': 'bg-green-100 text-green-800',
      'Sauces': 'bg-orange-100 text-orange-800',
      'Fromages': 'bg-yellow-100 text-yellow-800',
      'Viandes': 'bg-red-100 text-red-800',
      'Épices': 'bg-purple-100 text-purple-800',
      'Autres': 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-secondary-900">
            Gestion des Garnitures
          </h2>
          <p className="text-secondary-600 mt-1">
            Gérez les garnitures et leurs prix
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Nouvelle Garniture</span>
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            categoryFilter === 'all'
              ? 'bg-primary-500 text-white'
              : 'bg-white text-secondary-700 hover:bg-secondary-50 border border-secondary-200'
          }`}
        >
          Toutes ({allToppings.length})
        </button>
        {toppingCategories.map((category) => (
          <button
            key={category}
            onClick={() => setCategoryFilter(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              categoryFilter === category
                ? 'bg-primary-500 text-white'
                : 'bg-white text-secondary-700 hover:bg-secondary-50 border border-secondary-200'
            }`}
          >
            {category} ({allToppings.filter((t: Topping) => t.category === category).length})
          </button>
        ))}
      </div>

      {/* Toppings Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="card p-4 animate-pulse">
              <div className="h-4 bg-secondary-200 rounded mb-2" />
              <div className="h-3 bg-secondary-200 rounded mb-4 w-3/4" />
              <div className="h-8 bg-secondary-200 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredToppings.map((topping) => (
            <motion.div
              key={topping._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <SparklesIcon className="w-4 h-4 text-primary-600" />
                  <h3 className="font-semibold text-secondary-900">
                    {topping.name}
                  </h3>
                </div>
                <button
                  onClick={() => toggleToppingAvailability(topping._id)}
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    topping.available
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {topping.available ? 'Dispo' : 'Indispo'}
                </button>
              </div>
              
              <div className="mb-3">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(topping.category || 'Autres')}`}>
                  {topping.category}
                </span>
              </div>

              {topping.description && (
                <p className="text-xs text-secondary-600 mb-3">
                  {topping.description}
                </p>
              )}

              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-primary-600">
                  {formatPrice(topping.price)}
                </span>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => openEditModal(topping)}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-medium py-1 px-2 rounded text-xs flex items-center justify-center space-x-1"
                >
                  <PencilIcon className="w-3 h-3" />
                  <span>Modifier</span>
                </button>
                <button
                  onClick={() => handleDelete(topping._id)}
                  className="bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-2 rounded text-xs"
                >
                  <TrashIcon className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Topping Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-secondary-100">
                  <h3 className="text-xl font-display font-bold text-secondary-900">
                    {modalMode === 'create' ? 'Nouvelle Garniture' : 'Modifier la Garniture'}
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 text-secondary-400 hover:text-secondary-600 transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Nom de la garniture
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="Ex: Tomates, Sauce Ail..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Prix (FCFA)
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="25"
                        className="input-field"
                        placeholder="100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Catégorie
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        className="input-field"
                      >
                        {toppingCategories.map(category => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Description (optionnel)
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={2}
                      className="input-field resize-none"
                      placeholder="Description de la garniture..."
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="available"
                      checked={formData.available}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <label className="text-sm font-medium text-secondary-700">
                      Garniture disponible
                    </label>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4 border-t border-secondary-100">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="btn-secondary"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                    >
                      {modalMode === 'create' ? 'Créer' : 'Sauvegarder'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ToppingManagement;