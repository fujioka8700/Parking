# 立体駐車場故障対応検索システム

## 概要

立体駐車場の故障コードとセンサ状態を検索できるWebアプリケーションです。

## 技術スタック

- Next.js 16
- React 19
- TypeScript
- Prisma
- PostgreSQL
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
docker compose exec app npx prisma migrate dev
```

または

```bash
docker compose exec app npx prisma db push
```

### 4. データの初期化

#### 開発環境

開発環境では、エクセルファイル（`data/TP_manual.xls`）を解析してJSONファイルを生成し、データベースに保存します。

```bash
docker compose exec app node scripts/initData.js
```

または

```bash
docker compose exec app npm run init:dev
```

このコマンドは以下を実行します：
1. エクセルファイル（`data/TP_manual.xls`）を解析
2. JSONファイル（`data/parsed_data.json`）を生成
3. データベースに保存

#### 本番環境

本番環境では、事前に生成されたJSONファイル（`data/parsed_data.json`）からデータベースに保存します。

```bash
NODE_ENV=production docker compose exec app node scripts/initData.js
```

または

```bash
docker compose exec app npm run init:prod
```

**重要**: 本番環境で実行する前に、以下のいずれかを確認してください：
- `data/parsed_data.json` が存在すること
- または、開発環境で先にエクセルファイルを解析してJSONファイルを生成しておくこと

### 5. アプリケーションの起動

開発サーバーは自動的に起動します（`docker compose up` を実行した場合）。

手動で起動する場合：

```bash
docker compose exec app npm run dev
```

ブラウザで `http://localhost:3000` にアクセスしてください。

## データ更新手順

### エクセルファイルを更新した場合

1. エクセルファイル（`data/TP_manual.xls`）を更新
2. 開発環境で以下のコマンドを実行してJSONファイルを再生成：

```bash
docker compose exec app node scripts/initData.js
```

3. 生成された `data/parsed_data.json` をGitにコミット
4. 本番環境にデプロイ後、本番環境で以下のコマンドを実行：

```bash
NODE_ENV=production docker compose exec app node scripts/initData.js
```

## 本番環境でのデプロイ

### 前提条件

- `data/parsed_data.json` が存在すること（Gitリポジトリに含まれている）
- データベースが起動していること

### デプロイ手順

1. コードをデプロイ
2. データベースのマイグレーションを実行：

```bash
NODE_ENV=production docker compose exec app npx prisma migrate deploy
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
│   ├── TP_manual.xls     # エクセルファイル（Git管理外）
│   └── parsed_data.json  # 解析済みJSONファイル（Git管理）
├── docs/                 # ドキュメント
├── compose.yaml          # Docker Compose設定
└── README.md            # このファイル
```

## 注意事項

- エクセルファイル（`data/TP_manual.xls`）はGit管理外です
- JSONファイル（`data/parsed_data.json`）はGit管理に含まれます（本番環境で使用するため）
- 本番環境では `xlsx` ライブラリは不要です（JSONファイルのみ使用）

## トラブルシューティング

### JSONファイルが見つからないエラー

本番環境で `parsed_data.json` が見つからない場合：

1. 開発環境でエクセルファイルを解析してJSONファイルを生成
2. JSONファイルをGitにコミット
3. 本番環境にデプロイ

### データベース接続エラー

データベースが起動しているか確認：

```bash
docker compose ps
```

データベースを再起動：

```bash
docker compose restart db
```
