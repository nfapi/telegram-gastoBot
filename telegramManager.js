function getTelegramToken(){
  var token = PropertiesService.getScriptProperties().getProperty('TELEGRAM_BOT_TOKEN');
  if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN not set in Script Properties. Use setTelegramToken(token) or set it in Project Properties.');
  }
  return token;
}

function getTelegramApiUrl(){
  return "https://api.telegram.org/bot" + getTelegramToken();
}

function getMe() {
  var url = getTelegramApiUrl() + "/getMe";
  var res = UrlFetchApp.fetch(url);
  Logger.log(res.getContentText());
}

function sendResponse(chatId, text) {
  var url = getTelegramApiUrl() + "/sendMessage?chat_id=" + chatId + "&text=" + encodeURIComponent(text);
  UrlFetchApp.fetch(url);
}

function setWebhook() {
  // Función para configurar el webhook, solo necesitas ejecutarla una vez
  var webAppUrl = "https://script.google.com/macros/s/AKfycbzqMSl28redg_O8GKLzuLNjBoHmBFB5GLvc1Nqa5OLyHqHsAYaAvPYlhwp5v-4UrEzKUg/exec";
  Logger.log(webAppUrl);
  var url = getTelegramApiUrl() + "/setWebhook?url=" + webAppUrl;
  console.log(url);
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}

// Helper para establecer el token desde el editor de Apps Script (run una vez)
function setTelegramToken(token){
  PropertiesService.getScriptProperties().setProperty('TELEGRAM_BOT_TOKEN', token);
  Logger.log('TELEGRAM_BOT_TOKEN set');
}

/**
 * Categorías predeterminadas con emojis
 */
const PREDEFINED_CATEGORIES = [
  { emoji: '🍔', nombre: 'Comida' },
  { emoji: '🚗', nombre: 'Transporte' },
  { emoji: '🎬', nombre: 'Entretenimiento' },
  { emoji: '💊', nombre: 'Salud' },
  { emoji: '📚', nombre: 'Educación' },
  { emoji: '🏠', nombre: 'Vivienda' },
  { emoji: '⚡', nombre: 'Servicios' },
  { emoji: '🛍️', nombre: 'Compras' },
  { emoji: '🆘', nombre: 'Ayuda' },
  { emoji: '🎁', nombre: 'Regalos' },
  { emoji: '👕', nombre: 'Ropa Ro' }
];

/**
 * Envía un teclado inline con las categorías predefinidas.
 */
function sendCategoriesKeyboard(chatId) {
  var inlineKeyboard = [];
  
  // Crear filas de 2 botones cada una
  for (var i = 0; i < PREDEFINED_CATEGORIES.length; i += 2) {
    var row = [];
    
    // Botón 1
    var cat1 = PREDEFINED_CATEGORIES[i];
    row.push({
      text: cat1.emoji + ' ' + cat1.nombre,
      callback_data: 'categoria_' + cat1.nombre.toLowerCase()
    });
    
    // Botón 2 (si existe)
    if (i + 1 < PREDEFINED_CATEGORIES.length) {
      var cat2 = PREDEFINED_CATEGORIES[i + 1];
      row.push({
        text: cat2.emoji + ' ' + cat2.nombre,
        callback_data: 'categoria_' + cat2.nombre.toLowerCase()
      });
    }
    
    inlineKeyboard.push(row);
  }
  
  var payload = {
    chat_id: chatId,
    text: '📂 ¿Quieres cambiar la categoría?',
    reply_markup: {
      inline_keyboard: inlineKeyboard
    }
  };
  
  sendMessageWithKeyboard(payload);
}

/**
 * Envía un mensaje con teclado inline (JSON).
 */
function sendMessageWithKeyboard(payload) {
  var url = getTelegramApiUrl() + '/sendMessage';
  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  };
  
  try {
    var response = UrlFetchApp.fetch(url, options);
    Logger.log('Message with keyboard sent: ' + response.getResponseCode());
  } catch (error) {
    Logger.log('Error sending message with keyboard: ' + error.toString());
  }
}

/**
 * Responde a un callback_query para eliminar el "loading" en Telegram.
 */
function answerCallbackQuery(callbackId, text) {
  var url = getTelegramApiUrl() + '/answerCallbackQuery';
  var payload = {
    callback_query_id: callbackId,
    text: text || '✅',
    show_alert: false
  };
  
  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  };
  
  try {
    UrlFetchApp.fetch(url, options);
  } catch (error) {
    Logger.log('Error answering callback: ' + error.toString());
  }
}

/**
 * Formatea un objeto `expense` en un mensaje legible para el usuario.
 * Mantener la lógica de presentación separada del endpoint `doPost`.
 */
function crearMensajeDeRespuesta(expense){
  var fechaLegible = expense.date.toLocaleString('es-ES', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit'
  });

  var montoFormateado = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'ARS',
    currencyDisplay: 'symbol',
    minimumFractionDigits: 2
  }).format(expense.amount);
  
  var mensaje = "✅ ¡Mensaje recibido!\n" + 
           "📂 " + expense.category + ": " + montoFormateado + "\n" + 
           "📅 " + fechaLegible + "\n" + 
           (expense.note ? ("📄 " + expense.note + "\n") : "");

  return mensaje;
}