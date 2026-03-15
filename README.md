# Photography Portfolio

Next.js + Contentful で構築した写真家向けポートフォリオサイト。

## Tech Stack

| 項目 | 内容 |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| CMS | Contentful (CDA) |
| Package Manager | pnpm |

## ページ構成

| URL | ページ |
|---|---|
| `/` | トップ — 最新 Works スライドショー + News 一覧 |
| `/works` | Works 一覧 |
| `/works/[slug]` | Works 詳細（写真ギャラリー） |
| `/news` | News 一覧 |
| `/news/[id]` | News 詳細 |
| `/biography` | Biography |
| `/about` | About |

## Contentful Content Model

### works
| フィールド | 型 | 必須 |
|---|---|---|
| title | Symbol | ✓ |
| slug | Symbol | ✓ |
| date | Date | |
| photos | Array\<AssetLink\> | |

### biography
| フィールド | 型 | 必須 |
|---|---|---|
| date | Date | ✓ |
| content | Symbol | ✓ |

### news
| フィールド | 型 | 必須 |
|---|---|---|
| registrationDate | Date | ✓ |
| newsTitle | Symbol | ✓ |
| content | RichText | ✓ |
| url | Symbol | |

### about
| フィールド | 型 | 必須 | ローカライズ |
|---|---|---|---|
| name | Symbol | ✓ | ✓ |
| instagram | Symbol | | |
| color | Symbol | | |
| description | Symbol | | |

> `color` フィールドには HEX カラーコード（例: `#493759`）を入力するとヘッダーのアクセントカラーに反映されます。
> `name` フィールドは `ja-JP` / `en-US` でローカライズ対応しています。

## セットアップ

### 1. 依存パッケージのインストール

```bash
pnpm install
```

### 2. 環境変数の設定

`.env.local` を作成し、Contentful の認証情報を設定します。

```
CTF_SPACE_ID=your_space_id
CTF_CDA_ACCESS_TOKEN=your_access_token
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

Contentful の Space ID と Content Delivery API Access Token は
**Settings > API keys** から取得できます。

### 3. 開発サーバーの起動

```bash
pnpm dev
```

[http://localhost:3000](http://localhost:3000) で確認できます。

## ビルド & デプロイ

```bash
pnpm build
pnpm start
```

Vercel へのデプロイ時は、環境変数 `CTF_SPACE_ID` と `CTF_CDA_ACCESS_TOKEN` をプロジェクト設定に追加してください。

## 多言語対応

`accept-language` ヘッダーをもとに表示言語を自動判定します。

- 日本語ブラウザ → `ja-JP` ロケールのコンテンツを表示
- それ以外 → `en-US` ロケールのコンテンツを表示（未入力の場合は `ja-JP` にフォールバック）

対応箇所: ヘッダーの作家名、ブラウザタブのタイトル、Works 詳細ページの写真タイトル・説明

## デザインポリシー

- フォント: UI・タイトル類は `Geist Mono`、本文は `Geist Sans`
- カラー: モノクロ (`zinc` スケール) + About の `color` フィールドによるアクセント
- ダークモード: OS 設定に連動（Tailwind CSS の `dark:` プレフィックス）
