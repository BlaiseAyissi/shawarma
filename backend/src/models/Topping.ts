import mongoose, { Document, Schema } from 'mongoose';

export interface ITopping extends Document {
  name: string;
  price: number;
  available: boolean;
  category: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ToppingSchema = new Schema<ITopping>({
  name: {
    type: String,
    required: [true, 'Topping name is required'],
    trim: true,
    maxlength: [50, 'Topping name cannot exceed 50 characters']
  },
  price: {
    type: Number,
    required: [true, 'Topping price is required'],
    min: [0, 'Price cannot be negative']
  },
  available: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    required: [true, 'Topping category is required'],
    enum: ['Légumes', 'Sauces', 'Fromages', 'Viandes', 'Épices', 'Autres'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  }
}, {
  timestamps: true
});

// Index for efficient queries
ToppingSchema.index({ category: 1 });
ToppingSchema.index({ available: 1 });
ToppingSchema.index({ name: 'text' });

export default mongoose.model<ITopping>('Topping', ToppingSchema);
