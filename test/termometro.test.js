const { expect } = require('chai');
const Termometro = require('../termometro.js');

describe('Termometro', () => {
  let termometro;

  beforeEach(() => {
    termometro = new Termometro();
  });

  it('constructor inicia el array vacío', () => {
    expect(termometro.temperaturas).to.eql([]);
  });

  it('anotarTemperatura guarda temperaturas correctamente', () => {
    termometro.anotarTemperatura(36.5);
    termometro.anotarTemperatura(37.1);
    expect(termometro.temperaturas).to.eql([36.5, 37.1]);
  });

  it('obtenerNumeroAnotaciones devuelve el número correcto', () => {
    termometro.anotarTemperatura(36.5);
    termometro.anotarTemperatura(38);
    expect(termometro.obtenerNumeroAnotaciones()).to.equal(2);
  });

  it('convertirCelsiusAFahrenheit convierte correctamente', () => {
    const resultado = termometro.convertirCelsiusAFahrenheit(0);
    expect(resultado).to.equal(32);
    expect(termometro.convertirCelsiusAFahrenheit(100)).to.equal(212);
  });

  it('convertirFahrenheitACelsius convierte correctamente', () => {
    const resultado = termometro.convertirFahrenheitACelsius(32);
    expect(resultado).to.equal(0);
    expect(termometro.convertirFahrenheitACelsius(212)).to.equal(100);
  });

  it('obtenerTemperaturaMaxima devuelve null si no hay datos', () => {
    expect(termometro.obtenerTemperaturaMaxima()).to.equal(null);
  });

  it('obtenerTemperaturaMinima devuelve null si no hay datos', () => {
    expect(termometro.obtenerTemperaturaMinima()).to.equal(null);
  });

  it('obtenerTemperaturaMaxima devuelve la temperatura más alta', () => {
    termometro.anotarTemperatura(35);
    termometro.anotarTemperatura(38);
    termometro.anotarTemperatura(36);
    expect(termometro.obtenerTemperaturaMaxima()).to.equal(38);
  });

  it('obtenerTemperaturaMinima devuelve la temperatura más baja', () => {
    termometro.anotarTemperatura(35);
    termometro.anotarTemperatura(38);
    termometro.anotarTemperatura(36);
    expect(termometro.obtenerTemperaturaMinima()).to.equal(35);
  });
  it('permite anotar temperaturas negativas', () => {
    termometro.anotarTemperatura(-5);
    termometro.anotarTemperatura(-2.3);
    expect(termometro.temperaturas).to.eql([-5, -2.3]);
    expect(termometro.obtenerNumeroAnotaciones()).to.equal(2);
  });

  it('obtenerTemperaturaMaxima y Minima funciona con negativos', () => {
    termometro.anotarTemperatura(-5);
    termometro.anotarTemperatura(-2.3);
    termometro.anotarTemperatura(-10);
    expect(termometro.obtenerTemperaturaMaxima()).to.equal(-2.3);
    expect(termometro.obtenerTemperaturaMinima()).to.equal(-10);
  });

  it('convertirCelsiusAFahrenheit con decimales y negativos', () => {
    expect(termometro.convertirCelsiusAFahrenheit(-40)).to.equal(-40);
    expect(termometro.convertirCelsiusAFahrenheit(36.6)).to.be.closeTo(97.88, 0.01);
  });

  it('convertirFahrenheitACelsius con decimales y negativos', () => {
    expect(termometro.convertirFahrenheitACelsius(-40)).to.equal(-40);
    expect(termometro.convertirFahrenheitACelsius(98.6)).to.be.closeTo(37, 0.1);
  });
});