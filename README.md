# 立体駐車場故障対応検索システム

## 概要

立体駐車場の故障コードとセンサ状態を検索できる Web アプリケーションです。

### 主な機能

- **故障コード検索**: 故障コード、故障名称、故障内容で検索可能
- **センサ状態確認**: 16 進数入力で ON になっているセンサを表示
- **駐車場タイプ切り替え**: 複数の駐車場タイプを切り替えて表示
  - タワーパーク（M）
  - タワーパーク（MT）
  - リフトパーク（C）
  - リフトパーク（縦列・前側）
  - リフトパーク（縦列・奥側）
  - スライドパーク円（SLMT、SLM）
  - スライドパーク円（SL-TL、SL-L）
  - シフトパーク
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
git clone git@github.com:fujioka8700/Parking.git
cd Parking
```

### 2. Docker Compose で起動

```bash
docker compose up -d
```

### 3. データベースのマイグレーション

データベーススキーマを適用する方法は 2 つあります：

#### 方法 1: マイグレーションファイルを使用（推奨）

マイグレーションファイルを使用してデータベーススキーマを適用します：

```bash
docker compose exec app npx prisma migrate dev
```

この方法では、以下のマイグレーションファイルが順番に適用されます：

- `20251229012056_init`: 初期テーブル作成（FaultMaster、SensorStatus）
- `20251229070403_add_parking_type`: 駐車場タイプフィールドの追加
- `20251229120000_add_user_table`: User テーブルの作成

**注意**:

- 初回実行時、既存のテーブルがある場合はエラーになる可能性があります。その場合は、方法 2 を使用するか、データベースをリセットしてください。
- 既存のデータベースがある場合、`prisma migrate resolve --applied <migration_name>` を使用して、既に適用済みのマイグレーションをマークできます。

#### 方法 2: スキーマを直接適用

マイグレーションファイルを適用せずに直接スキーマをプッシュする場合：

```bash
docker compose exec app npx prisma db push
```

**注意**: `prisma db push` はスキーマを直接データベースに適用しますが、マイグレーションファイルの履歴は記録されません。開発環境でスキーマを試行錯誤する場合に便利です。

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

1. 故障マスタデータ（`data/parsed_data_tower_code.json`）を読み込み（駐車場タイプ: "タワーパーク"）
2. MT センサデータ（`data/parsed_data_mt_sensor.json`）を読み込み（駐車場タイプ: "タワーパーク（MT）"）
3. M センサデータ（`data/parsed_data_m_sensor.json`）を読み込み（駐車場タイプ: "タワーパーク（M）"）
4. リフトパーク（C）センサデータ（`data/parsed_data_c_sensor.json`）を読み込み（駐車場タイプ: "リフトパーク（C）"）
5. リフトパーク故障コードデータ（`data/parsed_data_lift_code.json`）を読み込み（駐車場タイプ: "リフトパーク"）
6. リフトパーク（縦列・前側）センサデータ（`data/parsed_data_c_front_sensor.json`）を読み込み（駐車場タイプ: "リフトパーク（縦列・前側）"）
7. リフトパーク（縦列・奥側）センサデータ（`data/parsed_data_c_back_sensor.json`）を読み込み（駐車場タイプ: "リフトパーク（縦列・奥側）"）
8. スライドパーク円（SLMT、SLM）センサデータ（`data/parsed_data_circle_slmt_sensor.json`）を読み込み（駐車場タイプ: "スライドパーク円（SLMT、SLM）"）
9. スライドパーク円故障コードデータ（`data/parsed_data_circle_code.json`）を読み込み（駐車場タイプ: "スライドパーク円"）
10. スライドパーク円（SL-TL、SL-L）センサデータ（`data/parsed_data_circle_sl_sensor.json`）を読み込み（駐車場タイプ: "スライドパーク円（SL-TL、SL-L）"）
11. シフトパークセンサデータ（`data/parsed_data_shift_sensor.json`）を読み込み（駐車場タイプ: "シフトパーク"）
12. シフトパーク故障コードデータ（`data/parsed_data_shift_code.json`）を読み込み（駐車場タイプ: "シフトパーク"）
13. データベースに保存（各データに駐車場タイプを付与）

**重要**: 以下の JSON ファイルが存在することを確認してください：

- `data/parsed_data_tower_code.json`（故障マスタデータ、駐車場タイプ: "タワーパーク"）
- `data/parsed_data_mt_sensor.json`（MT センサデータ、駐車場タイプ: "タワーパーク（MT）"）
- `data/parsed_data_m_sensor.json`（M センサデータ、駐車場タイプ: "タワーパーク（M）"）
- `data/parsed_data_c_sensor.json`（リフトパーク（C）センサデータ、駐車場タイプ: "リフトパーク（C）"）
- `data/parsed_data_lift_code.json`（リフトパーク故障コードデータ、駐車場タイプ: "リフトパーク"）
- `data/parsed_data_c_front_sensor.json`（リフトパーク（縦列・前側）センサデータ、駐車場タイプ: "リフトパーク（縦列・前側）"）
- `data/parsed_data_c_back_sensor.json`（リフトパーク（縦列・奥側）センサデータ、駐車場タイプ: "リフトパーク（縦列・奥側）"）
- `data/parsed_data_circle_slmt_sensor.json`（スライドパーク円（SLMT、SLM）センサデータ、駐車場タイプ: "スライドパーク円（SLMT、SLM）"）
- `data/parsed_data_circle_code.json`（スライドパーク円故障コードデータ、駐車場タイプ: "スライドパーク円"）
- `data/parsed_data_circle_sl_sensor.json`（スライドパーク円（SL-TL、SL-L）センサデータ、駐車場タイプ: "スライドパーク円（SL-TL、SL-L）"）
- `data/parsed_data_shift_sensor.json`（シフトパークセンサデータ、駐車場タイプ: "シフトパーク"）
- `data/parsed_data_shift_code.json`（シフトパーク故障コードデータ、駐車場タイプ: "シフトパーク"）

#### 本番環境

本番環境では、事前に生成された JSON ファイルからデータベースに保存します。

```bash
docker compose exec app npm run init:prod
```

**重要**: 本番環境で実行する前に、以下のファイルが存在することを確認してください：

- `data/parsed_data_tower_code.json`（故障マスタデータ、駐車場タイプ: "タワーパーク"）
- `data/parsed_data_mt_sensor.json`（MT センサデータ、駐車場タイプ: "タワーパーク（MT）"）
- `data/parsed_data_m_sensor.json`（M センサデータ、駐車場タイプ: "タワーパーク（M）"）
- `data/parsed_data_c_sensor.json`（リフトパーク（C）センサデータ、駐車場タイプ: "リフトパーク（C）"）
- `data/parsed_data_lift_code.json`（リフトパーク故障コードデータ、駐車場タイプ: "リフトパーク"）
- `data/parsed_data_c_front_sensor.json`（リフトパーク（縦列・前側）センサデータ、駐車場タイプ: "リフトパーク（縦列・前側）"）
- `data/parsed_data_c_back_sensor.json`（リフトパーク（縦列・奥側）センサデータ、駐車場タイプ: "リフトパーク（縦列・奥側）"）
- `data/parsed_data_circle_slmt_sensor.json`（スライドパーク円（SLMT、SLM）センサデータ、駐車場タイプ: "スライドパーク円（SLMT、SLM）"）
- `data/parsed_data_circle_code.json`（スライドパーク円故障コードデータ、駐車場タイプ: "スライドパーク円"）
- `data/parsed_data_circle_sl_sensor.json`（スライドパーク円（SL-TL、SL-L）センサデータ、駐車場タイプ: "スライドパーク円（SL-TL、SL-L）"）
- `data/parsed_data_shift_sensor.json`（シフトパークセンサデータ、駐車場タイプ: "シフトパーク"）
- `data/parsed_data_shift_code.json`（シフトパーク故障コードデータ、駐車場タイプ: "シフトパーク"）

### 5. アプリケーションの起動

開発サーバーは自動的に起動します（`docker compose up` を実行した場合）。

手動で起動する場合：

```bash
docker compose exec app npm run dev
```

ブラウザで `http://localhost:3000` にアクセスしてください。

