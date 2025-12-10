// routes/pacienteRoutes.js - Controlador de Rutas de Paciente

const express = require('express');
const router = express.Router();
const pacienteModel = require('../models/pacienteModel'); 
const PacienteClass = require('../paciente'); 

/**
 * Middleware para validar datos de paciente.
 */
function validatePacienteData(req, res, next) {
    const { 
        nombre, apellidos, fechaDeNacimiento, 
        dni, telefono, email, direccion, genero, altura 
    } = req.body;
    
    // 1. Verificar datos básicos y formato de fecha (YYYY-MM-DD)
    const isValid = nombre && apellidos && fechaDeNacimiento && /^\d{4}-\d{2}-\d{2}$/.test(fechaDeNacimiento);

    if (!isValid) {
        // 2. Determinar si es una ruta API o una ruta Web (Formulario)
        const isApiRoute = req.originalUrl.startsWith('/api/pacientes');

        const errorMessage = 'Datos inválidos. Asegúrate de incluir nombre, apellidos y Fecha de Nacimiento (AAAA-MM-DD).';
        
        if (isApiRoute) {
            // Si es API, devuelve JSON
            return res.status(400).json({ 
                error: 'Datos inválidos', 
                message: errorMessage
            });
        }
        
        // Si es WEB (envío de formulario), redirige de vuelta
        return res.redirect(`${req.originalUrl.split('?')[0].replace('/editar', '')}?error=${encodeURIComponent(errorMessage)}`);
    }
    next();
}

// =================================================================
// 🌐 RUTAS WEB (VIEWS/EJS) - Montadas en /pacientes
// =================================================================

// 1. GET /pacientes/crear - Muestra el formulario de creación (Soluciona Cannot GET /crear)
router.get('/crear', (req, res) => {
    res.render('pacientes/crear', { 
        title: 'Crear Nuevo Paciente',
        error: req.query.error || null, 
        csrfToken: req.csrfToken()
    });
});

// 2. POST /pacientes/crear - Procesa la creación del formulario WEB
router.post('/crear', validatePacienteData, async (req, res) => {
    
    const { 
        nombre, apellidos, fechaDeNacimiento, 
        dni, telefono, email, direccion, genero, altura 
    } = req.body;
    const userId = req.session.userId; 

    try {
        const nuevoId = await pacienteModel.createPaciente(
            nombre, apellidos, fechaDeNacimiento, userId, 
            dni, telefono, email, direccion, genero, altura
        );
        
        res.redirect('/pacientes/lista?message=' + encodeURIComponent(`Paciente ${nombre} creado correctamente (ID: ${nuevoId}).`));
    } catch (error) {
        console.error("Error al crear paciente desde formulario web:", error);
        res.redirect(`/pacientes/crear?error=${encodeURIComponent('Error interno al guardar el paciente en la base de datos.')}`);
    }
});


// ===============================================
// 🚨 CORRECCIÓN CLAVE DE ORDEN: /lista debe ir antes de /:id
// ===============================================

// 3. GET /pacientes/lista - Muestra el listado de pacientes (Rompe el bucle de /:id)
router.get('/lista', async (req, res) => {
    const userId = req.session.userId;
    try {
        const pacientesData = await pacienteModel.getAllPacientes(userId);
        
        // APLICACIÓN NIVEL 8: Usar la clase Paciente para enriquecer los datos (edad)
        const pacientesConEdad = pacientesData.map(data => {
            const paciente = new PacienteClass(data.id, data.nombre, data.apellidos, data.fechaDeNacimiento);
            data.edad = paciente.obtenerEdad(); // <--- Usando el método de tu CLASE
            return data;
        });

        res.render('pacientes/lista', { 
            title: 'Listado de Pacientes',
            pacientes: pacientesConEdad, 
            message: req.query.message || null,
            error: req.query.error || null // Captura errores de eliminación o redirección
        });
    } catch (error) {
        console.error("Error al obtener listado de pacientes (Web):", error);
        // Si hay error en DB, renderiza la lista vacía con un mensaje de error.
        res.render('pacientes/lista', { 
            title: 'Listado de Pacientes',
            pacientes: [],
            message: null,
            error: 'Error al cargar los pacientes desde la base de datos.' 
        });
    }
});


// =================================================================
// RUTAS DE DETALLE Y EDICIÓN (/:id)
// =================================================================

// 4. GET /pacientes/:id - Muestra la vista de detalle/edición (funciona si no es 'lista')
router.get('/:id', async (req, res) => {
    const id = req.params.id;
    const userId = req.session.userId;

    try {
        const paciente = await pacienteModel.getPacienteById(id, userId);
        
        if (!paciente) {
            // Si no encuentra el paciente, redirige a la lista CON ERROR
            return res.redirect(`/pacientes/lista?error=${encodeURIComponent('Paciente no encontrado o no autorizado.')}`);
        }

        // Renderiza la vista paciente_detalle.ejs
        res.render('paciente_detalle', {
            title: `Detalle y Edición de Paciente (ID: ${id})`,
            paciente: paciente, 
            csrfToken: req.csrfToken(), 
            error: req.query.error || null,
            message: req.query.message || null
        });

    } catch (error) {
        console.error("Error al obtener detalle del paciente:", error);
        res.redirect(`/pacientes/lista?error=${encodeURIComponent('Error al cargar los datos del paciente.')}`);
    }
});

