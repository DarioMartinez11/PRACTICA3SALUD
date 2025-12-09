// middleware/auth.js

/**
 * Middleware para asegurar que el usuario esté autenticado.
 * Si no lo está, devuelve un error 401 (Unauthorized) o redirige a login.
 */
function protectRoute(req, res, next) {
    // La sesión debe haber sido configurada en server.js
    if (req.session && req.session.userId) {
        // El usuario está autenticado. Continuar con la siguiente función (next)
        next();
    } else {
        // Usuario no autenticado
        console.warn('❌ Acceso denegado a ruta privada:', req.method, req.path);
        
        // Si es una petición API, responder con JSON
        if (req.originalUrl.startsWith('/api')) {
            return res.status(401).json({ 
                error: 'Acceso no autorizado', 
                message: 'Debes iniciar sesión para acceder a este recurso.' 
            });
        }
        
        // Si es una petición web normal, redirigir a la página de login
        req.session.returnTo = req.originalUrl; // Guarda la URL a la que querían ir
        // 🚨 CORRECCIÓN: Cambiar '/login' a '/auth/login'
        res.redirect('/auth/login'); 
    }
}

module.exports = {
    protectRoute
};