## データ更新手順

### 故障マスタデータを更新した場合

1. `data/parsed_data_tower_code.json` を直接編集
2. データベースに反映：

```bash
docker compose exec app npm run init:dev
```

3. 更新された `data/parsed_data_tower_code.json` を Git にコミット
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

- 以下の JSON ファイルが存在すること（Git リポジトリに含まれている）：
  - `data/parsed_data_tower_code.json`（故障マスタデータ、駐車場タイプ: "タワーパーク"）
  - `data/parsed_data_mt_sensor.json`（MT センサデータ、駐車場タイプ: "タワーパーク（MT）"）
  - `data/parsed_data_m_sensor.json`（M センサデータ、駐車場タイプ: "タワーパーク（M）"）
  - `data/parsed_data_c_sensor.json`（リフトパーク（C）センサデータ、駐車場タイプ: "リフトパーク（C）"）
  - `data/parsed_data_lift_code.json`（リフトパーク故障コードデータ、駐車場タイプ: "リフトパーク"）
  - `data/parsed_data_c_front_sensor.json`（リフトパーク（縦列・前側）センサデータ、駐車場タイプ: "リフトパーク（縦列・前側）"）
  - `data/parsed_data_c_back_sensor.json`（リフトパーク（縦列・奥側）センサデータ、駐車場タイプ: "リフトパーク（縦列・奥側）"）
  - `data/parsed_data_circle_slmt_sensor.json`（スライドパーク円（SLMT、SLM）センサデータ、駐車場タイプ: "スライドパーク円（SLMT、SLM）"）
  - `data/parsed_data_circle_code.json`（スライドパーク円故障コードデータ、駐車場タイプ: "スライドパーク円"）
  - `data/parsed_data_circle_sl_sensor.json`（スライドパーク円（SL-TL、SL-L）センサデータ、駐車場タイプ: "スライドパーク円（SL-TL、SL-L）"）
  - `data/parsed_data_shift_sensor.json`（シフトパークセンサデータ、駐車場タイプ: "シフトパーク"）
  - `data/parsed_data_shift_code.json`（シフトパーク故障コードデータ、駐車場タイプ: "シフトパーク"）

