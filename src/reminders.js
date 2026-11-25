const { EmbedBuilder } = require("discord.js");
const { daysUntil } = require("./date");

function normalized(value) {
  return String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function isFinished(row) {
  return ["rendu", "termine", "annule", "fait"].includes(normalized(row.status));
}

function reminderFor(row, now, timeZone) {
  if (isFinished(row)) return null;

  const remaining = daysUntil(row.date, now, timeZone);
  if (remaining === null || remaining < 0) return null;

  const type = normalized(row.type);
  if (type.startsWith("exam")) {
    if (remaining === 7 && !row.examReminder) return "exam";
  } else if (type.startsWith("devoir")) {
    if (remaining === 2 && !row.homeworkReminder) return "homework";
  }

  return null;
}

function buildEmbed(row, kind) {
  const isExam = kind === "exam";
  const embed = new EmbedBuilder()
    .setTitle(isExam ? "Examen dans une semaine" : "Devoir pour dans 2 jours")
    .setColor(isExam ? 0xE67E22 : 0x5865F2)
    .addFields(
      { name: "Type", value: row.type || "-", inline: true },
      { name: "Matiere", value: row.subject || "-", inline: true },
      { name: "Pour le", value: row.date || "-", inline: true },
      { name: "Titre", value: row.title || "-", inline: false }
    );

  if (row.instructions) embed.addFields({ name: "A faire", value: row.instructions, inline: false });
  return embed;
}

module.exports = { reminderFor, buildEmbed };
