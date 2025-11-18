import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CogIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { settingsAPI } from '../../services/api';
import toast from 'react-hot-toast';

interface Settings {
  whatsappNumber: string;
  businessName: string;
  businessAddress: string;
  businessEmail: string;
  businessPhone: string;
  deliveryFee: number;
  minimumOrder: number;
  estimatedDeliveryTime: number;
}

const SettingsManagement: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    whatsappNumber: '',
    businessName: '',
    businessAddress: '',
    businessEmail: '',
    businessPhone: '',
    deliveryFee: 500,
    minimumOrder: 1000,
    estimatedDeliveryTime: 45
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await settingsAPI.get();
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Erreur lors du chargement des paramètres');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await settingsAPI.update(settings);
      toast.success('Paramètres mis à jour avec succès!');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Erreur lors de la mise à jour des paramètres');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-secondary-900">
          Paramètres de l'entreprise
        </h2>
        <p className="text-secondary-600 mt-1">
          Gérez les informations de votre entreprise et les paramètres de livraison
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center">
            <CogIcon className="w-5 h-5 mr-2" />
            Informations de l'entreprise
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Nom de l'entreprise
              </label>
              <input
                type="text"
                name="businessName"
                value={settings.businessName}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2 flex items-center">
                <PhoneIcon className="w-4 h-4 mr-1" />
                Numéro WhatsApp
              </label>
              <input
                type="tel"
                name="whatsappNumber"
                value={settings.whatsappNumber}
                onChange={handleInputChange}
                className="input-field"
                placeholder="+237600000000"
                required
              />
              <p className="text-xs text-secondary-500 mt-1">
                Les clients seront redirigés vers ce numéro pour payer
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2 flex items-center">
                <PhoneIcon className="w-4 h-4 mr-1" />
                Téléphone
              </label>
              <input
                type="tel"
                name="businessPhone"
                value={settings.businessPhone}
                onChange={handleInputChange}
                className="input-field"
                placeholder="+237600000000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2 flex items-center">
                <EnvelopeIcon className="w-4 h-4 mr-1" />
                Email
              </label>
              <input
                type="email"
                name="businessEmail"
                value={settings.businessEmail}
                onChange={handleInputChange}
                className="input-field"
                placeholder="contact@example.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-secondary-700 mb-2 flex items-center">
                <MapPinIcon className="w-4 h-4 mr-1" />
                Adresse
              </label>
              <textarea
                name="businessAddress"
                value={settings.businessAddress}
                onChange={handleInputChange}
                className="input-field resize-none"
                rows={3}
                placeholder="Adresse complète de l'entreprise"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center">
            <CurrencyDollarIcon className="w-5 h-5 mr-2" />
            Paramètres de livraison
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Frais de livraison (FCFA)
              </label>
              <input
                type="number"
                name="deliveryFee"
                value={settings.deliveryFee}
                onChange={handleInputChange}
                className="input-field"
                min="0"
                step="50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Commande minimum (FCFA)
              </label>
              <input
                type="number"
                name="minimumOrder"
                value={settings.minimumOrder}
                onChange={handleInputChange}
                className="input-field"
                min="0"
                step="100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2 flex items-center">
                <ClockIcon className="w-4 h-4 mr-1" />
                Temps de livraison (min)
              </label>
              <input
                type="number"
                name="estimatedDeliveryTime"
                value={settings.estimatedDeliveryTime}
                onChange={handleInputChange}
                className="input-field"
                min="15"
                step="5"
                required
              />
            </div>
          </div>
        </motion.div>

        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSaving}
            className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default SettingsManagement;
