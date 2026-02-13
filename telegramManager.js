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