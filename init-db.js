// config/init-db.js
console.log('🚀 Iniciando script de inicialización de base de datos...');

// Importaciones básicas
const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDatabase() {
    let connection;
    
    try {
        console.log('\n📊 Configuración MySQL:');
        console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
        console.log(`   Usuario: ${process.env.DB_USER || 'root'}`);
        console.log(`   Base de datos: ${process.env.DB_NAME || 'appsalud_db'}`);
        
        // Primero, intentamos conectar sin base de datos
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            port: process.env.DB_PORT || 3306
        });

        console.log('✅ Conectado al servidor MySQL');

        // Crear la base de datos si no existe
        const dbName = process.env.DB_NAME || 'appsalud_db';
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName} 
                               CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log(`📁 Base de datos '${dbName}' creada/verificada`);

        // Usar la base de datos
        await connection.query(`USE ${dbName}`);

        console.log('\n📋 Creando tablas...');

        // ======================
        // 1. TABLA USUARIOS (para autenticación JWT - NIVEL 10)
        // ======================
        await connection.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                nombre VARCHAR(100) NOT NULL,
                rol ENUM('admin', 'medico', 'paciente') DEFAULT 'paciente',
                activo BOOLEAN DEFAULT TRUE,
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ultimo_login TIMESTAMP NULL,
                telefono VARCHAR(20),
                INDEX idx_email (email),
                INDEX idx_rol (rol)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Tabla "usuarios" creada');

        // ======================
        // 2. TABLA PACIENTES
        // ======================
        await connection.query(`
            CREATE TABLE IF NOT EXISTS pacientes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                usuario_id INT NULL,
                nombre VARCHAR(100) NOT NULL,
                apellidos VARCHAR(200) NOT NULL,
                fecha_nacimiento DATE NOT NULL,
                dni VARCHAR(20) UNIQUE,
                telefono VARCHAR(20),
                email VARCHAR(255),
                direccion TEXT,
                genero ENUM('masculino', 'femenino', 'otro') DEFAULT 'otro',
                altura DECIMAL(5,2),
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
                INDEX idx_nombre (nombre),
                INDEX idx_apellidos (apellidos),
                INDEX idx_dni (dni)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Tabla "pacientes" creada');

        // ======================
        // 3. TABLA BASCULAS
        // ======================
        await connection.query(`
            CREATE TABLE IF NOT EXISTS basculas (
                id INT AUTO_INCREMENT PRIMARY KEY,
                paciente_id INT NOT NULL,
                peso DECIMAL(5,2) NOT NULL,
                altura DECIMAL(5,2) NOT NULL,
                fecha_registro DATETIME NOT NULL,
                notas TEXT,
                FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
                INDEX idx_paciente (paciente_id),
                INDEX idx_fecha (fecha_registro)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Tabla "basculas" creada');

        // ======================
        // 4. TABLA TERMOMETROS
        // ======================
        await connection.query(`
            CREATE TABLE IF NOT EXISTS termometros (
                id INT AUTO_INCREMENT PRIMARY KEY,
                paciente_id INT NOT NULL,
                temperatura DECIMAL(4,2) NOT NULL,
                fecha_registro DATETIME NOT NULL,
                unidad ENUM('celsius', 'fahrenheit') DEFAULT 'celsius',
                sintomas TEXT,
                notas TEXT,
                FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
                INDEX idx_paciente (paciente_id),
                INDEX idx_fecha (fecha_registro)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Tabla "termometros" creada');

        // ======================
        // 5. TABLA TOKENS_CSRF (Protección CSRF - NIVEL 10)
        // ======================
        await connection.query(`
            CREATE TABLE IF NOT EXISTS tokens_csrf (
                id INT AUTO_INCREMENT PRIMARY KEY,
                usuario_id INT NOT NULL,
                token VARCHAR(255) NOT NULL,
                creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expira_en TIMESTAMP NOT NULL,
                usado BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                UNIQUE KEY unique_token (token),
                INDEX idx_token (token),
                INDEX idx_usuario (usuario_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Tabla "tokens_csrf" creada (Nivel 10 - CSRF)');

        console.log('\n🎉 ¡Todas las tablas creadas con éxito!');
        console.log('\n📋 Resumen de tablas:');
        console.log('   1. usuarios - Autenticación JWT');
        console.log('   2. pacientes - Datos de pacientes');
        console.log('   3. basculas - Registros de peso');
        console.log('   4. termometros - Registros de temperatura');
        console.log('   5. tokens_csrf - Protección CSRF');

        await connection.end();
        return true;

    } catch (error) {
        console.error('\n❌ Error durante la inicialización:');
        console.error('   Mensaje:', error.message);
        
        // Mensajes de ayuda según el error
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('\n🔧 Solución: Verifica las credenciales en .env');
            console.error('   - Usuario y contraseña de MySQL');
            console.error('   - Asegúrate de que MySQL esté corriendo');
        }
        
        if (connection) {
            await connection.end();
        }
        
        return false;
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    initDatabase().then(success => {
        if (success) {
            console.log('\n✨ ¡Base de datos inicializada correctamente!');
            console.log('👉 Ahora puedes ejecutar: npm run dev');
            process.exit(0);
        } else {
            console.log('\n💥 Hubo un error durante la inicialización');
            process.exit(1);
        }
    }).catch(err => {
        console.error('Error inesperado:', err);
        process.exit(1);
    });
}

module.exports = initDatabase;