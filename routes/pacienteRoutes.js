// routes/pacienteRoutes.js - Controlador de Rutas de Paciente

const express = require('express');
const router = express.Router();
const pacienteModel = require('../models/pacienteModel'); // <--- El modelo SQL (Persistencia)
const PacienteClass = require('../paciente'); // <--- Tu CLASE Paciente (Lógica de Negocio Nivel 8)
// const Bascula = require('../bascula'); // Lo necesitarás para calcular el IMC

/**
 * Middleware para validar datos de paciente.
 */
function validatePacienteData(req, res, next) {
    const { nombre, apellidos, fechaDeNacimiento } = req.body;
    
    if (!nombre || !apellidos || !fechaDeNacimiento || !/^\d{4}-\d{2}-\d{2}$/.test(fechaDeNacimiento)) {
        return res.status(400).json({ 
            error: 'Datos inválidos', 
            message: 'Se requieren nombre, apellidos y fechaDeNacimiento (YYYY-MM-DD) válidos.' 
        });
    }
    next();
}

// =================================================================
// RUTAS CRUD DE PACIENTE (Niveles 5 y 8)
// =================================================================

// 1. POST /api/pacientes - Crear
router.post('/', validatePacienteData, async (req, res) => {
    const { nombre, apellidos, fechaDeNacimiento } = req.body;
    const userId = req.session.userId; // Asegurado por protectRoute (Nivel 10)

    try {
        const nuevoId = await pacienteModel.createPaciente(nombre, apellidos, fechaDeNacimiento, userId);
        res.status(201).json({ message: 'Paciente creado correctamente', id: nuevoId });
    } catch (error) {
        console.error("Error al crear paciente:", error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});


// 2. GET /api/pacientes - Listar todos (USA LÓGICA NIVEL 8)
router.get('/', async (req, res) => {
    const userId = req.session.userId;
    try {
        const pacientesData = await pacienteModel.getAllPacientes(userId);
        
        // APLICACIÓN NIVEL 8: Usar la clase Paciente para enriquecer los datos
        const pacientesConEdad = pacientesData.map(data => {
            const paciente = new PacienteClass(data.id, data.nombre, data.apellidos, data.fechaDeNacimiento);
            data.edad = paciente.obtenerEdad(); // <--- Usando el método de tu CLASE
            return data;
        });

        res.status(200).json({ count: pacientesConEdad.length, pacientes: pacientesConEdad });
    } catch (error) {
        console.error("Error al listar pacientes:", error);
        res.status(500).json({ error: 'Error interno del servidor al listar pacientes.' });
    }
});


// 3. GET /api/pacientes/:id - Consultar por ID (USA LÓGICA NIVEL 8)
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.session.userId;

    try {
        const pacienteData = await pacienteModel.getPacienteById(id, userId);
        if (!pacienteData) return res.status(404).json({ error: 'Paciente no encontrado.' });

        // APLICACIÓN NIVEL 8: Instanciar la clase para usar sus métodos
        const paciente = new PacienteClass(pacienteData.id, pacienteData.nombre, pacienteData.apellidos, pacienteData.fechaDeNacimiento);
        pacienteData.edad = paciente.obtenerEdad(); // <--- Usa el método de tu CLASE

        res.status(200).json(pacienteData);
    } catch (error) {
        console.error(`Error al obtener paciente ${id}:`, error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// 4. PUT /api/pacientes/:id - Actualizar
router.put('/:id', validatePacienteData, async (req, res) => {
    const { id } = req.params;
    const { nombre, apellidos, fechaDeNacimiento } = req.body;
    const userId = req.session.userId;

    try {
        const success = await pacienteModel.updatePaciente(id, nombre, apellidos, fechaDeNacimiento, userId);
        if (!success) return res.status(404).json({ error: 'Paciente no encontrado o no autorizado.' });
        
        res.status(200).json({ message: `Paciente con ID ${id} actualizado correctamente.` });
    } catch (error) {
        console.error(`Error al actualizar paciente ${id}:`, error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});


// 5. DELETE /api/pacientes/:id - Eliminar
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.session.userId;

    try {
        const success = await pacienteModel.deletePaciente(id, userId);
        if (!success) return res.status(404).json({ error: 'Paciente no encontrado o no autorizado.' });
        
        res.status(200).json({ message: `Paciente con ID ${id} eliminado correctamente.` });
    } catch (error) {
        console.error(`Error al eliminar paciente ${id}:`, error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});


module.exports = router;