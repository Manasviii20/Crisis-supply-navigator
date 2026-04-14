const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Supply = require('../models/Supply');
const Shelter = require('../models/Shelter');
const Delivery = require('../models/Delivery');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// GET /api/admin/users - Get all users (admin only)
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.findAll();
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/users/:id - Update user (admin only)
router.put('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { role, full_name, phone, is_active } = req.body;
    
    const user = await User.update(req.params.id, {
      role, full_name, phone, is_active
    });

    res.json({ success: true, data: user, message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/admin/users/:id - Delete user (admin only)
router.delete('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await User.delete(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/statistics - Get comprehensive statistics
router.get('/statistics', authMiddleware, async (req, res) => {
  try {
    const supplyStats = await Supply.getStatistics();
    const shelterStats = await Shelter.getStatistics();
    const deliveryStats = await Delivery.getStatistics();
    const userStats = await User.getStatistics();

    res.json({ 
      success: true, 
      data: {
        supplies: supplyStats,
        shelters: shelterStats,
        deliveries: deliveryStats,
        users: userStats
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/dashboard - Get dashboard overview
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const [recentSupplies, recentShelters, recentDeliveries] = await Promise.all([
      Supply.findAll({}).then(s => s.slice(0, 5)),
      Shelter.findAll({}).then(s => s.slice(0, 5)),
      Delivery.findAll({}).then(d => d.slice(0, 5))
    ]);

    res.json({ 
      success: true, 
      data: {
        recentSupplies,
        recentShelters,
        recentDeliveries
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
