# 技術スタック

## 概要

立体駐車場故障対応管理システムで使用する技術スタックの一覧と詳細です。

---

## フロントエンド

### フレームワーク
- **Next.js 16.0.4**
  - React ベースのフルスタックフレームワーク
  - App Router を使用
  - Server Components と Client Components の使い分け
  - ファイルベースルーティング
  - 自動コード分割と最適化

### 言語
- **TypeScript 5.x**
  - 型安全性の確保
  - 開発効率の向上
  - エラーの早期発見

### UI ライブラリ
- **React 19.2.0**
  - ユーザーインターフェース構築
  - コンポーネントベースの開発
  - 仮想 DOM による高速レンダリング

### スタイリング
- **Tailwind CSS 4.x**
  - ユーティリティファーストの CSS フレームワーク
  - レスポンシブデザイン対応
  - カスタマイズ可能なデザインシステム
  - ビルド時の最適化

### 状態管理
- **React Server Components**
  - Next.js App Router の Server Components
  - サーバーサイドでの状態管理
  - クライアントサイドの状態管理は必要に応じて React Hooks を使用

---

## バックエンド

### フレームワーク
- **Next.js API Routes**
  - Next.js 内蔵の API エンドポイント
  - Server Actions の活用
  - RESTful API の構築

### 言語
- **TypeScript 5.x**
  - フロントエンドとバックエンドで統一
  - 型安全性の確保

### ORM
- **Prisma 6.19.0**
  - 型安全なデータベースアクセス
  - マイグレーション管理
  - Prisma Studio によるデータ管理
  - 自動生成される Prisma Client

### データベース
- **PostgreSQL 16**
  - オープンソースのリレーショナルデータベース
  - ACID 準拠
  - 高パフォーマンス
  - 本番環境でも安定して動作

---

## インフラストラクチャ

### コンテナ化
- **Docker Compose**
  - マルチコンテナアプリケーションの管理
  - 開発環境の統一
  - 依存関係の管理

### アプリケーションコンテナ
- **Node.js 24**
  - JavaScript ランタイム
  - Next.js の実行環境
  - npm パッケージマネージャー

### データベースコンテナ
- **PostgreSQL 16**
  - Docker コンテナとして実行
  - ボリューム（`postgres_data`）によるデータ永続化
  - ヘルスチェック機能付き

---

## 開発ツール

### パッケージマネージャー
- **npm**
  - Node.js の標準パッケージマネージャー
  - 依存関係の管理
  - スクリプトの実行

### リンター
- **ESLint 9.x**
  - コード品質の確保
  - コーディング規約の統一
  - Next.js 用の設定（eslint-config-next）

### エクセル解析（開発環境のみ）
- **xlsx 0.18.5**（devDependencies）
  - エクセルファイルの読み込み
  - データの解析と変換
  - .xls および .xlsx 形式に対応
  - 開発環境でのみ使用（本番環境ではJSONファイルを使用）

### 型定義
- **@types/node 20.x**
  - Node.js の型定義
- **@types/react 19.x**
  - React の型定義
- **@types/react-dom 19.x**
  - React DOM の型定義
- **@types/xlsx 0.0.35**
  - xlsx ライブラリの型定義

---

## 依存関係の詳細

### 本番依存関係（dependencies）

```json
{
  "@prisma/client": "^6.19.0",
  "next": "16.0.4",
  "prisma": "^6.19.0",
  "react": "19.2.0",
  "react-dom": "19.2.0",
}
```

### 開発依存関係（devDependencies）

```json
{
  "@tailwindcss/postcss": "^4",
  "@types/node": "^20",
  "@types/react": "^19",
  "@types/react-dom": "^19",
  "@types/xlsx": "^0.0.35",
  "eslint": "^9",
  "eslint-config-next": "16.0.4",
  "tailwindcss": "^4",
  "typescript": "^5"
}
```

---

## アーキテクチャ

### ディレクトリ構造

```
src/
├── app/              # Next.js App Router のページとルート
│   ├── (routes)/    # ルートグループ
│   └── api/         # API ルート
├── components/       # React コンポーネント
├── lib/             # ユーティリティ関数
│   └── prisma.js    # Prisma Client の初期化
├── prisma/          # Prisma スキーマとマイグレーション
│   └── schema.prisma
└── scripts/         # スクリプトファイル
    └── parseExcel.js
```

### データフロー

1. **クライアントリクエスト**
   - Next.js App Router でルーティング
   - Server Components でデータ取得

2. **データベースアクセス**
   - Prisma Client を使用
   - 型安全なクエリ実行

3. **レスポンス**
   - Server Components で HTML 生成
   - 必要に応じて Client Components でインタラクティブな UI

---

## 開発環境

### 必要な環境
- **Docker** および **Docker Compose**
- **Git**（バージョン管理）

### 開発サーバー
- **Next.js Dev Server**
  - ホットリロード対応
  - 開発時の最適化
  - ポート: 3000

### データベース管理
- **Prisma Studio**
  - データベースの可視化
  - データの直接編集
  - ポート: 5555

---

## ビルドとデプロイ

### ビルドコマンド
```bash
npm run build
```

### 本番サーバー起動
```bash
npm start
```

### 開発サーバー起動
```bash
npm run dev
```

---

## 将来追加を検討している技術

### チャートライブラリ（ダッシュボード機能用）
- **Chart.js** または **Recharts**
  - 故障の発生傾向グラフ表示
  - 統計情報の可視化

### フォーム管理
- **React Hook Form**
  - フォームの状態管理
  - バリデーション

### UI コンポーネントライブラリ
- **shadcn/ui** または **Radix UI**
  - アクセシビリティに優れたコンポーネント
  - カスタマイズ可能

### テストフレームワーク
- **Jest**
  - ユニットテスト
- **React Testing Library**
  - コンポーネントテスト
- **Playwright** または **Cypress**
  - E2E テスト

### 認証（将来の拡張機能）
- **NextAuth.js**
  - 認証機能の実装
  - セッション管理

---

## バージョン管理

### 推奨バージョン管理戦略
- **セマンティックバージョニング**
- **Git タグ**によるリリース管理
- **ブランチ戦略**: main, develop, feature/*

---

## パフォーマンス最適化

### Next.js の最適化機能
- 自動コード分割
- 画像最適化（next/image）
- フォント最適化（next/font）
- 静的生成（SSG）
- サーバーサイドレンダリング（SSR）
- インクリメンタル静的再生成（ISR）

### データベース最適化
- Prisma のクエリ最適化
- インデックスの適切な設定
- 接続プールの管理

---

## セキュリティ

### 実装済み・検討事項
- **SQL インジェクション対策**: Prisma による型安全なクエリ
- **XSS 対策**: React の自動エスケープ
- **CSRF 対策**: Next.js の CSRF 保護
- **環境変数**: `.env.local` による機密情報の管理

---

## 参考資料

- [Next.js 公式ドキュメント](https://nextjs.org/docs)
- [Prisma 公式ドキュメント](https://www.prisma.io/docs)
- [Tailwind CSS 公式ドキュメント](https://tailwindcss.com/docs)
- [React 公式ドキュメント](https://react.dev)
- [PostgreSQL 公式ドキュメント](https://www.postgresql.org/docs/)

---

**最終更新日**: 2025 年 12 月 28 日



