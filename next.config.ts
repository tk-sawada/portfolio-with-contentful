import type { NextConfig } from "next";

const securityHeaders = [
  // HTTPS 強制 (1年間)
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // クリックジャッキング防止
  { key: "X-Frame-Options", value: "DENY" },
  // MIME スニッフィング防止
  { key: "X-Content-Type-Options", value: "nosniff" },
  // リファラー情報の制限
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // 不要な API へのアクセス禁止
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  // コンテンツセキュリティポリシー
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js のハイドレーションに必要
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      // Tailwind インラインスタイル + style={{ }} に必要
      "style-src 'self' 'unsafe-inline'",
      // Contentful 画像のみ許可
      "img-src 'self' data: https://images.ctfassets.net",
      // Geist フォント (next/font でバンドル済み)
      "font-src 'self' data:",
      // Contentful API への接続のみ許可
      "connect-src 'self' https://cdn.contentful.com https://images.ctfassets.net",
      "frame-src 'none'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  headers: async () => [
    {
      source: "/(.*)",
      headers: securityHeaders,
    },
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.ctfassets.net",
        // Contentful のスペース ID 配下のみ許可
        pathname: `/${process.env.CTF_SPACE_ID}/**`,
      },
    ],
  },
};

export default nextConfig;
