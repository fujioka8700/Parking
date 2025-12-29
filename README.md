# 立体駐車場故障対応検索システム

## 概要

立体駐車場の故障コードとセンサ状態を検索できる Web アプリケーションです。

## 技術スタック

- Next.js 16
- React 19
- TypeScript
- Prisma
- PostgreSQL 16
- Tailwind CSS
- Docker Compose

## セットアップ

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd Parking
```

### 2. Docker Compose で起動

```bash
docker compose up -d
```

### 3. データベースのマイグレーション

```bash
docker compose exec app npx prisma db push
```

PostgreSQL コンテナが自動的に起動し、データベースが初期化されます。

### 4. データの初期化

#### 開発環境

開発環境では、以下の手順でデータを初期化します：

1. **MT センサデータの変換**（初回のみ、または`mt_sensor.json`を更新した場合）:

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
2. JSON ファイル（`data/parsed_data_tower_code.json`）を生成（故障マスタのみ）
3. MT センサデータ（`data/parsed_data_mt_sensor.json`）を読み込み
4. データベースに保存

#### 本番環境

本番環境では、事前に生成された JSON ファイルからデータベースに保存します。

```bash
docker compose exec app npm run init:prod
```

**重要**: 本番環境で実行する前に、以下のファイルが存在することを確認してください：

- `data/parsed_data_tower_code.json`（故障マスタデータ）
- `data/parsed_data_mt_sensor.json`（MT センサデータ）

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
2. 開発環境で以下のコマンドを実行して JSON ファイルを再生成：

```bash
docker compose exec app npm run init:dev
```

3. 生成された `data/parsed_data_tower_code.json` を Git にコミット
4. 本番環境にデプロイ後、本番環境で以下のコマンドを実行：

```bash
docker compose exec app npm run init:prod
```

### MT センサデータを更新した場合

1. `data/mt_sensor.json` を更新
2. 開発環境で以下のコマンドを実行して JSON ファイルを再生成：

```bash
docker compose exec app node scripts/convertMtSensor.js
```

3. 生成された `data/parsed_data_mt_sensor.json` を Git にコミット
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

- `data/parsed_data_tower_code.json` が存在すること（Git リポジトリに含まれている）
- `data/parsed_data_mt_sensor.json` が存在すること（Git リポジトリに含まれている）

### Docker Compose でのデプロイ

1. コードをデプロイ
2. データベースのマイグレーションを実行：

```bash
docker compose exec app npx prisma db push
```

3. データを初期化：

```bash
docker compose exec app npm run init:prod
```

4. アプリケーションを起動：

```bash
docker compose exec app npm run start
```

### Vercel でのデプロイ

1. **環境変数の設定**

   - Vercel のダッシュボードで `DATABASE_URL` 環境変数を設定
   - PostgreSQL データベースの接続文字列を設定（例: `postgresql://user:password@host:5432/database?schema=public`）

2. **ビルド設定**

   - `package.json` の `build` スクリプトで `prisma generate` が実行されることを確認
   - Vercel は Next.js プロジェクトを自動検出するため、特別な設定ファイルは不要です

3. **データベースのマイグレーションとデータ初期化**

   - Vercel のビルド時に自動的に実行されます：
     - `postbuild` スクリプトで `prisma db push` とデータ初期化が実行されます
     - 既存データが存在する場合は、データ投入をスキップします
   - 手動で実行する場合：

   ```bash
   npx prisma db push
   npm run init:prod
   ```

4. **環境変数の設定**
   - Vercel のダッシュボードで `DATABASE_URL` 環境変数を設定
   - Neon データベースの接続文字列を設定（例: `postgresql://user:password@host:5432/database?schema=public`）

**注意**:

- Vercel はサーバーレス環境のため、PostgreSQL データベースは外部サービス（例: Vercel Postgres、Supabase、Neon など）を使用する必要があります
- データ初期化スクリプトは既存データをチェックし、データが存在する場合は投入をスキップします
- `data/parsed_data_tower_code.json` と `data/parsed_data_mt_sensor.json` が Git リポジトリに含まれている必要があります

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
│   ├── parsed_data_tower_code.json  # 解析済みJSONファイル（故障マスタ、Git管理）
│   └── parsed_data_mt_sensor.json  # MTセンサデータ（Git管理）
├── docs/                 # ドキュメント
├── compose.yaml          # Docker Compose設定
└── README.md            # このファイル
```

## 注意事項

- エクセルファイル（`data/TP_manual.xls`）は Git 管理外です
- JSON ファイル（`data/parsed_data_tower_code.json`、`data/parsed_data_mt_sensor.json`）は Git 管理に含まれます（本番環境で使用するため）
- 本番環境では `xlsx` ライブラリは不要です（JSON ファイルのみ使用）
- PostgreSQL データベースは Docker ボリューム（`postgres_data`）に保存されます
- センサ状態データは`parsed_data_mt_sensor.json`から読み込まれます（エクセルファイルからは読み込みません）

## センサ状態ページについて

センサ状態ページ（`/sensors`）では、16 進数（4 桁）を入力することで、ON になっているセンサを表示できます。

- データベースからセンサデータを取得して表示します
- 6 つのグループ（センサ状態 1〜6）に対応しています
- 各グループは 16 個のセンサ（X000-X00F, X010-X01F, ...）で構成されています
- 16 進数入力は自動的に大文字に変換され、16 進数以外の文字は除外されます
- データベースにセンサデータが登録されていない場合は、エラーメッセージが表示されます

## トラブルシューティング

### JSON ファイルが見つからないエラー

本番環境で `parsed_data_tower_code.json` または `parsed_data_mt_sensor.json` が見つからない場合：

1. 開発環境でエクセルファイルを解析して JSON ファイルを生成（`npm run init:dev`）
2. MT センサデータを変換（`node scripts/convertMtSensor.js`）
3. JSON ファイルを Git にコミット
4. 本番環境にデプロイ

### データベース接続エラー

PostgreSQL コンテナが起動しているか確認：

```bash
docker compose ps
```

データベースを再初期化する場合：

```bash
# データベースボリュームを削除（必要に応じて）
docker compose down -v

# コンテナを再起動
docker compose up -d

# データベースを再作成
docker compose exec app npx prisma db push

# データを再インポート
docker compose exec app npm run init:dev
```

### データベース接続タイムアウト

PostgreSQL コンテナの起動を待ってからアプリケーションを起動してください：

```bash
# PostgreSQL のヘルスチェックを確認
docker compose ps db

# アプリケーションを再起動
docker compose restart app
```
