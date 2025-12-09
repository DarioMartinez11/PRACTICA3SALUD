// routes/authRoutes.js - AJUSTADO PARA EL FLUJO WEB CON EJS
const express = require('express');
const router = express.Router();
const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken'); 
require('dotenv').config();

// =================================================================
// RUTAS GET: MUESTRAN LOS FORMULARIOS EJS (CORRECCIÓN CSRF)
// =================================================================

// GET /auth/register - Muestra el formulario de registro
router.get('/register', (req, res) => {
    // 🚨 CORRECCIÓN CRÍTICA: Se añade req.csrfToken() para pasar el token a la vista
    if (req.session.userId) { // Opcional: Redirigir si ya está logueado
        return res.redirect('/');
    }
    
    res.render('register', { 
        title: 'Registro',
        csrfToken: req.csrfToken(), // ✅ SOLUCIÓN AL ERROR CSRF
        error: req.query.error, 
        message: req.query.message
    });
});

// GET /auth/login - Muestra el formulario de login
router.get('/login', (req, res) => {
    // También se añade req.csrfToken() para el formulario de login
    if (req.session.userId) { // Opcional: Redirigir si ya está logueado
        return res.redirect('/');
    }
    
    res.render('login', { 
        title: 'Login',
        csrfToken: req.csrfToken(), // ✅ NECESARIO para el POST de login
        error: req.query.error,
        message: req.query.message
    });
});


// =================================================================
// 2. POST /register - Procesa el registro (Redirección Web)
// =================================================================
router.post('/register', async (req, res) => {
    const { email, password, nombre, password_confirm } = req.body;
    
    // Asumiendo que has añadido 'password_confirm' en tu EJS para Nivel 10
    if (password !== password_confirm) { 
        return res.redirect('/auth/register?error=' + encodeURIComponent('Las contraseñas no coinciden.'));
    }

    if (!email || !password || !nombre) {
        return res.redirect('/auth/register?error=' + encodeURIComponent('Faltan campos obligatorios.'));
    }

    try {
        await userModel.registerUser(email, password, nombre);
        
        // Registro exitoso: redirigir al login con un mensaje de éxito
        res.redirect('/auth/login?message=' + encodeURIComponent('Usuario registrado correctamente. Por favor, inicia sesión.'));
        
    } catch (error) {
        let errorMessage = 'Error interno del servidor al registrar.';
        if (error.message.includes('El email ya está registrado')) {
             errorMessage = error.message;
        }
        // Redirigir de vuelta al formulario con un error en la URL
        res.redirect(`/auth/register?error=${encodeURIComponent(errorMessage)}`);
    }
});

// =================================================================
// 3. POST /login - Procesa el inicio de sesión (Redirección Web)
// =================================================================
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.redirect('/auth/login?error=Faltan campos: email y password.');
    }

    try {
        // Usamos tu función findUserByCredentials
        const user = await userModel.findUserByCredentials(email, password); 
        
        if (user) {
            // Establecer Sesión (CRÍTICO para Nivel 10)
            req.session.userId = user.id; 
            req.session.nombre = user.nombre;
            
            // Redirigir al panel principal
            return res.redirect('/'); 

        } else {
            return res.redirect('/auth/login?error=Credenciales incorrectas.');
        }

    } catch (error) {
        console.error("Error en login:", error);
        res.redirect('/auth/login?error=Error interno del servidor.');
    }
});

// =================================================================
// 4. POST /logout (Cerrar sesión)
// =================================================================
// Lo mantendremos como POST por seguridad y lo usaremos desde un formulario
router.post('/logout', (req, res, next) => {
    req.session.destroy(err => {
        if (err) {
            console.error("Error al cerrar sesión:", err);
            return next(err); // Dejar que Express maneje el error
        }
        // Redirigir a la página de inicio
        res.redirect('/'); 
    });
});

module.exports = router;