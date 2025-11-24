import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  productName: string;
  productPrice: number;
  quantity: number;
  size: string;
  selectedToppings: {
    name: string;
    price: number;
  }[];
  customizations?: string;
  itemTotal: number;
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  orderNumber: string;
  items: IOrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  paymentMethod: 'stripe' | 'momo' | 'om' | 'cash';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  deliveryAddress: {
    street: string;
    neighborhood: string;
    city: string;
    postalCode?: string;
    phone: string;
    instructions?: string;
  };
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  productPrice: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  size: {
    type: String,
    required: true
  },
  selectedToppings: [{
    name: { type: String, required: true },
    price: { type: Number, required: true }
  }],
  customizations: {
    type: String,
    maxlength: [200, 'Customizations cannot exceed 200 characters']
  },
  itemTotal: {
    type: Number,
    required: true
  }
});

const OrderSchema = new Schema<IOrder>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  items: [OrderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  },
  deliveryFee: {
    type: Number,
    default: 500,
    min: [0, 'Delivery fee cannot be negative']
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'momo', 'om', 'cash'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  deliveryAddress: {
    street: { type: String, required: true },
    neighborhood: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: String,
    phone: { type: String, required: true },
    instructions: String
  },
  estimatedDeliveryTime: Date,
  actualDeliveryTime: Date
}, {
  timestamps: true
});

// Generate order number before validation (so it's set before required check)
OrderSchema.pre('validate', async function(next) {
  if (this.isNew && !this.orderNumber) {
    try {
      const count = await mongoose.model('Order').countDocuments();
      this.orderNumber = `SH${Date.now().toString().slice(-6)}${(count + 1).toString().padStart(3, '0')}`;
      next();
    } catch (error) {
      next(error as Error);
    }
  } else {
    next();
  }
});

// Index for efficient queries
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });

export default mongoose.model<IOrder>('Order', OrderSchema);