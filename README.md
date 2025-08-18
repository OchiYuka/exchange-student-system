# 交換留学生システム (Exchange Student System)

[![Deploy on Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/OchiYuka/exchange-student-system)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🌟 プロジェクト概要

交換留学生向けの活動報告書・在籍証明書提出システムです。React + Node.js + PostgreSQLで構築されたモダンなWebアプリケーションです。

**🌐 デプロイ済みアプリケーション**: [https://exchange-student-system.vercel.app/](https://exchange-student-system.vercel.app/)

## ✨ 主な機能

### 👤 ユーザー機能
- **ログイン・認証システム** - 学生と管理者の分離されたアクセス
- **ダッシュボード** - 個人の報告書・証明書管理
- **活動報告書提出** - フォームベースの報告書作成・提出
- **在籍証明書提出** - 証明書のアップロード・管理

### 🔧 管理者機能
- **管理者ダッシュボード** - 全ユーザーの報告書・証明書一覧
- **承認・却下機能** - 提出された書類の審査
- **ユーザー管理** - 学生アカウントの管理

## 🛠️ 技術スタック

### フロントエンド
- **React 18** - モダンなUIライブラリ
- **React Router DOM** - クライアントサイドルーティング
- **Tailwind CSS** - ユーティリティファーストCSS
- **React Hook Form** - フォーム管理
- **Axios** - HTTP通信
- **Lucide React** - アイコンライブラリ

### バックエンド
- **Node.js** - JavaScriptランタイム
- **Express.js** - Webフレームワーク
- **PostgreSQL** - リレーショナルデータベース
- **Supabase** - データベースホスティング
- **JWT** - 認証トークン
- **bcryptjs** - パスワードハッシュ化

### デプロイ・インフラ
- **Vercel** - フロントエンド・APIホスティング
- **GitHub** - バージョン管理
- **Monorepo** - 統合されたプロジェクト構造

## 🚀 クイックスタート

### 前提条件
- Node.js 18.0.0以上
- npm または yarn
- PostgreSQL データベース

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/OchiYuka/exchange-student-system.git
cd exchange-student-system

# 依存関係をインストール
npm run install-all

# 開発サーバーを起動
npm run dev
```

### 環境変数の設定

`.env`ファイルを作成して以下の変数を設定：

```env
# データベース
DATABASE_URL=your_postgresql_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key

# API
PORT=3001
```

## 📁 プロジェクト構造

```
exchange-student-system/
├── client/                 # React フロントエンド
│   ├── public/
│   ├── src/
│   │   ├── components/     # React コンポーネント
│   │   ├── contexts/       # React Context
│   │   └── utils/          # ユーティリティ関数
│   └── package.json
├── api/                    # Node.js バックエンド
│   ├── index.js           # Express サーバー
│   ├── database.sql       # データベーススキーマ
│   └── package.json
├── package.json           # ルート設定
└── README.md
```

## 🔧 開発コマンド

```bash
# 開発サーバー起動（フロントエンド + バックエンド）
npm run dev

# フロントエンドのみ
npm run dev:client

# バックエンドのみ
npm run dev:api

# ビルド
npm run build

# 依存関係インストール
npm run install-all
```

## 🌐 デプロイ

### Vercel へのデプロイ

1. **GitHubリポジトリをフォーク**
2. **Vercelでプロジェクトを作成**
3. **環境変数を設定**
4. **自動デプロイが開始**

### 手動デプロイ

```bash
# ビルド
npm run build

# Vercel CLIでデプロイ
vercel --prod
```

## 📊 開発進捗

### ✅ 完了済み機能
- [x] **プロジェクト初期設定** - モノレポ構造、依存関係
- [x] **フロントエンド開発** - React、ルーティング、フォーム
- [x] **バックエンド開発** - Express API、データベース接続
- [x] **認証システム** - JWT認証、ロール管理
- [x] **UI/UX** - レスポンシブデザイン、Tailwind CSS
- [x] **デプロイ** - Vercel自動デプロイ、404エラー解決

### 🔄 進行中
- [ ] **テスト実装** - ユニットテスト、E2Eテスト
- [ ] **パフォーマンス最適化** - コード分割、キャッシュ
- [ ] **セキュリティ強化** - 入力検証、CSRF対策

## 📋 詳細な開発ステップ

### フェーズ1: プロジェクト初期設定
- [x] **STEP-001**: プロジェクト構造作成 ✅ 完了
- [x] **STEP-002**: ルートpackage.json作成 ✅ 完了

### フェーズ2: フロントエンド開発
- [x] **STEP-003**: Reactアプリケーション初期化 ✅ 完了
- [x] **STEP-004**: 基本コンポーネント作成 ✅ 完了
- [x] **STEP-005**: ルーティング設定 ✅ 完了
- [x] **STEP-006**: フォーム機能実装 ✅ 完了

### フェーズ3: バックエンド開発
- [x] **STEP-007**: Node.js API初期化 ✅ 完了
- [x] **STEP-008**: APIサーバー実装 ✅ 完了
- [x] **STEP-009**: データベース設定 ✅ 完了

### フェーズ4: 統合・テスト
- [x] **STEP-010**: フロントエンド・バックエンド統合 ✅ 完了
- [x] **STEP-011**: ローカルテスト ✅ 完了

### フェーズ5: デプロイ準備
- [x] **STEP-012**: ビルド設定 ✅ 完了
- [x] **STEP-013**: Vercel設定ファイル作成 ✅ 完了

### フェーズ6: デプロイ実行
- [x] **STEP-014**: GitHubリポジトリ作成 ✅ 完了
- [x] **STEP-015**: Vercelプロジェクト作成 ✅ 完了
- [x] **STEP-016**: 初回デプロイ実行 ✅ 完了

### フェーズ7: エラー解決
- [x] **STEP-017**: 404エラー分析 ✅ 完了
- [x] **STEP-018**: 設定最適化 ✅ 完了

## 🎯 現在の進捗: 18/18 ステップ完了 (100%) 

### 📈 開発タイムライン
- **STEP-001〜006**: フロントエンド基盤構築
- **STEP-007〜009**: バックエンドAPI開発
- **STEP-010〜011**: 統合テスト・ローカル動作確認
- **STEP-012〜016**: デプロイ準備・実行
- **STEP-017〜018**: 404エラー解決・最適化

### 🔧 技術的課題と解決

#### 1. 404エラーの解決過程
**問題**: デプロイ後にSPAルーティングが正常に動作せず、`/dashboard`や`/admin`で404エラーが発生

**原因分析**:
- Vercelが`main`ブランチを監視していたが、コードは`master`ブランチにあった
- `vercel.json`の設定がSPAルーティングに最適化されていなかった
- 静的ファイルとSPAルーティングの競合

**解決手順**:
1. **STEP-017-1**: ブランチ問題を発見・修正
   - `git push origin master:main`でmainブランチを更新
   - Vercelが正しいブランチを監視するように修正

2. **STEP-017-2**: vercel.json設定の最適化
   - `filesystem`ハンドルを削除して競合を回避
   - `rewrites`設定に変更してSPAルーティングを改善

3. **STEP-017-3**: 最終的な解決
   - `vercel.json`を完全に削除してVercelの自動設定に任せる
   - VercelダッシュボードでFramework Presetを`Create React App`に設定

#### 2. ビルドエラーの解決過程
**問題**: `react-scripts: command not found`エラーが発生

**原因分析**:
- クライアントディレクトリの依存関係がインストールされていない
- Vercelがルートディレクトリでビルドを実行していた

**解決手順**:
1. **STEP-018-1**: vercel-buildスクリプトの修正
   ```json
   "vercel-build": "npm run install-all && cd client && npm run vercel-build"
   ```

2. **STEP-018-2**: 依存関係の確実なインストール
   - `install-all`スクリプトを実行してクライアントとAPIの依存関係を両方インストール
   - `react-scripts`が利用可能になるように修正

#### 3. SPAルーティングの最適化
**問題**: React Routerのパスが正常に動作しない

**解決手順**:
1. **STEP-018-3**: Vercelの自動設定を活用
   - `vercel.json`を削除してVercelの自動SPA設定に任せる
   - Create React Appの適切な設定が自動適用される

**最終的な解決策**:
- VercelダッシュボードでFramework Preset: `Create React App`
- Build Command: `npm run vercel-build`
- Output Directory: `client/build`
- ブランチ監視: `main`

## 🐛 トラブルシューティング

### よくある問題と解決方法

#### 404エラーが発生する場合
**症状**: `/dashboard`、`/admin`などのReact Routerパスで404エラーが発生

**原因**:
- Vercelのプロジェクト設定が正しくない
- ブランチ監視の問題
- SPAルーティングの設定不備

**解決方法**:
1. **Vercelダッシュボードの設定確認**
   - Framework Preset: `Create React App`
   - Build Command: `npm run vercel-build`
   - Output Directory: `client/build`

2. **ブランチ監視の確認**
   - 監視ブランチが`main`になっているか確認
   - `git push origin master:main`でmainブランチを更新

3. **vercel.jsonの設定**
   - 必要に応じて`vercel.json`を削除してVercelの自動設定に任せる

#### ビルドエラーが発生する場合
**症状**: `react-scripts: command not found`エラー

**原因**:
- クライアントディレクトリの依存関係がインストールされていない
- Node.jsのバージョンが古い

**解決方法**:
1. **依存関係の確認**
   ```bash
   npm run install-all
   ```

2. **Node.jsバージョンの確認**
   - Node.js 18.0.0以上であることを確認
   - `node --version`でバージョンを確認

3. **vercel-buildスクリプトの修正**
   ```json
   "vercel-build": "npm run install-all && cd client && npm run vercel-build"
   ```

#### SPAルーティングが動作しない場合
**症状**: React Routerのパスが正常に動作しない

**解決方法**:
1. **Vercelの自動設定を活用**
   - `vercel.json`を削除
   - Vercelの自動SPA設定に任せる

2. **homepage設定の確認**
   ```json
   "homepage": "/"
   ```

### デバッグ手順
1. **Vercelのデプロイログを確認**
2. **ブラウザの開発者ツールでエラーを確認**
3. **ローカル環境で動作確認**
4. **環境変数の設定を確認**

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📝 ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 👨‍💻 開発者

**Yuka Ochi** - [GitHub](https://github.com/OchiYuka)

## 🙏 謝辞

- [Vercel](https://vercel.com/) - 素晴らしいデプロイプラットフォーム
- [Supabase](https://supabase.com/) - データベースホスティング
- [React](https://reactjs.org/) - 素晴らしいフロントエンドライブラリ

---

⭐ このプロジェクトが役に立ったら、スターを付けてください！ 