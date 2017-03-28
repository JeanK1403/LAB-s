

var mostrarResultados = function(texto, estilo){
	/*$('#mostrarResultado').text(texto);*/
	alert(texto);
}

$(document).ready(function(){
	$('#btn_calcular_edad').click(function(){
		mostrarResultados("texto", "css");
	});
});


function usuario(nombre, fecha) {
    this.nombre = nombre;
    this.fecha = fecha;
    this.edad = "";

    //Metodo privado
 	var calcularEdad = function() {
            var actual = new Date().getYear();
            var nacimiento = fecha.getYear();
 
            if (actual <= nacimiento)
                edad = "Error: no se ha podido calcular";
            else
                edad = actual - nacimiento;
    };

    //Metodo publico
    this.presentarse = function(){
    	calcularEdad();

    	mostrarResultados("Hola, mi nombre es " + nombre + " y tengo " + edad + " años", );
    };
}