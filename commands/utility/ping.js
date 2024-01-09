const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('ぽんぽんぽん！！'),
  async execute(interaction) {
    await interaction.reply('Pong!');
  },
};