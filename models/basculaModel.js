// models/basculaModel.js - Lógica SQL de Báscula
const { query } = require('../database');

/**
 * Registra una nueva medición de peso/altura.
 */
async function recordMeasurement(pacienteId, peso, altura, fecha) {
    const sql = `
        INSERT INTO basculas (pacienteId, peso, altura, fecha)
        VALUES (?, ?, ?, ?)
    `;
    const result = await query(sql, [pacienteId, peso, altura, fecha]);
    return result.insertId;
}

/**
 * Obtiene todas las mediciones de un paciente.
 */
async function getMeasurementsByPaciente(pacienteId) {
    const sql = `
        SELECT id, peso, altura, fecha 
        FROM basculas 
        WHERE pacienteId = ?
        ORDER BY fecha DESC, id DESC
    `;
    return await query(sql, [pacienteId]);
}

module.exports = {
    recordMeasurement,
    getMeasurementsByPaciente,
};