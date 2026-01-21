const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('schedule-list')
    .setDescription('Mostra tutte le schedulazioni configurate')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, { config }) {
    if (config.schedules.length === 0) {
      return interaction.reply({
        content: 'Nessuna schedulazione configurata.',
        ephemeral: true
      });
    }

    const guild = interaction.guild;
    const embeds = [];

    for (const schedule of config.schedules) {
      const channel = guild.channels.cache.get(schedule.channelId);
      const role = guild.roles.cache.get(schedule.roleId);

      const embed = new EmbedBuilder()
        .setTitle(`Schedule: ${schedule.id}`)
        .setColor(schedule.enabled ? 0x00ff00 : 0xff0000)
        .addFields(
          { name: 'Canale', value: channel ? `#${channel.name}` : schedule.channelId, inline: true },
          { name: 'Ruolo', value: role ? `@${role.name}` : schedule.roleId, inline: true },
          { name: 'Stato', value: schedule.enabled ? 'Attivo' : 'Disattivo', inline: true }
        );

      if (schedule.rules.length > 0) {
        const rulesText = schedule.rules.map((rule, i) =>
          `${i + 1}. **${rule.action === 'allow' ? 'Sblocca' : 'Blocca'}** - \`${rule.cron}\`\n   ${rule.description || ''}`
        ).join('\n');
        embed.addFields({ name: 'Regole', value: rulesText });
      }

      embeds.push(embed);
    }

    await interaction.reply({
      embeds: embeds.slice(0, 10), // Discord limita a 10 embed per messaggio
      ephemeral: true
    });
  }
};
