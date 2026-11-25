const test = require("node:test");
const assert = require("node:assert/strict");
const { daysUntil, parseSheetDate } = require("../src/date");

test("parse Sheet date formats", () => {
  assert.deepEqual(parseSheetDate("2026-12-02"), { year: 2026, month: 12, day: 2 });
  assert.deepEqual(parseSheetDate("02/12/2026"), { year: 2026, month: 12, day: 2 });
  assert.equal(parseSheetDate(""), null);
});

test("calculates two days before in Paris timezone", () => {
  const now = new Date("2026-11-30T12:00:00Z");
  assert.equal(daysUntil("2026-12-02", now, "Europe/Paris"), 2);
});

test("calculates seven days before", () => {
  const now = new Date("2026-11-25T12:00:00Z");
  assert.equal(daysUntil("02/12/2026", now, "Europe/Paris"), 7);
});

test("reads European dot date format", () => {
  const now = new Date("2026-11-23T12:00:00Z");
  assert.equal(daysUntil("25.11.2026", now, "Europe/Paris"), 2);
});
