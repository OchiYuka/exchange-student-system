# Neon PostgreSQL セットアップガイド

## 1. Neonアカウントの作成

1. [Neon](https://neon.tech)にアクセス
2. "Sign Up"をクリックしてアカウントを作成
3. GitHubまたはGoogleアカウントでログイン

## 2. プロジェクトの作成

1. Neonダッシュボードで"New Project"をクリック
2. プロジェクト名を入力（例：`exchange-student-system`）
3. リージョンを選択（推奨：Vercelと同じリージョン）
4. "Create Project"をクリック

## 3. 接続情報の取得

1. プロジェクト作成後、接続文字列が表示されます
2. "Connection Details"セクションで以下を確認：
   - **Connection string**: `postgresql://username:password@hostname:port/database?sslmode=require`
   - **Database name**: データベース名
   - **Host**: ホスト名
   - **Port**: ポート番号（通常は5432）
   - **User**: ユーザー名
   - **Password**: パスワード

## 4. 環境変数の設定

### ローカル開発環境
`.env.local`ファイルを作成：
```bash
DATABASE_URL=postgresql://username:password@hostname:port/database?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=development
```

### Vercel本番環境
1. Vercelダッシュボードでプロジェクトを開く
2. "Settings" → "Environment Variables"をクリック
3. 以下の環境変数を追加：
   - `DATABASE_URL`: Neonの接続文字列
   - `JWT_SECRET`: 任意のJWTシークレットキー

## 5. 接続テスト

ローカルで接続をテスト：
```bash
cd api
npm install
node ../test-db-connection.js
```

## 6. データベース初期化

デプロイ後、以下のエンドポイントにPOSTリクエストを送信：
```bash
curl -X POST https://your-app.vercel.app/api/init-db
```

または、ブラウザで以下にアクセス：
```
https://your-app.vercel.app/api/init-db
```

## 7. Neonの利点

- **サーバーレス**: 使用量に応じた課金
- **自動スケーリング**: トラフィックに応じて自動調整
- **ブランチ機能**: 開発・本番環境の分離
- **高速**: グローバルCDNによる高速アクセス
- **Vercel統合**: Vercelとの優れた統合

## 8. トラブルシューティング

### 接続エラー
1. 接続文字列が正しいか確認
2. SSL設定が有効になっているか確認
3. ファイアウォール設定を確認

### パフォーマンス
1. 接続プールの設定を調整
2. クエリの最適化
3. インデックスの追加

## 9. セキュリティ

- 接続文字列は環境変数で管理
- 本番環境では強力なJWTシークレットを使用
- 定期的なパスワード変更
- アクセスログの監視

## 10. バックアップ

Neonは自動バックアップを提供：
- ポイントインタイムリカバリ
- 自動バックアップ（7日間）
- 手動バックアップの作成可能
