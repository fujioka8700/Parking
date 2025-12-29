# 立体駐車場故障対応検索システム

## 概要

立体駐車場の故障コードとセンサ状態を検索できる Web アプリケーションです。

### 主な機能

- **故障コード検索**: 故障コード、故障名称、故障内容で検索可能
- **センサ状態確認**: 16 進数入力で ON になっているセンサを表示
- **駐車場タイプ切り替え**: タワーパーク（M）とタワーパーク（MT）を切り替えて表示
- **レスポンシブデザイン**: スマートフォン・タブレット対応

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

開発環境では、マイグレーションファイルを使用してデータベーススキーマを適用します：

```bash
docker compose exec app npx prisma migrate dev
```

または、マイグレーションファイルを適用せずに直接スキーマをプッシュする場合：

```bash
docker compose exec app npx prisma db push
```

**注意**: `prisma migrate dev` は開発環境で使用し、マイグレーションファイルを管理します。`prisma db push` はスキーマを直接データベースに適用しますが、マイグレーションファイルは作成されません。

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
2. JSON ファイル（`data/parsed_data_tower_code.json`）を生成（故障マスタのみ、駐車場タイプ: "タワーパーク"）
3. MT センサデータ（`data/parsed_data_mt_sensor.json`）を読み込み（駐車場タイプ: "タワーパーク（MT）"）
4. M センサデータ（`data/parsed_data_m_sensor.json`）を読み込み（駐車場タイプ: "タワーパーク（M）"）
5. データベースに保存（各データに駐車場タイプを付与）

#### 本番環境

本番環境では、事前に生成された JSON ファイルからデータベースに保存します。

```bash
docker compose exec app npm run init:prod
```

**重要**: 本番環境で実行する前に、以下のファイルが存在することを確認してください：

- `data/parsed_data_tower_code.json`（故障マスタデータ、駐車場タイプ: "タワーパーク"）
- `data/parsed_data_mt_sensor.json`（MT センサデータ、駐車場タイプ: "タワーパーク（MT）"）
- `data/parsed_data_m_sensor.json`（M センサデータ、駐車場タイプ: "タワーパーク（M）"）

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

### M センサデータを更新した場合

1. `data/parsed_data_m_sensor.json` を直接編集（または手動で作成）
2. データベースに反映：

```bash
docker compose exec app npm run init:dev
```

3. 本番環境にデプロイ後、本番環境で以下のコマンドを実行：

```bash
docker compose exec app npm run init:prod
```

## 本番環境でのデプロイ

### 前提条件

- `data/parsed_data_tower_code.json` が存在すること（Git リポジトリに含まれている）
- `data/parsed_data_mt_sensor.json` が存在すること（Git リポジトリに含まれている）
- `data/parsed_data_m_sensor.json` が存在すること（Git リポジトリに含まれている）

### Docker Compose でのデプロイ

1. コードをデプロイ
2. データベースのマイグレーションを実行：

**本番環境の場合**（マイグレーションファイルを使用）：

```bash
docker compose exec app npx prisma migrate deploy
```

**開発環境の場合**（スキーマを直接適用）：

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

#### 前提条件

1. **Git リポジトリに必要なファイルが含まれていること**

   - `data/parsed_data_tower_code.json`
   - `data/parsed_data_mt_sensor.json`
   - `data/parsed_data_m_sensor.json`

2. **PostgreSQL データベースの準備**
   - Neon、Supabase、Vercel Postgres などの PostgreSQL サービスを使用
   - データベース接続文字列を取得

#### デプロイ手順

1. **Vercel プロジェクトの作成**

   - Vercel ダッシュボードで「New Project」をクリック
   - Git リポジトリを接続
   - プロジェクト設定：
     - Framework Preset: Next.js
     - Root Directory: `src`（またはプロジェクトルート）
     - Build Command: `npm run build`（自動検出される）
     - Output Directory: `.next`（自動検出される）

2. **環境変数の設定**

   - Vercel ダッシュボードの「Settings」→「Environment Variables」で以下を設定：
     - `DATABASE_URL`: PostgreSQL データベースの接続文字列
       - 例: `postgresql://user:password@host:5432/database?schema=public`
       - Neon の場合: `postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/database?sslmode=require`

3. **ビルド設定の確認**

   - `package.json` の `build` スクリプトで `prisma generate` が実行されることを確認
   - `postbuild` スクリプトで `prisma db push` とデータ初期化が実行されることを確認
     - **注意**: Vercel では `prisma db push` を使用しています（マイグレーションファイルではなくスキーマを直接適用）
     - 本番環境でマイグレーションファイルを使用する場合は、`postbuild` スクリプトを `npx prisma migrate deploy` に変更してください
   - Vercel は Next.js プロジェクトを自動検出するため、特別な設定ファイル（`vercel.json`）は不要です

4. **デプロイの実行**

   - 「Deploy」ボタンをクリック
   - ビルドプロセスで以下が自動実行されます：
     1. `npm install`（依存関係のインストール）
     2. `prisma generate`（Prisma Client の生成、`postinstall` スクリプト）
     3. `next build`（Next.js のビルド）
     4. `prisma db push`（データベーススキーマの適用、`postbuild` スクリプト）
        - **注意**: 現在は `prisma db push` を使用していますが、マイグレーションファイルを使用する場合は `prisma migrate deploy` に変更してください
     5. `node scripts/initData.js`（データ初期化、`postbuild` スクリプト）
   - 既存データが存在する場合は、データ投入をスキップします

