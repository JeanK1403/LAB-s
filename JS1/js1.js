
var presionar = function(){
	alert("Pagina JS-1, Boton presionado..");
}


window.onload = function(){
	document.getElementById('btn').onclick = presionar;
}
