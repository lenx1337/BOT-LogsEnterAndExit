require('dotenv').config();

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  SlashCommandBuilder,
  REST,
  Routes,
} = require('discord.js');

// Initialize Discord client with necessary intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

// Load environment variables
const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const JOIN_CHANNEL_ID = process.env.MEMBER_JOIN_CHANNEL;
const LEAVE_CHANNEL_ID = process.env.MEMBER_LEAVE_CHANNEL;

// Ensure all environment variables are set
if (!TOKEN || !GUILD_ID || !JOIN_CHANNEL_ID || !LEAVE_CHANNEL_ID) {
  console.error(
    '❌ Missing environment variables. Please check your .env file.'
  );
  process.exit(1);
}

// Bot is ready
client.once('ready', async () => {
  console.log(`✅ Bot is online as ${client.user.tag}`);

  // Register slash commands
  const commands = [
    new SlashCommandBuilder()
      .setName('ping')
      .setDescription('Responde com Pong!'),
  ].map((command) => command.toJSON());

  const rest = new REST({ version: '10' }).setToken(TOKEN);
  try {
    console.log('🔄 Registrando comandos de barra...');
    await rest.put(Routes.applicationGuildCommands(client.user.id, GUILD_ID), {
      body: commands,
    });
    console.log('✅ Comandos registrados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao registrar comandos:', error);
  }
});

// Event: Handle slash commands
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'ping') {
    await interaction.reply('🏓 Pong!');
  }
});

// Event: Member joins the server
client.on('guildMemberAdd', async (member) => {
  try {
    const channel = member.guild.channels.cache.get(JOIN_CHANNEL_ID);
    if (!channel) return console.warn('⚠️ Join log channel not found.');

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('👋 Novo Membro!')
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setDescription(
        `Bem-vindo(a) ${member} ao servidor **${member.guild.name}**! 🎉`
      )
      .addFields(
        {
          name: 'Usuário',
          value: `${member.user.tag} (${member.id})`,
          inline: true,
        },
        {
          name: 'Entrou em',
          value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
          inline: true,
        }
      )
      .setFooter({
        text: 'Ficamos felizes em ter você aqui!',
        iconURL: member.guild.iconURL(),
      });

    await channel.send({ content: `${member}`, embeds: [embed] });
  } catch (error) {
    console.error('❌ Error handling member join event:', error);
  }
});

// Event: Member leaves the server
client.on('guildMemberRemove', async (member) => {
  try {
    const channel = member.guild.channels.cache.get(LEAVE_CHANNEL_ID);
    if (!channel) return console.warn('⚠️ Leave log channel not found.');

    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle('😢 Membro Saiu')
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setDescription(`**${member.user.username}** saiu do servidor.`)
      .addFields(
        {
          name: 'Usuário',
          value: `${member.user.tag} (${member.id})`,
          inline: true,
        },
        {
          name: 'Saiu em',
          value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
          inline: true,
        }
      )
      .setFooter({
        text: 'Sentiremos sua falta!',
        iconURL: member.guild.iconURL(),
      });

    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('❌ Error handling member leave event:', error);
  }
});

// Login bot using token from .env
client.login(TOKEN).catch((err) => {
  console.error('❌ Failed to log in:', err);
});
