require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");
const { createSheetsClient, readRows, markReminder } = require("./sheets");
const { reminderFor, buildEmbed } = require("./reminders");

const required = [
  "DISCORD_TOKEN",
  "DISCORD_CHANNEL_ID",
  "GOOGLE_SHEET_ID",
  "GOOGLE_APPLICATION_CREDENTIALS"
];

const missing = required.filter((name) => !process.env[name]);
if (missing.length) {
  throw new Error(`Variables manquantes dans .env: ${missing.join(", ")}`);
}

const config = {
  channelId: process.env.DISCORD_CHANNEL_ID,
  sheetId: process.env.GOOGLE_SHEET_ID,
  tab: process.env.GOOGLE_SHEET_TAB || "Planning",
  roleId: process.env.PING_ROLE_ID || "",
  timeZone: process.env.TIMEZONE || "Europe/Paris",
  intervalMinutes: Math.max(1, Number(process.env.CHECK_INTERVAL_MINUTES || 15))
};

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

let running = false;

async function checkReminders(sheets) {
  if (running) return;
  running = true;

  try {
    const channel = await client.channels.fetch(config.channelId);
    if (!channel?.isTextBased()) throw new Error("Le canal Discord configure n'est pas valide.");

    const rows = await readRows(sheets, config.sheetId, config.tab);
    const now = new Date();

    for (const row of rows) {
      const kind = reminderFor(row, now, config.timeZone);
      if (!kind) continue;

      const ping = config.roleId ? `<@&${config.roleId}>` : "@everyone";
      await channel.send({
        content: ping,
        embeds: [buildEmbed(row, kind)],
        allowedMentions: config.roleId
          ? { roles: [config.roleId] }
          : { parse: ["everyone"] }
      });

      const column = kind === "exam" ? "examReminder" : "homeworkReminder";
      await markReminder(sheets, config.sheetId, config.tab, row.rowNumber, column, now.toISOString());
      console.log(`Rappel envoye pour "${row.title}" (ligne ${row.rowNumber})`);
    }
  } catch (error) {
    console.error("Erreur lors de la verification:", error.message);
  } finally {
    running = false;
  }
}

client.once("ready", async () => {
  console.log(`Connecte a Discord sous le nom ${client.user.tag}`);
  const sheets = await createSheetsClient(process.env.GOOGLE_APPLICATION_CREDENTIALS);

  await checkReminders(sheets);
  setInterval(() => checkReminders(sheets), config.intervalMinutes * 60 * 1000);
});

client.on("error", (error) => console.error("Erreur Discord:", error));

client.login(process.env.DISCORD_TOKEN).catch((error) => {
  console.error("Impossible de se connecter a Discord:", error.message);
  process.exit(1);
});
