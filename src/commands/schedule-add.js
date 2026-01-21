const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('schedule-add')
    .setDescription('Aggiunge una nuova regola di scheduling')
    .addChannelOption(option =>
      option.setName('canale')
        .setDescription('Il canale da schedulare')
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
    .addStringOption(option =>
      option.setName('orario')
        .setDescription('Orario in formato HH:MM (es: 22:00)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('giorni')
        .setDescription('Giorni della settimana (es: 1-5 per lun-ven, * per tutti)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('descrizione')
        .setDescription('Descrizione della regola')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, { config, saveConfig, startScheduler }) {
    const channel = interaction.options.getChannel('canale');
    const role = interaction.options.getRole('ruolo');
    const action = interaction.options.getString('azione');
    const orario = interaction.options.getString('orario');
    const giorni = interaction.options.getString('giorni') || '*';
    const descrizione = interaction.options.getString('descrizione') || `${action === 'allow' ? 'Sblocca' : 'Blocca'} alle ${orario}`;

    // Valida formato orario
    const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
    const match = orario.match(timeRegex);
    if (!match) {
      return interaction.reply({
        content: 'Formato orario non valido. Usa HH:MM (es: 22:00)',
        ephemeral: true
      });
    }

    const [_, ore, minuti] = match;
    const cronExpression = `${parseInt(minuti)} ${parseInt(ore)} * * ${giorni}`;

    // Cerca o crea schedule per questa combinazione canale/ruolo
    let schedule = config.schedules.find(
      s => s.channelId === channel.id && s.roleId === role.id
    );

    if (!schedule) {
      schedule = {
        id: `${channel.id}-${role.id}`,
        channelId: channel.id,
        roleId: role.id,
        enabled: true,
        rules: []
      };
      config.schedules.push(schedule);
    }

    // Aggiungi la nuova regola
    schedule.rules.push({
      action,
      cron: cronExpression,
      description: descrizione
    });

    saveConfig();
    startScheduler();

    await interaction.reply({
      content: `Regola aggiunta!\n` +
        `**Canale:** #${channel.name}\n` +
        `**Ruolo:** @${role.name}\n` +
        `**Azione:** ${action === 'allow' ? 'Sblocca' : 'Blocca'}\n` +
        `**Orario:** ${orario}\n` +
        `**Giorni:** ${giorni === '*' ? 'Tutti' : giorni}\n` +
        `**Cron:** \`${cronExpression}\``,
      ephemeral: true
    });
  }
};