5. **デプロイ後の確認**
   - デプロイが成功したら、アプリケーションにアクセス
   - 故障コード検索とセンサ状態確認が正常に動作することを確認
   - データベースにデータが正しく投入されていることを確認

#### トラブルシューティング

- **ビルドエラー**: ログを確認し、`DATABASE_URL` が正しく設定されているか確認
- **データ初期化エラー**: `postbuild` スクリプトでエラーが発生してもビルドは続行されますが、データが投入されていない可能性があります
- **データベース接続エラー**: `DATABASE_URL` の形式と SSL 設定を確認

**注意**:

- Vercel はサーバーレス環境のため、PostgreSQL データベースは外部サービス（例: Vercel Postgres、Supabase、Neon など）を使用する必要があります
- データ初期化スクリプトは既存データをチェックし、データが存在する場合は投入をスキップします
- 以下の JSON ファイルが Git リポジトリに含まれている必要があります：
  - `data/parsed_data_tower_code.json`（故障マスタ、駐車場タイプ: "タワーパーク"）
  - `data/parsed_data_mt_sensor.json`（MT センサデータ、駐車場タイプ: "タワーパーク（MT）"）
  - `data/parsed_data_m_sensor.json`（M センサデータ、駐車場タイプ: "タワーパーク（M）"）

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

# マイグレーション（開発環境）
docker compose exec app npx prisma migrate dev

# マイグレーション（本番環境）
docker compose exec app npx prisma migrate deploy

# スキーマを直接適用（マイグレーションファイルを使用しない場合）
docker compose exec app npx prisma db push

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
│   ├── prisma/           # Prismaスキーマとマイグレーション
│   │   ├── schema.prisma # データベーススキーマ定義
│   │   └── migrations/    # マイグレーションファイル
│   └── scripts/          # スクリプト
│       └── initData.js   # データ初期化スクリプト
├── data/
│   ├── TP_manual.xls           # エクセルファイル（Git管理外）
│   ├── mt_sensor.json          # MTセンサ定義ファイル（Git管理）
│   ├── parsed_data_tower_code.json  # 解析済みJSONファイル（故障マスタ、駐車場タイプ: "タワーパーク"、Git管理）
│   ├── parsed_data_mt_sensor.json  # MTセンサデータ（駐車場タイプ: "タワーパーク（MT）"、Git管理）
│   └── parsed_data_m_sensor.json   # Mセンサデータ（駐車場タイプ: "タワーパーク（M）"、Git管理）
├── docs/                 # ドキュメント
├── compose.yaml          # Docker Compose設定
└── README.md            # このファイル
```

## 注意事項

- エクセルファイル（`data/TP_manual.xls`）は Git 管理外です
- JSON ファイル（`data/parsed_data_tower_code.json`、`data/parsed_data_mt_sensor.json`、`data/parsed_data_m_sensor.json`）は Git 管理に含まれます（本番環境で使用するため）
- 本番環境では `xlsx` ライブラリは不要です（JSON ファイルのみ使用）
- PostgreSQL データベースは Docker ボリューム（`postgres_data`）に保存されます
- センサ状態データは`parsed_data_mt_sensor.json`と`parsed_data_m_sensor.json`から読み込まれます（エクセルファイルからは読み込みません）
- データベーススキーマには`parkingType`フィールドが含まれており、各データは駐車場タイプで区別されます
- 現在、プルダウンで選択可能な駐車場タイプは「タワーパーク（M）」と「タワーパーク（MT）」のみです

## センサ状態ページについて

センサ状態ページ（`/sensors`）では、16 進数（4 桁）を入力することで、ON になっているセンサを表示できます。

- データベースからセンサデータを取得して表示します（選択された駐車場タイプに応じて）
- 6 つのグループ（センサ状態 1〜6）に対応しています
- 各グループは 16 個のセンサ（X000-X00F, X010-X01F, ...）で構成されています
- 16 進数入力は自動的に大文字に変換され、16 進数以外の文字は除外されます
- データベースにセンサデータが登録されていない場合は、エラーメッセージが表示されます
- 駐車場タイプを変更すると、センサ状態の入力フィールドと表示がリセットされます

## 駐車場タイプについて

- ヘッダーのプルダウンで駐車場タイプを切り替えることができます
- 現在選択可能な駐車場タイプ：
  - **タワーパーク（M）**: M 型タワーパークのセンサデータを表示
  - **タワーパーク（MT）**: MT 型タワーパークのセンサデータを表示
- 故障コードは「タワーパーク（M）」と「タワーパーク（MT）」の両方で「タワーパーク」の故障コードが表示されます
- 駐車場タイプを変更すると、検索入力と検索結果がリセットされます

## トラブルシューティング

### JSON ファイルが見つからないエラー

本番環境で `parsed_data_tower_code.json`、`parsed_data_mt_sensor.json`、または `parsed_data_m_sensor.json` が見つからない場合：

1. 開発環境でエクセルファイルを解析して JSON ファイルを生成（`npm run init:dev`）
2. MT センサデータを変換（`node scripts/convertMtSensor.js`）
3. M センサデータ（`parsed_data_m_sensor.json`）が存在することを確認
4. JSON ファイルを Git にコミット
5. 本番環境にデプロイ

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

# データベースを再作成（マイグレーションファイルを使用する場合）
docker compose exec app npx prisma migrate deploy

# または、スキーマを直接適用する場合
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
