# テスト手順書

## 概要

本プロジェクトのテストは以下の 3 種類で構成されています。

| 種別 | ツール | 対象 | 実行環境 |
|---|---|---|---|
| ユニットテスト | Jest | ライブラリ関数 | サーバー不要 |
| E2E テスト | Playwright | 全ページ・ナビゲーション・セキュリティヘッダー | 動作中のサーバーが必要 |
| パフォーマンス計測 | Lighthouse / PageSpeed Insights | 表示速度スコア | サーバー必要（LAN or 本番） |

---

## 1. 前提条件

### 1-1. 依存パッケージのインストール

```bash
pnpm install
```

### 1-2. Playwright ブラウザのインストール（初回のみ）

```bash
pnpm exec playwright install chromium
```

### 1-3. Playwright システム依存ライブラリのインストール（初回のみ・要 sudo）

```bash
sudo pnpm exec playwright install-deps chromium
```

> Linux 環境で `libatk-1.0.so.0` などのエラーが出た場合に必要です。

---

## 2. ユニットテスト

サーバー起動不要。環境変数も不要です。

### 実行コマンド

```bash
pnpm test
```

### 監視モード（開発中）

```bash
pnpm test:watch
```

### テストファイル一覧

| ファイル | テスト対象 | テスト内容 |
|---|---|---|
| `__tests__/lib/url.test.ts` | `lib/url.ts` `isSafeUrl()` | https/http 許可、javascript:/data:/vbscript: 拒否、空・null・undefined・不正値の拒否 |
| `__tests__/lib/meta.test.ts` | `lib/meta.ts` `toOgImage()` | URL 変換、OGP 推奨サイズ（1200x630）、クエリパラメータ付与、戻り値の型 |

### 期待する結果

```
Test Suites: 2 passed, 2 total
Tests:       16 passed, 16 total
```

---

## 3. E2E テスト（Playwright）

### 3-1. ローカルサーバーに対して実行

プロダクションビルドを起動してからテストを実行します。

```bash
# ビルド
pnpm build

# サーバー起動（別ターミナル）
pnpm start

# テスト実行
pnpm test:e2e
```

### 3-2. 特定ホストに対して実行

`PLAYWRIGHT_BASE_URL` を指定することでローカル以外のサーバーをテスト対象にできます。

```bash
PLAYWRIGHT_BASE_URL=http://192.168.1.12:3000 pnpm test:e2e
```

```bash
# 本番環境（例）
PLAYWRIGHT_BASE_URL=https://your-domain.com pnpm test:e2e
```

### 3-3. インタラクティブ UI モード（デバッグ用）

```bash
PLAYWRIGHT_BASE_URL=http://192.168.1.12:3000 pnpm test:e2e:ui
```

### テストファイル一覧

#### `e2e/pages.spec.ts` — ページスモークテスト

| テスト | 確認内容 |
|---|---|
| セキュリティヘッダー | `X-Frame-Options: DENY` |
| セキュリティヘッダー | `X-Content-Type-Options: nosniff` |
| セキュリティヘッダー | `Referrer-Policy: strict-origin-when-cross-origin` |
| セキュリティヘッダー | `Content-Security-Policy` の存在 |
| トップページ | HTTP 200、WORKS/NEWS セクションの表示 |
| Works 一覧 | HTTP 200 |
| News 一覧 | HTTP 200、見出し「NEWS」の表示 |
| Biography | HTTP 200、見出し「BIOGRAPHY」の表示 |
| About | HTTP 200、見出し「ABOUT」の表示 |
| 404 ページ | HTTP 404、ホームリンクの表示 |

#### `e2e/navigation.spec.ts` — ナビゲーションテスト

| テスト | 確認内容 |
|---|---|
| グローバルナビ | NEWS → `/news` へ遷移 |
| グローバルナビ | WORKS → `/works` へ遷移 |
| グローバルナビ | BIOGRAPHY → `/biography` へ遷移 |
| グローバルナビ | ABOUT → `/about` へ遷移 |
| ロゴ（正方形） | クリックでトップ `/` へ戻る |
| トップページ | WORKS ラベル → `/works` へ遷移 |
| トップページ | NEWS ラベル → `/news` へ遷移 |
| News 詳細 | タイトルリンク → `/news/:id` へ遷移、「← News」リンクの表示 |
| Works 詳細 | タイトルリンク → `/works/:slug` へ遷移 |

### 期待する結果

```
46 passed (chromium + mobile-chrome)
```

### レポートの確認

テスト完了後に HTML レポートが生成されます。

```bash
pnpm exec playwright show-report
```

---

## 5. ユニットテスト + E2E テスト 一括実行

```bash
# ローカルサーバーが起動済みの状態で実行
pnpm test:all

# 特定ホストに対して一括実行
PLAYWRIGHT_BASE_URL=http://192.168.1.12:3000 pnpm test:all
```

