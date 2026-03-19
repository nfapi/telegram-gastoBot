// entrada de datos desde Telegram
function doPost(e) {
  try {
    // Guardar log en una hoja llamada "Logs"
    var rawContents = e.postData.contents;
    logOnSheet(rawContents);
      
    var contents = JSON.parse(e.postData.contents);
    
    // Verificar si es un callback_query (botón clickeado)
    if (contents.callback_query) {
      manejarCallbackQuery(contents.callback_query);
      return;
    }
    
    // Si no, es un mensaje normal
    var msg = contents.message;
    var chat_id = msg.chat.id;
    var text = msg.text;

    // Verificar si es un comando
    if (text.startsWith('/')) {
      // Pasar el objeto `msg` completo para que `manejarComando` pueda
      // identificar al usuario que solicita comandos como `/mireporte`.
      manejarComando(chat_id, text, msg);
      return;
    }

    var expense = parseExpense(text);
    // Si no pudimos parsear, avisar y no agregar
    if (!expense) {
      sendResponse(chat_id, "No pude interpretar el gasto. Usa formato: 'Categoria 123.45'");
      return;
    }

    // Obtener nombre legible del chat (grupo o usuario)
    var sheetName = getChatDisplayName(msg.chat);
    
    // Registrar el gasto en Google Sheets
    var sheet = getSpreadsheet(sheetName, chat_id);
    addExpense(sheet, expense, msg);
    
    // Guardar el nombre de la sheet para recuperarlo luego en callbacks
    // Usar ScriptProperties (global) para que todos los usuarios puedan acceder
    var scriptProps = PropertiesService.getScriptProperties();
    scriptProps.setProperty('last_sheet_' + chat_id, sheetName);

    // Enviar una confirmación al usuario (mensaje formateado en `telegramManager`)
    sendResponse(chat_id, crearMensajeDeRespuesta(expense));
    
    // Mostrar categorías por si quiere cambiarla
    sendCategoriesKeyboard(chat_id);
  }
  catch(error){
    logOnSheet(error);
  }
}

/**
 * Maneja los callbacks cuando el usuario clickea un botón inline.
 */
function manejarCallbackQuery(callbackQuery) {
  var userId = callbackQuery.from.id;
  var callbackData = callbackQuery.data;
  var callbackId = callbackQuery.id;
  
  // Obtener el ID del chat donde se hizo el click (grupo o privado)
  var chatId = callbackQuery.message.chat.id;
  var chatType = callbackQuery.message.chat.type;
  
  // Responder al callback para eliminar el "loading" en Telegram
  answerCallbackQuery(callbackId, '✅ Categoría actualizada');
  
  if (callbackData.startsWith('categoria_')) {
    var categoriaNueva = callbackData.substring('categoria_'.length);
    categoriaNueva = categoriaNueva.charAt(0).toUpperCase() + categoriaNueva.slice(1);
    
    // Recuperar el nombre de la sheet donde se registró el último gasto
    // Usar chatId (ID del grupo o usuario) como clave, no userId
    var scriptProps = PropertiesService.getScriptProperties();
    var sheetName = scriptProps.getProperty('last_sheet_' + chatId);
    
    if (!sheetName) {
      sendResponse(chatId, "❌ Error: No se encontró el gasto a actualizar");
      return;
    }
    
    // Actualizar la última fila con la nueva categoría
    updateLastExpenseCategory(sheetName, categoriaNueva);
    
    var mensaje = "✅ Categoría actualizada a: " + categoriaNueva;
    sendResponse(chatId, mensaje);
  }
}

/**
 * Parsea un parámetro de mes de string a número (0-11).
 * Acepta: número (0-11 ó 1-12), nombre mes en español (enero, feb, etc)
 */
