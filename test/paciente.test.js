var assert = require('assert');
var expect = require('chai').expect;
var Paciente = require('../paciente.js');
var Bascula = require('../bascula.js');

describe('Paciente', () => {
  it('El constructor debe inicializar correctamente', function () {
    var paciente = new Paciente(1, 'Juan', 'Pérez', '1990-05-21');
    expect(paciente.id).to.equal(1);
    expect(paciente.nombre).to.equal('Juan');
    expect(paciente.apellidos).to.equal('Pérez');
    expect(paciente.fechaDeNacimiento).to.equal('1990-05-21');
    expect(paciente.miBascula).to.be.null;
  });

  it('modificarNombre cambia correctamente el nombre', function () {
    var paciente = new Paciente(2, 'Ana', 'López', '1988-01-01');
    var res = paciente.modificarNombre('Laura');
    expect(res).to.equal('Tu nuevo nombre es Laura');
    expect(paciente.nombre).to.equal('Laura');
  });

  it('modificarNombre devuelve mensaje si no se pasa valor', function () {
    var paciente = new Paciente(3, 'Ana', 'López', '1988-01-01');
    var res = paciente.modificarNombre('');
    expect(res).to.equal('Debes añadir tu nuevo nombre');
  });

  it('modificarApellidos cambia los apellidos', function () {
    var paciente = new Paciente(4, 'Ana', 'López', '1988-01-01');
    var res = paciente.modificarApellidos('Martín');
    expect(res).to.equal('Tu nuevo apellido es Martín');
    expect(paciente.apellidos).to.equal('Martín');
  });

  it('modificarFechaNacimiento cambia la fecha correctamente', function () {
    var paciente = new Paciente(5, 'Ana', 'López', '1988-01-01');
    var res = paciente.modificarFechaNacimiento('2000-12-31');
    expect(res).to.equal('Tu nueva fecha de nacimiento es 2000-12-31');
    expect(paciente.fechaDeNacimiento).to.equal('2000-12-31');
  });

  it('saludar devuelve saludo correcto', function () {
    var paciente = new Paciente(6, 'Ana', 'López', '1988-01-01');
    expect(paciente.saludar()).to.equal('Hola soy Ana');
  });

  it('obtenerEdad devuelve un número correcto', function () {
    var paciente = new Paciente(7, 'Ana', 'López', '2000-01-01');
    var edad = paciente.obtenerEdad();
    expect(edad).to.be.a('number');
    expect(edad).to.be.at.least(0);
  });

  it('obtenerBascula es null por defecto', function () {
    var paciente = new Paciente(8, 'Ana', 'López', '1990-05-21');
    expect(paciente.obtenerBascula()).to.be.null;
  });

  it('El constructor crea una instancia con nombre, apellidos y fecha', () => {
    var paciente = new Paciente(9, 'Juan', 'Pérez', '2000-01-02');
    expect(paciente.nombre).to.eql('Juan');
    expect(paciente.apellidos).to.eql('Pérez');
    expect(paciente.fechaDeNacimiento).to.eql('2000-01-02');
    expect(paciente.miBascula).to.eql(null);
  });

  it('modificarNombre actualiza el nombre', () => {
    var paciente = new Paciente(10, 'Pepe', 'Ramírez', '1986-06-06');
    var res = paciente.modificarNombre('Luis');
    expect(res).to.eql('Tu nuevo nombre es Luis');
    expect(paciente.nombre).to.eql('Luis');
  });

  it('modificarNombre valida nombre vacío', () => {
    var paciente = new Paciente(11, 'Pepe', 'Ramírez', '1986-06-06');
    var res = paciente.modificarNombre('');
    expect(res).to.eql('Debes añadir tu nuevo nombre');
  });

  it('modificarApellidos actualiza los apellidos', () => {
    var paciente = new Paciente(12, 'Ana', 'Gil', '1993-01-01');
    var res = paciente.modificarApellidos('García');
    expect(res).to.eql('Tu nuevo apellido es García');
    expect(paciente.apellidos).to.eql('García');
  });

  it('modificarFechaNacimiento actualiza la fecha', () => {
    var paciente = new Paciente(13, 'Ana', 'Gil', '1993-01-01');
    var res = paciente.modificarFechaNacimiento('1995-12-01');
    expect(res).to.eql('Tu nueva fecha de nacimiento es 1995-12-01');
    expect(paciente.fechaDeNacimiento).to.eql('1995-12-01');
  });

  it('saludar devuelve la frase correcta', () => {
    var paciente = new Paciente(14, 'Eva', 'Martín', '1970-07-07');
    expect(paciente.saludar()).to.eql('Hola soy Eva');
  });

  it('obtenerEdad devuelve una edad numérica razonable', () => {
    var paciente = new Paciente(15, 'Test', 'Apellido', '2000-01-01');
    var edad = paciente.obtenerEdad();
    expect(edad).to.be.a('number');
    expect(edad).to.be.at.least(0);
  });

  it('obtenerBascula devuelve null por defecto', () => {
    var paciente = new Paciente(16, 'Eva', 'Martín', '1970-07-07');
    expect(paciente.obtenerBascula()).to.eql(null);
  });

  it('obtenerBascula devuelve la báscula del paciente', () => {
    var paciente = new Paciente(17, 'Eva', 'Martín', '1970-07-07');
    var bascula = new Bascula();
    bascula.pesos.push(70);
    bascula.alturas.push(1.65);
    bascula.fechas.push('01/01/2024');
    bascula.anotaciones = 1;
    paciente.modificarBascula(bascula);
    expect(paciente.obtenerBascula()).to.eql(bascula);
  });
});