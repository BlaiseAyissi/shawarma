import mongoose, { Document, Schema } from 'mongoose';

export interface ITopping {
  _id?: string;
  name: string;
  price: number;
  available: boolean;
  category?: string;
  description?: string;
}

export interface ISizeVariation {
  size: string;
  name: string;
  price: number;
  available: boolean;
}

export interface IProduct extends Document {
  name: string;
  description: string;
  basePrice: number;
  sizeVariations: ISizeVariation[];
  category: string;
  image: string;
  images: string[]; // Array of up to 5 images
  toppings: ITopping[];
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ToppingSchema = new Schema<ITopping>({
  name: {
    type: String,
    required: [true, 'Topping name is required'],
    trim: true
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
    trim: true
  },
  description: {
    type: String,
    trim: true
  }
});

const SizeVariationSchema = new Schema<ISizeVariation>({
  size: {
    type: String,
    required: [true, 'Size identifier is required'],
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Size name is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Size price is required'],
    min: [0, 'Price cannot be negative'],
    default: 0
  },
  available: {
    type: Boolean,
    default: true
  }
});

const ProductSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  basePrice: {
    type: Number,
    required: [true, 'Product base price is required'],
    min: [0, 'Price cannot be negative']
  },
  sizeVariations: {
    type: [SizeVariationSchema],
    required: [true, 'At least one size variation is required'],
    validate: {
      validator: function(v: ISizeVariation[]) {
        return v && v.length > 0;
      },
      message: 'Product must have at least one size variation'
    }
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    trim: true
  },
  image: {
    type: String,
    required: [true, 'Product image is required']
  },
  images: {
    type: [String],
    default: [],
    validate: {
      validator: function(v: string[]) {
        return v.length <= 5;
      },
      message: 'Product can have maximum 5 images'
    }
  },
  toppings: [ToppingSchema],
  available: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for search functionality
ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ available: 1 });

export default mongoose.model<IProduct>('Product', ProductSchema);