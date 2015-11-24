#!/usr/bin/env node

/**
 * Ejecutar: node servidor.js
 * 
 * Acepta peticiones para insertar, consultar, modificar o borrar un contacto 
 * de la base de datos, almacenará DNI con nombre y teléfono.
 * 
 * Vuelvo a hacer las validaciones de DNI y teléfono en el servidor para no
 * introducir datos incorrectos.
 * 
 * @author Antonio Espinosa Jiménez
 */

//el puerto dónde se ejecutará
var puerto = process.env.PORT || 8080;

//incluyo express
var express = require('express');

var app = express();

//La base de datos donde almacenará los contactos
var bd = {};

//Para hacer un log de las peticiones al servidor
var contador = 0;

//Necesario para que pueda hacer peticiones desde otra dirección
//Habilita cors
var cors = require('cors');
app.use(cors());

/**
 * Comprueba si un teléfono es correcto
 * 
 * @param telefono El teléfono a comprobar
 * @returns true si el formato es teléfono, false en caso contrario
 */
function comprobar_telefono(telefono) {
    //Compruebo si el teléfono son 9 dígitos, si es así es un teléfono válido
    if (/^\d{9}$/.test(telefono)) {
        return true;
    } else {
        return false;
    }
}

/**
 * Comprueba si un DNI es válido
 * 
 * @param dni El DNI a comprobar
 * @returns true si es un DNI válido, False en caso contrario
 */
function comprobar_dni(dni) {
    //Las cadenas válidas del DNI
    var letras = ['T', 'R', 'W', 'A', 'G', 'M', 'Y', 'F', 'P', 'D', 'X', 'B', 'N', 'J', 'Z', 'S', 'Q', 'V', 'H', 'L', 'C', 'K', 'E', 'T'];

    //Compruebo si tiene el formato 8 números y 1 letra
    if (!(/^\d{8}[A-Z]$/.test(dni))) {
        return false;
    }

    //Compruebo si la letra es correcta
    if (dni.charAt(8) != letras[(dni.substring(0, 8)) % 23]) {
        return false;
    }

    //Si llego hasta aquí significa que es DNI válido
    return true;
}

/**
 * Si no se especifica ruta en la petición GET 
 * Si hay contactos, devuelvo la bd entera, si no devuelvo el estado vacio
 * 
 * @param req el parámetro de entrada
 * @param res el parámetro de salida
 */
app.get('/', function (req, res) {
    contador++;
    console.log('recibida petición GET: ' + contador);

    if (Object.keys(bd).length) {
        res.send(bd);
    } else {
        res.send({'estado': 'vacio'});
    }
    res.end();
});

/**
 * Si se especifica insertar en la petición GET 
 * Si no existe ese dni, lo inserto con su nombre y teléfono
 * 
 * @param req el parámetro de entrada
 * @param res el parámetro de salida
 */
app.put('/insertar/:dni/:nombre/:telefono', function (req, res) {
    contador++;
    console.log('recibida petición PUT: ' + contador);
    
    //Paso el dni a mayúsculas
    var dni = req.params.dni.toUpperCase();

    //Si no exite un registro con ese DNI, es válido y el teléfono también
    //Lo inserto en bd y devuelvo el estado de la acción
    if (bd.hasOwnProperty(dni)) {
        res.send({'estado': 'existe'});
    } else if (!comprobar_dni(dni)) {
        res.send({'estado': 'dni_incorrecto'});
    } else if (!comprobar_telefono(req.params.telefono)) {
        res.send({'estado': 'telefono_incorrecto'});
    } else {
        bd[dni] = {};
        bd[dni]["nombre"] = req.params.nombre;
        bd[dni]["telefono"] = req.params.telefono;
        res.send({'estado': 'exito'});
    }
    res.end();
});

/**
 * Si se especifica consultar en la petición GET 
 * Si existe un registro con un dni empezando con esa cadena, lo añado a registros entero.
 * Es posible que devuelva varios registros.
 * 
 * @param req el parámetro de entrada
 * @param res el parámetro de salida
 */
app.get('/consultar/:dni', function (req, res) {
    var registros = {};

    //Recorro la bd en busca de que el nombre empiece con la cadena pasada,
    //si la encuentra la añade a registros para devolverlo
    for (dni in bd) {
        if (dni.indexOf(req.params.dni) == 0) {
            registros[dni] = bd[dni];
        }
    }

    res.send(registros);
    res.end();
});

/**
 * Si se especifica modificar en la petición POST 
 * Si existe ese DNI, es válido y el teléfono también, modifico ese registro con los nuevos valores.
 * Devuelvo el estado de la acción
 * 
 * @param req el parámetro de entrada
 * @param res el parámetro de salida
 */
app.post('/modificar/:dni/:nombre/:telefono', function (req, res) {
    if (!comprobar_dni(dni)) {
        res.send({'estado': 'dni_incorrecto'});
    } else if (!comprobar_telefono(req.params.telefono)) {
        res.send({'estado': 'telefono_incorrecto'});
    } else if (bd.hasOwnProperty(dni)) {
        bd[req.params.dni]["nombre"] = req.params.nombre;
        bd[req.params.dni]["telefono"] = req.params.telefono;
        res.send({"estado" : "exito"});
    }
    res.end();
});

/**
 * Si se especifica borrar en la petición DELETE 
 * Si existe ese DNI lo borro y devuelvo el estado exito.
 * 
 * @param req el parámetro de entrada
 * @param res el parámetro de salida
 */
app.delete('/borrar/:nombre', function (req, res) {
    if (bd.hasOwnProperty(req.params.nombre)) {
        delete bd[req.params.nombre];
        res.send({'estado' : 'exito'})
    }
    res.end();
});

//Escucho peticiones
app.listen(puerto);

//Muestro el log de servidor ON
console.log('Servidor en http://127.0.0.1:' + puerto + '/');
