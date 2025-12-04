// config/database.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración del pool de conexiones
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Función para ejecutar queries
async function query(sql, params) {
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) {
        console.error('❌ Error en la consulta MySQL:', error.message);
        console.error('SQL:', sql);
        console.error('Params:', params);
        throw error;
    }
}

// Función para obtener una conexión del pool
async function getConnection() {
    return await pool.getConnection();
}

// Función para probar la conexión
async function testConnection() {
    try {
        const connection = await getConnection();
        console.log('✅ Conexión a MySQL establecida correctamente');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Error al conectar con MySQL:', error.message);
        console.log('\n🔧 Solución de problemas:');
        console.log('1. Verifica que MySQL esté corriendo');
        console.log('2. Revisa las credenciales en .env');
        console.log('3. Asegúrate de que la base de datos exista');
        return false;
    }
}

module.exports = {
    pool,
    query,
    getConnection,
    testConnection
};