### Docker Compose でのデプロイ

1. コードをデプロイ
2. データベースのマイグレーションを実行：

**本番環境の場合**（マイグレーションファイルを使用、推奨）：

```bash
docker compose exec app npx prisma migrate deploy
```

このコマンドは、`src/prisma/migrations/` ディレクトリ内のすべてのマイグレーションファイルを順番に適用します：

- `20251229012056_init`: 初期テーブル作成
- `20251229070403_add_parking_type`: 駐車場タイプフィールドの追加
- `20251229120000_add_user_table`: User テーブルの作成

**開発環境の場合**（スキーマを直接適用）：

```bash
docker compose exec app npx prisma db push
```

**注意**: 既存のデータベースがある場合、`prisma migrate deploy` は既に適用済みのマイグレーションをスキップします。初回セットアップの場合は、すべてのマイグレーションが適用されます。

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

   - `data/parsed_data_tower_code.json`（故障マスタデータ、駐車場タイプ: "タワーパーク"）
   - `data/parsed_data_mt_sensor.json`（MT センサデータ、駐車場タイプ: "タワーパーク（MT）"）
   - `data/parsed_data_m_sensor.json`（M センサデータ、駐車場タイプ: "タワーパーク（M）"）
   - `data/parsed_data_c_sensor.json`（リフトパーク（C）センサデータ、駐車場タイプ: "リフトパーク（C）"）
   - `data/parsed_data_lift_code.json`（リフトパーク故障コードデータ、駐車場タイプ: "リフトパーク"）
   - `data/parsed_data_c_front_sensor.json`（リフトパーク（縦列・前側）センサデータ、駐車場タイプ: "リフトパーク（縦列・前側）"）
   - `data/parsed_data_c_back_sensor.json`（リフトパーク（縦列・奥側）センサデータ、駐車場タイプ: "リフトパーク（縦列・奥側）"）
   - `data/parsed_data_circle_slmt_sensor.json`（スライドパーク円（SLMT、SLM）センサデータ、駐車場タイプ: "スライドパーク円（SLMT、SLM）"）
   - `data/parsed_data_circle_code.json`（スライドパーク円故障コードデータ、駐車場タイプ: "スライドパーク円"）
   - `data/parsed_data_circle_sl_sensor.json`（スライドパーク円（SL-TL、SL-L）センサデータ、駐車場タイプ: "スライドパーク円（SL-TL、SL-L）"）
   - `data/parsed_data_shift_sensor.json`（シフトパークセンサデータ、駐車場タイプ: "シフトパーク"）
   - `data/parsed_data_shift_code.json`（シフトパーク故障コードデータ、駐車場タイプ: "シフトパーク"）

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
     - **注意**: 現在の `postbuild` スクリプトは `prisma db push` を使用しています（マイグレーションファイルではなくスキーマを直接適用）
     - 本番環境でマイグレーションファイルを使用する場合は、`postbuild` スクリプトを以下のように変更してください：
       ```json
       "postbuild": "npx prisma migrate deploy && node scripts/initData.js"
       ```
     - マイグレーションファイルを使用する場合、`--force-reset` フラグは使用しないでください（既存データが削除されます）
   - Vercel は Next.js プロジェクトを自動検出するため、特別な設定ファイル（`vercel.json`）は不要です

