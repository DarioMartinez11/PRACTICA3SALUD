// bascula.js - CLASE Y CONTROLADOR DE RUTAS (Versión Final Nivel 5 y 8)

const express = require('express');
const router = express.Router();
// Importamos la lógica de conexión SQL (lo que definimos en models/basculaModel.js)
const basculaModel = require('./models/basculaModel'); 


// =================================================================
// 1. TU CLASE BASCULA (LÓGICA NIVEL 8)
// Nota: Mantenemos tu clase intacta, pero añadimos un método utilitario 
// para usarlo directamente con los datos de la DB sin depender de this.pesos.
// =================================================================
class Bascula {

    constructor() {
    // Tus arrays para el estado interno. Estos ya no se usarán para la API, 
    // ya que la persistencia la lleva MySQL, pero se mantienen para respetar la POO.
    this.pesos = [];
    this.alturas = [];
    this.fechas = [];
    this.anotaciones = 0; 
  }

    // Tu Setter original (ya no se usa con la DB, pero se mantiene)
    anotarPesoAltura(peso, altura, fecha) { 
        // ... (Tu lógica original se mantiene aquí)
    }

    // Tu Setter original (ya no se usa con la DB, pero se mantiene)
    anotarPeso(peso, altura = 1, fecha = null) {
        // ... (Tu lógica original se mantiene aquí)
    }

    obtenerNumeroAnotaciones() {
        return this.anotaciones;
    }

    obtenerPesoMaximo() {
        if (this.pesos.length === 0) return null;
        return Math.max(...this.pesos);
    }

    obtenerPesoMinimo() {
        if (this.pesos.length === 0) return null;
        return Math.min(...this.pesos);
    }

    // Tu método original, basado en el estado interno
    calcularIMCO() {
        if (this.pesos.length === 0) return null;
        const peso = this.pesos[this.pesos.length - 1];
        const altura = this.alturas[this.alturas.length - 1] || 1;
        const imc = peso / (altura * altura);
        return Number(imc.toFixed(2));
    }

    // 🚨 Método UTILITARIO NIVEL 8: Calcula el IMC directamente para usar con la DB.
    calcularIMC(peso, altura) {
        if (!peso || !altura || altura === 0) return null;
        const imc = peso / (altura * altura);
        return Number(imc.toFixed(2));
    }

    // Tu método de clasificación (LÓGICA NIVEL 8)
    describirIMC(imc) {
        let resultado = "";
        if (imc < 16) {
            resultado = "Infrapeso (delgadez severa).";
        }
        if (16 <= imc && imc < 17) {
            resultado = "Infrapeso (delgadez moderada).";
        }
        if (17 <= imc && imc < 18.5) {
            resultado = "Infrapeso (delgadez aceptable).";
        }
        if (18.5 <= imc && imc < 25) {
            resultado = "Peso normal.";
        }
        if (25 <= imc && imc < 30) {
            resultado = "Sobrepeso.";
        }
        if (30 <= imc && imc < 35) {
            resultado = "Obeso (Tipo I).";
        }
        if (35 <= imc && imc < 40) {
            resultado = "Obeso (Tipo II).";
        }
        if (40 <= imc) {
            resultado = "Obeso (Tipo III).";
        }
        // Eliminamos "Imc inferior a 16:" para que sea más limpio
        return resultado.replace(/Imc (inferior|entre|superior) a .*?: /, '').trim();
    }
}
const BasculaClass = new Bascula(); // Creamos una instancia para usar los métodos


// =================================================================
// 2. RUTAS EXPRESS (CONTROLADOR)
// =================================================================

// POST /api/basculas - Registrar un nuevo peso (NIVEL 5)
router.post('/', async (req, res) => {
    // Nota: El pacienteId debe asegurarse que pertenece al userId en el model (Nivel 10)
    const { pacienteId, peso, altura, fecha } = req.body; 
    
    if (!pacienteId || !peso || !altura || !fecha) {
        return res.status(400).json({ error: 'Faltan datos de pacienteId, peso, altura y fecha (YYYY-MM-DD).' });
    }

    try {
        // 1. Persistencia (Nivel 5)
        const idMedicion = await basculaModel.recordMeasurement(pacienteId, peso, altura, fecha);
        
        // 2. Lógica de Negocio (Nivel 8)
        const imc = BasculaClass.calcularIMC(peso, altura); // Usamos el método de tu CLASE
        const descripcion = BasculaClass.describirIMC(imc); // Usamos el método de tu CLASE

        res.status(201).json({ 
            message: 'Medición registrada y procesada.', 
            id: idMedicion,
            imc: imc,
            clasificacion: descripcion // Resultado de la lógica de negocio
        });
    } catch (error) {
        console.error("Error al registrar medición:", error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});


// GET /api/basculas/:pacienteId - Listar mediciones (NIVEL 5 + NIVEL 8)
router.get('/:pacienteId', async (req, res) => {
    const { pacienteId } = req.params;
    
    try {
        // 1. Obtener datos de la DB (Nivel 5)
        const allMeasurements = await basculaModel.getMeasurementsByPaciente(pacienteId);
        
        let imcData = { imc: null, clasificacion: null };
        const lastMeasurement = allMeasurements.length > 0 ? allMeasurements[0] : null;

        if (lastMeasurement) {
            // 2. Usar la CLASE para procesar el dato de la DB (Nivel 8)
            const imc = BasculaClass.calcularIMC(lastMeasurement.peso, lastMeasurement.altura);
            imcData.imc = imc;
            imcData.clasificacion = BasculaClass.describirIMC(imc);
        }

        res.status(200).json({
            pacienteId,
            totalMediciones: allMeasurements.length,
            calculoIMC: imcData,
            historial: allMeasurements
        });
    } catch (error) {
        console.error("Error al obtener mediciones:", error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});


// Exportamos el router para que `server.js` lo use
module.exports = router;