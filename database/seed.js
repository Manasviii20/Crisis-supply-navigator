const { pool } = require('./config');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Check if data already exists
    const [existingSupplies] = await pool.query('SELECT COUNT(*) as count FROM supplies');
    if (existingSupplies[0].count > 0) {
      console.log('Database already has data. Skipping seed.');
      return;
    }

    // Seed supplies
    console.log('Seeding supplies...');
    await pool.query(`
      INSERT INTO supplies (name, category, quantity, unit, status, location, description) VALUES
      ('Rice Bags', 'Food', 500, 'bags', 'Available', 'Warehouse A', '50kg rice bags for distribution'),
      ('Canned Food', 'Food', 300, 'cans', 'Available', 'Warehouse A', 'Mixed canned goods'),
      ('Blankets', 'Clothes', 200, 'pieces', 'Available', 'Warehouse B', 'Winter blankets'),
      ('Winter Jackets', 'Clothes', 150, 'pieces', 'Low Stock', 'Warehouse B', 'Waterproof jackets'),
      ('First Aid Kits', 'Medicine', 100, 'kits', 'Available', 'Medical Store', 'Emergency medical supplies'),
      ('Pain Relief Medicine', 'Medicine', 250, 'boxes', 'In Transit', 'Medical Store', 'Ibuprofen and Paracetamol'),
      ('Water Bottles', 'Water', 1000, 'bottles', 'Available', 'Warehouse C', '1-liter packaged water'),
      ('Water Purification Tablets', 'Water', 500, 'packs', 'Available', 'Warehouse C', 'Water purification tablets'),
      ('Baby Formula', 'Food', 80, 'cans', 'Low Stock', 'Warehouse A', 'Infant nutrition'),
      ('Hygiene Kits', 'Other', 120, 'kits', 'Available', 'Warehouse B', 'Personal hygiene supplies')
    `);

    // Seed shelters
    console.log('Seeding shelters...');
    await pool.query(`
      INSERT INTO shelters (name, address, capacity, current_occupancy, status, contact_person, contact_phone, contact_email, latitude, longitude, facilities) VALUES
      ('Community Center A', '123 Main St, Chennai', 100, 80, 'Accepting', 'John Doe', '+91 9876543210', 'john@example.com', 12.82, 80.04, '["food", "medical", "sleeping"]'),
      ('School Gymnasium', '456 Park Ave, Chennai', 150, 120, 'Limited Space', 'Jane Smith', '+91 9876543211', 'jane@example.com', 12.85, 80.07, '["food", "sleeping", "wifi"]'),
      ('Church Hall', '789 Church Rd, Chennai', 80, 40, 'Accepting', 'Mike Johnson', '+91 9876543212', 'mike@example.com', 12.79, 80.02, '["food", "medical"]'),
      ('City Convention Center', '321 Center Blvd, Chennai', 300, 285, 'Full', 'Sarah Williams', '+91 9876543213', 'sarah@example.com', 12.83, 80.06, '["food", "medical", "sleeping", "wifi"]'),
      ('Government School', '654 Education St, Chennai', 120, 95, 'Limited Space', 'Robert Brown', '+91 9876543214', 'robert@example.com', 12.81, 80.03, '["food", "sleeping"]')
    `);

    // Seed deliveries
    console.log('Seeding deliveries...');
    await pool.query(`
      INSERT INTO deliveries (supply_id, from_location, to_location, quantity, status, driver_name, driver_phone, vehicle_number, scheduled_date, notes) VALUES
      (1, 'Warehouse A', 'Community Center A', 50, 'Delivered', 'Raj Kumar', '+91 9876543220', 'TN-01-AB-1234', '2026-04-10 10:00:00', 'Morning delivery completed'),
      (2, 'Warehouse A', 'School Gymnasium', 30, 'In Transit', 'Vijay Singh', '+91 9876543221', 'TN-01-CD-5678', '2026-04-14 14:00:00', 'Expected arrival by 3 PM'),
      (3, 'Warehouse B', 'Church Hall', 20, 'Scheduled', 'Arun Reddy', '+91 9876543222', 'TN-01-EF-9012', '2026-04-15 09:00:00', 'Scheduled for tomorrow morning'),
      (6, 'Medical Store', 'City Convention Center', 40, 'In Transit', 'Suresh Patel', '+91 9876543223', 'TN-01-GH-3456', '2026-04-14 12:00:00', 'Urgent medical supplies'),
      (7, 'Warehouse C', 'Government School', 100, 'Scheduled', 'Karthik Rajan', '+91 9876543224', 'TN-01-IJ-7890', '2026-04-16 08:00:00', 'Water supply delivery')
    `);

    // Seed admin user
    console.log('Seeding users...');
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('admin123', salt);
    
    await pool.query(`
      INSERT INTO users (username, email, password_hash, role, full_name, phone, is_active) VALUES
      ('admin', 'admin@crisisnavigator.com', ?, 'admin', 'System Administrator', '+91 9876543200', TRUE),
      ('coordinator1', 'coord1@crisisnavigator.com', ?, 'coordinator', 'John Coordinator', '+91 9876543201', TRUE),
      ('volunteer1', 'volunteer1@crisisnavigator.com', ?, 'volunteer', 'Sarah Volunteer', '+91 9876543202', TRUE)
    `, [adminPasswordHash, adminPasswordHash, adminPasswordHash]);

    console.log('Database seeding completed successfully!');
    console.log('\nDefault Admin Credentials:');
    console.log('Email: admin@crisisnavigator.com');
    console.log('Password: admin123\n');
  } catch (error) {
    console.error('Error seeding database:', error.message);
    throw error;
  }
}

// Run seed if executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
