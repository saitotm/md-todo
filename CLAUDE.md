# CLAUDE.md - MD-Todo プロジェクト開発ガイド

## プロジェクト概要

MD-Todo は、マークダウン形式でタスクを管理できるモダンな Web アプリケーションです。フロントエンドに React + Remix、バックエンドに Rust + axum、データベースに PostgreSQL を使用したフルスタックアプリケーションです。

## アーキテクチャ

### 技術スタック

**フロントエンド:**

- React 18 + Remix
- TypeScript
- Tailwind CSS
- カスタム状態管理システム (FormState, ErrorHandler)
- Vitest (テスト)
- Vite (ビルドツール)

**バックエンド:**

- Rust
- axum (非同期 Web フレームワーク)
- sqlx (PostgreSQL クエリビルダー)
- utoipa (OpenAPI 仕様書生成)
- tracing (構造化ログ)
- Cargo (ビルドツール)

**データベース:**

- PostgreSQL 18
- UUID v7 主キー
- マイグレーション管理

**インフラ:**

- Docker + Docker Compose
- DevContainer 対応
- GitHub Actions CI/CD

### システム構成

```
Frontend (React+Remix) ←→ Backend (Rust+axum) ←→ Database (PostgreSQL)
Port: 3000                Port: 8000               Port: 5432
```

## プロジェクト構造

```
md-todo/
├── frontend/             # React + Remix フロントエンド
│   ├── app/             # Remix アプリケーション
│   │   ├── routes/      # ルーティング
│   │   ├── entry.client.tsx
│   │   ├── entry.server.tsx
│   │   └── root.tsx
│   ├── public/          # 静的ファイル
│   ├── test/            # テストファイル
│   └── package.json     # Node.js依存関係
├── backend/             # Rust + axum バックエンド
│   ├── src/
│   │   ├── main.rs      # エントリーポイント
│   │   ├── lib.rs       # コアロジック
│   │   └── bin/         # 開発ツール
│   │       └── generate_openapi.rs  # OpenAPI仕様書生成
│   ├── tests/           # テストファイル
│   ├── openapi.json     # 生成されたOpenAPI仕様書
│   └── Cargo.toml       # Rust依存関係
├── database/            # データベース設定
│   ├── migrations/      # マイグレーションファイル
│   └── init.sql         # 初期化スクリプト
├── .devcontainer/       # DevContainer設定
├── .github/workflows/   # GitHub Actions CI/CD
└── docker-compose.yml   # コンテナオーケストレーション
```

## 開発環境セットアップ

### フロントエンド開発

```bash
cd frontend
npm install
npm run dev        # 開発サーバー起動
npm test          # テスト実行
npm run build     # ビルド
npm run lint      # リント実行
npm run typecheck # 型チェック
```

### バックエンド開発

```bash
cd backend
cargo run         # 開発サーバー起動
cargo test        # テスト実行
cargo build       # ビルド
cargo clippy      # リント実行
cargo fmt         # フォーマット

# OpenAPI仕様書生成
cargo run --bin generate_openapi  # openapi.json生成
```

## 開発フロー

### GitHub Flow

このプロジェクトでは GitHub Flow を採用しています：

1. **ブランチ作成**

   ```bash
   git checkout -b feature/機能名
   ```

2. **こまめなコミット**

   - 機能の実装は小さな単位に分けてコミット
   - わかりやすいコミットメッセージを心がける
   - **重要: コミットメッセージは英語で記述する**
   - 例: `feat: add user registration feature`、`fix: resolve task deletion bug`

3. **プルリクエスト**

   - 機能が完成したらプルリクエストを作成
   - **重要: プルリクエストのタイトルと説明は英語で記述する**
   - コードレビューを経てマージ

4. **コミット規約**
   - `feat:` - 新機能
   - `fix:` - バグ修正
   - `docs:` - ドキュメント更新
   - `style:` - コードスタイル修正
   - `refactor:` - リファクタリング
   - `test:` - テスト追加・修正
   - `chore:` - その他の変更