// 5. POST /pacientes/editar/:id - Procesa la actualización del formulario WEB
router.post('/editar/:id', validatePacienteData, async (req, res) => {
    const id = req.params.id;
    const userId = req.session.userId;
    const data = req.body; 

    try {
        const updated = await pacienteModel.updatePaciente(id, userId, data);

        if (!updated) {
            return res.redirect(`/pacientes/${id}?error=${encodeURIComponent('No se pudo actualizar. ID incorrecto o no autorizado.')}`);
        }
        
        res.redirect(`/pacientes/${id}?message=${encodeURIComponent('Paciente actualizado correctamente.')}`);
    } catch (error) {
        console.error("Error al actualizar paciente:", error);
        res.redirect(`/pacientes/${id}?error=${encodeURIComponent('Error interno al actualizar el paciente en la base de datos.')}`);
    }
});

// 6. POST /pacientes/eliminar/:id?_method=DELETE - Procesa la eliminación WEB
router.post('/eliminar/:id', async (req, res) => {
    
    const { id } = req.params;
    const userId = req.session.userId;
    
    try {
        const success = await pacienteModel.deletePaciente(id, userId);
        
        if (success) {
            res.redirect('/pacientes/lista?message=' + encodeURIComponent(`Paciente con ID ${id} eliminado correctamente.`));
        } else {
            res.redirect('/pacientes/lista?error=' + encodeURIComponent(`No se pudo eliminar el paciente con ID ${id}. No encontrado o no autorizado.`));
        }
    } catch (error) {
        console.error(`Error al eliminar paciente ${id} desde formulario web:`, error);
        res.redirect('/pacientes/lista?error=' + encodeURIComponent('Error interno del servidor al intentar eliminar el paciente.'));
    }
});

// =================================================================
// 💻 RUTAS API (JSON) - Montadas en /api/pacientes (se omite /api/pacientes)
// =================================================================

// 7. POST /api/pacientes - Crear (API)
router.post('/', validatePacienteData, async (req, res) => {
    const { 
        nombre, apellidos, fechaDeNacimiento, dni, telefono, email, direccion, genero, altura 
    } = req.body;
    const userId = req.session.userId; 

    try {
        const nuevoId = await pacienteModel.createPaciente(
            nombre, apellidos, fechaDeNacimiento, userId, 
            dni, telefono, email, direccion, genero, altura
        );
        res.status(201).json({ message: 'Paciente creado correctamente', id: nuevoId });
    } catch (error) {
        console.error("Error al crear paciente (API):", error);
        res.status(500).json({ error: 'Error interno del servidor al crear paciente.' });
    }
});


// 8. GET /api/pacientes - Listar todos (API)
router.get('/', async (req, res) => {
    const userId = req.session.userId;
    try {
        const pacientesData = await pacienteModel.getAllPacientes(userId);
        
        const pacientesConEdad = pacientesData.map(data => {
            const paciente = new PacienteClass(data.id, data.nombre, data.apellidos, data.fechaDeNacimiento);
            data.edad = paciente.obtenerEdad();
            return data;
        });

        res.status(200).json({ count: pacientesConEdad.length, pacientes: pacientesConEdad });
    } catch (error) {
        console.error("Error al listar pacientes (API):", error);
        res.status(500).json({ error: 'Error interno del servidor al listar pacientes.' });
    }
});


// 9. GET /api/pacientes/:id - Consultar por ID (API)
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.session.userId;

    try {
        const pacienteData = await pacienteModel.getPacienteById(id, userId); 
        if (!pacienteData) return res.status(404).json({ error: 'Paciente no encontrado.' });

        const paciente = new PacienteClass(pacienteData.id, pacienteData.nombre, pacienteData.apellidos, pacienteData.fecha_nacimiento);
        pacienteData.edad = paciente.obtenerEdad(); 

        res.status(200).json(pacienteData);
    } catch (error) {
        console.error(`Error al obtener paciente ${id} (API):`, error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// 10. PUT /api/pacientes/:id - Actualizar (API)
router.put('/:id', validatePacienteData, async (req, res) => {
    const { id } = req.params;
    const data = req.body; 
    const userId = req.session.userId;

    try {
        const success = await pacienteModel.updatePaciente(id, userId, data);
        if (!success) return res.status(404).json({ error: 'Paciente no encontrado o no autorizado.' });
        
        res.status(200).json({ message: `Paciente con ID ${id} actualizado correctamente.` });
    } catch (error) {
        console.error(`Error al actualizar paciente ${id} (API):`, error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});


// 11. DELETE /api/pacientes/:id - Eliminar (API)
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.session.userId;

    try {
        const success = await pacienteModel.deletePaciente(id, userId);
        if (!success) return res.status(404).json({ error: 'Paciente no encontrado o no autorizado.' });
        
        res.status(200).json({ message: `Paciente con ID ${id} eliminado correctamente.` });
    } catch (error) {
        console.error(`Error al eliminar paciente ${id} (API):`, error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});


module.exports = router;