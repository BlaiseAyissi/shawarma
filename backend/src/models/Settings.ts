import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
  whatsappNumber: string;
  businessName: string;
  businessAddress: string;
  businessEmail: string;
  businessPhone: string;
  deliveryFee: number;
  minimumOrder: number;
  estimatedDeliveryTime: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>({
  whatsappNumber: {
    type: String,
    required: [true, 'WhatsApp number is required'],
    trim: true
  },
  businessName: {
    type: String,
    default: 'The House of Shawarma',
    trim: true
  },
  businessAddress: {
    type: String,
    default: '',
    trim: true
  },
  businessEmail: {
    type: String,
    default: '',
    trim: true
  },
  businessPhone: {
    type: String,
    default: '',
    trim: true
  },
  deliveryFee: {
    type: Number,
    default: 500,
    min: [0, 'Delivery fee cannot be negative']
  },
  minimumOrder: {
    type: Number,
    default: 1000,
    min: [0, 'Minimum order cannot be negative']
  },
  estimatedDeliveryTime: {
    type: Number,
    default: 45,
    min: [15, 'Delivery time must be at least 15 minutes']
  }
}, {
  timestamps: true
});

export default mongoose.model<ISettings>('Settings', SettingsSchema);
