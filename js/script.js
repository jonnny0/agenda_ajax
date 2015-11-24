/**
 * El cliente que valida los datos y hace las peticiones al servidor,
 * además controla los aspectos visuales de la página
 * 
 * @author Antonio Espinosa Jiménez
 */

var dir = 'http://agenda-ajax.herokuapp.com';
var puerto = '';


/**
 * Muestra el div para insertar un contacto mediante animación hacia abajo,
 * se añade dentro de div_contenido
 */
function mostrar_insertar() {
    $('#div_consultar').hide();
    $('#div_modificar').hide();
    $('#div_insertar').appendTo('#div_contenido');
    $('#div_insertar').show();
    $('#div_contenido').hide();
    $('#div_contenido').slideDown();
}

/**
 * Muestra el div para consultar contactos mediante animación hacia abajo,
 * se añade dentro de div_contenido y hace la petición de consultar al servidor
 */
function mostrar_consultar() {
    $('#div_insertar').hide();
    $('#div_modificar').hide();
    $('#div_consultar').appendTo('#div_contenido');
    $('#div_consultar').show();
    $('#div_contenido').hide();
    $('#div_contenido').slideDown();
    consultar();
}

/**
 * Muestra el formulario para modificar un contacto
 */
function mostrar_modificar() {
    $('#div_modificar').appendTo('#div_contenido');
    $('#div_modificar').slideDown();
}

/**
 * Hace una petición de inserción al servidor mediante AJAX
 * @returns true si hay éxito al insertar, false en caso contrario
 */
function insertar() {
    //genero la dirección a partir de los datos del formulario
    var direccion = dir + puerto + '/insertar/' + $('#input_insertar_DNI').val() +
            '/' + $('#input_insertar_nombre').val() + '/' + $('#input_insertar_telefono').val();

    //hago una petición mediante AJAX al servidor, pasándole la dirección y especificando
    //que es tipo PUT, recojo la respuesta y muestro el resultado.
    //Si es éxito devuelvo true, para terminar con el formulario, si no devuelvo false
    //para poder modificar los datos.   
    $.ajax({
        url: direccion,
        type: 'PUT',
        success: function (result) {
            if (result['estado'] == 'exito') {
                alert('El contacto se ha insertado con éxito.');
                $('#input_insertar_DNI').val('');
                $('#input_insertar_nombre').val('');
                $('#input_insertar_telefono').val('');
                return true;
            } else if (result['estado'] == 'existe') {
                alert('ERROR: El DNI ya existía en la agenda.');
                $('#input_insertar_DNI').focus();
            } else if (result['estado'] == 'dni_incorrecto') {
                alert('ERROR: El DNI tiene un formato incorrecto.');
                $('#input_insertar_DNI').focus();
            } else if (result['estado'] == 'telefono_incorrecto') {
                alert('ERROR: El teléfono tiene un formato incorrecto.');
                $('#input_insertar_telefono').focus();
            }
            return false;
        }
    });
}

/**
 * Realiza una consulta en el servidor, si en el input del buscador está vacío
 * se devuelven todos los contactos, si se especifica algún texto, busca los contactos
 * que empiecen con este.
 * @returns false si la agenda está vacía
 */
function consultar() {
    //Si se especifica texto a buscar, se consulta este, si no se buscan todos los contactos
    if ($('#input_buscador').val() == '') {
        var direccion = dir + puerto;
    } else {
        var direccion = dir + puerto + '/consultar/' + $('#input_buscador').val();
    }

    //Hago una petición GET mediante AJAX, para rellenar los elementos a mostrar dinámicamente
    //por cada contacto devuelto por el servidor meto este en la variable elementos,
    //en el caso de que estuviera vacía (el servidor devuelve {estado : vacio} salgo
    $.get(direccion, function (data) {
        var elementos = '';
        var vacio = false;

        $.each(data, function (key, val) {
            if (key == 'estado' && val == 'vacio') {
                vacio = true;
                return false;
            }
            elementos += '<tr><th>DNI: ' + key + '</th>';

            elementos += '<td>' + val.nombre + '</td><td>' + val.telefono + '</td>';

            elementos += '<td><button id="boton_accion_modificar"' +
                    ' onclick="rellenar_modificar(\'' + key + '\');">Modificar</button>';

            elementos += '<button id="boton_accion_borrar_' + key +
                    '" onclick="borrar(\'' + key + '\')">Borrar</button></td>';

            elementos += '</tr>';
        });

        //Oculto el div de modificar, vacío la tabla y si tenía los añado a la tabla
        $('#div_modificar').hide();
        $('#tabla_consultar').empty();

        if (!vacio) {
            $('#tabla_consultar').append(elementos);
        }
    });
}

/**
 * Hace una petición al servidor de modificar mediante AJAX
 * @returns true si hay éxito al modificar, false en caso contrario
 */
