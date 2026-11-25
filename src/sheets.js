const { google } = require("googleapis");

const headers = [
  "ID",
  "Type",
  "Matiere",
  "Titre",
  "A faire",
  "Date",
  "Statut",
  "Rappel devoir",
  "Rappel examen"
];

async function createSheetsClient(credentialsPath) {
  const auth = new google.auth.GoogleAuth({
    keyFile: credentialsPath,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });
  return google.sheets({ version: "v4", auth });
}

async function ensureHeader(sheets, sheetId, tab) {
  const range = `${tab}!A1:I1`;
  const response = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range });
  const existing = response.data.values?.[0] ?? [];

  if (existing.length !== headers.length || headers.some((name, index) => existing[index] !== name)) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range,
      valueInputOption: "RAW",
      requestBody: { values: [headers] }
    });
  }
}

async function readRows(sheets, sheetId, tab) {
  await ensureHeader(sheets, sheetId, tab);
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${tab}!A2:I`
  });

  const rows = response.data.values ?? [];
  return rows
    .map((row, index) => ({
      rowNumber: index + 2,
      id: row[0]?.trim() || `ligne-${index + 2}`,
      type: row[1]?.trim() || "",
      subject: row[2]?.trim() || "",
      title: row[3]?.trim() || "",
      instructions: row[4]?.trim() || "",
      date: row[5]?.trim() || "",
      status: row[6]?.trim() || "",
      homeworkReminder: row[7]?.trim() || "",
      examReminder: row[8]?.trim() || ""
    }))
    .filter((row) => row.type || row.title);
}

async function markReminder(sheets, sheetId, tab, rowNumber, column, value) {
  const columnLetter = column === "homeworkReminder" ? "H" : "I";
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `${tab}!${columnLetter}${rowNumber}`,
    valueInputOption: "RAW",
    requestBody: { values: [[value]] }
  });
}

module.exports = { createSheetsClient, readRows, markReminder };
