const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('コード配信')
    .setDescription('コードを送信します')
    .addStringOption(option =>
      option.setName('game')
        .setDescription('ゲームを選択')
        .setRequired(true)
        .addChoices(
          { name: '原神', value: 'gs' },
          { name: 'スタレ', value: 'hsr' },
        )
    ) 
    .addStringOption(option =>
      option.setName('inputcode')
        .setDescription('コード')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('deadline')
        .setDescription('入力期限')
    ),
  async execute(interaction) {
  await interaction.reply(`${gamename}:${inputcode}を送信しました`);
  },
};