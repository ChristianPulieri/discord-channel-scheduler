const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('schedule-remove')
    .setDescription('Rimuove una schedulazione o una regola specifica')
    .addChannelOption(option =>
      option.setName('canale')
        .setDescription('Il canale della schedulazione')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('ruolo')
        .setDescription('Il ruolo della schedulazione')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('regola')
        .setDescription('Numero della regola da rimuovere (lascia vuoto per rimuovere tutto)')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, { config, saveConfig, startScheduler }) {
    const channel = interaction.options.getChannel('canale');
    const role = interaction.options.getRole('ruolo');
    const ruleIndex = interaction.options.getInteger('regola');

    const scheduleIndex = config.schedules.findIndex(
      s => s.channelId === channel.id && s.roleId === role.id
    );

    if (scheduleIndex === -1) {
      return interaction.reply({
        content: `Nessuna schedulazione trovata per #${channel.name} e @${role.name}`,
        ephemeral: true
      });
    }

    if (ruleIndex !== null) {
      // Rimuovi solo la regola specificata
      const schedule = config.schedules[scheduleIndex];
      if (ruleIndex < 1 || ruleIndex > schedule.rules.length) {
        return interaction.reply({
          content: `Numero regola non valido. Le regole vanno da 1 a ${schedule.rules.length}`,
          ephemeral: true
        });
      }

      const removed = schedule.rules.splice(ruleIndex - 1, 1)[0];

      // Se non ci sono più regole, rimuovi l'intera schedule
      if (schedule.rules.length === 0) {
        config.schedules.splice(scheduleIndex, 1);
      }

      saveConfig();
      startScheduler();

      return interaction.reply({
        content: `Regola rimossa: ${removed.description || removed.cron}`,
        ephemeral: true
      });
    }

    // Rimuovi l'intera schedulazione
    config.schedules.splice(scheduleIndex, 1);
    saveConfig();
    startScheduler();

    await interaction.reply({
      content: `Schedulazione rimossa per #${channel.name} e @${role.name}`,
      ephemeral: true
    });
  }
};