function parseMesParam(param) {
  if (!param) return null;
  param = param.toLowerCase().trim();
  
  // Intentar como número
  var num = parseInt(param, 10);
  if (!isNaN(num)) {
    if (num >= 1 && num <= 12) return num - 1;  // Convertir 1-12 a 0-11
    if (num >= 0 && num <= 11) return num;      // Ya en 0-11
  }
  
  // Intentar como nombre de mes
  var meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var abreviaturas = ['ene', 'feb', 'mar', 'abr', 'may', 'jun',
                       'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  
  for (var i = 0; i < meses.length; i++) {
    if (param.startsWith(meses[i]) || param.startsWith(abreviaturas[i])) {
      return i;
    }
  }
  
  return null;
}

/**
 * Maneja comandos de Telegram (/reporte, /ayuda, /categorias, etc).
 */
function manejarComando(chat_id, comando, msg) {
  var comandoLimpio = comando.toLowerCase().trim();
  var chat = msg.chat;
  var partes = comandoLimpio.split(/\s+/);
  var cmd = partes[0];

  if (cmd === '/reporte') {
    var sheetName = getChatDisplayName(chat);
    var reporteMsg;
    
    // Si hay parámetro de mes o tipo de reporte
    if (partes.length > 1) {
      // Soportar: /reporte anual
      if (partes[1] === 'anual') {
        reporteMsg = reporteAnualUltimos12Meses(sheetName);
        sendResponse(chat_id, reporteMsg);
        return;
      }

      var mesParam = parseMesParam(partes[1]);
      if (mesParam === null) {
        sendResponse(chat_id, "❌ Mes inválido. Usa: /reporte [número 1-12 o nombre, ej: /reporte 3 o /reporte marzo] o /reporte anual");
        return;
      }
      var now = new Date();
      reporteMsg = reporteMesPorFecha(sheetName, mesParam, now.getFullYear());
    } else {
      // Sin parámetro: mes actual
      reporteMsg = reporteMes(sheetName);
    }
    sendResponse(chat_id, reporteMsg);
  } else if (cmd === '/mireporte') {
    // Reporte solo para el usuario que lo solicita
    var sheetName = getChatDisplayName(chat);
    var userName = getUserDisplayName(msg.from);
    var reporteMsg;
    
    if (partes.length > 1) {
      // Soportar: /mireporte anual
      if (partes[1] === 'anual') {
        reporteMsg = reporteAnualUsuarioUltimos12Meses(sheetName, userName);
        sendResponse(chat_id, reporteMsg);
        return;
      }

      var mesParam = parseMesParam(partes[1]);
      if (mesParam === null) {
        sendResponse(chat_id, "❌ Mes inválido. Usa: /mireporte [número 1-12 o nombre, ej: /mireporte 3 o /mireporte marzo] o /mireporte anual");
        return;
      }
      var now = new Date();
      reporteMsg = reporteMesUsuarioPorFecha(sheetName, userName, mesParam, now.getFullYear());
    } else {
      // Sin parámetro: mes actual
      reporteMsg = reporteMesUsuario(sheetName, userName);
    }
    sendResponse(chat_id, reporteMsg);
  } else if (cmd === '/reporteanual') {
    var sheetName = getChatDisplayName(chat);
    var reporteMsg = reporteAnualUltimos12Meses(sheetName);
    sendResponse(chat_id, reporteMsg);
  } else if (cmd === '/mireporteanual') {
    var sheetName = getChatDisplayName(chat);
    var userName = getUserDisplayName(msg.from);
    var reporteMsg = reporteAnualUsuarioUltimos12Meses(sheetName, userName);
    sendResponse(chat_id, reporteMsg);
  } else if (cmd === '/categorias') {
    sendCategoriesKeyboard(chat_id);
  } else if (cmd === '/ayuda') {
    var ayuda = "📋 Comandos disponibles:\n\n" +
                "/reporte [mes] (o /reporte anual) - Reporte del grupo\n" +
                "/mireporte [mes] (o /mireporte anual) - Tu reporte\n" +
                "/reporteanual - Total por mes de los últimos 12 meses (grupo)\n" +
                "/mireporteanual - Total por mes de los últimos 12 meses (tú)\n" +
                "/categorias - Ver categorías predefinidas\n" +
                "/ayuda - Ver esta ayuda\n\n" +
                "📝 Parámetro mes: número 1-12 o nombre (enero, feb, etc)\n" +
                "Ejemplos: /reporte 3  o  /reporte marzo\n\n" +
                "📝 Para registrar un gasto, envía:\n" +
                "'Categoria monto' (ej: 'Café 150')";
    sendResponse(chat_id, ayuda);
  } else {
    sendResponse(chat_id, "Comando no reconocido. Usa /ayuda para ver los comandos.");
  }
}

/**
 * Extrae el nombre legible del chat (nombre del grupo o usuario).
 */
function getChatDisplayName(chat) {
  // Para grupos: usar el title
  if (chat.type === 'group' || chat.type === 'supergroup') {
    return chat.title || ('Group_' + chat.id);
  }
  // Para usuarios privados: usar username o nombre(s)
  if (chat.username) {
    return '@' + chat.username;
  }
  if (chat.first_name) {
    var fullName = chat.first_name;
    if (chat.last_name) {
      fullName += ' ' + chat.last_name;
    }
    return fullName;
  }
  // Fallback a ID
  return 'User_' + chat.id;
}