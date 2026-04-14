const express = require('express');
const router = express.Router();
const Delivery = require('../models/Delivery');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// GET /api/deliveries - Get all deliveries with optional filters
router.get('/', async (req, res) => {
  try {
    const { status, supply_id } = req.query;
    const filters = { status, supply_id };
    
    const deliveries = await Delivery.findAll(filters);
    res.json({ success: true, data: deliveries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/deliveries/today - Get today's deliveries
router.get('/today', async (req, res) => {
  try {
    const todayDeliveries = await Delivery.getTodayDeliveries();
    res.json({ success: true, data: todayDeliveries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/deliveries/statistics - Get delivery statistics
router.get('/statistics', async (req, res) => {
  try {
    const stats = await Delivery.getStatistics();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/deliveries/:id - Get delivery by ID
router.get('/:id', async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }
    res.json({ success: true, data: delivery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/deliveries - Create new delivery (requires authentication)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      supply_id, from_location, to_location, quantity, status,
      driver_name, driver_phone, vehicle_number,
      scheduled_date, delivered_date, notes
    } = req.body;

    if (!supply_id || !from_location || !to_location || !quantity) {
      return res.status(400).json({ 
        success: false, 
        message: 'Supply ID, from_location, to_location, and quantity are required' 
      });
    }

    const delivery = await Delivery.create({
      supply_id, from_location, to_location, quantity, status,
      driver_name, driver_phone, vehicle_number,
      scheduled_date, delivered_date, notes
    });

    res.status(201).json({ success: true, data: delivery, message: 'Delivery created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/deliveries/:id - Update delivery (requires authentication)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const existingDelivery = await Delivery.findById(req.params.id);
    if (!existingDelivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }

    const delivery = await Delivery.update(req.params.id, req.body);
    res.json({ success: true, data: delivery, message: 'Delivery updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/deliveries/:id/status - Update delivery status
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Status is required' 
      });
    }

    const validStatuses = ['Scheduled', 'In Transit', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ') 
      });
    }

    const result = await Delivery.updateStatus(req.params.id, status);
    res.json({ success: true, data: result, message: 'Delivery status updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/deliveries/:id - Delete delivery (requires admin)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const existingDelivery = await Delivery.findById(req.params.id);
    if (!existingDelivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }

    await Delivery.delete(req.params.id);
    res.json({ success: true, message: 'Delivery deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
