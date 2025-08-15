# 交換留学生システム (Exchange Student System)

交換留学生向けの在籍証明書と活動報告書を提出するWebアプリケーションです。

## 機能

### 学生機能
- ユーザー登録・ログイン
- 活動報告書の提出・管理
- 在籍証明書の申請・確認
- 個人情報の管理

### 管理者機能
- 学生の活動報告書の確認・承認
- 在籍証明書の承認・発行
- システム全体の管理

## 技術スタック

### フロントエンド
- React 18
- Tailwind CSS
- React Router
- Axios
- React Hook Form
- Lucide React (アイコン)

### バックエンド
- Node.js
- Express.js
- Neon PostgreSQL (本番環境)
- JWT認証
- bcryptjs (パスワードハッシュ化)

### デプロイ
- Vercel (フロントエンド + バックエンド)
- Neon PostgreSQL (データベース)

## セットアップ

### ローカル開発

1. リポジトリをクローン
```bash
git clone <repository-url>
cd exchange-student-system
```

2. 依存関係をインストール
```bash
npm run install-all
```

3. 環境変数の設定
```bash
# .env.local ファイルを作成
DATABASE_URL=your_neon_postgres_connection_string
JWT_SECRET=your_jwt_secret_key
```

4. 開発サーバーを起動
```bash
npm run dev
```

### Vercelでのデプロイ

1. GitHubにリポジトリをプッシュ
```bash
git add .
git commit -m "Update for Vercel Postgres deployment"
git push origin main
```

2. Vercelでプロジェクトをインポート
   - Vercelダッシュボードにアクセス
   - "New Project"をクリック
   - GitHubリポジトリを選択
   - 自動的に設定が適用される

3. Neon PostgreSQLの設定
   - [Neon](https://neon.tech)でアカウントを作成
   - 新しいプロジェクトを作成
   - 接続文字列をコピー（DATABASE_URL）

4. 環境変数の設定
   - Vercelダッシュボードでプロジェクト設定
   - "Environment Variables"で以下を設定：
     - `DATABASE_URL`: Neon PostgreSQLの接続文字列
     - `JWT_SECRET`: 任意のJWTシークレットキー

5. データベースの初期化
   - デプロイ後、以下のエンドポイントにPOSTリクエストを送信：
   ```
   POST https://your-app.vercel.app/api/init-db
   ```

## 使用方法

### 学生アカウント
1. アプリケーションにアクセス
2. "新規登録"でアカウントを作成
3. ログイン後、活動報告書や在籍証明書を申請

### 管理者アカウント
- ユーザー名: `admin`
- パスワード: `admin123`

## API エンドポイント

### 認証
- `POST /api/register` - ユーザー登録
- `POST /api/login` - ログイン
- `GET /api/profile` - ユーザー情報取得

### 活動報告書
- `GET /api/activity-reports` - 報告書一覧取得
- `POST /api/activity-reports` - 報告書作成

### 在籍証明書
- `GET /api/enrollment-certificates` - 証明書一覧取得
- `POST /api/enrollment-certificates` - 証明書申請
- `PUT /api/enrollment-certificates/:id/status` - ステータス更新（管理者）

### システム
- `GET /api/health` - ヘルスチェック
- `POST /api/init-db` - データベース初期化

## データベーススキーマ

### users テーブル
- `id`: 主キー (SERIAL)
- `username`: ユーザー名 (VARCHAR(255), UNIQUE)
- `email`: メールアドレス (VARCHAR(255), UNIQUE)
- `password`: ハッシュ化されたパスワード (VARCHAR(255))
- `role`: ユーザー役割 (VARCHAR(50), DEFAULT 'student')
- `created_at`: 作成日時 (TIMESTAMP)

### activity_reports テーブル
- `id`: 主キー (SERIAL)
- `user_id`: ユーザーID (INTEGER, FOREIGN KEY)
- `title`: タイトル (VARCHAR(255))
- `description`: 説明 (TEXT)
- `date`: 日付 (VARCHAR(255))
- `created_at`: 作成日時 (TIMESTAMP)

### enrollment_certificates テーブル
- `id`: 主キー (SERIAL)
- `user_id`: ユーザーID (INTEGER, FOREIGN KEY)
- `student_name`: 学生名 (VARCHAR(255))
- `student_id`: 学生ID (VARCHAR(255))
- `program`: プログラム名 (VARCHAR(255))
- `start_date`: 開始日 (VARCHAR(255))
- `end_date`: 終了日 (VARCHAR(255))
- `status`: ステータス (VARCHAR(50), DEFAULT 'pending')
- `created_at`: 作成日時 (TIMESTAMP)

## 注意事項

- Neon PostgreSQLを使用することで、高性能なサーバーレスデータベースが利用可能です
- 本番環境では適切なJWTシークレットキーを設定してください
- データベース初期化は初回デプロイ後に一度実行してください

## トラブルシューティング

### Vercelデプロイエラー
1. `vercel.json`の設定を確認
2. ビルドログでエラーの詳細を確認
3. 環境変数が正しく設定されているか確認
4. Vercel Postgresの接続が正常か確認

### データベース接続エラー
1. `DATABASE_URL`環境変数が正しく設定されているか確認
2. Neon PostgreSQLのステータスを確認
3. データベース初期化が実行されているか確認

### ローカル開発エラー
1. 依存関係が正しくインストールされているか確認
2. ポート5000が使用可能か確認
3. Node.jsのバージョンが適切か確認
4. PostgreSQLがローカルで動作しているか確認

## ライセンス

MIT License

## 貢献

プルリクエストやイシューの報告を歓迎します。 