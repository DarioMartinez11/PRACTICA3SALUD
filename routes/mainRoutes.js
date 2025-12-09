// routes/mainRoutes.js - RUTAS WEB
const express = require('express');
const router = express.Router();
const { protectRoute } = require('../middleware/auth'); 

// Modelos (Persistencia - Nivel 5)
const pacienteModel = require('../models/pacienteModel');
const basculaModel = require('../models/basculaModel');    // NUEVO: Para historial de peso
const termometroModel = require('../models/termometroModel'); // NUEVO: Para historial de temperatura

// Lógica de Negocio (Nivel 8)
const PacienteClass = require('../paciente'); 
// NOTA: Para no complicar las importaciones, definimos las funciones de lógica
// Bascula/Termometro directamente aquí, ya que son independientes de la DB.

// Funciones de Lógica de Negocio Nivel 8 (Bascula)
const calcularIMC = (peso, altura) => {
     if (!peso || !altura || altura <= 0) return null;
     return Number((peso / (altura * altura)).toFixed(2));
};
const describirIMC = (imc) => {
     if (imc === null || isNaN(imc)) return "Dato no disponible.";
     if (imc < 18.5) return "Infrapeso";
     if (imc < 25) return "Peso normal";
     if (imc < 30) return "Sobrepeso";
     return "Obesidad"; 
};

// Funciones de Lógica de Negocio Nivel 8 (Termometro)
const convertirCelsiusAFahrenheit = (temp) => {
     return Number(((temp * 9/5) + 32).toFixed(1));
};

// =================================================================
// RUTA 1: GET / - Listado de Pacientes
// =================================================================
router.get('/', protectRoute, async (req, res) => {
    try {
        const userId = req.session.userId;
        
        const pacientesDB = await pacienteModel.getAllPacientesByUserId(userId);

        const pacientesProcesados = pacientesDB.map(p => {
            // Creamos instancia para obtenerEdad() (Nivel 8)
            const pacienteInstance = new PacienteClass(
                p.id, 
                p.nombre, 
                p.apellidos, 
                p.fecha_nacimiento
            );
            
            return {
                ...p,
                edad: pacienteInstance.obtenerEdad(), // Nivel 8
                fecha_nacimiento_formateada: p.fecha_nacimiento // Se podría formatear aquí
            };
        });

        res.render('pacientes', {
            title: 'Listado de Pacientes',
            nombreUsuario: req.session.nombre,
            pacientes: pacientesProcesados
        });

    } catch (error) {
        console.error('Error al cargar la lista de pacientes:', error);
        res.render('error', { title: 'Error', message: 'No se pudo cargar la lista de pacientes.', error: error });
    }
});


// =================================================================
// RUTA 2: GET /pacientes/:id - Detalle del Paciente (NUEVA)
// =================================================================
router.get('/pacientes/:id', protectRoute, async (req, res) => {
    const pacienteId = req.params.id;
    const userId = req.session.userId; // Nivel 10

    try {
        // 1. Obtener paciente y verificar propiedad
        const pacienteDB = await pacienteModel.getPacienteById(pacienteId, userId);

        if (!pacienteDB) {
            return res.status(404).render('error', { 
                title: 'Error 404', 
                message: 'Paciente no encontrado o no autorizado.' 
            });
        }

        // 2. Lógica de Negocio (Edad - Nivel 8)
        const pacienteInstance = new PacienteClass(
            pacienteDB.id, 
            pacienteDB.nombre, 
            pacienteDB.apellidos, 
            pacienteDB.fecha_nacimiento
        );
        
        const pacienteProcesado = {
            ...pacienteDB,
            edad: pacienteInstance.obtenerEdad(),
        };
        
        // 3. Obtener y procesar Historial de Báscula (Nivel 5 y 8)
        let historialBasculaDB = await basculaModel.getMeasurementsByPaciente(pacienteId);

        const historialBasculaProcesado = historialBasculaDB.map(m => {
            const imc = calcularIMC(m.peso, m.altura); // Nivel 8
            return {
                ...m,
                imc: imc,
                clasificacion: describirIMC(imc) // Nivel 8
            };
        });


        // 4. Obtener y procesar Historial de Termómetro (Nivel 5 y 8)
        let historialTermometroDB = await termometroModel.getMeasurementsByPaciente(pacienteId);

        const historialTermometroProcesado = historialTermometroDB.map(m => {
            const tempFahrenheit = convertirCelsiusAFahrenheit(m.temperatura); // Nivel 8
            return {
                ...m,
                temp_celsius: m.temperatura,
                temp_fahrenheit: tempFahrenheit, 
                unidad: '°C' // Muestra la unidad base
            };
        });

        // 5. Renderizar la vista de detalle
        res.render('paciente_detalle', {
            title: `Detalle de ${pacienteProcesado.nombre}`,
            paciente: pacienteProcesado,
            historialBascula: historialBasculaProcesado,
            historialTermometro: historialTermometroProcesado,
        });

    } catch (error) {
        console.error(`Error al cargar el detalle del paciente ${pacienteId}:`, error);
        res.status(500).render('error', { 
            title: 'Error Interno', 
            message: 'Error al procesar la solicitud.', 
            error: error 
        });
    }
});

module.exports = router;