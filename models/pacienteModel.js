// models/pacienteModel.js
const { query } = require('../database');
// Si usas la clase Paciente para cálculos (ej. edad, IMC), asegúrate de importarla
// const PacienteClass = require('../paciente'); 

/**
 * Crea un nuevo paciente en la base de datos asociado a un usuario, incluyendo TODOS los campos.
 */
async function createPaciente(nombre, apellidos, fechaDeNacimiento, userId, dni, telefono, email, direccion, genero, altura) {
    const sql = `
        INSERT INTO pacientes (
            nombre, apellidos, fecha_nacimiento, usuario_id, 
            dni, telefono, email, direccion, genero, altura
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    // Si algún campo opcional es null o undefined, el '|| null' asegura que se pase NULL a la DB.
    const params = [
        nombre, 
        apellidos, 
        fechaDeNacimiento, 
        userId, 
        dni || null, 
        telefono || null, 
        email || null, 
        direccion || null, 
        genero || null, 
        altura || null
    ];
    
    const result = await query(sql, params);
    return result.insertId;
}

/**
 * Obtiene todos los pacientes asociados a un usuario específico.
 * Se seleccionan los campos básicos necesarios para el listado.
 */
async function getAllPacientes(userId) {
    const sql = `
        SELECT 
            id, 
            nombre, 
            apellidos, 
            fecha_nacimiento AS fechaDeNacimiento 
        FROM pacientes 
        WHERE usuario_id = ?
        ORDER BY apellidos, nombre
    `;
    const pacientesData = await query(sql, [userId]);
    
    return pacientesData;
}

/**
 * Obtiene un único paciente por ID, asegurando que pertenece al usuario, seleccionando TODOS los campos.
 */
async function getPacienteById(id, userId) {
    // 🚨 CORRECCIÓN: Usar SELECT * (o listar todos los campos) para obtener los datos COMPLETOs para la edición.
    const sql = `
        SELECT 
            id, usuario_id, nombre, apellidos, 
            fecha_nacimiento, dni, telefono, email, 
            direccion, genero, altura, fecha_creacion, fecha_actualizacion
        FROM pacientes 
        WHERE id = ? AND usuario_id = ?
    `;
    const pacientes = await query(sql, [id, userId]);
    
    if (pacientes.length === 0) {
        return null;
    }
    
    return pacientes[0];
}

/**
 * Actualiza todos los datos de un paciente.
 */
async function updatePaciente(id, userId, data) {
    const { 
        nombre, apellidos, fechaDeNacimiento, 
        dni, telefono, email, direccion, genero, altura 
    } = data;
    
    // 🚨 CORRECCIÓN: Actualizar TODOS los campos y añadir fecha_actualizacion.
    const sql = `
        UPDATE pacientes 
        SET 
            nombre = ?, 
            apellidos = ?, 
            fecha_nacimiento = ?,
            dni = ?,
            telefono = ?,
            email = ?,
            direccion = ?,
            genero = ?,
            altura = ?,
            fecha_actualizacion = NOW()
        WHERE id = ? AND usuario_id = ?
    `;
    
    const params = [
        nombre, 
        apellidos, 
        fechaDeNacimiento, 
        dni || null, 
        telefono || null, 
        email || null, 
        direccion || null, 
        genero || null, 
        altura || null,
        id, 
        userId
    ];
    
    const result = await query(sql, params);
    
    return result.affectedRows > 0;
}

/**
 * Elimina un paciente de la base de datos.
 */
async function deletePaciente(id, userId) {
    const sql = `
        DELETE FROM pacientes 
        WHERE id = ? AND usuario_id = ?
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