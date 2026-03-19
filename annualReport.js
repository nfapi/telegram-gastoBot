/**
 * Genera un reporte anual con el total por mes de los últimos 12 meses.
 * Incluye meses sin gastos (mostrados con $0.00).
 */
function reporteAnualUltimos12Meses(sheetName) {
  var expenses = getUserExpenses(sheetName);
  var now = new Date();
  var totals = {};
  var months = [];

  // Inicializar los últimos 12 meses (incluyendo el mes actual)
  for (var i = 11; i >= 0; i--) {
    var d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    var key = d.getFullYear() + '-' + d.getMonth();
    totals[key] = 0;
    months.push({ year: d.getFullYear(), month: d.getMonth(), key: key });
  }

  var grandTotal = 0;

  expenses.forEach(function(expense) {
    var expenseDate = new Date(expense.date);
    var monthsDiff = (now.getFullYear() - expenseDate.getFullYear()) * 12 + (now.getMonth() - expenseDate.getMonth());
    if (monthsDiff >= 0 && monthsDiff < 12) {
      var key = expenseDate.getFullYear() + '-' + expenseDate.getMonth();
      if (totals[key] === undefined) {
        totals[key] = 0;
      }
      totals[key] += expense.amount;
      grandTotal += expense.amount;
    }
  });

  if (grandTotal === 0) {
    return '📊 Reporte anual (últimos 12 meses)\n\nNo se registraron gastos en los últimos 12 meses.';
  }

  var report = '📊 Reporte anual (últimos 12 meses)\n\n';

  months.forEach(function(item) {
    var total = totals[item.key] || 0;
    var montoFormateado = new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'ARS',
      currencyDisplay: 'symbol',
      minimumFractionDigits: 2
    }).format(total);
    report += getNombreMes(item.month) + ' ' + item.year + ': ' + montoFormateado + '\n';
  });

  var totalFormateado = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'ARS',
    currencyDisplay: 'symbol',
    minimumFractionDigits: 2
  }).format(grandTotal);

  report += '\n💰 Total últimos 12 meses: ' + totalFormateado;
  return report;
}

/**
 * Genera un reporte anual para un usuario específico, mostrando el total por mes de los últimos 12 meses.
 */
function reporteAnualUsuarioUltimos12Meses(sheetName, userDisplayName) {
  var sheet = getSpreadsheet(sheetName);
  var rows = sheet.getDataRange().getValues();
  var now = new Date();
  var totals = {};
  var months = [];

  // Inicializar los últimos 12 meses (incluyendo mes actual)
  for (var i = 11; i >= 0; i--) {
    var d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    var key = d.getFullYear() + '-' + d.getMonth();
    totals[key] = 0;
    months.push({ year: d.getFullYear(), month: d.getMonth(), key: key });
  }

  var grandTotal = 0;
  var count = 0;

  // Iterar filas y filtrar por usuario
  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    var date = new Date(row[0]);
    var amount = parseFloat(row[1]) || 0;
    var user = row[4] || '';

    if (user !== userDisplayName) continue;

    var monthsDiff = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
    if (monthsDiff < 0 || monthsDiff >= 12) continue;

    var key = date.getFullYear() + '-' + date.getMonth();
    if (totals[key] === undefined) {
      totals[key] = 0;
    }
    totals[key] += amount;
    grandTotal += amount;
    count++;
  }

  if (count === 0) {
    return '📊 Tu reporte anual (últimos 12 meses)\n\nNo tienes gastos registrados en los últimos 12 meses.';
  }

  var report = '📊 Tu reporte anual (últimos 12 meses)\n\n';

  months.forEach(function(item) {
    var total = totals[item.key] || 0;
    var montoFormateado = new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'ARS',
      currencyDisplay: 'symbol',
      minimumFractionDigits: 2
    }).format(total);
    report += getNombreMes(item.month) + ' ' + item.year + ': ' + montoFormateado + '\n';
  });

  var totalFormateado = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'ARS',
    currencyDisplay: 'symbol',
    minimumFractionDigits: 2
  }).format(grandTotal);

  report += '\n💰 Total últimos 12 meses: ' + totalFormateado;
  return report;
}
