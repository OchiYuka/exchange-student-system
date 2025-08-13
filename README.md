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
- SQLite3 (メモリベース)
- JWT認証
- bcryptjs (パスワードハッシュ化)

### デプロイ
- Vercel (フロントエンド + バックエンド)

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

3. 開発サーバーを起動
```bash
npm run dev
```

### Vercelでのデプロイ

1. GitHubにリポジトリをプッシュ
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Vercelでプロジェクトをインポート
   - Vercelダッシュボードにアクセス
   - "New Project"をクリック
   - GitHubリポジトリを選択
   - 自動的に設定が適用される

3. 環境変数の設定（必要に応じて）
   - Vercelダッシュボードでプロジェクト設定
   - "Environment Variables"で設定

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

### 活動報告書
- `GET /api/activity-reports` - 報告書一覧取得
- `POST /api/activity-reports` - 報告書作成

### 在籍証明書
- `GET /api/enrollment-certificates` - 証明書一覧取得
- `POST /api/enrollment-certificates` - 証明書申請
- `PUT /api/enrollment-certificates/:id/status` - ステータス更新（管理者）

### プロフィール
- `GET /api/profile` - ユーザー情報取得

## 注意事項

- Vercelではファイルベースのデータベースが使用できないため、メモリベースのSQLiteを使用しています
- データはリクエストごとにリセットされます（本番環境では永続的なデータベースの使用を推奨）
- ファイルアップロード機能はVercelでは利用できません

## トラブルシューティング

### Vercelデプロイエラー
1. `vercel.json`の設定を確認
2. ビルドログでエラーの詳細を確認
3. 環境変数が正しく設定されているか確認

### ローカル開発エラー
1. 依存関係が正しくインストールされているか確認
2. ポート5000が使用可能か確認
3. Node.jsのバージョンが適切か確認

## ライセンス

MIT License

## 貢献

プルリクエストやイシューの報告を歓迎します。 