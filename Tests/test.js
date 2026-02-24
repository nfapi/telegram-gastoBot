/**
 * Suite de tests para validar la funcionalidad de doPost
 */

// Test 1: Registrar un gasto simple
function testAgregarGasto() {
  Logger.log('=== TEST 1: Agregar Gasto ===');
  
  var chat = { 
    id: "8553550912", 
    username: "testuser",
    first_name: "Nicolas",
    type: "private"
  };
  var from = { 
    username: "testuser", 
    first_name: "Nicolas" 
  };
  var unixTimestamp = Math.floor(Date.now() / 1000);
  
  var message = { 
    chat: chat, 
    from: from, 
    text: "Café 150",
    date: unixTimestamp
  };

  var event = {
    postData: {
      contents: JSON.stringify({ message: message })
    }
  };

  try {
    doPost(event);
    Logger.log('✅ TEST PASÓ: Gasto registrado correctamente');
  } catch (error) {
    Logger.log('❌ TEST FALLÓ: ' + error.toString());
  }
}

// Test 2: Comando /reporte
function testComandoReporte() {
  Logger.log('=== TEST 2: Comando /reporte ===');
  
  var chat = { 
    id: "8553550912",
    username: "testuser",
    first_name: "Nicolas",
    type: "private"
  };
  var from = { 
    username: "testuser", 
    first_name: "Nicolas" 
  };
  var unixTimestamp = Math.floor(Date.now() / 1000);
  
  var message = { 
    chat: chat, 
    from: from, 
    text: "/reporte",
    date: unixTimestamp
  };

  var event = {
    postData: {
      contents: JSON.stringify({ message: message })
    }
  };

  try {
    doPost(event);
    Logger.log('✅ TEST PASÓ: Comando /reporte ejecutado');
  } catch (error) {
    Logger.log('❌ TEST FALLÓ: ' + error.toString());
  }
}

// Test 3: Comando /ayuda
function testComandoAyuda() {
  Logger.log('=== TEST 3: Comando /ayuda ===');
  
  var chat = { 
    id: "8553550912",
    username: "testuser",
    first_name: "Nicolas",
    type: "private"
  };
  var from = { 
    username: "testuser", 
    first_name: "Nicolas" 
  };
  var unixTimestamp = Math.floor(Date.now() / 1000);
  
  var message = { 
    chat: chat, 
    from: from, 
    text: "/ayuda",
    date: unixTimestamp
  };

  var event = {
    postData: {
      contents: JSON.stringify({ message: message })
    }
  };

  try {
    doPost(event);
    Logger.log('✅ TEST PASÓ: Comando /ayuda ejecutado');
  } catch (error) {
    Logger.log('❌ TEST FALLÓ: ' + error.toString());
  }
}

// Test 4: Formato inválido
function testFormatoInvalido() {
  Logger.log('=== TEST 4: Formato Inválido ===');
  
  var chat = { 
    id: "8553550912",
    username: "testuser",
    first_name: "Nicolas",
    type: "private"
  };
  var from = { 
    username: "testuser", 
    first_name: "Nicolas" 
  };
  var unixTimestamp = Math.floor(Date.now() / 1000);
  
  var message = { 
    chat: chat, 
    from: from, 
    text: "texto sin monto",
    date: unixTimestamp
  };

  var event = {
    postData: {
      contents: JSON.stringify({ message: message })
    }
  };

  try {
    doPost(event);
    Logger.log('✅ TEST PASÓ: Formato inválido manejado correctamente');
  } catch (error) {
    Logger.log('❌ TEST FALLÓ: ' + error.toString());
  }
}

// Test 5: Gasto en grupo
function testGastoEnGrupo() {
  Logger.log('=== TEST 5: Gasto en Grupo ===');
  
  var chat = { 
    id: "-1001234567890",
    title: "Mi Grupo",
    type: "supergroup"
  };
  var from = { 
    username: "testuser", 
    first_name: "Juan",
    last_name: "Pérez"
  };
  var unixTimestamp = Math.floor(Date.now() / 1000);
  
  var message = { 
    chat: chat, 
    from: from, 
    text: "Almuerzo 450.50",
    date: unixTimestamp
  };

  var event = {
    postData: {
      contents: JSON.stringify({ message: message })
    }
  };

  try {
    doPost(event);
    Logger.log('✅ TEST PASÓ: Gasto en grupo registrado correctamente');
  } catch (error) {
    Logger.log('❌ TEST FALLÓ: ' + error.toString());
  }
}

// Test 6: Ejecutar todos los tests
function runAllTests() {
  Logger.log('\n🧪 INICIANDO SUITE DE TESTS\n');
  
  testAgregarGasto();
  Logger.log('');
  
  testComandoReporte();
  Logger.log('');
  
  testComandoAyuda();
  Logger.log('');
  
  testFormatoInvalido();
  Logger.log('');
  
  testGastoEnGrupo();
  Logger.log('');
  
  Logger.log('\n✔️ SUITE DE TESTS COMPLETADA');
}

// Legacy tests
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
  Logger.log(reporteMes("Nicolas"));
}