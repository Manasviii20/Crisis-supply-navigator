const { pool } = require('../database/config');
const bcrypt = require('bcryptjs');

class User {
  static async findAll() {
    const [rows] = await pool.query(
      'SELECT id, username, email, role, full_name, phone, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, username, email, role, full_name, phone, is_active, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async findByEmail(email) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  static async findByUsername(username) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    return rows[0];
  }

  static async create(userData) {
    const { username, email, password, role, full_name, phone } = userData;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      'INSERT INTO users (username, email, password_hash, role, full_name, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, password_hash, role || 'volunteer', full_name, phone]
    );
    return { id: result.insertId, username, email, role, full_name, phone };
  }

  static async update(id, userData) {
    const { role, full_name, phone, is_active } = userData;
    
    await pool.query(
      'UPDATE users SET role = ?, full_name = ?, phone = ?, is_active = ? WHERE id = ?',
      [role, full_name, phone, is_active, id]
    );
    return { id, ...userData };
  }

  static async updatePassword(id, newPassword) {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);
    
    await pool.query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [password_hash, id]
    );
  }

  static async delete(id) {
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return { id };
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async getStatistics() {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admin_count,
        SUM(CASE WHEN role = 'coordinator' THEN 1 ELSE 0 END) as coordinator_count,
        SUM(CASE WHEN role = 'volunteer' THEN 1 ELSE 0 END) as volunteer_count,
        SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active_count
      FROM users
    `);
    return stats[0];
  }
}

module.exports = User;
