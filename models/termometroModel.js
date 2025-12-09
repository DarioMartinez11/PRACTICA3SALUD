// models/termometroModel.js - Lógica SQL de Termómetro
const { query } = require('../database');

/**
 * Registra una nueva medición de temperatura.
 */
async function recordTemperature(pacienteId, temperatura, unidad, fecha) {
    const sql = `
        INSERT INTO termometros (pacienteId, temperatura, unidad, fecha)
        VALUES (?, ?, ?, ?)
    `;
    const result = await query(sql, [pacienteId, temperatura, unidad, fecha]);
    return result.insertId;
}

/**
 * Obtiene todas las mediciones de un paciente.
 */
async function getMeasurementsByPaciente(pacienteId) {
    const sql = `
        SELECT id, temperatura, unidad, fecha 
        FROM termometros 
        WHERE pacienteId = ?
        ORDER BY fecha DESC, id DESC
    `;
    return await query(sql, [pacienteId]);
}

module.exports = {
    recordTemperature,
    getMeasurementsByPaciente,
};