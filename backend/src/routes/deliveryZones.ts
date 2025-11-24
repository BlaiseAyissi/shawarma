import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import DeliveryZone from '../models/DeliveryZone';
import { adminAuth } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/delivery-zones/cities
// @desc    Get all available cities (public)
// @access  Public
router.get('/cities', async (req, res) => {
  try {
    const zones = await DeliveryZone.find({ available: true }).lean();

    // Get unique cities from all zones
    const citiesSet = new Set<string>();
    zones.forEach(zone => {
      zone.cities.forEach(city => citiesSet.add(city));
    });

    const cities = Array.from(citiesSet).sort();

    res.json({
      success: true,
      data: { cities }
    });
  } catch (error: any) {
    console.error('Get cities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching cities'
    });
  }
});

// @route   GET /api/delivery-zones/neighborhoods/:city
// @desc    Get neighborhoods for a city (public)
// @access  Public
router.get('/neighborhoods/:city', async (req, res) => {
  try {
    const city = req.params.city;
    const zones = await DeliveryZone.find({
      available: true,
      cities: city
    }).lean();

    // Get all neighborhoods for this city
    const neighborhoods: string[] = [];
    zones.forEach(zone => {
      zone.neighborhoods
        .filter(n => n.city === city && n.available)
        .forEach(n => neighborhoods.push(n.name));
    });

    // Remove duplicates and sort
    const uniqueNeighborhoods = Array.from(new Set(neighborhoods)).sort();

    res.json({
      success: true,
      data: { neighborhoods: uniqueNeighborhoods }
    });
  } catch (error: any) {
    console.error('Get neighborhoods error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching neighborhoods'
    });
  }
});

// @route   GET /api/delivery-zones
// @desc    Get all delivery zones (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const zones = await DeliveryZone.find({ available: true })
      .select('name cities neighborhoods deliveryFee estimatedTime')
      .lean();

    res.json({
      success: true,
      data: { zones }
    });
  } catch (error: any) {
    console.error('Get delivery zones error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching delivery zones'
    });
  }
});

// @route   POST /api/delivery-zones/calculate-fee
// @desc    Calculate delivery fee for city and neighborhood
// @access  Public
router.post('/calculate-fee', async (req, res) => {
  try {
    const { city, neighborhood } = req.body;

    if (!city || !neighborhood) {
      return res.status(400).json({
        success: false,
        message: 'City and neighborhood are required'
      });
    }

    // Find zone that contains this specific city AND neighborhood combination
    // Note: A city can exist in multiple zones with different neighborhoods
    // The neighborhood determines which zone (and thus which delivery fee) applies
    const zone = await DeliveryZone.findOne({
      available: true,
      cities: city,
      'neighborhoods.city': city,
      'neighborhoods.name': neighborhood,
      'neighborhoods.available': true
    }).lean();

    if (!zone) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not available for this location'
      });
    }

    res.json({
      success: true,
      data: {
        deliveryFee: zone.deliveryFee,
        estimatedTime: zone.estimatedTime,
        zoneName: zone.name
      }
    });
  } catch (error: any) {
    console.error('Calculate fee error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while calculating delivery fee'
    });
  }
});

// @route   GET /api/delivery-zones/admin/all
// @desc    Get all delivery zones including unavailable (Admin)
// @access  Private/Admin
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const zones = await DeliveryZone.find().sort({ name: 1 }).lean();

    res.json({
      success: true,
      data: { zones }
    });
  } catch (error: any) {
    console.error('Get all delivery zones error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching delivery zones'
    });
  }
});

// @route   POST /api/delivery-zones
// @desc    Create a new delivery zone (Admin)
// @access  Private/Admin
router.post('/', [
  adminAuth,
  body('name').trim().isLength({ min: 2 }).withMessage('Zone name is required'),
  body('cities').isArray({ min: 1 }).withMessage('At least one city is required'),
  body('deliveryFee').isNumeric().withMessage('Delivery fee must be a number'),
  body('estimatedTime').isNumeric().withMessage('Estimated time must be a number'),
  body('neighborhoods').optional().isArray().withMessage('Neighborhoods must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, cities, neighborhoods, deliveryFee, estimatedTime, available } = req.body;

    // Check if zone name already exists
    const existingZone = await DeliveryZone.findOne({ name });
    if (existingZone) {
      return res.status(400).json({
        success: false,
        message: 'Delivery zone with this name already exists'
      });
    }

    const zone = new DeliveryZone({
      name,
      cities,
      neighborhoods: neighborhoods || [],
      deliveryFee,
      estimatedTime,
      available: available !== undefined ? available : true
    });

    console.log('Creating zone with data:', JSON.stringify(zone, null, 2));
    await zone.save();

    res.status(201).json({
      success: true,
      message: 'Delivery zone created successfully',
      data: { zone }
    });
  } catch (error: any) {
    console.error('Create delivery zone error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error while creating delivery zone',
      error: error.message
    });
  }
});

// @route   PUT /api/delivery-zones/:id
// @desc    Update delivery zone (Admin)
// @access  Private/Admin
router.put('/:id', [
  adminAuth,
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Zone name is required'),
  body('cities').optional().isArray({ min: 1 }).withMessage('At least one city is required'),
  body('deliveryFee').optional().isNumeric().withMessage('Delivery fee must be a number'),
  body('estimatedTime').optional().isNumeric().withMessage('Estimated time must be a number'),
  body('neighborhoods').optional().isArray().withMessage('Neighborhoods must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const zone = await DeliveryZone.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!zone) {
      return res.status(404).json({
        success: false,
        message: 'Delivery zone not found'
      });
    }

    res.json({
      success: true,
      message: 'Delivery zone updated successfully',
      data: { zone }
    });
  } catch (error: any) {
    console.error('Update delivery zone error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating delivery zone'
    });
  }
});

// @route   DELETE /api/delivery-zones/:id
// @desc    Delete delivery zone (Admin)
// @access  Private/Admin
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const zone = await DeliveryZone.findByIdAndDelete(req.params.id);

    if (!zone) {
      return res.status(404).json({
        success: false,
        message: 'Delivery zone not found'
      });
    }

    res.json({
      success: true,
      message: 'Delivery zone deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete delivery zone error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting delivery zone'
    });
  }
});

export default router;
