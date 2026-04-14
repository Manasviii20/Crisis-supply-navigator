const { pool } = require('../database/config');

class Shelter {
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM shelters WHERE 1=1';
    const params = [];

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.search) {
      query += ' AND (name LIKE ? OR address LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM shelters WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(shelterData) {
    const { 
      name, address, capacity, current_occupancy, status,
      contact_person, contact_phone, contact_email,
      latitude, longitude, facilities
    } = shelterData;

    const facilitiesJson = facilities ? JSON.stringify(facilities) : null;

    const [result] = await pool.query(
      `INSERT INTO shelters (
        name, address, capacity, current_occupancy, status,
        contact_person, contact_phone, contact_email,
        latitude, longitude, facilities
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, address, capacity, current_occupancy || 0, status || 'Accepting',
        contact_person, contact_phone, contact_email,
        latitude, longitude, facilitiesJson
      ]
    );
    return { id: result.insertId, ...shelterData };
  }

  static async update(id, shelterData) {
    const { 
      name, address, capacity, current_occupancy, status,
      contact_person, contact_phone, contact_email,
      latitude, longitude, facilities
    } = shelterData;

    const facilitiesJson = facilities ? JSON.stringify(facilities) : null;

    await pool.query(
      `UPDATE shelters SET 
        name = ?, address = ?, capacity = ?, current_occupancy = ?, status = ?,
        contact_person = ?, contact_phone = ?, contact_email = ?,
        latitude = ?, longitude = ?, facilities = ?
      WHERE id = ?`,
      [
        name, address, capacity, current_occupancy, status,
        contact_person, contact_phone, contact_email,
        latitude, longitude, facilitiesJson, id
      ]
    );
    return { id, ...shelterData };
  }

  static async delete(id) {
    await pool.query('DELETE FROM shelters WHERE id = ?', [id]);
    return { id };
  }

  static async getStatistics() {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_shelters,
        SUM(capacity) as total_capacity,
        SUM(current_occupancy) as total_occupancy,
        SUM(CASE WHEN status = 'Accepting' THEN 1 ELSE 0 END) as accepting_count,
        SUM(CASE WHEN status = 'Limited Space' THEN 1 ELSE 0 END) as limited_space_count,
        SUM(CASE WHEN status = 'Full' THEN 1 ELSE 0 END) as full_count
      FROM shelters
    `);
    return stats[0];
  }

  static async updateOccupancy(id, newOccupancy) {
    const shelter = await this.findById(id);
    if (!shelter) throw new Error('Shelter not found');

    let status = 'Accepting';
    const occupancyRate = newOccupancy / shelter.capacity;
    if (occupancyRate >= 1) {
      status = 'Full';
    } else if (occupancyRate >= 0.75) {
      status = 'Limited Space';
    }

    await pool.query(
      'UPDATE shelters SET current_occupancy = ?, status = ? WHERE id = ?',
      [newOccupancy, status, id]
    );
    return { id, current_occupancy: newOccupancy, status };
  }
}

module.exports = Shelter;
