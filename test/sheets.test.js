const test = require("node:test");
const assert = require("node:assert/strict");
const { parseCsv } = require("../src/sheets");

test("parses quoted CSV values and new rows", () => {
  const csv = 'ID,Type,Titre\r\n1,Devoir,"Lire ""les pages"", puis travailler"\r\n';
  assert.deepEqual(parseCsv(csv), [
    ["ID", "Type", "Titre"],
    ["1", "Devoir", 'Lire "les pages", puis travailler']
  ]);
});
