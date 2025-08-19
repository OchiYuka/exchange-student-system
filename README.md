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

### 📋 デプロイまでの詳細ステップ

#### フェーズ1: プロジェクト初期設定
**STEP-001**: プロジェクト構造作成
```bash
# プロジェクトディレクトリ作成
mkdir exchange-student-system
cd exchange-student-system

# モノレポ構造作成
mkdir client api
```

**STEP-002**: ルートpackage.json作成
```json
{
  "name": "exchange-student-system",
  "version": "1.0.0",
  "description": "Exchange Student Activity Report System",
  "scripts": {
    "dev": "concurrently \"npm run dev:client\" \"npm run dev:api\"",
    "dev:client": "cd client && npm start",
    "dev:api": "cd api && npm run dev",
    "install-all": "npm install && cd client && npm install && cd ../api && npm install",
    "build": "cd client && npm run build",
    "vercel-build": "npm run install-all && cd client && npm run vercel-build"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

#### フェーズ2: フロントエンド開発
**STEP-003**: Reactアプリケーション初期化
```bash
cd client
npx create-react-app . --template typescript
npm install react-router-dom axios react-hook-form lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**STEP-004**: Tailwind CSS設定
```javascript
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: { extend: {} },
  plugins: []
}
```

**STEP-005**: 基本コンポーネント作成
```bash
mkdir src/components src/contexts src/utils
```

**STEP-006**: ルーティング設定
```jsx
// App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}
```

#### フェーズ3: バックエンド開発
**STEP-007**: Node.js API初期化
```bash
cd ../api
npm init -y
npm install express cors bcryptjs jsonwebtoken pg dotenv
npm install -D nodemon
```

**STEP-008**: Express サーバー実装
```javascript
// api/index.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.vercel.app' 
    : 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// データベース接続
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// ルート定義
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is running' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```

**STEP-009**: データベース設定
```sql
-- database.sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE activity_reports (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE enrollment_certificates (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  file_url VARCHAR(500) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### フェーズ4: 統合・テスト
**STEP-010**: フロントエンド・バックエンド統合
```javascript
// client/src/utils/api.js
import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-domain.vercel.app/api' 
  : 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

