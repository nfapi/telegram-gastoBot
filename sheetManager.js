const SHEET_ID = '1mQT2lRmqR5C_44w09briJXXRk2mdbOJMx5JxRVz_mRo';

function logOnSheet(rawContents){
  var ss = SpreadsheetApp.openById(SHEET_ID)
  var logSheet = ss.getSheetByName("Logs") || ss.insertSheet("Logs");
  logSheet.appendRow([new Date(), rawContents]);
}

function getSpreadsheet(sheetName) {
  var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(sheetName);
  if (sheet == null){
    sheet = SpreadsheetApp.openById(SHEET_ID).insertSheet();
    sheet.setName(sheetName);
    sheet.appendRow(['Date', 'Amount', 'Category', 'Note'])
  }
  return sheet;
}

function addExpense(sheet, expense, msg){
  sheet.appendRow([expense.date, 
    expense.amount, 
    expense.category, 
    expense.note,
    msg.chat.type,
    msg.chat.title,
    msg.chat.username,
    msg.chat.first_name,
    msg.chat.last_name]);
    
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