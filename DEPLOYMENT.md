# デプロイ手順 - GitHub + Vercel + Neon PostgreSQL

## 1. GitHubリポジトリの準備

### 1.1 ローカルリポジトリの初期化
```bash
# Gitリポジトリを初期化
git init

# ファイルをステージング
git add .

# 初回コミット
git commit -m "Initial commit: Exchange Student System with Neon PostgreSQL"

# リモートリポジトリを追加（GitHubで作成したリポジトリのURL）
git remote add origin https://github.com/your-username/exchange-student-system.git

# メインブランチにプッシュ
git branch -M main
git push -u origin main
```

### 1.2 GitHubリポジトリの作成
1. [GitHub](https://github.com)にアクセス
2. "New repository"をクリック
3. リポジトリ名: `exchange-student-system`
4. 説明: "交換留学生向けの在籍証明書と活動報告書提出システム"
5. PublicまたはPrivateを選択
6. "Create repository"をクリック

## 2. Neon PostgreSQLの設定

### 2.1 Neonアカウント作成
1. [Neon](https://neon.tech)にアクセス
2. "Sign Up"でアカウント作成
3. GitHubまたはGoogleアカウントでログイン

### 2.2 プロジェクト作成
1. "New Project"をクリック
2. プロジェクト名: `exchange-student-system`
3. リージョン: Vercelと同じリージョンを選択
4. "Create Project"をクリック

### 2.3 接続情報の取得
1. 接続文字列をコピー
2. 形式: `postgresql://username:password@hostname:port/database?sslmode=require`

## 3. Vercelでのデプロイ

### 3.1 Vercelプロジェクトの作成
1. [Vercel](https://vercel.com)にアクセス
2. GitHubアカウントでログイン
3. "New Project"をクリック
4. GitHubリポジトリを選択
5. "Import"をクリック

### 3.2 プロジェクト設定
- **Framework Preset**: Other
- **Root Directory**: `./` (デフォルト)
- **Build Command**: `npm run vercel-build`
- **Output Directory**: `client/build`
- **Install Command**: `npm run install-all`

### 3.3 環境変数の設定
Vercelダッシュボードで以下を設定：
- `DATABASE_URL`: Neonの接続文字列
- `JWT_SECRET`: 強力なJWTシークレットキー（例：`your-super-secret-key-here-2024`）

### 3.4 デプロイ
1. "Deploy"をクリック
2. デプロイが完了するまで待機（約2-3分）

## 4. データベース初期化

### 4.1 初期化の実行
デプロイ完了後、以下のURLにアクセス：
```
https://your-app-name.vercel.app/api/init-db
```

または、curlコマンドで実行：
```bash
curl -X POST https://your-app-name.vercel.app/api/init-db
```

### 4.2 初期化の確認
成功すると以下のレスポンスが返されます：
```json
{
  "message": "Database initialized successfully"
}
```

## 5. アプリケーションの確認

### 5.1 管理者アカウントでログイン
- URL: `https://your-app-name.vercel.app`
- ユーザー名: `admin`
- パスワード: `admin123`

### 5.2 機能テスト
1. 学生アカウントの作成
2. 活動報告書の提出
3. 在籍証明書の申請
4. 管理者による承認

## 6. カスタムドメインの設定（オプション）

### 6.1 ドメインの追加
1. Vercelダッシュボードでプロジェクトを開く
2. "Settings" → "Domains"をクリック
3. カスタムドメインを追加

### 6.2 DNS設定
- Type: CNAME
- Name: `@` または `www`
- Value: `cname.vercel-dns.com`

## 7. 継続的デプロイメント

### 7.1 自動デプロイ
- GitHubにプッシュすると自動的にVercelにデプロイ
- プルリクエストでプレビューデプロイ

### 7.2 環境分離
- Production: `main`ブランチ
- Preview: プルリクエスト
- Development: ローカル開発

## 8. 監視とログ

### 8.1 Vercel Analytics
1. Vercelダッシュボードで"Analytics"を有効化
2. パフォーマンスとエラーを監視

### 8.2 Neon Monitoring
1. Neonダッシュボードでメトリクスを確認
2. クエリパフォーマンスを監視

## 9. バックアップと復旧

### 9.1 Neonバックアップ
- 自動バックアップ（7日間）
- ポイントインタイムリカバリ
- 手動バックアップの作成

### 9.2 コードバックアップ
- GitHubでコードをバックアップ
- リリースタグでバージョン管理

## 10. セキュリティ

### 10.1 環境変数
- 機密情報は環境変数で管理
- 本番環境では強力なパスワードを使用

### 10.2 アクセス制御
- JWTトークンの有効期限設定
- 管理者権限の適切な管理

## トラブルシューティング

### デプロイエラー
1. ビルドログを確認
2. 依存関係のインストールエラーを確認
3. 環境変数が正しく設定されているか確認

### データベース接続エラー
1. `DATABASE_URL`が正しく設定されているか確認
2. Neonプロジェクトのステータスを確認
3. SSL設定を確認

### アプリケーションエラー
1. Vercelの関数ログを確認
2. ブラウザの開発者ツールでエラーを確認
3. APIエンドポイントの動作を確認
