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

    // Registrar el mensaje en Google Sheets
    var sheet = getSpreadsheet(chat_id);
    addExpense(sheet, expense, msg);
    //Logger.log(e.postData.contents);

    // Opcional: Enviar una respuesta de vuelta al usuario
    sendResponse(chat_id, crearMensajeDeRespuesta(expense))
  }
  catch(error){
    logOnSheet(error);
  }
}

function crearMensajeDeRespuesta(expense){
  var fechaLegible = expense.date.toLocaleString('es-ES', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });

  var montoFormateado = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'ARS', 
    minimumFractionDigits: 2 // Si no quieres decimales, usa 0
  }).format(expense.amount);
  
  var mensaje = "✅ ¡Mensaje recibido!\n" + 
           "📂 " + expense.category + ": 💸 " + montoFormateado + "\n" + 
           "📅 Fecha: " + fechaLegible + "\n" + 
           "📄 Nota: " + expense.note + "\n";

  return mensaje;
}

function reporte(chat_id){
  var expenses = getUserExpenses(chat_id);

  const categoryTotals = {};
  let grandTotal = 0;

  expenses.forEach((expense) => {
    if (!categoryTotals[expense.category]) {
      categoryTotals[expense.category] = 0;
    }
    categoryTotals[expense.category] += expense.amount;
    grandTotal += expense.amount;
  });

  // Sort categories by total (descending)
  const sortedCategories = Object.entries(categoryTotals).sort(
    (a, b) => b[1] - a[1]
  );

  // Build report message
  let report = '📊 Monthly Expense Report\n\n';

  sortedCategories.forEach(([category, total]) => {
    const percentage = ((total / grandTotal) * 100).toFixed(1);
    report += `${category}: $${total.toFixed(2)} (${percentage}%)\n`;
  });

  report += `\n💰 Total: $${grandTotal.toFixed(2)}`;
  report += `\n📈 Entries: ${expenses.length}`;

  return report;
}