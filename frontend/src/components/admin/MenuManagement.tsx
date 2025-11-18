import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { useData } from '../../context/DataContext';
import { Product, Topping, SizeVariation } from '../../types';
import toast from 'react-hot-toast';

const MenuManagement: React.FC = () => {
  const {
    products: allProducts,
    categories: allCategories,
    toppings: allToppings,
    addProduct,
    updateProduct,
    deleteProduct,
    isLoading: dataLoading
  } = useData();

  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    category: '',
    image: '',
    available: true
  });

  const [sizeVariations, setSizeVariations] = useState<SizeVariation[]>([]);
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageSource, setImageSource] = useState<'url' | 'upload'>('url');
  
  // Multiple images state
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([]);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([]);

  // Get category names from DataContext
  const categories = allCategories.map(cat => cat.name);
  const availableToppings = allToppings;

  // Initialize filtered products
  useEffect(() => {
    setFilteredProducts(allProducts);
  }, [allProducts]);

  // Filter products
  useEffect(() => {
    let filtered = allProducts;

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [allProducts, categoryFilter, searchTerm]);

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

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Veuillez sélectionner un fichier image valide');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La taille de l\'image ne doit pas dépasser 5MB');
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, image: url }));
    setImagePreview(url);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const clearAdditionalImage = (index: number) => {
    setAdditionalImagePreviews(prev => prev.filter((_, i) => i !== index));
    setAdditionalImageFiles(prev => prev.filter((_, i) => i !== index));
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAdditionalImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = additionalImagePreviews.length + files.length;
    
    if (totalImages > 4) {
      toast.error('Vous pouvez ajouter maximum 4 images supplémentaires (5 au total avec l\'image principale)');
      return;
    }

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        toast.error('Veuillez sélectionner uniquement des fichiers image');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} dépasse la taille maximale de 5MB`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAdditionalImagePreviews(prev => [...prev, reader.result as string]);
        setAdditionalImageFiles(prev => [...prev, file]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAdditionalImageUrlAdd = (url: string) => {
    if (additionalImages.length >= 4) {
      toast.error('Maximum 4 images supplémentaires');
      return;
    }
    if (url.trim()) {
      setAdditionalImages(prev => [...prev, url]);
      setAdditionalImagePreviews(prev => [...prev, url]);
    }
  };

  const handleToppingToggle = (toppingId: string) => {
    setSelectedToppings(prev =>
      prev.includes(toppingId)
        ? prev.filter(id => id !== toppingId)
        : [...prev, toppingId]
    );
  };

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      name: '',
      description: '',
      basePrice: '',
      category: categories[0] || 'Shawarma',
      image: '',
      available: true
    });
    setSizeVariations([
      { size: 'small', name: 'Petit', price: 0, available: true },
    ]);
    setSelectedToppings([]);
    setImageFile(null);
    setImagePreview('');
    setImageSource('url');
    setAdditionalImages([]);
    setAdditionalImageFiles([]);
    setAdditionalImagePreviews([]);
    setIsModalOpen(true);
  };

  const addSizeVariation = () => {
    const newSize: SizeVariation = {
      size: `size_${Date.now()}`,
      name: '',
      price: 0,
      available: true
    };
    setSizeVariations(prev => [...prev, newSize]);
  };

  const removeSizeVariation = (index: number) => {
    if (sizeVariations.length > 1) {
      setSizeVariations(prev => prev.filter((_, i) => i !== index));
    }
  };

  const openEditModal = (product: Product) => {
    setModalMode('edit');
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      basePrice: product.basePrice.toString(),
      category: product.category,
      image: product.image,
      available: product.available
    });
    setSizeVariations(product.sizeVariations);
    setSelectedToppings(product.toppings.map(t => t._id));
    setImageFile(null);
    setImagePreview(product.image);
    setImageSource(product.image.startsWith('data:') ? 'upload' : 'url');
    setAdditionalImages(product.images || []);
    setAdditionalImageFiles([]);
    setAdditionalImagePreviews(product.images || []);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const productToppings = availableToppings.filter(t => selectedToppings.includes(t._id));

    // Use default image if none provided
    const defaultImage = 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&h=300&fit=crop';
    const productImage = formData.image && formData.image.trim() !== '' ? formData.image : defaultImage;

    const productData = {
      name: formData.name,
      description: formData.description,
      basePrice: parseFloat(formData.basePrice),
      sizeVariations: sizeVariations,
      category: formData.category,
      image: productImage,
      images: additionalImagePreviews, // Include additional images
      toppings: productToppings,
      available: formData.available
    };

    if (modalMode === 'create') {
      addProduct(productData);
    } else {
      updateProduct(selectedProduct!._id, productData);
    }

    setIsModalOpen(false);
  };

  const handleSizeVariationChange = (index: number, field: keyof SizeVariation, value: any) => {
    setSizeVariations(prev => prev.map((variation, i) =>
      i === index ? { ...variation, [field]: value } : variation
    ));
  };

  const handleDelete = (productId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) {
      deleteProduct(productId);
    }
  };

  const toggleProductAvailability = (productId: string) => {
    const product = allProducts.find(p => p._id === productId);
    if (product) {
      updateProduct(productId, { available: !product.available });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-secondary-900">
            Gestion du Menu
          </h2>
          <p className="text-secondary-600 mt-1">
            Gérez vos produits et leurs garnitures
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Nouveau Produit</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${categoryFilter === 'all'
                  ? 'bg-primary-500 text-white'
                  : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                }`}
            >
              Toutes ({allProducts.length})
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${categoryFilter === category
                    ? 'bg-primary-500 text-white'
                    : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                  }`}
              >
                {category} ({allProducts.filter((p: Product) => p.category === category).length})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {dataLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card overflow-hidden"
            >
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                
                {/* Multiple Images Indicator */}
                {product.images && product.images.length > 0 && (
                  <div className="absolute bottom-3 left-3">
                    <span className="bg-black bg-opacity-70 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center space-x-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                      <span>{product.images.length + 1} photos</span>
                    </span>
                  </div>
                )}
                
                <div className="absolute top-3 right-3 flex space-x-2">
                  <button
                    onClick={() => toggleProductAvailability(product._id)}
                    className={`px-2 py-1 rounded-full text-xs font-medium ${product.available
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                      }`}
                  >
                    {product.available ? 'Disponible' : 'Indisponible'}
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-display font-semibold text-lg text-secondary-900">
                    {product.name}
                  </h3>
                  <div className="text-right">
                    <span className="font-bold text-primary-600 text-lg">
                      {formatPrice(product.basePrice)}
                    </span>
                    <p className="text-xs text-secondary-500">Prix de base</p>
                  </div>
                </div>

                <p className="text-secondary-600 text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>

                <div className="mb-4">
                  <span className="inline-block bg-secondary-100 text-secondary-700 px-2 py-1 rounded-full text-xs font-medium">
                    {product.category}
                  </span>
                </div>

                {product.toppings.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-secondary-500 mb-2">Garnitures disponibles:</p>
                    <div className="flex flex-wrap gap-1">
                      {product.toppings.slice(0, 3).map((topping) => (
                        <span
                          key={topping._id}
                          className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full"
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

                {/* Additional Images Thumbnails */}
                {product.images && product.images.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-secondary-500 mb-2">Images supplémentaires:</p>
                    <div className="flex gap-2 overflow-x-auto">
                      {product.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`${product.name} ${idx + 2}`}
                          className="w-12 h-12 object-cover rounded border border-secondary-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48?text=' + (idx + 2);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(product)}
                    className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center justify-center space-x-1"
                  >
                    <PencilIcon className="w-4 h-4" />
                    <span>Modifier</span>
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Product Modal */}
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
              <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-secondary-100">
                  <h3 className="text-2xl font-display font-bold text-secondary-900">
                    {modalMode === 'create' ? 'Nouveau Produit' : 'Modifier le Produit'}
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 text-secondary-400 hover:text-secondary-600 transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Left Column - Takes 2/3 of space */}
                    <div className="space-y-2 md:col-span-2">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                          Nom du produit
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="input-field"
                          placeholder="Ex: Shawarma Classique"
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
                          rows={4}
                          className="input-field resize-none"
                          placeholder="Description détaillée du produit..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 mb-2">
                            Prix de base (FCFA)
                          </label>
                          <input
                            type="number"
                            name="basePrice"
                            value={formData.basePrice}
                            onChange={handleInputChange}
                            required
                            min="0"
                            step="50"
                            className="input-field"
                            placeholder="2000"
                          />
                          <p className="text-xs text-secondary-500 mt-1">Prix pour la taille "Petit"</p>
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
                            {categories.map(category => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Size Variations */}
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-3">
                          Variations de taille
                        </label>
                        <div className="space-y-3">
                          {sizeVariations.map((variation, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3 border border-secondary-200 rounded-lg">
                              <div className="flex-1 min-w-[150px]">
                                <input
                                  type="text"
                                  value={variation.name}
                                  onChange={(e) => handleSizeVariationChange(index, 'name', e.target.value)}
                                  className="input-field"
                                  placeholder="Petit, Moyen, Grand"
                                  required
                                />
                              </div>
                              <div className="w-32">
                                <input
                                  type="number"
                                  value={variation.price}
                                  onChange={(e) => handleSizeVariationChange(index, 'price', parseFloat(e.target.value) || 0)}
                                  className="input-field"
                                  placeholder="Supplément"
                                  min="0"
                                  step="50"
                                />
                                <p className="text-xs text-secondary-500 mt-1">Supplément</p>
                              </div>
                              <div className="flex-1 items-center">
                                <input
                                  type="checkbox"
                                  checked={variation.available}
                                  onChange={(e) => handleSizeVariationChange(index, 'available', e.target.checked)}
                                  className="mr-2"
                                />
                                <span className="text-sm text-secondary-700">Dispo</span>
                              </div>
                              <div className="text-right min-w-[80px]">
                                <p className="font-semibold text-secondary-900">
                                  {formatPrice(parseFloat(formData.basePrice || '0') + variation.price)}
                                </p>
                                <p className="text-xs text-secondary-500">Prix final</p>
                              </div>
                              {sizeVariations.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeSizeVariation(index)}
                                  className="text-red-500 hover:text-red-700 p-1"
                                  title="Supprimer cette taille"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={addSizeVariation}
                            className="w-full p-3 border-2 border-dashed border-secondary-300 rounded-lg text-secondary-600 hover:border-primary-300 hover:text-primary-600 transition-colors flex items-center justify-center space-x-2"
                          >
                            <PlusIcon className="w-4 h-4" />
                            <span>Ajouter une taille</span>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-3">
                          Image du produit
                        </label>

                        {/* Image Source Toggle */}
                        <div className="flex space-x-4 mb-4">
                          <button
                            type="button"
                            onClick={() => setImageSource('url')}
                            className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${imageSource === 'url'
                                ? 'border-primary-500 bg-primary-50 text-primary-700'
                                : 'border-secondary-200 text-secondary-600 hover:border-secondary-300'
                              }`}
                          >
                            🔗 URL d'image
                          </button>
                          <button
                            type="button"
                            onClick={() => setImageSource('upload')}
                            className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${imageSource === 'upload'
                                ? 'border-primary-500 bg-primary-50 text-primary-700'
                                : 'border-secondary-200 text-secondary-600 hover:border-secondary-300'
                              }`}
                          >
                            📁 Télécharger
                          </button>
                        </div>

                        {/* URL Input */}
                        {imageSource === 'url' && (
                          <div>
                            <input
                              type="url"
                              value={formData.image}
                              onChange={handleImageUrlChange}
                              className="input-field"
                              placeholder="https://example.com/image.jpg"
                              required={!imagePreview}
                            />
                            <p className="text-xs text-secondary-500 mt-1">
                              Entrez l'URL complète de l'image
                            </p>
                          </div>
                        )}

                        {/* File Upload */}
                        {imageSource === 'upload' && (
                          <div>
                            <div className="flex items-center justify-center w-full">
                              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-secondary-300 border-dashed rounded-lg cursor-pointer bg-secondary-50 hover:bg-secondary-100 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  <svg className="w-8 h-8 mb-2 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                  </svg>
                                  <p className="mb-1 text-sm text-secondary-700">
                                    <span className="font-semibold">Cliquez pour télécharger</span> ou glissez-déposez
                                  </p>
                                  <p className="text-xs text-secondary-500">PNG, JPG, JPEG, GIF (MAX. 5MB)</p>
                                </div>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={handleImageFileChange}
                                />
                              </label>
                            </div>
                            {imageFile && (
                              <p className="text-sm text-secondary-600 mt-2">
                                📎 {imageFile.name} ({(imageFile.size / 1024).toFixed(2)} KB)
                              </p>
                            )}
                          </div>
                        )}

                        {/* Image Preview */}
                        {imagePreview && (
                          <div className="mt-4 relative">
                            <img
                              src={imagePreview}
                              alt="Aperçu"
                              className="w-full h-48 object-cover rounded-lg border-2 border-secondary-200"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Image+non+disponible';
                              }}
                            />
                            <button
                              type="button"
                              onClick={clearImage}
                              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                              title="Supprimer l'image"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Additional Images Section */}
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-3">
                          Images supplémentaires (max 4)
                          <span className="text-xs text-secondary-500 ml-2">
                            {additionalImagePreviews.length}/4
                          </span>
                        </label>

                        {/* Additional Images Grid */}
                        {additionalImagePreviews.length > 0 && (
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            {additionalImagePreviews.map((preview, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={preview}
                                  alt={`Image ${index + 2}`}
                                  className="w-full h-32 object-cover rounded-lg border-2 border-secondary-200"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x150?text=Image+' + (index + 2);
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => clearAdditionalImage(index)}
                                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                  title="Supprimer"
                                >
                                  <XMarkIcon className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add More Images */}
                        {additionalImagePreviews.length < 4 && (
                          <div className="space-y-3">
                            {imageSource === 'url' ? (
                              <div className="flex gap-2">
                                <input
                                  type="url"
                                  placeholder="URL de l'image supplémentaire"
                                  className="input-field flex-1"
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleAdditionalImageUrlAdd((e.target as HTMLInputElement).value);
                                      (e.target as HTMLInputElement).value = '';
                                    }
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                                    handleAdditionalImageUrlAdd(input.value);
                                    input.value = '';
                                  }}
                                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                                >
                                  <PlusIcon className="w-5 h-5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-secondary-300 border-dashed rounded-lg cursor-pointer bg-secondary-50 hover:bg-secondary-100 transition-colors">
                                  <div className="flex items-center space-x-2">
                                    <PlusIcon className="w-5 h-5 text-secondary-500" />
                                    <span className="text-sm text-secondary-700">Ajouter des images</span>
                                  </div>
                                  <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    multiple
                                    onChange={handleAdditionalImageFileChange}
                                  />
                                </label>
                              </div>
                            )}
                          </div>
                        )}
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
                          Produit disponible
                        </label>
                      </div>
                    </div>

                    {/* Right Column - Toppings */}
                    <div>
                      <h4 className="text-lg font-semibold text-secondary-900 mb-4">
                        Garnitures disponibles
                      </h4>
                      <div className="space-y-2 max-h-80 ">
                        {availableToppings.map((topping) => (
                          <label
                            key={topping._id}
                            className="flex items-center p-2 border border-secondary-200 rounded-lg cursor-pointer hover:border-primary-300 transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={selectedToppings.includes(topping._id)}
                              onChange={() => handleToppingToggle(topping._id)}
                              className="mr-3"
                            />
                            <div className="flex-1">
                              <span className="font-medium text-secondary-900">
                                {topping.name}
                              </span>
                              <span className="text-sm text-secondary-600 ml-2">
                                (+{formatPrice(topping.price)})
                              </span>
                            </div>
                            {!topping.available && (
                              <span className="text-xs text-red-500">Indisponible</span>
                            )}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-secondary-100">
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
                      {modalMode === 'create' ? 'Créer le produit' : 'Sauvegarder'}
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

export default MenuManagement;