export default api;
```

**STEP-011**: ローカルテスト
```bash
# ルートディレクトリで
npm run install-all
npm run dev
```

#### フェーズ5: デプロイ準備
**STEP-012**: ビルド設定
```json
// client/package.json
{
  "homepage": "/",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "vercel-build": "react-scripts build"
  }
}
```

**STEP-013**: 環境変数設定
```bash
# .env (ルートディレクトリ)
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production
```

#### フェーズ6: GitHub・Vercel設定
**STEP-014**: GitHubリポジトリ作成
```bash
git init
git add .
git commit -m "Initial commit: Exchange Student System"
git branch -M master
git remote add origin https://github.com/your-username/exchange-student-system.git
git push -u origin master
```

**STEP-015**: Vercelプロジェクト作成
1. [Vercel](https://vercel.com)にアクセス
2. GitHubアカウントでログイン
3. "New Project"をクリック
4. GitHubリポジトリを選択
5. 以下の設定を適用：
   - **Framework Preset**: `Create React App`
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `client/build`
   - **Install Command**: `npm run install-all`

**STEP-016**: 環境変数設定（Vercel）
1. Vercelダッシュボードでプロジェクトを開く
2. "Settings" → "Environment Variables"
3. 以下の変数を追加：
   - `DATABASE_URL`: PostgreSQL接続文字列
   - `JWT_SECRET`: JWT秘密鍵
   - `NODE_ENV`: `production`

**STEP-017**: 初回デプロイ実行
```bash
# コードをプッシュ
git add .
git commit -m "Ready for deployment"
git push origin master
```

### 🎯 デプロイ成功の確認
1. **Vercelダッシュボード**でデプロイ状況を確認
2. **デプロイログ**でエラーがないことを確認
3. **本番URL**でアプリケーションが正常に動作することを確認

### 📝 重要な設定ポイント
- **ブランチ監視**: Vercelで`main`ブランチを監視するように設定
- **API Routes**: `/api/*`のリクエストが正しくAPIに転送されることを確認
- **SPA Routing**: React Routerのパスが正常に動作することを確認
- **CORS設定**: 本番環境でのCORS設定を適切に行う

### 🔧 トラブルシューティング
デプロイ時に問題が発生した場合は、以下のセクションを参照してください：
- [技術的課題と解決](#-技術的課題と解決)
- [トラブルシューティング](#-トラブルシューティング)



### 🔧 技術的課題と解決

#### 1. 404エラーの解決過程
**問題**: デプロイ後にSPAルーティングが正常に動作せず、`/dashboard`や`/admin`で404エラーが発生

**原因分析（初心者向け説明）**:
- **ブランチの混乱**: 
  - **ブランチとは何？**：ブランチは「コードの異なるバージョンを管理する仕組み」です。例えるなら、本の「章」のようなものです。`master`ブランチは「完成版の章」、`main`ブランチは「新しい章」という感じです
  - GitHubには`master`と`main`という2つのブランチがある
  - **ブランチを監視する**とは、Vercelが「このブランチに新しいコードがプッシュされたら、自動的にデプロイを実行する」という設定のこと
  - 問題：Vercelが`main`ブランチを監視していたが、実際のコードは`master`ブランチにあったため、新しいコードがプッシュされてもVercelが気づかなかった

- **設定ファイルの競合**: 
  - `vercel.json`という設定ファイルで、静的ファイル（画像やCSS）とSPAルーティング（Reactのページ移動）の処理が競合していた
  - **処理が競合するとは具体的にどういうこと？**：
    - 例：ユーザーが`/dashboard`にアクセスした時、Vercelが「これは画像ファイルのリクエストなのか、それともReactのページのリクエストなのか」を判断する必要がある
    - 設定ファイルで「画像ファイルはこのルールで処理」「Reactページはこのルールで処理」と2つのルールを同時に設定すると、Vercelが混乱してしまう
  - **これは設定ミスに起因してるの？**：はい、手動で設定ファイルを作成した時に、ルールの優先順位が正しく設定されていなかったことが原因です
  - **競合すると何が悪いか**：Vercelが「このリクエストは画像ファイルなのか、それともReactのページなのか」を判断できなくなり、どちらも正しく処理できなくなってしまう

- **自動設定の不備**: 
  - **Vercelが提供している機能なのに、Reactアプリの設定を正しく認識できていなかった**理由：
  - Vercelは「Create React App」というReactの標準的な開発方法を自動認識できるが、プロジェクトの構造が複雑（モノレポ構造）だったり、手動で設定ファイルを作成すると、この自動認識機能が混乱してしまう
  - **なんで複雑になると自動認識が混乱するの？**：
    - Vercelは「Reactアプリは通常、この場所にファイルがある」「このファイル名を使う」というパターンを覚えている
    - モノレポ構造（`client/`と`api/`フォルダに分かれている）になると、Vercelが「Reactアプリはどこにあるの？」と迷ってしまう
    - 手動で設定ファイルを作ると、Vercelが「自動で設定しようとしたけど、手動設定があるから自動設定をやめよう」と判断してしまう
  - つまり、Vercelが「これはReactアプリだ」と正しく判断できなくなってしまった

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

**原因分析（初心者向け説明）**:
- **必要なファイルの不足**: Reactアプリを動かすために必要な`react-scripts`というファイルが、クライアントフォルダにインストールされていなかった
- **ビルド場所の間違い**: Vercelが間違った場所（ルートフォルダ）でビルドを実行しようとしていたが、Reactアプリは`client`フォルダにある

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

**原因分析（初心者向け説明）**:
- **ページ移動の仕組み**: Reactアプリでは、ユーザーが`/dashboard`や`/admin`などのURLにアクセスした時に、サーバーではなくブラウザ側でページを切り替える仕組みになっている
- **設定の複雑さ**: 手動で設定ファイルを作成すると、この仕組みが正しく動作しなくなることがある

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