import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Settings from '../models/Settings';
import { auth, adminAuth } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/settings
// @desc    Get business settings
// @access  Public
router.get('/', async (req, res) => {
  console.log('GET /api/settings called');
  try {
    let settings = await Settings.findOne();
    console.log('Settings found:', settings);
    
    // Create default settings if none exist
    if (!settings) {
      settings = await Settings.create({
        whatsappNumber: '+237600000000',
        businessName: 'The House of Shawarma',
        businessAddress: 'Douala, Cameroon',
        businessEmail: 'contact@houseofshawarma.com',
        businessPhone: '+237600000000',
        deliveryFee: 500,
        minimumOrder: 1000,
        estimatedDeliveryTime: 45
      });
    }

    res.json({
      success: true,
      data: { settings }
    });
  } catch (error: any) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching settings'
    });
  }
});

// @route   PUT /api/settings
// @desc    Update business settings
// @access  Private/Admin
router.put('/', [
  adminAuth,
  body('whatsappNumber')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('WhatsApp number cannot be empty'),
  body('businessName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Business name cannot be empty'),
  body('deliveryFee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Delivery fee must be a positive number'),
  body('minimumOrder')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum order must be a positive number'),
  body('estimatedDeliveryTime')
    .optional()
    .isInt({ min: 15 })
    .withMessage('Delivery time must be at least 15 minutes')
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

    let settings = await Settings.findOne();
    
    if (!settings) {
      // Create new settings if none exist
      settings = await Settings.create(req.body);
    } else {
      // Update existing settings
      Object.assign(settings, req.body);
      await settings.save();
    }

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: { settings }
    });
  } catch (error: any) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating settings'
    });
  }
});

export default router;