4. **デプロイの実行**

   - 「Deploy」ボタンをクリック
   - ビルドプロセスで以下が自動実行されます：
     1. `npm install`（依存関係のインストール）
     2. `prisma generate`（Prisma Client の生成、`postinstall` スクリプト）
     3. `next build`（Next.js のビルド）
     4. `prisma db push --force-reset`（データベーススキーマの適用、`postbuild` スクリプト）
        - **注意**: `--force-reset`フラグにより、既存のデータベースがリセットされ、新しいスキーマが適用されます
        - マイグレーションファイルを使用する場合は、`postbuild` スクリプトを `npx prisma migrate deploy && node scripts/initData.js` に変更してください
        - マイグレーションファイルを使用する場合、`--force-reset` フラグは使用しないでください（既存データが削除されます）
     5. `node scripts/initData.js`（データ初期化、`postbuild` スクリプト）
        - JSON ファイルからデータベースにデータを投入します
        - 既存データが存在する場合は、データ投入をスキップします（Vercel 環境では`--force-reset`により常にデータ投入が実行されます）

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
  - `data/parsed_data_c_sensor.json`（リフトパーク（C）センサデータ、駐車場タイプ: "リフトパーク（C）"）
  - `data/parsed_data_lift_code.json`（リフトパーク故障コードデータ、駐車場タイプ: "リフトパーク"）
  - `data/parsed_data_c_front_sensor.json`（リフトパーク（縦列・前側）センサデータ、駐車場タイプ: "リフトパーク（縦列・前側）"）
  - `data/parsed_data_c_back_sensor.json`（リフトパーク（縦列・奥側）センサデータ、駐車場タイプ: "リフトパーク（縦列・奥側）"）
  - `data/parsed_data_circle_slmt_sensor.json`（スライドパーク円（SLMT、SLM）センサデータ、駐車場タイプ: "スライドパーク円（SLMT、SLM）"）
  - `data/parsed_data_circle_code.json`（スライドパーク円故障コードデータ、駐車場タイプ: "スライドパーク円"）
  - `data/parsed_data_circle_sl_sensor.json`（スライドパーク円（SL-TL、SL-L）センサデータ、駐車場タイプ: "スライドパーク円（SL-TL、SL-L）"）
  - `data/parsed_data_shift_sensor.json`（シフトパークセンサデータ、駐車場タイプ: "シフトパーク"）
  - `data/parsed_data_shift_code.json`（シフトパーク故障コードデータ、駐車場タイプ: "シフトパーク"）

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
│   ├── parsed_data_tower_code.json       # 故障マスタJSONファイル（駐車場タイプ: "タワーパーク"、Git管理）
│   ├── parsed_data_mt_sensor.json        # MTセンサデータ（駐車場タイプ: "タワーパーク（MT）"、Git管理）
│   ├── parsed_data_m_sensor.json         # Mセンサデータ（駐車場タイプ: "タワーパーク（M）"、Git管理）
│   ├── parsed_data_c_sensor.json         # リフトパーク（C）センサデータ（駐車場タイプ: "リフトパーク（C）"、Git管理）
│   ├── parsed_data_lift_code.json        # リフトパーク故障コードデータ（駐車場タイプ: "リフトパーク"、Git管理）
│   ├── parsed_data_c_front_sensor.json   # リフトパーク（縦列・前側）センサデータ（駐車場タイプ: "リフトパーク（縦列・前側）"、Git管理）
│   ├── parsed_data_c_back_sensor.json    # リフトパーク（縦列・奥側）センサデータ（駐車場タイプ: "リフトパーク（縦列・奥側）"、Git管理）
│   ├── parsed_data_circle_slmt_sensor.json # スライドパーク円（SLMT、SLM）センサデータ（駐車場タイプ: "スライドパーク円（SLMT、SLM）"、Git管理）
│   ├── parsed_data_circle_code.json      # スライドパーク円故障コードデータ（駐車場タイプ: "スライドパーク円"、Git管理）
│   ├── parsed_data_circle_sl_sensor.json # スライドパーク円（SL-TL、SL-L）センサデータ（駐車場タイプ: "スライドパーク円（SL-TL、SL-L）"、Git管理）
│   ├── parsed_data_shift_sensor.json     # シフトパークセンサデータ（駐車場タイプ: "シフトパーク"、Git管理）
│   └── parsed_data_shift_code.json       # シフトパーク故障コードデータ（駐車場タイプ: "シフトパーク"、Git管理）
├── docs/                 # ドキュメント
├── compose.yaml          # Docker Compose設定
└── README.md            # このファイル
```

## 注意事項

- JSON ファイルは Git 管理に含まれます（本番環境で使用するため）
- データ初期化スクリプト（`initData.js`）は JSON ファイルから直接データを読み込みます（エクセルファイルへの依存はありません）
- PostgreSQL データベースは Docker ボリューム（`postgres_data`）に保存されます
- センサ状態データは各駐車場タイプに対応する JSON ファイルから読み込まれます
- データベーススキーマには`parkingType`フィールドが含まれており、各データは駐車場タイプで区別されます
- プルダウンで選択可能な駐車場タイプ：
  - タワーパーク（M）
  - タワーパーク（MT）
  - リフトパーク（C）
  - リフトパーク（縦列・前側）
  - リフトパーク（縦列・奥側）
  - スライドパーク円（SLMT、SLM）
  - スライドパーク円（SL-TL、SL-L）
  - シフトパーク
- 故障コードは駐車場タイプごとに異なる場合があります：
  - タワーパーク（M）、タワーパーク（MT）→「タワーパーク」の故障コード
  - リフトパーク（C）、リフトパーク（縦列・前側）、リフトパーク（縦列・奥側）→「リフトパーク」の故障コード
  - スライドパーク円（SLMT、SLM）、スライドパーク円（SL-TL、SL-L）→「スライドパーク円」の故障コード
  - シフトパーク →「シフトパーク」の故障コード

## センサ状態ページについて

センサ状態ページ（`/sensors`）では、16 進数（4 桁）を入力することで、ON になっているセンサを表示できます。

- データベースからセンサデータを取得して表示します（選択された駐車場タイプに応じて）
- 駐車場タイプによって異なる数のグループ（センサ状態）に対応しています：
  - タワーパーク（M）、タワーパーク（MT）、スライドパーク円: 6 グループ（センサ状態 1〜6）
  - リフトパーク（C）、リフトパーク（縦列・奥側）: 8 グループ（センサ状態 1〜8）
  - リフトパーク（縦列・前側）: 12 グループ（センサ状態 1〜12）
  - シフトパーク: 8 グループ（センサ状態 1〜8、B630-B64F、X200-X27F）
- 各グループは 16 個のセンサで構成されています（センサコード範囲は駐車場タイプによって異なります）
- 16 進数入力は自動的に大文字に変換され、16 進数以外の文字は除外されます
- データベースにセンサデータが登録されていない場合は、エラーメッセージが表示されます
- 駐車場タイプを変更すると、センサ状態の入力フィールドと表示がリセットされます
- センサ状態のグループ数は、受信したデータに基づいて動的に決定されます

## 駐車場タイプについて

- ヘッダーのプルダウンで駐車場タイプを切り替えることができます
- 選択可能な駐車場タイプ：
  - **タワーパーク（M）**: M 型タワーパークのセンサデータを表示
  - **タワーパーク（MT）**: MT 型タワーパークのセンサデータを表示
  - **リフトパーク（C）**: リフトパーク（C）のセンサデータを表示
  - **リフトパーク（縦列・前側）**: リフトパーク（縦列・前側）のセンサデータを表示
  - **リフトパーク（縦列・奥側）**: リフトパーク（縦列・奥側）のセンサデータを表示
  - **スライドパーク円（SLMT、SLM）**: スライドパーク円（SLMT、SLM）のセンサデータを表示
  - **スライドパーク円（SL-TL、SL-L）**: スライドパーク円（SL-TL、SL-L）のセンサデータを表示
  - **シフトパーク**: シフトパークのセンサデータを表示
- 故障コードは駐車場タイプごとに異なります：
  - タワーパーク（M）、タワーパーク（MT）→「タワーパーク」の故障コード
  - リフトパーク（C）、リフトパーク（縦列・前側）、リフトパーク（縦列・奥側）→「リフトパーク」の故障コード
  - スライドパーク円（SLMT、SLM）、スライドパーク円（SL-TL、SL-L）→「スライドパーク円」の故障コード
  - シフトパーク →「シフトパーク」の故障コード
- 駐車場タイプを変更すると、検索入力と検索結果がリセットされます

## トラブルシューティング

### JSON ファイルが見つからないエラー

本番環境で JSON ファイルが見つからない場合：

1. 必要な JSON ファイルが存在することを確認：
   - `data/parsed_data_tower_code.json`
   - `data/parsed_data_mt_sensor.json`
   - `data/parsed_data_m_sensor.json`
   - `data/parsed_data_c_sensor.json`
   - `data/parsed_data_lift_code.json`
   - `data/parsed_data_c_front_sensor.json`
   - `data/parsed_data_c_back_sensor.json`
   - `data/parsed_data_circle_slmt_sensor.json`
   - `data/parsed_data_circle_code.json`
   - `data/parsed_data_circle_sl_sensor.json`
   - `data/parsed_data_shift_sensor.json`
   - `data/parsed_data_shift_code.json`
2. JSON ファイルを Git にコミット
3. 本番環境にデプロイ

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

# データベースを再作成（マイグレーションファイルを使用する場合、推奨）
docker compose exec app npx prisma migrate deploy

# または、スキーマを直接適用する場合（開発環境のみ）
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

## 認証情報

### 開発環境

- **ユーザー ID**: `user`
- **パスワード**: `password`

### 本番環境

- **ユーザー ID**: `osaka9999`
- **パスワード**: `4567`

**注意**: これらの認証情報は初期化スクリプト（`initData.js`）によって自動的に作成されます。環境変数（`NODE_ENV`、`VERCEL`、`VERCEL_ENV`）に基づいて、開発環境と本番環境で異なるユーザーが作成されます。