function modificar() {
    //Extraigo el dni a modificar, de los datos de la cabecera de la tabla
    var dni = $('#head_modificar_DNI').text();
    dni = dni.substring(5);

    //Genero la dirección a partir de los datos del formulario
    var direccion = dir + puerto + '/modificar/' +
            dni + '/' +
            $('#input_modificar_nombre').val() + '/' +
            $('#input_modificar_telefono').val();

    //Hago una petición mediante AJAX al servidor, pasándole la dirección y especificando
    //que es tipo POST, recojo la respuesta y muestro el resultado.
    //Si es éxito devuelvo true, para terminar con el formulario, si no devuelvo false
    //para poder modificar los datos.   
    $.ajax({
        url: direccion,
        type: 'POST',
        success: function (result) {
            if (result['estado'] == 'exito') {
                alert('El contacto se ha modificado con éxito.');
                mostrar_consultar();
                return true;
            } else if (result['estado'] == 'dni_incorrecto') {
                alert('ERROR: El DNI tiene un formato incorrecto.');
                $('#input_insertar_DNI').focus();
            } else if (result['estado'] == 'telefono_incorrecto') {
                alert('SERVER ERROR: El teléfono tiene un formato incorrecto.');
                $('#input_insertar_telefono').focus();
            }
            return false;
        }
    });
}

/**
 * Rellena el formulario de modificar contacto con lo datos almacenados en el servidor
 * @param key El dni del contacto a modificar
 */
function rellenar_modificar(key) {
    //muestro el formulario para modificar y oculto consultar
    mostrar_modificar();
    $('#div_consultar').hide();

    //Genero la dirección a partir de los datos que se pasan por parámetro
    var direccion = dir + puerto + '/consultar/' + key;

    //Hago una petición GET mediante AJAX y relleno el formulario con la respuesta del servidor
    $.get(direccion, function (data) {
        $('#head_modificar_DNI').html('DNI: ' + key);
        $('#input_modificar_nombre').val(data[key].nombre);
        $('#input_modificar_telefono').val(data[key].telefono);
    });
}

/**
 * Borra un contacto de la agenda
 * @param key El dni del contacto a borrar
 */
function borrar(key) {
    //Genero la dirección a partir del dni pasado como parámetro
    var direccion = dir + puerto + '/borrar/' + key;
    
    //Hago una petición DELETE mediante AJAX e informo del estado de la operación,
    //si ha borrado bien, actualizo los contactos que se muestran
    $.ajax({
        url: direccion,
        type: 'DELETE',
        success: function (result) {
            if (result['estado'] == 'exito') {
                alert('El contacto se ha borrado con éxito.');
                mostrar_consultar();
            } else {
                alert('ERROR: Al borrar el contacto.');
            }
        }
    });
}

/**
 * Valida el formulario de insertar, los campos DNI y teléfono
 * @returns false si no es correcta la validación o no se ha podido insertar
 */
function validar_insertar() {
    //Extraigo el dni del formulario
    var dni = $('#input_insertar_DNI').val();
    
    //Si el dni y el teléfono están bien, inserto, si no devuelvo false.
    //El segundo parámetro de comprobar teléfono es para darle el focus() al input
    //de insertar teléfono en caso de fallar
    if (comprobar_dni(dni.toUpperCase()) &&
            comprobar_telefono($('#input_insertar_telefono').val(), 'insertar')) {
        insertar();
    }
    return false;
}

/**
 * Valida el formulario de modificar, el campo teléfono
 * @returns false si no es correcta la validación o no se ha podido modificar
 */
function validar_modificar() {
     if (comprobar_telefono($('#input_modificar_telefono').val(), 'modificar')) {
        modificar();
    }
    return false;
}

/**
 * Comprueba si un teléfono es correcto
 * @param telefono El teléfono a comprobar
 * @param formulario El formulario desde el que se está llamando
 * @returns true si el formato es teléfono, false en caso contrario
 */
function comprobar_telefono(telefono, formulario) {
    //Compruebo si el teléfono son 9 dígitos, si es así es un teléfono válido
    if (/^\d{9}$/.test(telefono)) {
        return true;
    } else {
        alert('ERROR: Teléfono incorrecto.');
        if (formulario == 'insertar') {
            $('#input_insertar_telefono').focus();
        } else if (formulario == 'modificar') {
            $('#input_modificar_telefono').focus();
        }
        return false;
    }
}

/**
 * Comprueba si un DNI es válido
 * @param dni El DNI a comprobar
 * @param formulario El formulario desde el que se está llamando
 * @returns true si es un DNI válido, False en caso contrario
 */
function comprobar_dni(dni) {
    //Las cadenas válidas del DNI
    var letras = ['T', 'R', 'W', 'A', 'G', 'M', 'Y', 'F', 'P', 'D', 'X', 'B', 'N', 'J', 'Z', 'S', 'Q', 'V', 'H', 'L', 'C', 'K', 'E', 'T'];

    //Compruebo si tiene el formato 8 números y 1 letra
    if (!(/^\d{8}[A-Z]$/.test(dni))) {
        alert('ERROR: DNI incorrecto.');
        $('#input_insertar_DNI').focus();
        return false;
    }

    //Compruebo si la letra es correcta
    if (dni.charAt(8) != letras[(dni.substring(0, 8)) % 23]) {
        alert('ERROR: DNI incorrecto');
        $('#input_insertar_DNI').focus();
        return false;
    }

    //Si llego hasta aquí significa que es DNI válido
    return true;
}
