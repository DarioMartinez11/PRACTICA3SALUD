// models/pacienteModel.js
const { query } = require('../database');
const PacienteClass = require('../paciente'); // Importamos la clase Paciente para usarla si es necesario.

/**
 * Crea un nuevo paciente en la base de datos asociado a un usuario.
 */
async function createPaciente(nombre, apellidos, fechaDeNacimiento, userId) {
    const sql = `
        INSERT INTO pacientes (nombre, apellidos, fechaDeNacimiento, userId)
        VALUES (?, ?, ?, ?)
    `;
    const result = await query(sql, [nombre, apellidos, fechaDeNacimiento, userId]);
    // Devolver el ID del paciente recién creado
    return result.insertId;
}

/**
 * Obtiene todos los pacientes asociados a un usuario específico.
 */
async function getAllPacientes(userId) {
    const sql = `
        SELECT id, nombre, apellidos, fechaDeNacimiento 
        FROM pacientes 
        WHERE userId = ?
        ORDER BY apellidos, nombre
    `;
    const pacientesData = await query(sql, [userId]);
    
    // Opcional: Instanciar la clase Paciente para cada resultado si se necesita su lógica interna
    // const pacientes = pacientesData.map(data => 
    //     new PacienteClass(data.id, data.nombre, data.apellidos, data.fechaDeNacimiento)
    // );
    
    // Por simplicidad, devolvemos el objeto de datos plano
    return pacientesData;
}

/**
 * Obtiene un único paciente por ID, asegurando que pertenece al usuario.
 */
async function getPacienteById(id, userId) {
    const sql = `
        SELECT id, nombre, apellidos, fechaDeNacimiento 
        FROM pacientes 
        WHERE id = ? AND userId = ?
    `;
    const pacientes = await query(sql, [id, userId]);
    
    if (pacientes.length === 0) {
        return null; // Paciente no encontrado o no pertenece al usuario
    }
    
    // Opcional: Instanciar la clase Paciente
    // const data = pacientes[0];
    // return new PacienteClass(data.id, data.nombre, data.apellidos, data.fechaDeNacimiento);

    return pacientes[0];
}

/**
 * Actualiza los datos de un paciente.
 */
async function updatePaciente(id, nombre, apellidos, fechaDeNacimiento, userId) {
    const sql = `
        UPDATE pacientes 
        SET nombre = ?, apellidos = ?, fechaDeNacimiento = ?
        WHERE id = ? AND userId = ?
    `;
    const result = await query(sql, [nombre, apellidos, fechaDeNacimiento, id, userId]);
    
    // Si affectedRows es 0, significa que el paciente no existe o no pertenece al usuario
    return result.affectedRows > 0;
}

/**
 * Elimina un paciente de la base de datos.
 * Nota: Es importante considerar si también se deben eliminar sus registros de báscula/termómetro (cascada).
 */
async function deletePaciente(id, userId) {
    // Primero, eliminamos los registros de báscula y termómetro
    // (Asegúrate de que estas tablas tengan el FOREIGN KEY con CASCADE DELETE o hazlo manualmente)
    // DELETE FROM basculas WHERE pacienteId = ?;
    // DELETE FROM termometros WHERE pacienteId = ?;

    const sql = `
        DELETE FROM pacientes 
        WHERE id = ? AND userId = ?
    `;
    const result = await query(sql, [id, userId]);
    
    return result.affectedRows > 0;
}

module.exports = {
    createPaciente,
    getAllPacientes,
    getPacienteById,
    updatePaciente,
    deletePaciente,
};