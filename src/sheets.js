function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"' && quoted && text[index + 1] === '"') {
      value += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(value);
      value = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(value);
      if (row.some((cell) => cell !== "")) rows.push(row);
      row = [];
      value = "";
    } else {
      value += character;
    }
  }

  row.push(value);
  if (row.some((cell) => cell !== "")) rows.push(row);
  return rows;
}

async function readPublicRows(sheetId, tab) {
  const url = new URL(`https://docs.google.com/spreadsheets/d/${encodeURIComponent(sheetId)}/gviz/tq`);
  url.searchParams.set("tqx", "out:csv");
  url.searchParams.set("sheet", tab);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Google Sheets inaccessible (${response.status}). Rend le tableau accessible via le lien.`);
  }

  const rows = parseCsv(await response.text());
  if (!rows.length) return [];
  const normalized = (value) => String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  const headerIndex = rows.findIndex((row) =>
    row.some((value) => normalized(value) === "type") &&
    row.some((value) => normalized(value) === "date")
  );
  const hasHeaders = headerIndex >= 0;
  const resolvedHeaderIndex = hasHeaders ? headerIndex : 0;
  const headers = hasHeaders
    ? rows[headerIndex].map(normalized)
    : ["id", "type", "matiere", "titre", "a faire", "date", "statut", "rappel devoir", "rappel examen"];
  const column = (name) => headers.findIndex((header) => header === normalized(name));
  const idColumn = column("id");
  const typeColumn = column("type");
  const subjectColumn = column("matiere");
  const titleColumn = column("titre");
  const instructionsColumn = column("a faire");
  const dateColumn = column("date");
  const statusColumn = column("statut");

  return rows.slice(resolvedHeaderIndex + 1)
    .map((row, index) => ({
      rowNumber: resolvedHeaderIndex + index + 2,
      id: row[idColumn]?.trim() || `ligne-${resolvedHeaderIndex + index + 2}`,
      type: row[typeColumn]?.trim() || "",
      subject: row[subjectColumn]?.trim() || "",
      title: row[titleColumn]?.trim() || "",
      instructions: row[instructionsColumn]?.trim() || "",
      date: row[dateColumn]?.trim() || "",
      status: row[statusColumn]?.trim() || "",
      homeworkReminder: "",
      examReminder: ""
    }))
    .filter((row) => row.type || row.title);
}

module.exports = { parseCsv, readPublicRows };
