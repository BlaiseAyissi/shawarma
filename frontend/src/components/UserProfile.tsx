import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import NotificationSettings from './NotificationSettings';
import toast from 'react-hot-toast';

const UserProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications'>('profile');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateUser(formData);
      setIsEditing(false);
      toast.success('Profil mis à jour avec succès!');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-secondary-900">
            Mon Profil
          </h1>
          <p className="text-secondary-600 mt-2">
            Gérez vos informations personnelles et préférences
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center space-x-2 pb-4 border-b-2 font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700'
              }`}
            >
              <UserIcon className="w-5 h-5" />
              <span>Informations personnelles</span>
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center space-x-2 pb-4 border-b-2 font-medium transition-colors ${
                activeTab === 'notifications'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700'
              }`}
            >
              <BellIcon className="w-5 h-5" />
              <span>Notifications</span>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' ? (
          /* Profile Card */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-8"
          >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <UserIcon className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-semibold text-secondary-900">
                  {user?.name}
                </h2>
                <p className="text-secondary-600">{user?.email}</p>
                <span className="inline-block mt-1 px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                  {user?.role === 'admin' ? 'Administrateur' : 'Client'}
                </span>
              </div>
            </div>
            
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <PencilIcon className="w-4 h-4" />
                <span>Modifier</span>
              </button>
            )}
          </div>

          {/* Profile Form */}
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  <UserIcon className="w-4 h-4 inline mr-2" />
                  Nom complet
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Votre nom complet"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg text-secondary-900">
                    {user?.name || 'Non renseigné'}
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  <EnvelopeIcon className="w-4 h-4 inline mr-2" />
                  Email
                </label>
                <div className="p-3 bg-gray-50 rounded-lg text-secondary-900">
                  {user?.email}
                  <span className="text-xs text-secondary-500 ml-2">(non modifiable)</span>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  <PhoneIcon className="w-4 h-4 inline mr-2" />
                  Téléphone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="+237 6XX XXX XXX"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg text-secondary-900">
                    {user?.phone || 'Non renseigné'}
                  </div>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Rôle
                </label>
                <div className="p-3 bg-gray-50 rounded-lg text-secondary-900">
                  {user?.role === 'admin' ? 'Administrateur' : 'Client'}
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                <MapPinIcon className="w-4 h-4 inline mr-2" />
                Adresse de livraison
              </label>
              {isEditing ? (
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Votre adresse complète de livraison..."
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg text-secondary-900">
                  {user?.address || 'Non renseigné'}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex justify-end space-x-4 pt-6 border-t border-secondary-200">
                <button
                  onClick={handleCancel}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <XMarkIcon className="w-4 h-4" />
                  <span>Annuler</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sauvegarde...</span>
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-4 h-4" />
                      <span>Sauvegarder</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </motion.div>
        ) : (
          /* Notifications Tab */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <NotificationSettings />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;