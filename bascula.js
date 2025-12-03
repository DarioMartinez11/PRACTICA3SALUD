class Bascula {

    constructor() {
    this.pesos = [];
    this.alturas = [];
    this.fechas = [];
    this.anotaciones = 0; // Puedes asociar una instancia de Bascula si lo necesitas
  }

  /**
   * Setters.
   */
  anotarPesoAltura(peso, altura, fecha) {
    if (!peso) {
      return "¡Debe registar un peso!";
    } else {
      let newPesos = [...this.pesos];
      let newAlturas = [...this.alturas];
      let newFechas = [...this.fechas];
      newPesos.push(peso);

      if (altura) {
        newAlturas.push(altura);
      } else {
        newAlturas.push(1);
      }

      if (fecha) {
        newFechas.push(fecha);
      } else {
        let date = new Date();
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();
        newFechas.push(`${day}/${month}/${year}`);
      }
      
      this.pesos = newPesos;
      this.alturas = newAlturas;
      this.fechas = newFechas;
      this.anotaciones = this.anotaciones + 1;
      return "¡Su peso se ha registrado correctamente!";
    }
  }

  anotarPeso(peso, altura = 1, fecha = null) {
    if (peso === undefined || peso === null) return '¡Debe registar un peso!';
    this.pesos.push(peso);
    this.alturas.push(altura);
    const fechaActual = fecha ? fecha : new Date().toLocaleDateString('es-ES');
    this.fechas.push(fechaActual);
    this.anotaciones++;
    return '¡Su peso se ha registrado correctamente!';
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

  calcularIMCO() {
    if (this.pesos.length === 0) return null;
    const peso = this.pesos[this.pesos.length - 1];
    const altura = this.alturas[this.alturas.length - 1] || 1;
    const imc = peso / (altura * altura);
    return Number(imc.toFixed(2));
  }

  describirIMC(imc) {
    let resultado = "";
    if (imc < 16) {
      resultado = "Imc inferior a 16: Infrapeso (delgadez severa).";
    }
    if (16 <= imc && imc < 17) {
      resultado = "Imc entre 16–17: Infrapeso (delgadez moderada).";
    }
    if (17 <= imc && imc < 18.5) {
      resultado = "Imc entre 17-18.5: Infrapeso (delgadez aceptable).";
    }
    if (18.5 <= imc && imc < 25) {
      resultado = "Imc entre 18.5-25: Peso normal.";
    }
    if (25 <= imc && imc < 30) {
      resultado = "Imc entre 25-30: Sobrepeso.";
    }
    if (30 <= imc && imc < 35) {
      resultado = "Imc entre 30-35: Obeso (Tipo I).";
    }
    if (35 <= imc && imc < 40) {
      resultado = "Imc entre 35-40: Obeso (Tipo II).";
    }
    if (40 <= imc) {
      resultado = "Imc superior a 40: Obeso (Tipo III).";
    }

   return resultado;
  }
}


module.exports = Bascula;