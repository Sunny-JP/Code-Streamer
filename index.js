// 必要なクラスを要求
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, ActivityType, EmbedBuilder } = require('discord.js');
const { token } = require('./config.js');

// GASからの受信(botの常時起動)
//const http = require('http');
//http.createServer(function(request, response)
//{
//  response.writeHead(200, {'Content-Type': 'text/plain'});
//  response.end('Bot is online!');
//}).listen(8080);

// コマンドから取得した値を用いてembed用変数を生成する関数
function changeVariable(gameValue) {
    if (gameValue === 'gs') {
        gamename = '原神';
        gameUrl = 'https://genshin.hoyoverse.com/ja/gift?code=';
        embeddescription = 'オイラからの贈り物だぞ！';
        embedcolor = 0xfff2e1;
        gameIconUrl = 'https://lh3.googleusercontent.com/pw/ADCreHeFw3xtVLCgF1Dvpi6EDQQB3XWlcDECbp6ikEKrsxIjVLFY5AoQW8B1v3zYYogQUgOlZ8Z5C6WUnPUl-X5DzyhTJI4B4-hQnln7tv3msmzpcbdVwJgC060xPPlv7O10JURRpi7eIUDQAd2OrJkm2BZFeQ=w189-h189-s-no-gm?authuser=0';
    } else if (gameValue === 'hsr') {
        gamename = 'スターレイル';
        gameUrl = 'https://hsr.hoyoverse.com/gift?code=';
        embeddescription = 'ウチからの贈り物だよ～！';
        embedcolor = 0xcd98b5;
        gameIconUrl = 'https://lh3.googleusercontent.com/pw/ADCreHcJHyMqIwK2vUEZP2aqKKk2VG5I_NKZ6gDvULUS6zk544-uc9TAKgVtgw08Mcp6i5PXP610dZZPTNswsdB5iwD11WnNijSKFlw260MTMHdItnmEGvfX0LK8yBEuCI16ZXnWqcHuWcXenQcA3k7ioL0Ymw=w189-h189-s-no-gm?authuser=0'
    } else {
        gamename = 'unknown';
        gameUrl = 'unknown';
        gameIconUrl = 'unknown';
    }
};

// 新しい client instance の作成
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // キーをコマンド名，値をエクスポートされたモジュールとして，Collection に新しい項目を設定する
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }
}

// インタラクションが作成された時の処理
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  //　取得したスラッシュコマンドを変数に格納
  const command = interaction.client.commands.get(interaction.commandName);
  // コマンドが見つからなかった場合は処理を中断する
  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }
  // コマンド別の処理を実行
  try {
    // スコープ外でも使えるように宣言
    let inputcode = null;
    // 'コード配信' コマンドが発行された場合の処理
    if (interaction.commandName === 'コード配信') {
      await interaction.deferReply();
      // すべてのサーバーを確認
      client.guilds.cache.forEach(guild => {
        // "code"という名前のチャンネルを検索
        const codeChannel = guild.channels.cache.find(channel => channel.name === 'code');
        // "code"という名前のチャンネルが見つかった場合
        if (codeChannel) {
          // 各オプションの値を取得して変数に格納
          const game = interaction.options.getString('game');
          inputcode = interaction.options.getString('inputcode');
          const deadline = interaction.options.getInteger('deadline');
          // 関数を実行
          changeVariable(game);
          // スコープ外でも使えるように宣言
          let dlJoined;
          // 入力期限が指定されていない場合
          if (deadline == null) {
            dlJoined = '不明';
          }
          // 入力期限が指定されている場合
          else {
            // 文字列に変換
            const dlString = deadline.toString();
            // 年月日時分に分割
            const year = dlString.substring(0, 4);
            const month = dlString.substring(4, 6);
            const day = dlString.substring(6, 8);
            const hour = dlString.substring(8, 10);
            const min = dlString.substring(10, 12);
            // 文字列の組み立て
            dlJoined = `${year}年${month}月${day}日 ${hour}時${min}分`;
          }
          // URLとコードを結合
          const gameStreamUrl = gameUrl + inputcode;
          //embedを生成
          const codeEmbed = new EmbedBuilder()
            .setColor(embedcolor)
            .setTitle(inputcode)
            .setURL(gameStreamUrl)
            .setAuthor({ name: `${gamename} コード`})
            .setDescription(embeddescription)
            .setThumbnail(gameIconUrl)
            .setFooter({ text: `入力期限: ${dlJoined}` });
          // Embed を送信
          codeChannel.send({ embeds: [codeEmbed] });
        } 
        // "code"という名前のチャンネルが見つからなかった場合
        else {
          console.log(`"code"チャンネルがサーバー "${guild.name}" で見つかりませんでした。`);
        }
      }); 
    } 
    // 'コード配信' 以外のコマンドが発行された場合の処理
    else {
      command.execute(interaction);
    }
    // 'コード配信' コマンドにおいて保留したレスポンスを完結させる
    if (interaction.commandName === 'コード配信') {
      await interaction.editReply(`${gamename}:${inputcode}を送信しました`); 
    }
  } 
  catch (error) {
    console.error(error);
    // もし既にレスポンスがあるか，遅延されていたら
    if (interaction.replied || interaction.deferred) {
      // レスポンスに追加してエラーメッセージを送信
      interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
    } else {
      // リプライでエラーメッセージを送信
      interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }  
  }
});

// bot のステータスを変更
function updateStatus() {
    const serverCount = client.guilds.cache.size;
    client.user.setPresence({
      activities: [{ name: `原神:スターレイル`, type: ActivityType.Custom, state: `${serverCount} 品の非常食を調理中` }],
      status: 'online',
    });
}

// サーバーに入室/退出したときに実行
client.on('guildCreate', updateStatus);
client.on('guildDelete', updateStatus);

// 準備ができたらコンソールに出力する（一度だけ）
// client: Client<boolean>` と `readyClient: Client<true>`  の区別は TypeScript 開発者にとって重要
// これはいくつかのプロパティをnull不可にする
client.once(Events.ClientReady, readyClient => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
  updateStatus();
});

// bot のトークンを使って Discord にログインする
client.login(token);