---

## 6. curl による簡易疎通確認（Playwright 不要）

Playwright のブラウザをインストールできない環境でも、以下で HTTP ステータスとセキュリティヘッダーを確認できます。

### ページ疎通確認

```bash
BASE=http://192.168.1.12:3000
for path in "/" "/works" "/news" "/biography" "/about" "/this-page-does-not-exist"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "${BASE}${path}")
  echo "${STATUS}  ${path}"
done
```

期待する出力：

```
200  /
200  /works
200  /news
200  /biography
200  /about
404  /this-page-does-not-exist
```

### セキュリティヘッダー確認

```bash
curl -s -I http://192.168.1.12:3000/ \
  | grep -iE "x-frame-options|x-content-type-options|referrer-policy|content-security-policy|strict-transport-security|permissions-policy"
```

期待する出力（例）：

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: default-src 'self'; ...
```

---

## 6. パフォーマンス計測

表示速度スコア（Performance / Accessibility / Best Practices / SEO）を計測します。

### 6-1. Lighthouse モード（LAN / ローカル向け）

Chrome が必要です。初回のみ以下を実行してください（要 sudo）。

```bash
sudo pnpm exec playwright install-deps chromium
```

実行：

```bash
# デフォルト（localhost:3000）
pnpm perf

# LAN サーバー指定
node scripts/perf.mjs http://192.168.1.12:3000
```

完了後、HTML レポートが `lighthouse-reports/` に保存されます（ページごとに詳細な診断情報を確認できます）。

### 6-2. PageSpeed Insights API モード（本番 URL 向け・Chrome 不要）

公開済みの本番 URL に対して Google の PageSpeed Insights API を使って計測します。Chrome のインストールは不要です。

```bash
# 本番 URL を引数で指定
pnpm perf:psi https://your-domain.com

# または環境変数で指定
PLAYWRIGHT_BASE_URL=https://your-domain.com pnpm perf:psi
```

API キーを持っている場合はレート制限なしで実行できます：

```bash
node scripts/perf.mjs https://your-domain.com --psi --key=YOUR_PSI_API_KEY
```

### スコアの目安

| 色 | スコア | 評価 |
|---|---|---|
| 🟢 | 90 〜 100 | 良好 |
| 🟡 | 50 〜 89 | 要改善 |
| 🔴 | 0 〜 49 | 問題あり |

### 出力例

```
計測モード: PageSpeed Insights API
計測対象:   https://your-domain.com
============================================================

[top] https://your-domain.com/ ... 完了
  Performance    🟢  95
  Accessibility  🟢  98
  Best Practices 🟢  100
  SEO            🟢  100
  ...

============================================================
サマリー
============================================================
ページ      Perf      A11y      Best      SEO
--------------------------------------------------
top         🟢 95     🟢 98     🟢 100    🟢 100
works       🟢 92     🟢 98     🟢 100    🟢 100
news        🟢 94     🟢 98     🟢 100    🟢 100
biography   🟢 96     🟢 98     🟢 100    🟢 100
about       🟢 95     🟢 98     🟢 100    🟢 100
```

---

## 8. テスト環境別の実施方針

| フェーズ | 対象 | 実行するテスト |
|---|---|---|
| 開発中 | ローカル（localhost:3000） | `pnpm test`（ユニット） |
| デプロイ前確認 | ステージング / LAN（192.168.1.12） | `pnpm test` + `PLAYWRIGHT_BASE_URL=... pnpm test:e2e` + `node scripts/perf.mjs http://...` |
| 本番リリース後 | 本番 URL | `PLAYWRIGHT_BASE_URL=https://... pnpm test:e2e` + `pnpm perf:psi https://...` |

---

## 9. トラブルシューティング

### `libatk-1.0.so.0: cannot open shared object file`

Playwright の実行に必要なシステムライブラリが不足しています。

```bash
sudo pnpm exec playwright install-deps chromium
```

### `Expected parameter accessToken`（ユニットテスト）

`.env.local` が存在しない環境でも、ユニットテストは Contentful をモックするため実行できます。このエラーが出る場合は `jest.config.ts` の設定を確認してください。

### E2E テストがタイムアウトする

サーバーが起動していない可能性があります。`pnpm start` でサーバーを起動してから再実行してください。ポートが異なる場合は `PLAYWRIGHT_BASE_URL` を合わせて指定してください。

### PSI API で `429 Quota exceeded` が返る

API キーなしの場合、1 日あたりのリクエスト上限に達しています。Google Cloud Console で PageSpeed Insights API を有効にし、API キーを取得してください。

```bash
node scripts/perf.mjs https://your-domain.com --psi --key=YOUR_API_KEY
```

### Lighthouse で `Chrome が見つかりません` と表示される

Playwright の Chromium をインストールしてください。

```bash
pnpm exec playwright install chromium
sudo pnpm exec playwright install-deps chromium
```
