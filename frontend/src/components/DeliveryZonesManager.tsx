import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { deliveryZonesAPI } from '../services/api';
import { DeliveryZone } from '../types';
import toast from 'react-hot-toast';

const DeliveryZonesManager: React.FC = () => {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    cities: [] as string[],
    deliveryFee: 500,
    estimatedTime: 30,
    available: true,
    neighborhoods: [] as { name: string; city: string; available: boolean }[]
  });
  const [newCity, setNewCity] = useState('');
  const [newNeighborhood, setNewNeighborhood] = useState({
    name: '',
    city: ''
  });

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    try {
      setIsLoading(true);
      const data = await deliveryZonesAPI.getAllAdmin();
      setZones(data);
    } catch (error) {
      console.error('Error loading zones:', error);
      toast.error('Erreur lors du chargement des zones');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (zone?: DeliveryZone) => {
    if (zone) {
      setEditingZone(zone);
      setFormData({
        name: zone.name,
        cities: [...zone.cities],
        deliveryFee: zone.deliveryFee,
        estimatedTime: zone.estimatedTime,
        available: zone.available,
        neighborhoods: [...zone.neighborhoods]
      });
    } else {
      setEditingZone(null);
      setFormData({
        name: '',
        cities: [],
        deliveryFee: 500,
        estimatedTime: 30,
        available: true,
        neighborhoods: []
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingZone(null);
    setNewCity('');
    setNewNeighborhood({ name: '', city: '' });
  };

  const handleAddCity = () => {
    if (newCity.trim() && !formData.cities.includes(newCity.trim())) {
      setFormData({
        ...formData,
        cities: [...formData.cities, newCity.trim()]
      });
      setNewCity('');
    }
  };

  const handleRemoveCity = (city: string) => {
    setFormData({
      ...formData,
      cities: formData.cities.filter(c => c !== city),
      neighborhoods: formData.neighborhoods.filter(n => n.city !== city)
    });
  };

  const handleAddNeighborhood = () => {
    if (newNeighborhood.name.trim() && newNeighborhood.city) {
      setFormData({
        ...formData,
        neighborhoods: [...formData.neighborhoods, { 
          name: newNeighborhood.name.trim(), 
          city: newNeighborhood.city,
          available: true 
        }]
      });
      setNewNeighborhood({ name: '', city: '' });
    }
  };

  const handleRemoveNeighborhood = (index: number) => {
    setFormData({
      ...formData,
      neighborhoods: formData.neighborhoods.filter((_, i) => i !== index)
    });
  };

  const handleToggleNeighborhood = (index: number) => {
    const updated = [...formData.neighborhoods];
    updated[index].available = !updated[index].available;
    setFormData({ ...formData, neighborhoods: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (!formData.name.trim()) {
      toast.error('Le nom de la zone est obligatoire');
      return;
    }
    
    if (formData.cities.length === 0) {
      toast.error('Ajoutez au moins une ville');
      return;
    }
    
    try {
      console.log('Submitting zone data:', formData);
      
      if (editingZone) {
        await deliveryZonesAPI.update(editingZone._id, formData);
        toast.success('Zone mise à jour avec succès');
      } else {
        await deliveryZonesAPI.create(formData);
        toast.success('Zone créée avec succès');
      }
      handleCloseModal();
      loadZones();
    } catch (error: any) {
      console.error('Error saving zone:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette zone?')) return;
    
    try {
      await deliveryZonesAPI.delete(id);
      toast.success('Zone supprimée avec succès');
      loadZones();
    } catch (error) {
      console.error('Error deleting zone:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-display font-bold text-secondary-900">
            Zones de Livraison
          </h2>
          <p className="text-secondary-600 mt-1">
            Gérer les villes, quartiers et tarifs de livraison
          </p>
          <p className="text-xs text-secondary-500 mt-1">
            💡 Une même ville peut être dans plusieurs zones avec des quartiers différents
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Nouvelle Zone</span>
        </button>
      </div>

      {/* Zones List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {zones.map((zone) => (
          <motion.div
            key={zone._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <MapPinIcon className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-secondary-900">
                    {zone.name}
                  </h3>
                  <p className="text-xs text-secondary-500">
                    {zone.cities && zone.cities.length > 0 ? zone.cities.join(', ') : 'Aucune ville'}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    zone.available 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {zone.available ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleOpenModal(zone)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(zone._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-secondary-600">Frais de livraison:</span>
                <span className="font-semibold text-secondary-900">
                  {formatPrice(zone.deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary-600">Temps estimé:</span>
                <span className="font-semibold text-secondary-900">
                  {zone.estimatedTime} min
                </span>
              </div>
              <div className="pt-3 border-t border-secondary-100">
                <p className="text-sm text-secondary-600 mb-2">
                  Quartiers ({zone.neighborhoods?.length || 0}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {zone.neighborhoods && zone.neighborhoods.length > 0 ? (
                    <>
                      {zone.neighborhoods.slice(0, 3).map((n, i) => (
                        <span
                          key={i}
                          className={`text-xs px-2 py-1 rounded ${
                            n.available
                              ? 'bg-secondary-100 text-secondary-700'
                              : 'bg-gray-100 text-gray-500 line-through'
                          }`}
                        >
                          {n.name}
                        </span>
                      ))}
                      {zone.neighborhoods.length > 3 && (
                        <span className="text-xs text-secondary-500">
                          +{zone.neighborhoods.length - 3} autres
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-secondary-400">Aucun quartier</span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {zones.length === 0 && (
        <div className="text-center py-12">
          <MapPinIcon className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
          <p className="text-secondary-600">Aucune zone de livraison configurée</p>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-secondary-100">
                  <h3 className="text-xl font-display font-bold text-secondary-900">
                    {editingZone ? 'Modifier la Zone' : 'Nouvelle Zone'}
                  </h3>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Zone Name */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Nom de la Zone *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="input-field"
                      placeholder="Ex: Zone Centre, Zone Nord"
                    />
                  </div>

                  {/* Cities */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Villes *
                    </label>
                    <div className="flex space-x-2 mb-3">
                      <input
                        type="text"
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCity())}
                        className="input-field flex-1"
                        placeholder="Nom de la ville"
                      />
                      <button
                        type="button"
                        onClick={handleAddCity}
                        className="btn-primary"
                      >
                        <PlusIcon className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.cities.map((city) => (
                        <span
                          key={city}
                          className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                        >
                          <span>{city}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCity(city)}
                            className="text-blue-900 hover:text-blue-700"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Fee */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Frais de livraison (FCFA) *
                    </label>
                    <input
                      type="number"
                      value={formData.deliveryFee}
                      onChange={(e) => setFormData({ ...formData, deliveryFee: Number(e.target.value) })}
                      required
                      min="0"
                      className="input-field"
                    />
                  </div>

                  {/* Estimated Time */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Temps estimé (minutes) *
                    </label>
                    <input
                      type="number"
                      value={formData.estimatedTime}
                      onChange={(e) => setFormData({ ...formData, estimatedTime: Number(e.target.value) })}
                      required
                      min="0"
                      className="input-field"
                    />
                  </div>

                  {/* Available */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="available"
                      checked={formData.available}
                      onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="available" className="ml-2 text-sm text-secondary-700">
                      Zone active
                    </label>
                  </div>

                  {/* Neighborhoods */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Quartiers
                    </label>
                    <div className="flex space-x-2 mb-3">
                      <select
                        value={newNeighborhood.city}
                        onChange={(e) => setNewNeighborhood({ ...newNeighborhood, city: e.target.value })}
                        className="input-field"
                        disabled={formData.cities.length === 0}
                      >
                        <option value="">Ville</option>
                        {formData.cities.map((city) => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={newNeighborhood.name}
                        onChange={(e) => setNewNeighborhood({ ...newNeighborhood, name: e.target.value })}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddNeighborhood())}
                        className="input-field flex-1"
                        placeholder="Nom du quartier"
                        disabled={!newNeighborhood.city}
                      />
                      <button
                        type="button"
                        onClick={handleAddNeighborhood}
                        className="btn-primary"
                        disabled={!newNeighborhood.city || !newNeighborhood.name}
                      >
                        <PlusIcon className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {formData.neighborhoods.map((neighborhood, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={neighborhood.available}
                              onChange={() => handleToggleNeighborhood(index)}
                              className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                            />
                            <span className={`text-sm ${
                              neighborhood.available ? 'text-secondary-900' : 'text-secondary-500 line-through'
                            }`}>
                              {neighborhood.name} <span className="text-secondary-400">({neighborhood.city})</span>
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveNeighborhood(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-3 pt-4 border-t border-secondary-100">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="btn-secondary"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                    >
                      {editingZone ? 'Mettre à jour' : 'Créer'}
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

export default DeliveryZonesManager;