### 英語記述のルール

**必須英語記述対象:**

- コミットメッセージ
- プルリクエストのタイトル・説明
- Issue のタイトル・説明
- コードコメント
- 変数名・関数名・クラス名

## 開発コマンド

### 全体

```bash
# 全サービス起動
docker compose up -d

# 全サービス停止
docker compose down

# ログ確認
docker compose logs -f [service-name]

# データベース初期化
docker compose down -v && docker compose up -d
```

### フロントエンド

```bash
# パッケージインストール
npm install

# 開発サーバー起動（ホットリロード）
npm run dev

# テスト実行
npm test

# テスト（UIモード）
npm run test:ui

# ビルド
npm run build

# リント
npm run lint

# 型チェック
npm run typecheck
```

### バックエンド

```bash
# 開発サーバー起動（ホットリロード）
cargo run

# テスト実行
cargo test

# ビルド
cargo build

# リリースビルド
cargo build --release

# リント
cargo clippy

# フォーマット
cargo fmt

# 依存関係チェック
cargo check
```

#### OpenAPI 関連

```bash
# OpenAPI仕様書生成（JSONファイル）
cargo run --bin generate_openapi
```

## 状態管理

### フロントエンド状態管理

フロントエンドでは、カスタムの状態管理システムを採用しています：

#### コアクラス

**FormState クラス:**
- 汎用的なフォーム状態の管理
- バリデーション、dirty/touched状態の追跡
- 非同期送信処理のサポート

**TodoFormState クラス:**
- Todo固有のフォーム状態管理
- FormStateを継承し、Todo特有のバリデーションを実装
- 作成・更新データの生成機能

#### エラーハンドリング

**StateError クラス:**
- アプリケーション全体のエラー基底クラス
- タイプ別エラー分類（validation, network, etc.）

**ValidationError クラス:**
- フォームバリデーションエラー専用
- フィールド固有のエラー情報を保持

**NetworkError クラス:**
- API通信エラー専用  
- 再試行可能性の判定機能

**ErrorHandler クラス:**
- エラー処理のユーティリティ
- エラーメッセージの整形とユーザー表示制御

#### ファイル構成

```
app/lib/
├── state-errors.ts     # エラークラス定義
├── form-state.ts       # フォーム状態管理
└── types.ts            # 型定義
```

## データベース

### スキーマ

**todos テーブル:**

- `id`: UUID (主キー、uuidv7()使用)
- `title`: TEXT (タスクタイトル)
- `content`: TEXT (マークダウンコンテンツ)
- `completed`: BOOLEAN (完了状態)
- `created_at`: TIMESTAMP WITH TIME ZONE
- `updated_at`: TIMESTAMP WITH TIME ZONE (自動更新)

### マイグレーション

```bash
# マイグレーション実行（Docker Compose起動時に自動実行）
docker compose up -d db
```

マイグレーションファイル:

- `001_initial_schema.sql`: 初期スキーマ
- `002_sample_data.sql`: サンプルデータ

## API 仕様

### ベース URL

```
http://localhost:8000
```

### OpenAPI ドキュメント

#### OpenAPI 仕様書（JSON）

```
http://localhost:8000/api-docs/openapi.json
```

- 標準 OpenAPI 3.0.3 フォーマット
- 他のツールとの統合に利用

#### ローカルファイル生成

```bash
cargo run --bin generate_openapi
# -> openapi.json ファイルが生成される
```

### エンドポイント

#### ヘルスチェック

- `GET /health` - サーバー状態確認

#### Todo 管理

- `GET /api/todos` - 全 Todo 取得
- `POST /api/todos` - Todo 作成
- `GET /api/todos/:id` - 特定 Todo 取得
- `PATCH /api/todos/:id` - Todo 更新（部分更新）
- `DELETE /api/todos/:id` - Todo 削除

