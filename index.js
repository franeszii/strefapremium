const {
    Client,
    GatewayIntentBits,
    SlashCommandBuilder,
    REST,
    Routes,
    PermissionsBitField,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const settings = require('./settings.json');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

client.once('ready', async () => {
    console.log(`Zalogowano jako ${client.user.tag}`);

    const commands = [
        new SlashCommandBuilder()
            .setName('wyslij-panel')
            .setDescription('Wysyła panel premium')
            .toJSON()
    ];

    const rest = new REST({ version: '10' }).setToken(settings.token);

    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );

        console.log('Komendy slash zostały zarejestrowane.');
    } catch (err) {
        console.error(err);
    }
});

client.on('interactionCreate', async interaction => {

    if (interaction.isChatInputCommand()) {

        if (interaction.commandName === 'wyslij-panel') {

            if (!interaction.member.roles.cache.has(settings.panelRoleId)) {
                return interaction.reply({
                    content: '❌ Nie masz permisji do tej komendy!',
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('🎉 STREFA PREMIUM')
                .setDescription(
                    'Aby odebrać strefę premium musisz zaprosić **5 osób** na serwer i muszą one dołączyć.\n\nGdy już spełnisz wymagania kliknij zielony przycisk poniżej.'
                );

            const button = new ButtonBuilder()
                .setCustomId('odbierz_premium')
                .setLabel('Odbierz premium')
                .setStyle(ButtonStyle.Success);

            const row = new ActionRowBuilder().addComponents(button);

            await interaction.channel.send({
                embeds: [embed],
                components: [row]
            });

            await interaction.reply({
                content: '✅ Panel został wysłany!',
                ephemeral: true
            });
        }
    }

    if (interaction.isButton()) {

        if (interaction.customId === 'odbierz_premium') {

            const role = interaction.guild.roles.cache.get(settings.premiumRoleId);

            if (!role) {
                return interaction.reply({
                    content: '❌ Nie znaleziono roli premium.',
                    ephemeral: true
                });
            }

            if (interaction.member.roles.cache.has(settings.premiumRoleId)) {
                return interaction.reply({
                    content: '❌ Masz już premium.',
                    ephemeral: true
                });
            }

            await interaction.member.roles.add(role);

            await interaction.reply({
                content: '✅ Otrzymałeś rangę premium!',
                ephemeral: true
            });
        }
    }
});

client.login(settings.token);
