const { Client, GatewayIntentBits, Collection, REST, Routes, PermissionFlagsBits } = require('discord.js');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

// Configurazione da variabili d'ambiente
const TOKEN = process.env.TOKEN;
const GUILD_ID = process.env.GUILD_ID;

if (!TOKEN || !GUILD_ID) {
  console.error('Errore: TOKEN e GUILD_ID sono richiesti!');
  console.error('Imposta le variabili d\'ambiente TOKEN e GUILD_ID');
  process.exit(1);
}

// File per salvare le schedules (persistente)
const schedulesPath = path.join(__dirname, '..', 'schedules.json');

// Carica o inizializza schedules
let schedules = [];
if (fs.existsSync(schedulesPath)) {
  try {
    schedules = JSON.parse(fs.readFileSync(schedulesPath, 'utf8'));
  } catch (e) {
    console.log('Creazione nuovo file schedules.json');
    schedules = [];
  }
}

// Oggetto config per compatibilità con i comandi
const config = {
  token: TOKEN,
  guildId: GUILD_ID,
  schedules: schedules
};

// Inizializza client Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ]
});

// Collection per i comandi
client.commands = new Collection();

// Carica comandi
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  }
}

// Mappa per tenere traccia dei job cron attivi
const cronJobs = new Map();

// Funzione per salvare le schedules
function saveConfig() {
  fs.writeFileSync(schedulesPath, JSON.stringify(config.schedules, null, 2));
}

// Funzione per ricaricare le schedules
function reloadConfig() {
  if (fs.existsSync(schedulesPath)) {
    config.schedules = JSON.parse(fs.readFileSync(schedulesPath, 'utf8'));
  }
  return config;
}

// Funzione per modificare i permessi del canale
async function setChannelPermission(channelId, roleId, allow, options = {}) {
  const { sendMessage = true, customOpenMessage = null, customCloseMessage = null } = options;

  try {
    const guild = client.guilds.cache.get(config.guildId);
    if (!guild) {
      console.error(`Guild ${config.guildId} non trovata`);
      return false;
    }

    const channel = guild.channels.cache.get(channelId);
    if (!channel) {
      console.error(`Canale ${channelId} non trovato`);
      return false;
    }

    const role = guild.roles.cache.get(roleId);
    if (!role) {
      console.error(`Ruolo ${roleId} non trovato`);
      return false;
    }

    await channel.permissionOverwrites.edit(role, {
      SendMessages: allow
    });

    const action = allow ? 'ABILITATO' : 'DISABILITATO';
    console.log(`[${new Date().toISOString()}] ${action} invio messaggi per ruolo "${role.name}" nel canale "#${channel.name}"`);

    // Invia messaggio nel canale
    if (sendMessage) {
      let message;

      if (allow && customOpenMessage) {
        message = customOpenMessage.replace('{ruolo}', `${role}`);
      } else if (!allow && customCloseMessage) {
        message = customCloseMessage.replace('{ruolo}', `${role}`);
      } else {
        const emoji = allow ? '🔓' : '🔒';
        message = allow
          ? `${emoji} **Il canale è ora aperto!** I ${role} possono scrivere.`
          : `${emoji} **Il canale è ora chiuso.** I ${role} non possono più scrivere.`;
      }

      await channel.send(message);
    }

    return true;
  } catch (error) {
    console.error('Errore nel modificare i permessi:', error);
    return false;
  }
}

// Funzione per avviare tutti i job di scheduling
function startScheduler() {
  // Ferma tutti i job esistenti
  cronJobs.forEach((jobs, scheduleId) => {
    jobs.forEach(job => job.stop());
  });
  cronJobs.clear();

  // Avvia i nuovi job
  for (const schedule of config.schedules) {
    if (!schedule.enabled) continue;

    const jobs = [];
    for (const rule of schedule.rules) {
      if (!cron.validate(rule.cron)) {
        console.error(`Cron expression non valida per schedule ${schedule.id}: ${rule.cron}`);
        continue;
      }

      const job = cron.schedule(rule.cron, async () => {
        const allow = rule.action === 'allow';
        console.log(`[SCHEDULER] Esecuzione regola: ${rule.description || rule.action}`);
        await setChannelPermission(schedule.channelId, schedule.roleId, allow, {
          sendMessage: true,
          customOpenMessage: schedule.openMessage,
          customCloseMessage: schedule.closeMessage
        });
      }, {
        timezone: 'Europe/Rome'
      });

      jobs.push(job);
      console.log(`[SCHEDULER] Registrata regola: ${rule.description || rule.cron} (${rule.action})`);
    }

    cronJobs.set(schedule.id, jobs);
  }

  console.log(`[SCHEDULER] Avviato con ${config.schedules.length} schedule configurate`);
}

// Gestione comandi slash
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, { config, saveConfig, reloadConfig, startScheduler, setChannelPermission });
  } catch (error) {
    console.error(error);
    const reply = { content: 'Si è verificato un errore durante l\'esecuzione del comando.', ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply);
    } else {
      await interaction.reply(reply);
    }
  }
});

// Quando il bot è pronto
client.once('ready', async () => {
  console.log(`Bot connesso come ${client.user.tag}`);

  // Registra i comandi slash
  const commands = [];
  client.commands.forEach(command => {
    commands.push(command.data.toJSON());
  });

  const rest = new REST().setToken(config.token);

  try {
    console.log('Registrazione comandi slash...');
    await rest.put(
      Routes.applicationGuildCommands(client.user.id, config.guildId),
      { body: commands }
    );
    console.log('Comandi slash registrati con successo!');
  } catch (error) {
    console.error('Errore nella registrazione dei comandi:', error);
  }

  // Avvia lo scheduler
  startScheduler();
});

// Login
client.login(config.token);

// Esporta per uso nei comandi
module.exports = { client, config };
