function runTest() {
  // Usamos ":" para definir pares clave:valor dentro de las llaves {}
  var chat = { id: "8553550912" };
  var from = { username: "@fapitest", first_name: "Nicolas" };
  // Obtenemos el timestamp Unix actual (segundos)
  var unixTimestamp = Math.floor(Date.now() / 1000);
  
  var message = { 
    chat: chat, 
    from: from, 
    text: "Nafta 43000 en la ypf de colon",
    date: unixTimestamp
  };

  // Estructuramos el evento para que imite lo que recibe doPost(e)
  var event = {
    postData: {
      contents: JSON.stringify({ message: message }) // Generalmente doPost recibe un JSON string
    }
  };

  // Llamamos a la función
  doPost(event);
}

function run(){
  Logger.log(reporte("8553550912"));
}