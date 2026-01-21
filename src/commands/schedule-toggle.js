const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('schedule-toggle')
    .setDescription('Abilita o disabilita una schedulazione')
    .addChannelOption(option =>
      option.setName('canale')
        .setDescription('Il canale della schedulazione')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('ruolo')
        .setDescription('Il ruolo della schedulazione')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, { config, saveConfig, startScheduler }) {
    const channel = interaction.options.getChannel('canale');
    const role = interaction.options.getRole('ruolo');

    const schedule = config.schedules.find(
      s => s.channelId === channel.id && s.roleId === role.id
    );

    if (!schedule) {
      return interaction.reply({
        content: `Nessuna schedulazione trovata per #${channel.name} e @${role.name}`,
        ephemeral: true
      });
    }

    schedule.enabled = !schedule.enabled;
    saveConfig();
    startScheduler();

    await interaction.reply({
      content: `Schedulazione per #${channel.name} e @${role.name} ora è **${schedule.enabled ? 'ATTIVA' : 'DISATTIVA'}**`,
      ephemeral: true
    });
  }
};
