// termometro.js - CLASE Y CONTROLADOR DE RUTAS (Versión Final Nivel 5 y 8)

const express = require('express');
const router = express.Router();
// Importamos la lógica de conexión SQL (asume que has creado models/termometroModel.js)
const termometroModel = require('./models/termometroModel'); 


// =================================================================
// 1. TU CLASE TERMOMETRO (LÓGICA NIVEL 8)
// =================================================================
class Termometro {
    constructor() {
        // Los arrays internos se mantienen por si los usas localmente, 
        // pero la API usará la base de datos.
        this.temperaturas = []; 
    }

    anotarTemperatura(temp) {
        this.temperaturas.push(temp);
    }

    // Método Nivel 8
    convertirCelsiusAFahrenheit(temp) {
        // Aseguramos el toFixed para un formato limpio
        return Number(((temp * 9/5) + 32).toFixed(2));
    }

    // Método Nivel 8
    convertirFahrenheitACelsius(temp) {
        // Aseguramos el toFixed para un formato limpio
        return Number(((temp - 32) * 5/9).toFixed(2));
    }

    obtenerTemperaturaMaxima() {
        if (this.temperaturas.length === 0) return null;
        return Math.max(...this.temperaturas);
    }

    obtenerTemperaturaMinima() {
        if (this.temperaturas.length === 0) return null;
        return Math.min(...this.temperaturas);
    }

    obtenerNumeroAnotaciones() {
        return this.temperaturas.length;
    }

    // 🚨 Lógica de Negocio adicional (Nivel 8) para clasificar la temperatura
    determinarEstado(temp, unidad) {
        if (unidad === 'C') {
            if (temp >= 38) return 'Fiebre alta';
            if (temp >= 37.5) return 'Febrícula';
            if (temp < 36) return 'Hipotermia leve';
            return 'Normal';
        }
        if (unidad === 'F') {
            if (temp >= 100.4) return 'Fiebre alta';
            if (temp >= 99.5) return 'Febrícula';
            return 'Normal';
        }
        return 'Unidad inválida';
    }
}
const TermometroClass = new Termometro(); // Instancia de tu clase


// =================================================================
// 2. RUTAS EXPRESS (CONTROLADOR)
// =================================================================

// POST /api/termometros - Registrar una nueva temperatura (NIVEL 5)
router.post('/', async (req, res) => {
    const { pacienteId, temperatura, unidad, fecha } = req.body;
    
    // Validación básica
    if (!pacienteId || !temperatura || !unidad || !fecha) {
        return res.status(400).json({ error: 'Faltan datos (pacienteId, temperatura, unidad, fecha).' });
    }
    if (unidad !== 'C' && unidad !== 'F') {
        return res.status(400).json({ error: 'Unidad de temperatura debe ser C o F.' });
    }

    try {
        // 1. Persistencia (Nivel 5)
        const idMedicion = await termometroModel.recordTemperature(pacienteId, temperatura, unidad, fecha);
        
        // 2. Lógica de Negocio (Nivel 8)
        // Convertimos a ambas unidades
        let tempCelsius = unidad === 'C' ? parseFloat(temperatura) : TermometroClass.convertirFahrenheitACelsius(temperatura);
        let tempFahrenheit = unidad === 'F' ? parseFloat(temperatura) : TermometroClass.convertirCelsiusAFahrenheit(temperatura);
        
        // Clasificamos usando el método de tu clase
        let estado = TermometroClass.determinarEstado(temperatura, unidad);

        res.status(201).json({ 
            message: 'Medición registrada y procesada.', 
            id: idMedicion,
            temperaturaRegistrada: parseFloat(temperatura),
            unidadRegistrada: unidad,
            celsius: tempCelsius,
            fahrenheit: tempFahrenheit,
            estado: estado // Retornamos el resultado de la lógica de negocio (Nivel 8)
        });
    } catch (error) {
        console.error("Error al registrar temperatura:", error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});


// GET /api/termometros/:pacienteId - Listar mediciones (NIVEL 5 + NIVEL 8)
router.get('/:pacienteId', async (req, res) => {
    const { pacienteId } = req.params;
    
    try {
        // 1. Obtener datos de la DB (Nivel 5)
        const allMeasurements = await termometroModel.getMeasurementsByPaciente(pacienteId);
        
        // 2. Procesamiento con la CLASE (Nivel 8)
        const historialProcesado = allMeasurements.map(m => {
            let celsius = m.unidad === 'C' ? m.temperatura : TermometroClass.convertirFahrenheitACelsius(m.temperatura);
            let fahrenheit = m.unidad === 'F' ? m.temperatura : TermometroClass.convertirCelsiusAFahrenheit(m.temperatura);
            let estado = TermometroClass.determinarEstado(m.temperatura, m.unidad);

            return {
                id: m.id,
                fecha: m.fecha,
                temperaturaRegistrada: m.temperatura,
                unidad: m.unidad,
                celsius: celsius,
                fahrenheit: fahrenheit,
                estado: estado // Usamos el método de tu CLASE
            };
        });

        res.status(200).json({
            pacienteId,
            totalMediciones: historialProcesado.length,
            historial: historialProcesado
        });
    } catch (error) {
        console.error("Error al obtener mediciones:", error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});


// Exportamos el router
module.exports = router;