require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");
const { readPublicRows } = require("./sheets");
const { reminderFor, buildEmbed } = require("./reminders");
const { loadSentReminderState, saveSentReminderState } = require("./state");

const required = [
  "DISCORD_TOKEN",
  "DISCORD_CHANNEL_ID",
  "GOOGLE_SHEET_ID"
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
  intervalMinutes: Math.max(1, Number(process.env.CHECK_INTERVAL_MINUTES || 15)),
  stateFile: process.env.REMINDER_STATE_FILE || "./data/reminders.json"
};

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

let running = false;
const sentReminders = loadSentReminderState(config.stateFile);

async function checkReminders() {
  if (running) return;
  running = true;

  try {
    const channel = await client.channels.fetch(config.channelId);
    if (!channel?.isTextBased()) throw new Error("Le canal Discord configure n'est pas valide.");

    const rows = await readPublicRows(config.sheetId, config.tab);
    const now = new Date();

    for (const row of rows) {
      const reminderKey = `${row.id}-${row.date}`;
      const kind = reminderFor(row, now, config.timeZone);
      if (!kind) continue;
      if (sentReminders[`${reminderKey}-${kind}`]) continue;
      const ping = config.roleId ? `<@&${config.roleId}>` : "@everyone";
      await channel.send({
        content: ping,
        embeds: [buildEmbed(row, kind)],
        allowedMentions: config.roleId
          ? { roles: [config.roleId] }
          : { parse: ["everyone"] }
      });

      sentReminders[`${reminderKey}-${kind}`] = now.toISOString();
      saveSentReminderState(config.stateFile, sentReminders);
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
  await checkReminders();
  setInterval(() => checkReminders(), config.intervalMinutes * 60 * 1000);
});

client.on("error", (error) => console.error("Erreur Discord:", error));

client.login(process.env.DISCORD_TOKEN).catch((error) => {
  console.error("Impossible de se connecter a Discord:", error.message);
  process.exit(1);
});
