import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Order from '../models/Order';
import { auth } from '../middleware/auth';

const router = express.Router();

// Note: Stripe integration disabled for now
// Initialize Stripe when needed:
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {});

// @route   POST /api/payments/stripe/create-intent
// @desc    Create Stripe payment intent
// @access  Private
router.post('/stripe/create-intent', [
  auth,
  body('orderId')
    .isMongoId()
    .withMessage('Invalid order ID'),
  body('amount')
    .isInt({ min: 1 })
    .withMessage('Amount must be a positive integer')
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

    const { orderId, amount } = req.body;
    const userId = req.user!.userId;

    // Verify order belongs to user
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Order is already paid'
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'xaf', // Central African Franc
      metadata: {
        orderId: orderId,
        userId: userId
      },
      automatic_payment_methods: {
        enabled: true
      }
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    });
  } catch (error: any) {
    console.error('Stripe payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment intent'
    });
  }
});

// @route   POST /api/payments/stripe/confirm
// @desc    Confirm Stripe payment
// @access  Private
router.post('/stripe/confirm', [
  auth,
  body('paymentIntentId')
    .isString()
    .withMessage('Payment intent ID is required'),
  body('orderId')
    .isMongoId()
    .withMessage('Invalid order ID')
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

    const { paymentIntentId, orderId } = req.body;
    const userId = req.user!.userId;

    // Verify payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: 'Payment not successful'
      });
    }

    // Update order
    const order = await Order.findOneAndUpdate(
      { _id: orderId, userId },
      { 
        paymentStatus: 'paid',
        status: 'confirmed'
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      data: { order }
    });
  } catch (error: any) {
    console.error('Stripe payment confirmation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirming payment'
    });
  }
});

// @route   POST /api/payments/momo/initiate
// @desc    Initiate Mobile Money payment
// @access  Private
router.post('/momo/initiate', [
  auth,
  body('orderId')
    .isMongoId()
    .withMessage('Invalid order ID'),
  body('phoneNumber')
    .isMobilePhone('any')
    .withMessage('Valid phone number is required'),
  body('amount')
    .isInt({ min: 1 })
    .withMessage('Amount must be a positive integer')
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

    const { orderId, phoneNumber, amount } = req.body;
    const userId = req.user!.userId;

    // Verify order belongs to user
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Order is already paid'
      });
    }

    // TODO: Integrate with actual Mobile Money API (MTN, Orange, etc.)
    // For now, simulate the process
    const transactionId = `MOMO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // In a real implementation, you would:
    // 1. Call the Mobile Money API to initiate payment
    // 2. Store the transaction reference
    // 3. Set up webhook to receive payment confirmation
    
    // Simulate successful initiation
    res.json({
      success: true,
      message: 'Mobile Money payment initiated. Please complete the payment on your phone.',
      data: {
        transactionId,
        phoneNumber,
        amount,
        orderId,
        instructions: 'You will receive a USSD prompt on your phone. Enter your Mobile Money PIN to complete the payment.'
      }
    });
  } catch (error: any) {
    console.error('Mobile Money initiation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error initiating Mobile Money payment'
    });
  }
});

// @route   POST /api/payments/momo/callback
// @desc    Mobile Money payment callback (webhook)
// @access  Public (but should be secured with API key in production)
router.post('/momo/callback', [
  body('transactionId').isString().withMessage('Transaction ID is required'),
  body('status').isIn(['success', 'failed', 'pending']).withMessage('Invalid status'),
  body('orderId').isMongoId().withMessage('Invalid order ID')
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

    const { transactionId, status, orderId } = req.body;

    // TODO: Verify the callback is from the actual Mobile Money provider
    // This should include signature verification

    if (status === 'success') {
      // Update order as paid
      const order = await Order.findByIdAndUpdate(
        orderId,
        { 
          paymentStatus: 'paid',
          status: 'confirmed'
        },
        { new: true }
      );

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      res.json({
        success: true,
        message: 'Payment confirmed successfully'
      });
    } else if (status === 'failed') {
      // Update order as payment failed
      await Order.findByIdAndUpdate(orderId, { paymentStatus: 'failed' });
      
      res.json({
        success: true,
        message: 'Payment failed notification received'
      });
    } else {
      res.json({
        success: true,
        message: 'Payment status updated'
      });
    }
  } catch (error: any) {
    console.error('Mobile Money callback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing Mobile Money callback'
    });
  }
});

// @route   POST /api/payments/cash/confirm
// @desc    Confirm cash on delivery payment
// @access  Private
router.post('/cash/confirm', [
  auth,
  body('orderId')
    .isMongoId()
    .withMessage('Invalid order ID')
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

    const { orderId } = req.body;
    const userId = req.user!.userId;

    // Update order for cash on delivery
    const order = await Order.findOneAndUpdate(
      { _id: orderId, userId },
      { 
        paymentStatus: 'pending', // Will be marked as paid upon delivery
        status: 'confirmed'
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Cash on delivery order confirmed',
      data: { order }
    });
  } catch (error: any) {
    console.error('Cash payment confirmation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirming cash payment'
    });
  }
});

export default router;