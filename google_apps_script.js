
const TELEGRAM_TOKEN = '7552481968:AAF_xe49BOmd-tBdKSYiebAKyIokxyBwBkU';
const CHAT_ID = '30945887';
const STORES = ['Fano', 'Monsano', 'Osimo', 'Macerata', 'Civitanova', 'Pesaro'];
const SHEET_ID = '1jscOwTvJvJ7S6ceGvls13ecEhnB3KP4GyMtHJP4oEm0';

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const store = data.store;
  const sales = data.sales;
  const incidence = data.incidence;
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
  const values = sheet.getDataRange().getValues();

  let row = values.findIndex(r => r[0] === store);
  if (row === -1) {
    sheet.appendRow([store, sales, incidence]);
  } else {
    sheet.getRange(row + 1, 2).setValue(sales);
    sheet.getRange(row + 1, 3).setValue(incidence);
  }

  if (checkAllSubmitted(sheet)) {
    const summary = makeSummary(sheet);
    sendTelegramMessage(summary);
  }

  return ContentService.createTextOutput("Dati inviati");
}

function checkAllSubmitted(sheet) {
  const data = sheet.getDataRange().getValues();
  const submittedStores = data.map(r => r[0]);
  return STORES.every(s => submittedStores.includes(s));
}

function makeSummary(sheet) {
  const data = sheet.getDataRange().getValues();
  let msg = '*📊 Report Giornata - Dati Ricevuti da Tutti i PV*\n\n';
  for (let i = 1; i < data.length; i++) {
    const [store, sales, incidence] = data[i];
    msg += `🏬 *${store}*\nVenduto: €${sales} \nIncidenza: ${incidence}%\n\n`;
  }
  return msg;
}

function sendTelegramMessage(message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  const payload = {
    chat_id: CHAT_ID,
    text: message,
    parse_mode: 'Markdown'
  };
  UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  });
}
