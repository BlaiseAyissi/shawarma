import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description: string;
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Category description is required'],
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  available: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
CategorySchema.index({ name: 1 });
CategorySchema.index({ available: 1 });

export default mongoose.model<ICategory>('Category', CategorySchema);
