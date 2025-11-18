import express, { Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import Topping from '../models/Topping';
import { adminAuth } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/toppings
// @desc    Get all toppings with optional filtering
// @access  Public
router.get('/', [
  query('category').optional().isString().withMessage('Category must be a string'),
  query('available').optional().isBoolean().withMessage('Available must be a boolean')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { category, available } = req.query;

    // Build query
    const query: any = {};
    if (category && category !== 'all') {
      query.category = category;
    }
    if (available !== undefined) {
      query.available = available === 'true';
    }

    const toppings = await Topping.find(query).sort({ category: 1, name: 1 }).lean();

    res.json({
      success: true,
      data: { toppings }
    });
  } catch (error: any) {
    console.error('Get toppings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching toppings'
    });
  }
});

// @route   POST /api/toppings
// @desc    Create a new topping (Admin only)
// @access  Private/Admin
router.post('/', [
  adminAuth,
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Topping name must be between 2 and 50 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .isIn(['Légumes', 'Sauces', 'Fromages', 'Viandes', 'Épices', 'Autres'])
    .withMessage('Invalid category'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description cannot exceed 200 characters')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, price, category, description, available = true } = req.body;

    const topping = new Topping({
      name,
      price,
      category,
      description,
      available
    });

    await topping.save();

    res.status(201).json({
      success: true,
      message: 'Topping created successfully',
      data: { topping }
    });
  } catch (error: any) {
    console.error('Create topping error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating topping'
    });
  }
});

// @route   PUT /api/toppings/:id
// @desc    Update a topping (Admin only)
// @access  Private/Admin
router.put('/:id', [
  adminAuth,
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Topping name must be between 2 and 50 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .optional()
    .isIn(['Légumes', 'Sauces', 'Fromages', 'Viandes', 'Épices', 'Autres'])
    .withMessage('Invalid category'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description cannot exceed 200 characters')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const topping = await Topping.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!topping) {
      return res.status(404).json({
        success: false,
        message: 'Topping not found'
      });
    }

    res.json({
      success: true,
      message: 'Topping updated successfully',
      data: { topping }
    });
  } catch (error: any) {
    console.error('Update topping error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating topping'
    });
  }
});

// @route   DELETE /api/toppings/:id
// @desc    Delete a topping (Admin only)
// @access  Private/Admin
router.delete('/:id', adminAuth, async (req: Request, res: Response) => {
  try {
    const topping = await Topping.findByIdAndDelete(req.params.id);

    if (!topping) {
      return res.status(404).json({
        success: false,
        message: 'Topping not found'
      });
    }

    res.json({
      success: true,
      message: 'Topping deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete topping error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting topping'
    });
  }
});

export default router;
