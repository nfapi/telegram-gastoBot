
const SHEET_ID = '1mQT2lRmqR5C_44w09briJXXRk2mdbOJMx5JxRVz_mRo';

/**
 * Registra texto bruto en la hoja `Logs` con timestamp.
 */
function logOnSheet(rawContents){
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var logSheet = ss.getSheetByName("Logs") || ss.insertSheet("Logs");
  logSheet.appendRow([new Date(), rawContents]);
}

/**
 * Obtiene (o crea) una hoja para el usuario/grupo con nombres legibles.
 * @param {string} sheetName - Nombre legible del usuario o grupo (ej. 'John Doe', 'My Group')
 * @param {string} chatId - ID del chat para usar como fallback si hay conflictos
 */
function getSpreadsheet(sheetName, chatId) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(sheetName);
  
  // Si el nombre ya existe, lo usamos directamente
  if (sheet) {
    return sheet;
  }
  
  // Crear nueva sheet con nombre legible (si hay conflicto, Google Sheets lo maneja)
  sheet = ss.insertSheet();
  sheet.setName(sheetName);
  // Header mejorado con columna de usuario
  sheet.appendRow(['Date', 'Amount', 'Category', 'Note', 'User', 'Chat Type', 'Group/Username']);
  
  return sheet;
}

/**
 * Añade una fila de gasto a la sheet, incluyendo el usuario que lo registró.
 */
function addExpense(sheet, expense, msg){
  var userName = getUserDisplayName(msg.from);
  var groupOrUsername = msg.chat.type === 'private' ? (msg.chat.username || msg.chat.first_name || 'N/A') : msg.chat.title;
  
  sheet.appendRow([
    expense.date,
    expense.amount,
    expense.category,
    expense.note,
    userName,  // Nuevo: nombre del usuario que registró
    msg.chat.type,
    groupOrUsername
  ]);
    
    /*msg.chat.id, 
    msg.from.username, 
    msg.from.first_name, 
    msg.text, 
    expense.currency]);*/
}

function getUserExpenses(sheetName){
  var sheet = getSpreadsheet(sheetName);
  var rows = sheet.getDataRange().getValues();
  const expenses = [];

  // Skip header row
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length >= 3) {
      expenses.push({
        date: row[0],
        category: row[2],
        amount: parseFloat(row[1]),
        note: row[3] || '',
      });
    }
  }

  return expenses;
}


/**
 * Genera un reporte resumido por categoría para un `sheetName` (chat id).
 * Devuelve un string con totales y porcentajes.
 */
function reporte(sheetName){
  var expenses = getUserExpenses(sheetName);
  const categoryTotals = {};
  let grandTotal = 0;

  expenses.forEach((expense) => {
    if (!categoryTotals[expense.category]) {
      categoryTotals[expense.category] = 0;
    }
    categoryTotals[expense.category] += expense.amount;
    grandTotal += expense.amount;
  });

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  let report = '📊 Monthly Expense Report\n\n';

  sortedCategories.forEach(([category, total]) => {
    const percentage = grandTotal ? ((total / grandTotal) * 100).toFixed(1) : '0.0';
    report += `${category}: $${total.toFixed(2)} (${percentage}%)\n`;
  });

  report += `\n💰 Total: $${grandTotal.toFixed(2)}`;
  report += `\n📈 Entries: ${expenses.length}`;

  return report;
}

/**
 * Extrae el nombre legible del usuario que registró el gasto (msg.from).
 */
function getUserDisplayName(from) {
  if (from.username) {
    return '@' + from.username;
  }
  if (from.first_name) {
    var fullName = from.first_name;
    if (from.last_name) {
      fullName += ' ' + from.last_name;
    }
    return fullName;
  }
  return 'User';
}