// server.js - Archivo principal del servidor CORREGIDO
require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const csrf = require('csurf');
const helmet = require('helmet');
const { testConnection } = require('./database'); // Cambiado: importar testConnection

// Importar controladores
const basculaRoutes = require('./bascula');
const pacienteRoutes = require('./paciente');
const termometroRoutes = require('./termometro');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de seguridad
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configurar sesiones
app.use(session({
    secret: process.env.SESSION_SECRET || 'clave-secreta-appsalud',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
}));

// Configurar CSRF
const csrfProtection = csrf({ 
    cookie: false,
    value: (req) => {
        // Buscar token en body, headers o query
        return req.body._csrf || 
               req.headers['x-csrf-token'] || 
               req.query._csrf;
    }
});

// Aplicar CSRF protection
app.use(csrfProtection);

// Pasar token CSRF a todas las vistas
app.use((req, res, next) => {
    if (typeof req.csrfToken === 'function') {
        res.locals.csrfToken = req.csrfToken();
    }
    next();
});

// CONEXIÓN A LA BASE DE DATOS (CORREGIDO)
async function initializeDatabase() {
    try {
        console.log('🔌 Conectando a MySQL...');
        const connected = await testConnection();
        
        if (connected) {
            console.log('✅ Conectado a MySQL correctamente');
            return true;
        } else {
            console.log('⚠️  No se pudo conectar a MySQL. Continuando sin base de datos...');
            return false;
        }
    } catch (error) {
        console.error('❌ Error en conexión a MySQL:', error.message);
        return false;
    }
}

// Rutas
app.use('/api/basculas', basculaRoutes);
app.use('/api/pacientes', pacienteRoutes);
app.use('/api/termometros', termometroRoutes);

// Ruta principal
app.get('/', (req, res) => {
    res.json({
        message: 'API de AppSalud funcionando',
        endpoints: {
            basculas: '/api/basculas',
            pacientes: '/api/pacientes',
            termometros: '/api/termometros',
            status: '/api/status'
        },
        documentation: 'Consulte la documentación para más detalles'
    });
});

// Ruta de estado del sistema
app.get('/api/status', async (req, res) => {
    const dbStatus = await testConnection();
    res.json({
        status: 'online',
        timestamp: new Date().toISOString(),
        database: dbStatus ? 'connected' : 'disconnected',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});

// Middleware para errores CSRF
app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).json({ 
            error: 'Token CSRF inválido o faltante',
            message: 'Incluya un token CSRF válido en la solicitud'
        });
    }
    next(err);
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack || err);
    res.status(err.status || 500).json({
        error: err.message || 'Error interno del servidor',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Función para iniciar el servidor
async function startServer() {
    try {
        // Inicializar conexión a base de datos
        await initializeDatabase();
        
        // Iniciar servidor
        app.listen(PORT, () => {
            console.log('\n' + '='.repeat(50));
            console.log(`🚀 Servidor AppSalud iniciado correctamente`);
            console.log(`📍 URL: http://localhost:${PORT}`);
            console.log(`📍 API Status: http://localhost:${PORT}/api/status`);
            console.log('='.repeat(50) + '\n');
            
            console.log('📋 Rutas disponibles:');
            console.log('  GET  /              - Página principal');
            console.log('  GET  /api/status    - Estado del sistema');
            console.log('  POST /api/basculas  - Registrar peso');
            console.log('  POST /api/pacientes - Registrar paciente');
            console.log('  POST /api/termometros - Registrar temperatura');
        });
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
}

// Manejo de señales de terminación
process.on('SIGTERM', () => {
    console.log('🛑 Recibida señal SIGTERM. Cerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 Recibida señal SIGINT (Ctrl+C). Cerrando servidor...');
    process.exit(0);
});

// Iniciar la aplicación
startServer();

module.exports = app; // Para testing