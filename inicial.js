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