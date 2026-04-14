const express = require('express');
const router = express.Router();
const Shelter = require('../models/Shelter');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// GET /api/shelters - Get all shelters with optional filters
router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;
    const filters = { status, search };
    
    const shelters = await Shelter.findAll(filters);
    res.json({ success: true, data: shelters });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/shelters/statistics - Get shelter statistics
router.get('/statistics', async (req, res) => {
  try {
    const stats = await Shelter.getStatistics();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/shelters/:id - Get shelter by ID
router.get('/:id', async (req, res) => {
  try {
    const shelter = await Shelter.findById(req.params.id);
    if (!shelter) {
      return res.status(404).json({ success: false, message: 'Shelter not found' });
    }
    res.json({ success: true, data: shelter });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/shelters - Create new shelter (requires authentication)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      name, address, capacity, current_occupancy, status,
      contact_person, contact_phone, contact_email,
      latitude, longitude, facilities
    } = req.body;

    if (!name || !address || !capacity) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, address, and capacity are required' 
      });
    }

    const shelter = await Shelter.create({
      name, address, capacity, current_occupancy, status,
      contact_person, contact_phone, contact_email,
      latitude, longitude, facilities
    });

    res.status(201).json({ success: true, data: shelter, message: 'Shelter created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/shelters/:id - Update shelter (requires authentication)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const existingShelter = await Shelter.findById(req.params.id);
    if (!existingShelter) {
      return res.status(404).json({ success: false, message: 'Shelter not found' });
    }

    const shelter = await Shelter.update(req.params.id, req.body);
    res.json({ success: true, data: shelter, message: 'Shelter updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/shelters/:id/occupancy - Update shelter occupancy
router.patch('/:id/occupancy', authMiddleware, async (req, res) => {
  try {
    const { occupancy } = req.body;
    
    if (occupancy === undefined || occupancy === null) {
      return res.status(400).json({ 
        success: false, 
        message: 'Occupancy value is required' 
      });
    }

    const result = await Shelter.updateOccupancy(req.params.id, occupancy);
    res.json({ success: true, data: result, message: 'Occupancy updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/shelters/:id - Delete shelter (requires admin)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const existingShelter = await Shelter.findById(req.params.id);
    if (!existingShelter) {
      return res.status(404).json({ success: false, message: 'Shelter not found' });
    }

    await Shelter.delete(req.params.id);
    res.json({ success: true, message: 'Shelter deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
