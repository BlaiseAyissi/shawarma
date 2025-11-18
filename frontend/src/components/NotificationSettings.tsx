import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BellIcon, 
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon
} from '@heroicons/react/24/outline';
import { NotificationSound } from '../utils/notificationSound';

interface NotificationPreferences {
  orderUpdates: boolean;
  promotions: boolean;
  newsletter: boolean;
  browserNotifications: boolean;
  soundEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

const NotificationSettings: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    orderUpdates: true,
    promotions: true,
    newsletter: false,
    browserNotifications: true,
    soundEnabled: true,
    emailNotifications: true,
    smsNotifications: false
  });

  const [isLoading, setIsLoading] = useState(false);

  const handlePreferenceChange = (key: keyof NotificationPreferences) => {
    setPreferences(prev => {
      const newPrefs = {
        ...prev,
        [key]: !prev[key]
      };
      
      // Update sound settings
      if (key === 'soundEnabled') {
        NotificationSound.setEnabled(newPrefs.soundEnabled);
        if (newPrefs.soundEnabled) {
          NotificationSound.playNotificationSound('success');
        }
      }
      
      return newPrefs;
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    
    // Request browser notification permission if enabled
    if (preferences.browserNotifications && 'Notification' in window) {
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    }
  };

  const testNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Test de notification', {
        body: 'Ceci est une notification de test de House of Shawarma',
        icon: '/favicon.ico'
      });
    }
    
    // Play test sound
    if (preferences.soundEnabled) {
      NotificationSound.playNotificationSound('info');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-secondary-200">
        <div className="p-6 border-b border-secondary-100">
          <div className="flex items-center space-x-3">
            <BellIcon className="w-6 h-6 text-primary-600" />
            <div>
              <h2 className="text-xl font-display font-semibold text-secondary-900">
                Paramètres de notification
              </h2>
              <p className="text-sm text-secondary-600 mt-1">
                Gérez vos préférences de notification
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Updates */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BellIcon className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-medium text-secondary-900">Mises à jour de commande</h3>
                <p className="text-sm text-secondary-600">
                  Notifications sur le statut de vos commandes
                </p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePreferenceChange('orderUpdates')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.orderUpdates ? 'bg-primary-600' : 'bg-secondary-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.orderUpdates ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </motion.button>
          </div>

          {/* Browser Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <DevicePhoneMobileIcon className="w-5 h-5 text-purple-600" />
              <div>
                <h3 className="font-medium text-secondary-900">Notifications navigateur</h3>
                <p className="text-sm text-secondary-600">
                  Notifications push dans votre navigateur
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {preferences.browserNotifications && (
                <button
                  onClick={testNotification}
                  className="text-xs text-primary-600 hover:text-primary-700 underline"
                >
                  Tester
                </button>
              )}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePreferenceChange('browserNotifications')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.browserNotifications ? 'bg-primary-600' : 'bg-secondary-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.browserNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </motion.button>
            </div>
          </div>

          {/* Sound */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {preferences.soundEnabled ? (
                <SpeakerWaveIcon className="w-5 h-5 text-green-600" />
              ) : (
                <SpeakerXMarkIcon className="w-5 h-5 text-red-600" />
              )}
              <div>
                <h3 className="font-medium text-secondary-900">Son des notifications</h3>
                <p className="text-sm text-secondary-600">
                  Jouer un son lors des notifications
                </p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePreferenceChange('soundEnabled')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.soundEnabled ? 'bg-primary-600' : 'bg-secondary-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </motion.button>
          </div>

          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <EnvelopeIcon className="w-5 h-5 text-orange-600" />
              <div>
                <h3 className="font-medium text-secondary-900">Notifications par email</h3>
                <p className="text-sm text-secondary-600">
                  Recevoir des emails pour les mises à jour importantes
                </p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePreferenceChange('emailNotifications')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.emailNotifications ? 'bg-primary-600' : 'bg-secondary-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </motion.button>
          </div>

          {/* SMS Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <DevicePhoneMobileIcon className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="font-medium text-secondary-900">Notifications SMS</h3>
                <p className="text-sm text-secondary-600">
                  Recevoir des SMS pour les mises à jour de commande
                </p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePreferenceChange('smsNotifications')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.smsNotifications ? 'bg-primary-600' : 'bg-secondary-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.smsNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </motion.button>
          </div>

          {/* Promotions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BellIcon className="w-5 h-5 text-yellow-600" />
              <div>
                <h3 className="font-medium text-secondary-900">Promotions et offres</h3>
                <p className="text-sm text-secondary-600">
                  Recevoir des notifications sur les offres spéciales
                </p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePreferenceChange('promotions')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.promotions ? 'bg-primary-600' : 'bg-secondary-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.promotions ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </motion.button>
          </div>

          {/* Newsletter */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <EnvelopeIcon className="w-5 h-5 text-teal-600" />
              <div>
                <h3 className="font-medium text-secondary-900">Newsletter</h3>
                <p className="text-sm text-secondary-600">
                  Recevoir notre newsletter mensuelle
                </p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePreferenceChange('newsletter')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.newsletter ? 'bg-primary-600' : 'bg-secondary-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.newsletter ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </motion.button>
          </div>
        </div>

        <div className="p-6 border-t border-secondary-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-secondary-600">
              Les modifications sont sauvegardées automatiquement
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;