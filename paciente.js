const Bascula = require("./bascula");

class Paciente {
  constructor(id,nombre, apellidos, fechaDeNacimiento) {
    this.id = id;
    this.nombre = nombre;
    this.apellidos = apellidos;
    this.fechaDeNacimiento = fechaDeNacimiento;
    this.miBascula = null; // Puedes asociar una instancia de Bascula si lo necesitas
  }

  // Setters
  modificarNombre(newName) {
    if (!newName) {
      return "Debes añadir tu nuevo nombre";
    }
    this.nombre = newName;
    return `Tu nuevo nombre es ${this.nombre}`;
  }

  modificarApellidos(nuevoApellidos) {
    if (!nuevoApellidos) {
      return "Debes añadir tu nuevo apellido";
    }
    this.apellidos = nuevoApellidos;
    return `Tu nuevo apellido es ${this.apellidos}`;
  }

  modificarFechaNacimiento(nuevaFechaDeNacimiento) {
    if (!nuevaFechaDeNacimiento) {
      return "Debes añadir tu nueva fecha de nacimiento";
    }
    this.fechaDeNacimiento = nuevaFechaDeNacimiento;
    return `Tu nueva fecha de nacimiento es ${this.fechaDeNacimiento}`;
  }

  modificarBascula(bascula, peso, altura, fecha) {
    if (!(bascula instanceof Bascula)) {
      return "Debes pasar una instancia válida de Bascula";
    }

    this.miBascula = bascula;

    if (peso !== undefined) {
      bascula.anotarPeso(peso, altura, fecha);
    }

    return "Báscula asociada correctamente";
  }

  // Getters
  saludar() {
    return `Hola soy ${this.nombre}`;
  }

  obtenerNombre() {
    return this.nombre;
  }

  obtenerApellidos() {
    return this.apellidos;
  }

  obtenerFechaNacimiento() {
    return this.fechaDeNacimiento;
  }

  obtenerEdad() {
    const today = new Date();
    const birthDate = new Date(this.fechaDeNacimiento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  obtenerBascula() {
    return this.miBascula;
  }

  calcularIMC() {
    // Si tienes una instancia de Bascula asociada
    if (this.miBascula && typeof this.miBascula.calcularIMC === 'function') {
      return this.miBascula.calcularIMC();
    }
    // Si usas el modelo Bascula directamente
    return Bascula.calcularIMC();
  }
}

module.exports = Paciente;