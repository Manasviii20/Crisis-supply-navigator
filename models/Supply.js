const { pool } = require('../database/config');

class Supply {
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM supplies WHERE 1=1';
    const params = [];

    if (filters.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM supplies WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(supplyData) {
    const { name, category, quantity, unit, status, location, description } = supplyData;
    const [result] = await pool.query(
      'INSERT INTO supplies (name, category, quantity, unit, status, location, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, category, quantity, unit, status || 'Available', location, description]
    );
    return { id: result.insertId, ...supplyData };
  }

  static async update(id, supplyData) {
    const { name, category, quantity, unit, status, location, description } = supplyData;
    await pool.query(
      'UPDATE supplies SET name = ?, category = ?, quantity = ?, unit = ?, status = ?, location = ?, description = ? WHERE id = ?',
      [name, category, quantity, unit, status, location, description, id]
    );
    return { id, ...supplyData };
  }

  static async delete(id) {
    await pool.query('DELETE FROM supplies WHERE id = ?', [id]);
    return { id };
  }

  static async getStatistics() {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_supplies,
        SUM(quantity) as total_quantity,
        SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) as available_count,
        SUM(CASE WHEN status = 'Low Stock' THEN 1 ELSE 0 END) as low_stock_count,
        SUM(CASE WHEN status = 'In Transit' THEN 1 ELSE 0 END) as in_transit_count
      FROM supplies
    `);
    return stats[0];
  }

  static async getCategoryBreakdown() {
    const [categories] = await pool.query(`
      SELECT category, COUNT(*) as count, SUM(quantity) as total_quantity
      FROM supplies
      GROUP BY category
      ORDER BY total_quantity DESC
    `);
    return categories;
  }
}

module.exports = Supply;
