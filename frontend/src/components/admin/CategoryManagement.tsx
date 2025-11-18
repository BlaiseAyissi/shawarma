import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  XMarkIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { useData, Category } from '../../context/DataContext';

const CategoryManagement: React.FC = () => {
  const { 
    categories, 
    addCategory, 
    updateCategory, 
    deleteCategory,
    isLoading 
  } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    available: true
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      description: '',
      available: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setModalMode('edit');
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      available: category.available
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const categoryData = {
      name: formData.name,
      description: formData.description,
      available: formData.available
    };

    if (modalMode === 'create') {
      addCategory(categoryData);
    } else {
      updateCategory(selectedCategory!._id, categoryData);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (categoryId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie?')) {
      deleteCategory(categoryId);
    }
  };

  const toggleCategoryAvailability = (categoryId: string) => {
    const category = categories.find(c => c._id === categoryId);
    if (category) {
      updateCategory(categoryId, { available: !category.available });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-secondary-900">
            Gestion des Catégories
          </h2>
          <p className="text-secondary-600 mt-1">
            Organisez vos produits par catégories
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Nouvelle Catégorie</span>
        </button>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="card p-6 animate-pulse">
              <div className="h-4 bg-secondary-200 rounded mb-2" />
              <div className="h-3 bg-secondary-200 rounded mb-4 w-3/4" />
              <div className="h-8 bg-secondary-200 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <TagIcon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-lg text-secondary-900">
                      {category.name}
                    </h3>
                    <p className="text-sm text-secondary-600">
                      {category.productCount} produit{category.productCount > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleCategoryAvailability(category._id)}
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    category.available
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {category.available ? 'Active' : 'Inactive'}
                </button>
              </div>
              
              <p className="text-secondary-600 text-sm mb-4">
                {category.description}
              </p>

              <div className="flex space-x-2">
                <button
                  onClick={() => openEditModal(category)}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center justify-center space-x-1"
                >
                  <PencilIcon className="w-4 h-4" />
                  <span>Modifier</span>
                </button>
                <button
                  onClick={() => handleDelete(category._id)}
                  className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
                  disabled={category.productCount > 0}
                  title={category.productCount > 0 ? 'Impossible de supprimer une catégorie contenant des produits' : 'Supprimer la catégorie'}
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Category Modal */}
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
                    {modalMode === 'create' ? 'Nouvelle Catégorie' : 'Modifier la Catégorie'}
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
                      Nom de la catégorie
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="Ex: Shawarma, Boissons..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className="input-field resize-none"
                      placeholder="Description de la catégorie..."
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
                      Catégorie active
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

export default CategoryManagement;