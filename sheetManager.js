
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
 * Convierte número de mes (0-11) a nombre en español.
 */
function getNombreMes(mes) {
  var meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return meses[mes] || 'Mes inválido';
}

/**
 * Genera un reporte genérico para un mes y año específico.
 * Filtra gastos por fecha (mes/año) y agrupa por categoría.
 */
function reporteMesPorFecha(sheetName, mes, anio) {
  var expenses = getUserExpenses(sheetName);
  const categoryTotals = {};
  let grandTotal = 0;
  let count = 0;

  expenses.forEach(function(expense) {
    var expenseDate = new Date(expense.date);
    if (expenseDate.getMonth() === mes && expenseDate.getFullYear() === anio) {
      if (!categoryTotals[expense.category]) {
        categoryTotals[expense.category] = 0;
      }
      categoryTotals[expense.category] += expense.amount;
      grandTotal += expense.amount;
      count++;
    }
  });

  if (count === 0) {
    var nombreMes = getNombreMes(mes);
    return '📊 Reporte de ' + nombreMes + ' ' + anio + '\n\nSin gastos registrados en este mes.';
  }

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  var nombreMes = getNombreMes(mes);
  let report = '📊 Reporte de ' + nombreMes + ' ' + anio + '\n\n';

  sortedCategories.forEach(function(pair) {
    var category = pair[0];
    var total = pair[1];
    const percentage = ((total / grandTotal) * 100).toFixed(1);
    const montoFormateado = new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'ARS',
      currencyDisplay: 'symbol',
      minimumFractionDigits: 2
    }).format(total);
    report += category + ': ' + montoFormateado + ' (' + percentage + '%)\n';
  });

  const totalFormateado = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'ARS',
    currencyDisplay: 'symbol',
    minimumFractionDigits: 2
  }).format(grandTotal);

  report += '\n💰 Total: ' + totalFormateado;
  report += '\n📈 Registros: ' + count;

  return report;
}

/**
 * Refactorizar reporteMes para usar reporteMesPorFecha con mes actual.
 */
function reporteMes(sheetName) {
  var now = new Date();
  var mesActual = now.getMonth();
  var anioActual = now.getFullYear();
  return reporteMesPorFecha(sheetName, mesActual, anioActual);
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

/**
 * Actualiza la categoría del último gasto registrado para un usuario/grupo.
 * Se usa cuando el usuario cambia de categoría desde el keyboard.
 */
function updateLastExpenseCategory(sheetName, newCategory) {
  try {
    var sheet = getSpreadsheet(sheetName);
    var rows = sheet.getDataRange().getValues();
    
    // Obtener la última fila (índice de datos - 1, porque index 0 es header)
    if (rows.length > 1) {
      var lastRowIndex = rows.length;
      // Actualizar la columna de categoría (índice 2)
      sheet.getRange(lastRowIndex, 3).setValue(newCategory);
    }
  } catch (error) {
    Logger.log('Error updating last expense category: ' + error.toString());
  }
}

/**
 * Genera un reporte de gastos del mes corriente (actual).
 * Filtra por fecha y agrupa por categoría.
 */
function reporteMes(sheetName) {
  var expenses = getUserExpenses(sheetName);
  var now = new Date();
  var mesActual = now.getMonth();
  var anioActual = now.getFullYear();
  
  const categoryTotals = {};
  let grandTotal = 0;
  let count = 0;

  // Filtrar gastos del mes actual
  expenses.forEach((expense) => {
    var expenseDate = new Date(expense.date);
    if (expenseDate.getMonth() === mesActual && expenseDate.getFullYear() === anioActual) {
      if (!categoryTotals[expense.category]) {
        categoryTotals[expense.category] = 0;
      }
      categoryTotals[expense.category] += expense.amount;
      grandTotal += expense.amount;
      count++;
    }
  });

  // Si no hay gastos en el mes actual
  if (count === 0) {
    return '📊 Reporte del mes actual\n\nSin gastos registrados este mes.';
  }

  // Ordenar categorías por total (descendente)
  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  let report = '📊 Reporte del mes actual\n\n';

  sortedCategories.forEach(([category, total]) => {
    const percentage = ((total / grandTotal) * 100).toFixed(1);
    const montoFormateado = new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'ARS',
      currencyDisplay: 'symbol',
      minimumFractionDigits: 2
    }).format(total);
    report += `${category}: ${montoFormateado} (${percentage}%)\n`;
  });

  const totalFormateado = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'ARS',
    currencyDisplay: 'symbol',
    minimumFractionDigits: 2
  }).format(grandTotal);

  report += `\n💰 Total: ${totalFormateado}`;
  report += `\n📈 Registros: ${count}`;

  return report;
}

/**
 * Genera un reporte para un usuario específico en un mes/año dado.
 * Filtra por columna 'User' y fecha.
 */
function reporteMesUsuarioPorFecha(sheetName, userDisplayName, mes, anio) {
  var sheet = getSpreadsheet(sheetName);
  var rows = sheet.getDataRange().getValues();

  const categoryTotals = {};
  let grandTotal = 0;
  let count = 0;

  // Iterar filas (saltando header)
  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    var date = new Date(row[0]);
    var amount = parseFloat(row[1]) || 0;
    var category = row[2] || 'Sin categoría';
    var user = row[4] || '';

    if (user !== userDisplayName) continue;
    if (date.getMonth() !== mes || date.getFullYear() !== anio) continue;

    if (!categoryTotals[category]) categoryTotals[category] = 0;
    categoryTotals[category] += amount;
    grandTotal += amount;
    count++;
  }

  if (count === 0) {
    var nombreMes = getNombreMes(mes);
    return '📊 Tu reporte de ' + nombreMes + ' ' + anio + '\n\nNo tienes gastos registrados en este mes.';
  }

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  var nombreMes = getNombreMes(mes);
  let report = '📊 Tu reporte de ' + nombreMes + ' ' + anio + '\n\n';

  sortedCategories.forEach(function(pair) {
    var category = pair[0];
    var total = pair[1];
    const percentage = ((total / grandTotal) * 100).toFixed(1);
    const montoFormateado = new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'ARS',
      currencyDisplay: 'symbol',
      minimumFractionDigits: 2
    }).format(total);
    report += category + ': ' + montoFormateado + ' (' + percentage + '%)\n';
  });

  const totalFormateado = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'ARS',
    currencyDisplay: 'symbol',
    minimumFractionDigits: 2
  }).format(grandTotal);

  report += '\n💰 Total: ' + totalFormateado;
  report += '\n📈 Registros: ' + count;

  return report;
}

/**
 * Refactorizar reporteMesUsuario para usar reporteMesUsuarioPorFecha con mes actual.
 */
function reporteMesUsuario(sheetName, userDisplayName) {
  var now = new Date();
  var mesActual = now.getMonth();
  var anioActual = now.getFullYear();
  return reporteMesUsuarioPorFecha(sheetName, userDisplayName, mesActual, anioActual);
}