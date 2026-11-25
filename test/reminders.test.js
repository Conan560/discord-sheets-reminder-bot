const test = require("node:test");
const assert = require("node:assert/strict");
const { reminderFor } = require("../src/reminders");

const base = {
  type: "Devoir",
  status: "",
  homeworkReminder: "",
  examReminder: ""
};

test("homework reminder is sent exactly two days before", () => {
  assert.equal(reminderFor({ ...base, date: "2026-12-02" }, new Date("2026-11-30T12:00:00Z"), "Europe/Paris"), "homework");
  assert.equal(reminderFor({ ...base, date: "2026-12-03" }, new Date("2026-11-30T12:00:00Z"), "Europe/Paris"), null);
});

test("exam reminder is sent exactly seven days before", () => {
  assert.equal(reminderFor({ ...base, type: "Examen", date: "2026-12-02" }, new Date("2026-11-25T12:00:00Z"), "Europe/Paris"), "exam");
});

test("reminders are not duplicated or sent for finished items", () => {
  assert.equal(reminderFor({ ...base, date: "2026-12-02", homeworkReminder: "envoye" }, new Date("2026-11-30T12:00:00Z"), "Europe/Paris"), null);
  assert.equal(reminderFor({ ...base, date: "2026-12-02", status: "Rendu" }, new Date("2026-11-30T12:00:00Z"), "Europe/Paris"), null);
});
