
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


//[JQuery] Básico

//1 - Id Selector
$(document).ready(function(){
	$('#btn_azul').click(function(){
		$('#mostrarResultado')
			.text($('#thing1').text())
			.css("background-color", "blue")
			.css("color", "white");
	});
});

//2 - class Selector
$(document).ready(function(){
	$('#btn_rojo').click(function(){
		$('#mostrarResultado')
			.text($('.main-greeting').text())
			.css("background-color", "red")
			.css("color", "white");
	});
});

//3 - tag Selector
$(document).ready(function(){
	$('#btn_verde').click(function(){
		$('#mostrarResultado')
			.text($('h1').text())
			.css("background-color", "green")
			.css("color", "white");
	});
});

//4 - Alteración de contenido entre dos selectores
$(document).ready(function(){
	$('#btn_amarillo').click(function(){
		$('.main-greeting').append($('#thing1').text()).text();
		$('#mostrarResultado')
			.text($('.main-greeting').text())
			.css("background-color", "yellow")
			.css("color", "black");
	});
});

//5 - child and descendat selectors
$(document).ready(function(){
	$('#btn_amarillo').click(function(){
		$('.main-greeting').append($('#thing1').text()).text();
		$('#mostrarResultado')
			.text($('.main-greeting').text())
			.css("background-color", "pink")
			.css("color", "black");
	});
});