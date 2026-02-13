// entrada de datos desde Telegram
function doPost(e) {
  try {
    // Guardar log en una hoja llamada "Logs"
    var rawContents = e.postData.contents;
    logOnSheet(rawContents);
      
    var contents = JSON.parse(e.postData.contents);
    var msg = contents.message;
    var chat_id = msg.chat.id;
    var text = msg.text;

    // Verificar si es un comando
    if (text.startsWith('/')) {
      manejarComando(chat_id, text, msg.chat);
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

    // Enviar una confirmación al usuario (mensaje formateado en `telegramManager`)
    sendResponse(chat_id, crearMensajeDeRespuesta(expense));
  }
  catch(error){
    logOnSheet(error);
  }
}

/**
 * Maneja comandos de Telegram (/reporte, /ayuda, etc).
 */
function manejarComando(chat_id, comando, chat) {
  var comandoLimpio = comando.toLowerCase().trim();
  
  if (comandoLimpio === '/reporte') {
    var sheetName = getChatDisplayName(chat);
    var reporteMsg = reporteMes(sheetName);
    sendResponse(chat_id, reporteMsg);
  } else if (comandoLimpio === '/ayuda') {
    var ayuda = "📋 Comandos disponibles:\n\n" +
                "/reporte - Ver gastos del mes actual por categoría\n" +
                "/ayuda - Ver esta ayuda\n\n" +
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