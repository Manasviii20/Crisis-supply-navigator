const { pool } = require('../database/config');

class Delivery {
  static async findAll(filters = {}) {
    let query = `
      SELECT d.*, s.name as supply_name, s.category as supply_category
      FROM deliveries d
      LEFT JOIN supplies s ON d.supply_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.status) {
      query += ' AND d.status = ?';
      params.push(filters.status);
    }

    if (filters.supply_id) {
      query += ' AND d.supply_id = ?';
      params.push(filters.supply_id);
    }

    query += ' ORDER BY d.created_at DESC';

    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query(`
      SELECT d.*, s.name as supply_name, s.category as supply_category
      FROM deliveries d
      LEFT JOIN supplies s ON d.supply_id = s.id
      WHERE d.id = ?
    `, [id]);
    return rows[0];
  }

  static async create(deliveryData) {
    const {
      supply_id, from_location, to_location, quantity, status,
      driver_name, driver_phone, vehicle_number,
      scheduled_date, delivered_date, notes
    } = deliveryData;

    const [result] = await pool.query(
      `INSERT INTO deliveries (
        supply_id, from_location, to_location, quantity, status,
        driver_name, driver_phone, vehicle_number,
        scheduled_date, delivered_date, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        supply_id, from_location, to_location, quantity, status || 'Scheduled',
        driver_name, driver_phone, vehicle_number,
        scheduled_date, delivered_date, notes
      ]
    );
    return { id: result.insertId, ...deliveryData };
  }

  static async update(id, deliveryData) {
    const {
      supply_id, from_location, to_location, quantity, status,
      driver_name, driver_phone, vehicle_number,
      scheduled_date, delivered_date, notes
    } = deliveryData;

    await pool.query(
      `UPDATE deliveries SET 
        supply_id = ?, from_location = ?, to_location = ?, quantity = ?, status = ?,
        driver_name = ?, driver_phone = ?, vehicle_number = ?,
        scheduled_date = ?, delivered_date = ?, notes = ?
      WHERE id = ?`,
      [
        supply_id, from_location, to_location, quantity, status,
        driver_name, driver_phone, vehicle_number,
        scheduled_date, delivered_date, notes, id
      ]
    );
    return { id, ...deliveryData };
  }

  static async delete(id) {
    await pool.query('DELETE FROM deliveries WHERE id = ?', [id]);
    return { id };
  }

  static async getStatistics() {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_deliveries,
        SUM(CASE WHEN status = 'Scheduled' THEN 1 ELSE 0 END) as scheduled_count,
        SUM(CASE WHEN status = 'In Transit' THEN 1 ELSE 0 END) as in_transit_count,
        SUM(CASE WHEN status = 'Delivered' THEN 1 ELSE 0 END) as delivered_count,
        SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled_count
      FROM deliveries
    `);
    return stats[0];
  }

  static async updateStatus(id, newStatus) {
    const deliveredDate = newStatus === 'Delivered' ? new Date() : null;
    
    await pool.query(
      'UPDATE deliveries SET status = ?, delivered_date = ? WHERE id = ?',
      [newStatus, deliveredDate, id]
    );
    return { id, status: newStatus, delivered_date: deliveredDate };
  }

  static async getTodayDeliveries() {
    const [rows] = await pool.query(`
      SELECT d.*, s.name as supply_name
      FROM deliveries d
      LEFT JOIN supplies s ON d.supply_id = s.id
      WHERE DATE(d.created_at) = CURDATE()
      ORDER BY d.created_at DESC
    `);
    return rows;
  }
}

module.exports = Delivery;
