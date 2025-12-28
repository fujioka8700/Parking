# 立体駐車場故障対応検索システム

## 概要

立体駐車場の故障コードとセンサ状態を検索できるWebアプリケーションです。

## 技術スタック

- Next.js 16
- React 19
- TypeScript
- Prisma
- SQLite
- Tailwind CSS
- Docker Compose

## セットアップ

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd Parking
```

### 2. Docker Composeで起動

```bash
docker compose up -d
```

### 3. データベースのマイグレーション

```bash
docker compose exec app npx prisma db push
```

SQLiteはファイルベースなので、別途データベースサーバーは不要です。

### 4. データの初期化

#### 開発環境

開発環境では、以下の手順でデータを初期化します：

1. **MTセンサデータの変換**（初回のみ、または`mt_sensor.json`を更新した場合）:
   ```bash
   docker compose exec app node scripts/convertMtSensor.js
   ```
   これにより`data/parsed_data_mt_sensor.json`が生成されます。

2. **データベースへの保存**:
   ```bash
   docker compose exec app npm run init:dev
   ```

このコマンドは以下を実行します：
1. エクセルファイル（`data/TP_manual.xls`）を解析して故障マスタデータを取得
2. JSONファイル（`data/parsed_data.json`）を生成（故障マスタのみ）
3. MTセンサデータ（`data/parsed_data_mt_sensor.json`）を読み込み
4. データベースに保存

#### 本番環境

本番環境では、事前に生成されたJSONファイルからデータベースに保存します。

```bash
docker compose exec app npm run init:prod
```

**重要**: 本番環境で実行する前に、以下のファイルが存在することを確認してください：
- `data/parsed_data.json`（故障マスタデータ）
- `data/parsed_data_mt_sensor.json`（MTセンサデータ）

### 5. アプリケーションの起動

開発サーバーは自動的に起動します（`docker compose up` を実行した場合）。

手動で起動する場合：

```bash
docker compose exec app npm run dev
```

ブラウザで `http://localhost:3000` にアクセスしてください。

## データ更新手順

### 故障マスタデータを更新した場合

1. エクセルファイル（`data/TP_manual.xls`）を更新
2. 開発環境で以下のコマンドを実行してJSONファイルを再生成：

```bash
docker compose exec app npm run init:dev
```

3. 生成された `data/parsed_data.json` をGitにコミット
4. 本番環境にデプロイ後、本番環境で以下のコマンドを実行：

```bash
docker compose exec app npm run init:prod
```

### MTセンサデータを更新した場合

1. `data/mt_sensor.json` を更新
2. 開発環境で以下のコマンドを実行してJSONファイルを再生成：

```bash
docker compose exec app node scripts/convertMtSensor.js
```

3. 生成された `data/parsed_data_mt_sensor.json` をGitにコミット
4. データベースに反映：

```bash
docker compose exec app npm run init:dev
```

5. 本番環境にデプロイ後、本番環境で以下のコマンドを実行：

```bash
docker compose exec app npm run init:prod
```

## 本番環境でのデプロイ

### 前提条件

- `data/parsed_data.json` が存在すること（Gitリポジトリに含まれている）
- `data/parsed_data_mt_sensor.json` が存在すること（Gitリポジトリに含まれている）

### デプロイ手順

1. コードをデプロイ
2. データベースのマイグレーションを実行：

```bash
docker compose exec app npx prisma db push
```

3. データを初期化：

```bash
NODE_ENV=production docker compose exec app node scripts/initData.js
```

4. アプリケーションを起動：

```bash
NODE_ENV=production docker compose exec app npm run start
```

## 開発コマンド

```bash
# 開発サーバー起動
docker compose exec app npm run dev

# ビルド
docker compose exec app npm run build

# 本番サーバー起動
docker compose exec app npm run start

# Prisma Studio（データベースGUI）
docker compose exec app npx prisma studio --browser none

# データ初期化（開発環境）
docker compose exec app npm run init:dev

# データ初期化（本番環境）
docker compose exec app npm run init:prod
```

## ファイル構成

```
Parking/
├── src/
│   ├── app/              # Next.jsアプリケーション
│   ├── components/       # Reactコンポーネント
│   ├── lib/              # ユーティリティ
│   ├── prisma/           # Prismaスキーマ
│   └── scripts/          # スクリプト
│       └── initData.js   # データ初期化スクリプト
├── data/
│   ├── TP_manual.xls           # エクセルファイル（Git管理外）
│   ├── mt_sensor.json          # MTセンサ定義ファイル（Git管理）
│   ├── parsed_data.json        # 解析済みJSONファイル（故障マスタ、Git管理）
│   ├── parsed_data_mt_sensor.json  # MTセンサデータ（Git管理）
│   └── database.db              # SQLiteデータベースファイル（Git管理外）
├── docs/                 # ドキュメント
├── compose.yaml          # Docker Compose設定
└── README.md            # このファイル
```

## 注意事項

- エクセルファイル（`data/TP_manual.xls`）はGit管理外です
- JSONファイル（`data/parsed_data.json`、`data/parsed_data_mt_sensor.json`）はGit管理に含まれます（本番環境で使用するため）
- SQLiteデータベースファイル（`data/database.db`）はGit管理外です
- 本番環境では `xlsx` ライブラリは不要です（JSONファイルのみ使用）
- SQLiteはファイルベースなので、バックアップは `data/database.db` をコピーするだけです
- センサ状態データは`parsed_data_mt_sensor.json`から読み込まれます（エクセルファイルからは読み込みません）

## トラブルシューティング

### JSONファイルが見つからないエラー

本番環境で `parsed_data.json` または `parsed_data_mt_sensor.json` が見つからない場合：

1. 開発環境でエクセルファイルを解析してJSONファイルを生成（`npm run init:dev`）
2. MTセンサデータを変換（`node scripts/convertMtSensor.js`）
3. JSONファイルをGitにコミット
4. 本番環境にデプロイ

### データベース接続エラー

SQLiteファイルが存在するか確認：

```bash
ls -lh data/database.db
```

データベースを再初期化する場合：

```bash
# データベースファイルを削除（必要に応じて）
rm data/database.db

# データベースを再作成
docker compose exec app npx prisma db push

# データを再インポート
docker compose exec app npm run init:dev
```

### データベースがロックされているエラー

複数のプロセスが同時にデータベースにアクセスしている可能性があります。アプリケーションを一度停止して再起動してください：

```bash
docker compose restart app
```