### レスポンス形式

```json
{
  "success": true,
  "data": {
    "id": "018c2e65-4b7f-7000-8000-000000000000",
    "title": "タスクタイトル",
    "content": "# タスク説明\n\n**マークダウン**形式のタスクです。",
    "completed": false,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

## テスト

### フロントエンド

```bash
# テスト実行
npm test

# テスト（ウォッチモード）
npm test -- --watch

# テスト（UIモード）
npm run test:ui

# カバレッジ
npm test -- --coverage
```

### バックエンド

```bash
# 単体テスト
cargo test

# 統合テスト
cargo test --test integration_test

# テスト（詳細出力）
cargo test -- --nocapture
```

## コード品質

### リント・フォーマット

**フロントエンド:**

```bash
npm run lint        # ESLint実行
npm run typecheck   # TypeScript型チェック
```

**バックエンド:**

```bash
cargo clippy        # Rustリント
cargo fmt           # Rustフォーマット
```

### CI/CD

GitHub Actions で以下を自動実行：

- リント・フォーマットチェック
- 型チェック
- 単体テスト
- 統合テスト
- Docker ビルド

## 環境変数

### 開発環境

```env
# バックエンド
DATABASE_URL=postgres://md_todo_user:md_todo_password@localhost:5432/md_todo_dev
RUST_LOG=debug

# フロントエンド
API_URL=http://localhost:8000
```

## トラブルシューティング

### よくある問題

1. **ポートが使用中**

   ```bash
   # ポート使用状況確認
   lsof -i :3000
   lsof -i :8000
   lsof -i :5432
   ```

2. **データベース接続エラー**

   ```bash
   # データベースコンテナ再起動
   docker compose restart db
   ```

3. **依存関係の問題**

   ```bash
   # フロントエンド
   rm -rf node_modules package-lock.json
   npm install

   # バックエンド
   cargo clean
   cargo build
   ```

4. **OpenAPI 仕様書の更新**

   ```bash
   # API変更後、仕様書を再生成
   cargo run --bin generate_openapi
   ```

## 開発のベストプラクティス

1. **小さな単位でのコミット**

   - 1 つの機能変更につき 1 つのコミット
   - わかりやすいコミットメッセージを英語で記述

2. **テストの作成**

   - 新機能には必ずテストを追加
   - バグ修正にはリグレッションテストを追加

3. **コードレビュー**

   - プルリクエストでの相互レビュー
   - 自動テストの通過を確認

4. **API 文書化**

   - API 変更時は utoipa アノテーションも更新する
   - OpenAPI 仕様書を定期的に生成・確認する

5. **セキュリティ**
   - 秘密情報をコミットしない
   - 依存関係の脆弱性を定期的にチェック

## ドキュメント

プロジェクトの詳細なドキュメントは以下の場所にあります：

### 開発ドキュメント

- `docs/ARCHITECTURE.md` - システムアーキテクチャ詳細
- `docs/SETUP.md` - 開発環境セットアップガイド
- `docs/task-forms-documentation.md` - タスク作成・編集機能ドキュメント

### コンポーネントドキュメント

- `frontend/docs/FRONTEND_COMPONENTS.md` - フロントエンドコンポーネント詳細
- `frontend/docs/MARKDOWN_PROCESSING.md` - Markdown処理機能詳細
- `frontend/docs/TODO_LIST_FUNCTIONALITY.md` - Todoリスト機能詳細

## 参考リンク

- [React 公式ドキュメント](https://react.dev/)
- [Remix 公式ドキュメント](https://remix.run/)
- [axum 公式ドキュメント](https://docs.rs/axum/)
- [utoipa 公式ドキュメント](https://docs.rs/utoipa/)
- [OpenAPI 仕様](https://swagger.io/specification/)
- [PostgreSQL 公式ドキュメント](https://www.postgresql.org/docs/)
- [Docker 公式ドキュメント](https://docs.docker.com/)
