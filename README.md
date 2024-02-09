# Code-Streamer

原神・崩壊:スターレイルで不定期に発表されるアイテムコードを一括配信するDiscord-botです。

## 機能

![Main](screenshot/main.png)<br>
コードを配信します。

#### コマンド
/ping　応答をチェックします<br>
/コード配信　コードを配信します
```
/コード配信 {game} {inputcode} {deadline}
game: 原神，スタレから選択
inputcode: コードを入力
deadline: コードの入力期限を入力(任意)

例
/コード配信 game:原神 inputcode:TESTCODE deadline:202412312359
```

## 開発
サーバーを立ち上げて動作させてください。<br>
discord.jsなどの導入も済ませておくこと。<br>
コマンド登録は以下を実行
```
node deploy-commands.js
```
