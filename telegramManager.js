const TELEGRAM_BOT_TOKEN = '7738124641:AAEDWAhTAzx4O9TdsoktsO8TrxHNe11kd3A';
const TELEGRAM_API_URL = "https://api.telegram.org/bot" + TELEGRAM_BOT_TOKEN;

function getMe() {
  var url = TELEGRAM_API_URL + "/getMe";
  var res = UrlFetchApp.fetch(url);
  Logger.log(res.getContentText());
}

function sendResponse(chatId, text) {
  var url = TELEGRAM_API_URL + "/sendMessage?chat_id=" + chatId + "&text=" + encodeURIComponent(text);
  UrlFetchApp.fetch(url);
}

function setWebhook() {
  // Función para configurar el webhook, solo necesitas ejecutarla una vez
  var webAppUrl = "https://script.google.com/macros/s/AKfycbzqMSl28redg_O8GKLzuLNjBoHmBFB5GLvc1Nqa5OLyHqHsAYaAvPYlhwp5v-4UrEzKUg/exec";
  Logger.log(webAppUrl);
  var url = TELEGRAM_API_URL + "/setWebhook?url=" + webAppUrl;
  console.log(url);
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}