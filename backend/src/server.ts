import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth';
import productsRoutes from './routes/products';
import ordersRoutes from './routes/orders';
import categoriesRoutes from './routes/categories';
import toppingsRoutes from './routes/toppings';
import deliveryZonesRoutes from './routes/deliveryZones';
const settingsRoutes = require('./routes/settings').default || require('./routes/settings');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

const allowedOrigins = [
  process.env.FRONTEND_URL, // production frontend
].filter(Boolean); // Remove undefined values

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      console.log('the origin is ' + origin)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'House of Shawarma API is running',
    timestamp: new Date().toISOString()
  });
});

// Basic test route
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API is working!',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test route for settings
app.get('/api/settings-test', (req, res) => {
  res.json({ message: 'Settings test route works!' });
});

// API Routes
console.log('Registering routes...');
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
console.log('Settings routes:', settingsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/toppings', toppingsRoutes);
app.use('/api/delivery-zones', deliveryZonesRoutes);
console.log('All routes registered');

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use((req, res) => {
  console.log('404 - Route not found:', req.method, req.url);
  res.status(404).json({ message: 'Route not found' });
});

// Database connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/shawarma';

    await mongoose.connect(mongoURI);

    console.log("✅ Successfully connected to MongoDB!");
    console.log(`📊 Database: ${mongoose.connection.name}`);

  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    // Don't exit in development, just log the error
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
});

connectDB(); //change back for dep

export default app;  //change back for dep

// Start server
//const startServer = async () => {
//  await connectDB();
//
//  app.listen(PORT, () => {
//    console.log(`🚀 Server running on port ${PORT}`);
//    console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
//    console.log(`🔗 API URL: http://localhost:${PORT}/api`);
//    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
//  });
//};

//startServer().catch(console.error);