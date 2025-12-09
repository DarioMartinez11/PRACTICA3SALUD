// models/userModel.js
const { query } = require('../database');
const bcrypt = require('bcryptjs');

// Número de rondas de sal para hashear. Cuanto mayor, más seguro, pero más lento.
const SALT_ROUNDS = 10; 

/**
 * Registra un nuevo usuario en la base de datos.
 */
async function registerUser(email, password, nombre) {
    try {
        // 1. Hashear la contraseña antes de guardarla
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // 2. Insertar en la tabla de usuarios
        const sql = `
            INSERT INTO usuarios (email, password_hash, nombre) 
            VALUES (?, ?, ?)
        `;
        // CRÍTICO: 'password' se ha cambiado a 'password_hash' para coincidir con init-db.js
        const result = await query(sql, [email, hashedPassword, nombre]);

        // Retornar el ID del usuario creado
        return result.insertId; 
    } catch (error) {
        // Manejar errores de duplicidad de email
        if (error.code === 'ER_DUP_ENTRY') {
            throw new Error('El email ya está registrado.');
        }
        throw error;
    }
}

/**
 * Verifica las credenciales de un usuario y retorna su información si son correctas.
 */
async function findUserByCredentials(email, password) {
    try {
        // 1. Buscar el usuario por email
        const sql = `
            SELECT id, email, password_hash, nombre, rol FROM usuarios WHERE email = ?
            
        `;
        // CRÍTICO: Seleccionamos 'password_hash' para poder compararlo.
        // También he añadido 'rol', que es útil para el Nivel 10.
        const users = await query(sql, [email]);
        
        if (users.length === 0) {
            return null; // Usuario no encontrado
        }

        const user = users[0];

        // 2. Comparar la contraseña hasheada (ahora usamos user.password_hash)
        const isMatch = await bcrypt.compare(password, user.password_hash); // CRÍTICO: Usar user.password_hash

        if (isMatch) {
            // Retornar la información del usuario (SIN la contraseña hasheada)
            const { password_hash, ...userData } = user; // CRÍTICO: Excluimos password_hash
            return userData;
        } else {
            return null; // Contraseña incorrecta
        }

    } catch (error) {
        console.error("Error al buscar usuario:", error);
        throw error;
    }
}

module.exports = {
    registerUser,
    findUserByCredentials,
};