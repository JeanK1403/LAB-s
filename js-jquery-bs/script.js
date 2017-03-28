
//Funcion anonima
var mostrarResultados = function(texto, estilo){
	if(estilo)
		$("#" + estilo).text(texto).css("background-color", "lightgreen");	
	else
		$("#mostrarResultado").text(texto).css("background-color", "lightblue");
}

$(document).ready(function(){
	
	//Para usar la funcion constructora
	$('#btn_calcular_edad').click(function(){
		var nombre = $('#name').val();
		var fecha = new Date($('#fecha_nacimiento').val());
		var u = new usuario(nombre, fecha);
		u.presentarse();
	});

	/*mostrarResultados("Jean", "");*/
});


function usuario(nombre, fecha) {
    this.nombre = nombre;
    this.fecha = fecha;
    this.edad = "";

    //Metodo privado
 	var calcularEdad = function() {
            var actual = new Date().getFullYear();
            var nacimiento = fecha.getFullYear();
 
            if (actual < nacimiento)
                edad = "Error: no se ha podido calcular";
            else
                edad = actual - nacimiento;
    };

    //Metodo publico
    this.presentarse = function(){
    	calcularEdad();

    	mostrarResultados("Hola, mi nombre es " + nombre + " y tengo " + edad + " años", "mostrarResultado");
    };
}