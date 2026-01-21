const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('schedule-message')
    .setDescription('Imposta messaggi personalizzati per apertura/chiusura canale')
    .addChannelOption(option =>
      option.setName('canale')
        .setDescription('Il canale della schedulazione')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('ruolo')
        .setDescription('Il ruolo della schedulazione')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('messaggio_apertura')
        .setDescription('Messaggio quando il canale si apre (usa {ruolo} per menzionare il ruolo)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('messaggio_chiusura')
        .setDescription('Messaggio quando il canale si chiude (usa {ruolo} per menzionare il ruolo)')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, { config, saveConfig }) {
    const channel = interaction.options.getChannel('canale');
    const role = interaction.options.getRole('ruolo');
    const openMessage = interaction.options.getString('messaggio_apertura');
    const closeMessage = interaction.options.getString('messaggio_chiusura');

    if (!openMessage && !closeMessage) {
      return interaction.reply({
        content: 'Devi specificare almeno un messaggio (apertura o chiusura).',
        ephemeral: true
      });
    }

    // Trova la schedule esistente
    let schedule = config.schedules.find(
      s => s.channelId === channel.id && s.roleId === role.id
    );

    if (!schedule) {
      // Crea una nuova schedule se non esiste
      schedule = {
        id: `${channel.id}-${role.id}`,
        channelId: channel.id,
        roleId: role.id,
        enabled: true,
        rules: [],
        openMessage: null,
        closeMessage: null
      };
      config.schedules.push(schedule);
    }

    // Aggiorna i messaggi
    if (openMessage) {
      schedule.openMessage = openMessage;
    }
    if (closeMessage) {
      schedule.closeMessage = closeMessage;
    }

    saveConfig();

    await interaction.reply({
      content: `Messaggi aggiornati per #${channel.name} / @${role.name}!\n` +
        `**Apertura:** ${schedule.openMessage || '(default)'}\n` +
        `**Chiusura:** ${schedule.closeMessage || '(default)'}`,
      ephemeral: true
    });
  }
};
