const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('permission-now')
    .setDescription('Modifica immediatamente i permessi di invio messaggi')
    .addChannelOption(option =>
      option.setName('canale')
        .setDescription('Il canale da modificare')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('ruolo')
        .setDescription('Il ruolo da gestire')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('azione')
        .setDescription('Azione da eseguire')
        .setRequired(true)
        .addChoices(
          { name: 'Blocca (deny)', value: 'deny' },
          { name: 'Sblocca (allow)', value: 'allow' }
        ))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, { setChannelPermission }) {
    const channel = interaction.options.getChannel('canale');
    const role = interaction.options.getRole('ruolo');
    const action = interaction.options.getString('azione');

    await interaction.deferReply({ ephemeral: true });

    const allow = action === 'allow';
    const success = await setChannelPermission(channel.id, role.id, allow);

    if (success) {
      await interaction.editReply({
        content: `Permessi modificati!\n` +
          `**Canale:** #${channel.name}\n` +
          `**Ruolo:** @${role.name}\n` +
          `**Invio messaggi:** ${allow ? 'ABILITATO' : 'DISABILITATO'}`
      });
    } else {
      await interaction.editReply({
        content: 'Errore nel modificare i permessi. Controlla i log del bot.'
      });
    }
  }
};
