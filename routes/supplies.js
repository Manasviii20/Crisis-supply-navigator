const express = require('express');
const router = express.Router();
const Supply = require('../models/Supply');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// GET /api/supplies - Get all supplies with optional filters
router.get('/', async (req, res) => {
  try {
    const { category, status, search } = req.query;
    const filters = { category, status, search };
    
    const supplies = await Supply.findAll(filters);
    res.json({ success: true, data: supplies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/supplies/statistics - Get supply statistics
router.get('/statistics', async (req, res) => {
  try {
    const stats = await Supply.getStatistics();
    const categoryBreakdown = await Supply.getCategoryBreakdown();
    res.json({ success: true, data: { stats, categoryBreakdown } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/supplies/:id - Get supply by ID
router.get('/:id', async (req, res) => {
  try {
    const supply = await Supply.findById(req.params.id);
    if (!supply) {
      return res.status(404).json({ success: false, message: 'Supply not found' });
    }
    res.json({ success: true, data: supply });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/supplies - Create new supply (requires authentication)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, category, quantity, unit, status, location, description } = req.body;

    if (!name || !category || !quantity || !unit) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, category, quantity, and unit are required' 
      });
    }

    const supply = await Supply.create({
      name, category, quantity, unit, status, location, description
    });

    res.status(201).json({ success: true, data: supply, message: 'Supply created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/supplies/:id - Update supply (requires authentication)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const existingSupply = await Supply.findById(req.params.id);
    if (!existingSupply) {
      return res.status(404).json({ success: false, message: 'Supply not found' });
    }

    const supply = await Supply.update(req.params.id, req.body);
    res.json({ success: true, data: supply, message: 'Supply updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/supplies/:id - Delete supply (requires admin)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const existingSupply = await Supply.findById(req.params.id);
    if (!existingSupply) {
      return res.status(404).json({ success: false, message: 'Supply not found' });
    }

    await Supply.delete(req.params.id);
    res.json({ success: true, message: 'Supply deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
