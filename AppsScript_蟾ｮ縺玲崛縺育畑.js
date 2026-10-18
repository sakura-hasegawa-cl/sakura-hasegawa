const SHEET_NAME = 'シート1';
function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const rows = sheet.getDataRange().getDisplayValues();
  const headers = rows.shift().map(s => s.trim());
  const concerts = rows.filter(row => row.some(s => s.trim())).map(row => {
    const x = {};
    headers.forEach((h, i) => x[h] = row[i] || '');
    return x;
  }).filter(x => x['公演日'] && x['公演名'] && x['公開状態'].trim() !== '非公開')
    .map(x => ({
      date: x['公演日'], title: x['公演名'], time: x['開演時間'],
      venue: x['会場'], venueUrl: validUrl(x['会場URL']),
      performers: x['出演者'], description: x['公演詳細'],
      price: x['料金'], image: validUrl(x['チラシ画像URL']),
      url: validUrl(x['予約URL'])
    }));
  const callback = String((e && e.parameter && e.parameter.callback) || '');
  const json = JSON.stringify(concerts).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  if (/^[A-Za-z_$][\w$]*$/.test(callback)) {
    return ContentService.createTextOutput(callback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}
function validUrl(value) {
  const s = String(value || '').trim();
  return /^https:\/\/[^\s]+$/i.test(s) ? s : '';
}
