import express, { Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import Order from '../models/Order';
import Product from '../models/Product';
import DeliveryZone from '../models/DeliveryZone';
import { auth, adminAuth } from '../middleware/auth';

const router = express.Router();

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post('/', [
  auth,
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  body('items.*.productId')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('items.*.size')
    .isString()
    .notEmpty()
    .withMessage('Size is required'),
  body('paymentMethod')
    .isIn(['stripe', 'momo', 'om', 'cash'])
    .withMessage('Invalid payment method'),
  body('deliveryAddress.street')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Street address is required'),
  body('deliveryAddress.neighborhood')
    .trim()
    .notEmpty()
    .withMessage('Neighborhood is required'),
  body('deliveryAddress.city')
    .trim()
    .isLength({ min: 2 })
    .withMessage('City is required'),
  body('deliveryAddress.phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { items, paymentMethod, deliveryAddress } = req.body;
    const userId = req.user!.userId;

    // Validate products and calculate totals
    const orderItems: any[] = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product with ID ${item.productId} not found`
        });
      }

      if (!product.available) {
        return res.status(400).json({
          success: false,
          message: `Product ${product.name} is not available`
        });
      }

      // Find size variation
      const sizeVariation = product.sizeVariations.find(sv => sv.size === item.size);
      if (!sizeVariation) {
        const availableSizes = product.sizeVariations.map(sv => sv.size).join(', ');
        return res.status(400).json({
          success: false,
          message: `Size "${item.size}" not found for ${product.name}. Available sizes: ${availableSizes}`
        });
      }
      if (!sizeVariation.available) {
        return res.status(400).json({
          success: false,
          message: `Size ${item.size} is not currently available for ${product.name}`
        });
      }

      // Calculate toppings price
      let toppingsPrice = 0;
      const selectedToppings: Array<{ name: string; price: number }> = [];

      if (item.selectedToppings && item.selectedToppings.length > 0) {
        for (const toppingId of item.selectedToppings) {
          const topping = product.toppings.find(t => t._id?.toString() === toppingId);
          if (topping && topping.available) {
            toppingsPrice += topping.price;
            selectedToppings.push({
              name: topping.name,
              price: topping.price
            });
          }
        }
      }

      const itemPrice = (product.basePrice + sizeVariation.price + toppingsPrice) * item.quantity;
      subtotal += itemPrice;

      orderItems.push({
        product: product._id,
        productName: product.name,
        productPrice: product.basePrice,
        quantity: item.quantity,
        size: item.size,
        selectedToppings,
        customizations: item.customizations || '',
        itemTotal: itemPrice
      });
    }

    // Get delivery fee from zone
    const deliveryZone = await DeliveryZone.findOne({ 
      available: true,
      cities: deliveryAddress.city,
      'neighborhoods.city': deliveryAddress.city,
      'neighborhoods.name': deliveryAddress.neighborhood,
      'neighborhoods.available': true
    });

    if (!deliveryZone) {
      return res.status(400).json({
        success: false,
        message: `Delivery not available for ${deliveryAddress.neighborhood}, ${deliveryAddress.city}`
      });
    }

    const deliveryFee = deliveryZone.deliveryFee;
    const total = subtotal + deliveryFee;
    const estimatedDeliveryTime = new Date(Date.now() + deliveryZone.estimatedTime * 60 * 1000);

    // Create order
    const order = new Order({
      userId,
      items: orderItems,
      subtotal,
      deliveryFee,
      total,
      paymentMethod,
      deliveryAddress,
      estimatedDeliveryTime
    });

    await order.save();

    // Populate product details
    await order.populate('items.product', 'name image category');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order }
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Request body:', JSON.stringify(req.body, null, 2));
    res.status(500).json({
      success: false,
      message: 'Server error while creating order',
      error: error.message,
      details: error.toString()
    });
  }
});

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', [
  auth,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('status').optional().isString().withMessage('Status must be a string')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { page = 1, limit = 10, status } = req.query;
    const userId = req.user!.userId;

    // Build query
    const query: any = { userId };
    if (status) {
      query.status = status;
    }

    // Calculate pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('items.product', 'name image category')
        .lean(),
      Order.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalOrders: total,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });
  } catch (error: any) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders'
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name image category')
      .populate('userId', 'name email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order or is admin
    if (order.userId._id.toString() !== req.user!.userId && req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { order }
    });
  } catch (error: any) {
    console.error('Get order error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while fetching order'
    });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Admin only)
// @access  Private/Admin
router.put('/:id/status', [
  adminAuth,
  body('status')
    .isIn(['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'])
    .withMessage('Invalid status')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status } = req.body;
    const updateData: any = { status };

    // Set delivery time if status is delivered
    if (status === 'delivered') {
      updateData.actualDeliveryTime = new Date();
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('items.product', 'name image category');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });
  } catch (error: any) {
    console.error('Update order status error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating order status'
    });
  }
});

// @route   GET /api/orders/admin/all
// @desc    Get all orders (Admin only)
// @access  Private/Admin
router.get('/admin/all', [
  adminAuth,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isString().withMessage('Status must be a string'),
  query('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
  query('endDate').optional().isISO8601().withMessage('End date must be a valid date')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { page = 1, limit = 20, status, startDate, endDate } = req.query;

    // Build query
    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate as string);
      if (endDate) query.createdAt.$lte = new Date(endDate as string);
    }

    // Calculate pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('userId', 'name email phone')
        .populate('items.product', 'name image category')
        .lean(),
      Order.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalOrders: total,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });
  } catch (error: any) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders'
    });
  }
});

export default router;