# AWS Amplify デプロイ手順書

## 概要

本プロジェクトは Next.js 16 の Static Generation（SSG）を中心に構成されています。
AWS Amplify の **Amplify Hosting** を使ってデプロイします。

---

## 前提条件

| 項目 | 要件 |
|---|---|
| AWS アカウント | 作成済みであること |
| GitHub リポジトリ | コードがプッシュ済みであること |
| Contentful | Space ID・CDA Access Token を取得済みであること |
| Node.js | v22 以上（Amplify 上での設定値） |
| パッケージマネージャー | pnpm |

---

## 手順

### ステップ 1: リポジトリを GitHub にプッシュ

ローカルのコードを GitHub リポジトリにプッシュします。

```bash
git add .
git commit -m "ready for deployment"
git push origin main
```

`.env.local` は `.gitignore` に含まれていることを確認してください（シークレット情報をコミットしないため）。

```bash
# .gitignore に以下が含まれているか確認
cat .gitignore | grep .env
```

---

### ステップ 2: Amplify アプリを作成

1. [AWS マネジメントコンソール](https://console.aws.amazon.com/) にサインイン
2. 上部検索バーで **「Amplify」** を検索して開く
3. **「Create new app」** をクリック
4. **「GitHub」** を選択して「Next」
5. GitHub アカウントを認証し、対象リポジトリを選択
6. ブランチ: **`main`** を選択して「Next」

---

### ステップ 3: ビルド設定

Amplify が自動検出したビルド設定を以下の内容に修正します。
「Edit YML file」から直接編集するか、以下の内容で `amplify.yml` をリポジトリルートに作成します。

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - corepack enable
        - corepack prepare pnpm@latest --activate
        - pnpm install --frozen-lockfile
    build:
      commands:
        - pnpm build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

---

### ステップ 4: 環境変数の設定

Amplify コンソールの「Environment variables」セクションで以下を設定します。

| キー | 値 | 説明 |
|---|---|---|
| `CTF_SPACE_ID` | `xxxxxxxx` | Contentful Space ID |
| `CTF_CDA_ACCESS_TOKEN` | `xxxxxxxx` | Contentful CDA Access Token |
| `NEXT_PUBLIC_SITE_URL` | `https://xxxxxx.amplifyapp.com` | デプロイ後の URL（OGP に使用） |

> **注意**: `NEXT_PUBLIC_SITE_URL` はデプロイ完了後に発行される URL に合わせて更新してください。カスタムドメインを使う場合はそちらの URL を設定します。

---

### ステップ 5: デプロイ実行

1. 「Save and deploy」をクリック
2. Amplify コンソールのビルドログを確認
3. ビルドが成功すると `https://xxxxxx.amplifyapp.com` でアクセス可能になります

---

### ステップ 6: デプロイ後の動作確認

デプロイが完了したら、テスト手順書（`docs/TEST_GUIDE.md`）に従って確認を実施します。

#### 6-1. 疎通確認

```bash
BASE=https://xxxxxx.amplifyapp.com
for path in "/" "/works" "/news" "/biography" "/about"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "${BASE}${path}")
  echo "${STATUS}  ${path}"
done
```

#### 6-2. セキュリティヘッダー確認

```bash
curl -s -I https://xxxxxx.amplifyapp.com/ \
  | grep -iE "x-frame-options|x-content-type-options|referrer-policy|content-security-policy|strict-transport-security"
```

#### 6-3. E2E テスト

```bash
PLAYWRIGHT_BASE_URL=https://xxxxxx.amplifyapp.com pnpm test:e2e
```

#### 6-4. パフォーマンス計測

```bash
pnpm perf:psi https://xxxxxx.amplifyapp.com
```

---

### ステップ 7: カスタムドメインの設定（任意）

独自ドメインを使う場合は以下を実施します。

1. Amplify コンソール左メニュー「App settings」→「Custom domains」
2. 「Add domain」をクリック
3. ドメイン名を入力し、「Configure domain」
4. 表示された CNAME レコードをドメインレジストラに登録
5. SSL 証明書が自動で発行されます（通常 10〜30 分）
6. 完了後、`NEXT_PUBLIC_SITE_URL` 環境変数をカスタムドメインの URL に更新して再デプロイ

---

## 継続的デプロイ（CD）

`main` ブランチへのプッシュで自動的に再デプロイが実行されます。
設定は Amplify コンソール「App settings」→「Repository settings」で変更できます。

---

## Contentful の Webhook 設定（コンテンツ更新の自動反映）

Contentful でコンテンツを更新したとき、自動で再ビルドするよう Webhook を設定します。

### Amplify 側: Webhook URL の取得

1. Amplify コンソール「App settings」→「Build settings」
2. 「Create webhook」をクリック
3. 発行された Webhook URL をコピー

### Contentful 側: Webhook の登録

1. Contentful ダッシュボード「Settings」→「Webhooks」
2. 「Add Webhook」をクリック
3. 以下を設定：
   - **Name**: `AWS Amplify Deploy`
   - **URL**: コピーした Amplify Webhook URL
   - **Method**: `POST`
   - **Triggers**: `Publish` / `Unpublish` にチェック
4. 「Save」

以後、Contentful でコンテンツを公開・取り消しすると自動でビルドが走ります。

---

## トラブルシューティング

### ビルドエラー: `pnpm: command not found`

`amplify.yml` の `preBuild` に `corepack enable` が含まれているか確認してください。

### ビルドエラー: `CTF_SPACE_ID` が未定義

Amplify コンソールで環境変数が正しく設定されているか確認してください。
ビルドログに `Expected parameter accessToken` などが出ている場合は環境変数の設定漏れです。

### 画像が表示されない

`next.config.ts` の `remotePatterns` の `pathname` に `CTF_SPACE_ID` が含まれています。
Amplify の環境変数に `CTF_SPACE_ID` が設定されていれば自動的に反映されます。

### HSTS ヘッダーが HTTP で返る

`Strict-Transport-Security` は HTTPS 接続にのみ有効です。Amplify はデフォルトで HTTPS を提供するため、本番環境では正常に動作します。ローカルや HTTP 環境では表示されない場合があります。

### デプロイ後も古いコンテンツが表示される

静的生成（SSG）のキャッシュが残っている可能性があります。
Amplify コンソール「Deployments」→「Redeploy this version」で強制再デプロイするか、Contentful の Webhook を設定して自動再ビルドを有効にしてください。
