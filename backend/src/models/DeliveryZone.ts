import mongoose, { Document, Schema } from 'mongoose';

export interface INeighborhood {
  name: string;
  city: string;
  available: boolean;
}

export interface IDeliveryZone extends Document {
  name: string; // Zone name for admin reference (e.g., "Zone Centre", "Zone Nord")
  cities: string[]; // Cities included in this zone
  neighborhoods: INeighborhood[];
  deliveryFee: number;
  estimatedTime: number; // in minutes
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NeighborhoodSchema = new Schema<INeighborhood>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  available: {
    type: Boolean,
    default: true
  }
});

const DeliveryZoneSchema = new Schema<IDeliveryZone>({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  cities: [{
    type: String,
    required: true,
    trim: true
  }],
  neighborhoods: [NeighborhoodSchema],
  deliveryFee: {
    type: Number,
    required: true,
    min: [0, 'Delivery fee cannot be negative'],
    default: 500
  },
  estimatedTime: {
    type: Number,
    required: true,
    min: [0, 'Estimated time cannot be negative'],
    default: 30
  },
  available: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
DeliveryZoneSchema.index({ name: 1 });
DeliveryZoneSchema.index({ cities: 1 });
DeliveryZoneSchema.index({ available: 1 });

export default mongoose.model<IDeliveryZone>('DeliveryZone', DeliveryZoneSchema);
