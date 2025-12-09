// server.js - Archivo principal del servidor (VERSIÓN FINAL CON NIVEL 10)
require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const csrf = require('csurf');
const helmet = require('helmet');
const { testConnection } = require('./database'); 
// 🚨 IMPORTANTE: Asegúrate de que tu middleware/auth.js redirija a /auth/login
const { protectRoute } = require('./middleware/auth'); // Middleware de protección (Nivel 10)

// Configuración EJS
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Importar controladores (Rutas)
const authRoutes = require('./routes/authRoutes'); // Rutas de autenticación
const pacienteRoutes = require('./routes/pacienteRoutes'); 
const basculaRoutes = require('./bascula'); 
const termometroRoutes = require('./termometro'); 


const PORT = process.env.PORT || 3000;

// =================================================================
// MIDDLEWARE GENERAL
// =================================================================

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

// Configurar CSRF (Nivel 10)
const csrfProtection = csrf({ 
    cookie: false,
    value: (req) => {
        return req.body._csrf || 
               req.headers['x-csrf-token'] || 
               req.query._csrf;
    }
});

// Aplicar CSRF protection (Globalmente)
app.use(csrfProtection);

// Pasar estado de sesión y token CSRF a todas las vistas
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.userId ? true : false;
    res.locals.nombreUsuario = req.session.nombre || null;
    
    // El token se genera aquí y se pasa a res.locals para todas las vistas EJS
    if (typeof req.csrfToken === 'function') {
        res.locals.csrfToken = req.csrfToken();
    }
    next();
});

// =================================================================
// 🚨 ZONA DE RUTAS
// =================================================================

// Rutas de Autenticación (NO protegidas)
app.use('/auth', authRoutes);


// Rutas de la API (Protegidas por `protectRoute` - Nivel 10)
app.use('/api/basculas', protectRoute, basculaRoutes);
app.use('/api/pacientes', protectRoute, pacienteRoutes);
app.use('/api/termometros', protectRoute, termometroRoutes);

// ✅ RUTA CORREGIDA: Ruta principal (Dashboard)
app.get('/', protectRoute, (req, res) => { // 1. AÑADIDO: protectRoute
    // 2. CAMBIADO: 'index' por 'dashboard' (o el nombre de tu vista principal)
    res.render('dashboard', { 
        title: 'AppSalud - Panel de Control',
        // nombreUsuario y csrfToken ya se pasan por res.locals
        message: req.query.message || null 
    });
});

// Ruta de estado del sistema (Se mantiene)
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


// =================================================================
// MANEJO DE ERRORES
// =================================================================

// Middleware para errores CSRF (Se mantiene)
app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        console.warn('❌ ERROR CSRF:', err.message);
        // Si es una petición API, devolver JSON. Si es web, se podría redirigir.
        return res.status(403).json({ 
            error: 'Token CSRF inválido o faltante', 
            message: 'Incluya un token CSRF válido en la solicitud' 
        });
    }
    next(err);
});

// Manejo de errores general (Se mantiene)
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack || err);
    res.status(err.status || 500).json({
        error: err.message || 'Error interno del servidor',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// =================================================================
// INICIALIZACIÓN (Se mantiene)
// =================================================================

async function initializeDatabase() {
    try {
        console.log('🔌 Conectando a MySQL...');
        const connected = await testConnection();
        // ... (resto de la lógica)
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

async function startServer() {
    try {
        await initializeDatabase();
        
        app.listen(PORT, () => {
            console.log('\n' + '='.repeat(50));
            console.log(`🚀 Servidor AppSalud iniciado correctamente`);
            console.log(`📍 URL: http://localhost:${PORT}`);
            console.log(`📍 API Status: http://localhost:${PORT}/api/status`);
            console.log('='.repeat(50) + '\n');
            
            console.log('📋 Rutas disponibles:');
            console.log('  GET  /              - Página principal (Web - PROTEGIDA)'); // Actualizado
            console.log('  POST /auth/register - Registro de usuario (Web)');
            console.log('  POST /auth/login    - Inicio de sesión (Web)');
            console.log('  POST /auth/logout   - Cerrar sesión (Web)');
            console.log('  GET  /api/status    - Estado del sistema (API)');
            console.log('  API Protegidas (Requieren Login/Sesión):');
            console.log('  /api/pacientes, /api/basculas, /api/termometros');
        });
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
}

startServer();

module.exports = app;