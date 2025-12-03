var assert = require('assert');
var expect = require('chai').expect;
var Bascula = require('../bascula.js');


describe('Bascula', () => {
    let bascula;

    beforeEach(() => {
        bascula = new Bascula();
    });


    

 it('constructor inicia arrays y anotaciones vacíos', () => {    
    expect(bascula.pesos).to.eql([]);
    expect(bascula.alturas).to.eql([]);
    expect(bascula.fechas).to.eql([]);
    expect(bascula.anotaciones).to.equal(0);
  });

  it('anotarPeso añade todos los datos correctamente', () => {
    const retorno = bascula.anotarPeso(80, 1.75, '01/01/2022');
    expect(retorno).to.equal('¡Su peso se ha registrado correctamente!');
    expect(bascula.pesos).to.eql([80]);
    expect(bascula.alturas).to.eql([1.75]);
    expect(bascula.fechas[0]).to.equal('01/01/2022');
    expect(bascula.anotaciones).to.equal(1);
  });

  it('anotarPeso usa altura por defecto', () => {
    bascula.anotarPeso(70, undefined, '02/01/2022');
    expect(bascula.alturas[0]).to.equal(1);
  });

  it('anotarPeso usa fecha actual si no se da', () => {
    bascula.anotarPeso(70, 1.60);
    // Solo comprobamos que se añade una fecha con formato válido de "es-ES"
    expect(bascula.fechas).to.have.lengthOf(1);
  });

  it('anotarPeso sin peso manda error', () => {
    const retorno = bascula.anotarPeso();
    expect(retorno).to.equal('¡Debe registar un peso!');
    expect(bascula.anotaciones).to.equal(0);
  });

  it('obtenerNumeroAnotaciones cuenta bien los registros', () => {
    expect(bascula.obtenerNumeroAnotaciones()).to.equal(0);
    bascula.anotarPeso(80, 1.75, '01/01/2022');
    expect(bascula.obtenerNumeroAnotaciones()).to.equal(1);
    bascula.anotarPeso(70, 1.8, '01/03/2022');
    expect(bascula.obtenerNumeroAnotaciones()).to.equal(2);
  });

  it('obtenerPesoMaximo da null con sin pesajes', () => {
    expect(bascula.obtenerPesoMaximo()).to.equal(null);
  });

  it('obtenerPesoMinimo da null sin pesajes', () => {
    expect(bascula.obtenerPesoMinimo()).to.equal(null);
  });

  it('obtenerPesoMaximo y obtenerPesoMinimo dan valores correctos', () => {
    bascula.anotarPeso(60, 1.65, '01/01/2022');
    bascula.anotarPeso(63, 1.61, '03/01/2022');
    bascula.anotarPeso(75.5, 1.60, '05/01/2022');
    expect(bascula.obtenerPesoMaximo()).to.equal(75.5);
    expect(bascula.obtenerPesoMinimo()).to.equal(60);
  });

  it('calcularIMCO calcula IMC del último registro', () => {
    bascula.anotarPeso(65, 1.7, '11/01/2022');
    let imc = bascula.calcularIMCO();
    expect(imc).to.be.closeTo(22.49, 0.01); // IMC real = 65 / (1.7*1.7) = 22.491
  });

  it('calcularIMCO sin pesajes da null', () => {
    expect(bascula.calcularIMCO()).to.equal(null);
  });

  it('describirIMC describe todos los rangos', () => {
    expect(bascula.describirIMC(15.9)).to.equal("Imc inferior a 16: Infrapeso (delgadez severa).");
    expect(bascula.describirIMC(16.1)).to.equal("Imc entre 16–17: Infrapeso (delgadez moderada).");
    expect(bascula.describirIMC(17)).to.equal("Imc entre 17-18.5: Infrapeso (delgadez aceptable).");
    expect(bascula.describirIMC(22)).to.equal("Imc entre 18.5-25: Peso normal.");
    expect(bascula.describirIMC(27)).to.equal("Imc entre 25-30: Sobrepeso.");
    expect(bascula.describirIMC(33)).to.equal("Imc entre 30-35: Obeso (Tipo I).");
    expect(bascula.describirIMC(38)).to.equal("Imc entre 35-40: Obeso (Tipo II).");
    expect(bascula.describirIMC(41)).to.equal("Imc superior a 40: Obeso (Tipo III).");
  });


});