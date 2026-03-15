#!/usr/bin/env node
/**
 * パフォーマンス計測スクリプト
 *
 * 【モード 1】Lighthouse（ローカル / LAN 向け）
 *   node scripts/perf.mjs http://192.168.1.12:3000
 *   ※ 事前に `sudo pnpm exec playwright install-deps chromium` が必要
 *
 * 【モード 2】PageSpeed Insights API（本番 URL 向け・Chrome 不要）
 *   node scripts/perf.mjs https://your-domain.com --psi
 *   node scripts/perf.mjs https://your-domain.com --psi --key=YOUR_API_KEY
 *   ※ API キーなしでも動作しますが、レート制限あり（1分1リクエスト程度）
 */

import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");

// 引数パース
const args = process.argv.slice(2);
const baseUrl = args.find((a) => !a.startsWith("--")) ?? process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const usePsi   = args.includes("--psi");
const apiKey   = (args.find((a) => a.startsWith("--key=")) ?? "").replace("--key=", "");

const pages = [
  { name: "top",       path: "/" },
  { name: "works",     path: "/works" },
  { name: "news",      path: "/news" },
  { name: "biography", path: "/biography" },
  { name: "about",     path: "/about" },
];

function scoreEmoji(score) {
  if (score >= 90) return "🟢";
  if (score >= 50) return "🟡";
  return "🔴";
}

function getChromePath() {
  const candidates = [
    `${process.env.HOME}/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome`,
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
  ];
  return candidates.find(existsSync) ?? null;
}

// ── モード 1: Lighthouse ──────────────────────────────────
async function runLighthouse(url) {
  const { default: lighthouse } = await import("lighthouse");
  const { launch } = await import("chrome-launcher");

  const chromePath = getChromePath();
  if (!chromePath) {
    throw new Error("Chrome が見つかりません");
  }

  const chrome = await launch({
    chromePath,
    chromeFlags: ["--headless=new", "--no-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const result = await lighthouse(url, {
      port: chrome.port,
      output: ["json", "html"],
      onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
      formFactor: "desktop",
      screenEmulation: { disabled: true },
    });
    return result;
  } finally {
    await chrome.kill();
  }
}

async function runWithLighthouse(page, reportDir) {
  const url = `${baseUrl}${page.path}`;
  const result = await runLighthouse(url);
  const cats = result.lhr.categories;

  const scores = {
    performance:   Math.round((cats.performance?.score          ?? 0) * 100),
    accessibility: Math.round((cats.accessibility?.score        ?? 0) * 100),
    bestPractices: Math.round((cats["best-practices"]?.score    ?? 0) * 100),
    seo:           Math.round((cats.seo?.score                  ?? 0) * 100),
  };

  const reports = Array.isArray(result.report) ? result.report : [result.report];
  const htmlReport = reports.find((r) => r.startsWith("<!"));
  if (htmlReport) {
    const reportPath = join(reportDir, `${page.name}.html`);
    writeFileSync(reportPath, htmlReport);
    console.log(`  レポート → lighthouse-reports/${page.name}.html`);
  }

  return scores;
}

// ── モード 2: PageSpeed Insights API ─────────────────────
async function runWithPsi(page) {
  const url = `${baseUrl}${page.path}`;
  const apiUrl = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  apiUrl.searchParams.set("url", url);
  apiUrl.searchParams.set("strategy", "desktop");
  ["performance", "accessibility", "best-practices", "seo"].forEach((c) =>
    apiUrl.searchParams.append("category", c)
  );
  if (apiKey) apiUrl.searchParams.set("key", apiKey);

  const res = await fetch(apiUrl.toString());
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`PSI API error ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  const cats = data.lighthouseResult?.categories ?? {};

  return {
    performance:   Math.round((cats.performance?.score          ?? 0) * 100),
    accessibility: Math.round((cats.accessibility?.score        ?? 0) * 100),
    bestPractices: Math.round((cats["best-practices"]?.score    ?? 0) * 100),
    seo:           Math.round((cats.seo?.score                  ?? 0) * 100),
  };
}

// ── メイン ────────────────────────────────────────────────
async function main() {
  const mode = usePsi ? "PageSpeed Insights API" : "Lighthouse";
  console.log(`\n計測モード: ${mode}`);
  console.log(`計測対象:   ${baseUrl}`);
  console.log("=".repeat(60));

  const reportDir = join(projectRoot, "lighthouse-reports");
  if (!usePsi) mkdirSync(reportDir, { recursive: true });

  const summary = [];

  for (const page of pages) {
    const url = `${baseUrl}${page.path}`;
    process.stdout.write(`\n[${page.name}] ${url} ... `);

    try {
      let scores;
      if (usePsi) {
        scores = await runWithPsi(page);
      } else {
        scores = await runWithLighthouse(page, reportDir);
      }

      console.log("完了");
      console.log(`  Performance    ${scoreEmoji(scores.performance)}  ${scores.performance}`);
      console.log(`  Accessibility  ${scoreEmoji(scores.accessibility)}  ${scores.accessibility}`);
      console.log(`  Best Practices ${scoreEmoji(scores.bestPractices)}  ${scores.bestPractices}`);
      console.log(`  SEO            ${scoreEmoji(scores.seo)}  ${scores.seo}`);

      summary.push({ name: page.name, ...scores });
    } catch (err) {
      console.log("失敗");
      console.log(`  エラー: ${err.message}`);
      if (!usePsi && err.message.includes("Chrome")) {
        console.log("  → 以下を実行してください: sudo pnpm exec playwright install-deps chromium");
      }
      summary.push({ name: page.name, error: err.message });
    }

    // PSI のレート制限対策: ページ間に 1 秒待機
    if (usePsi) await new Promise((r) => setTimeout(r, 1000));
  }

  // サマリー
  console.log("\n" + "=".repeat(60));
  console.log("サマリー");
  console.log("=".repeat(60));
  console.log("ページ      Perf      A11y      Best      SEO");
  console.log("-".repeat(50));

  for (const s of summary) {
    if (s.error) {
      console.log(`${s.name.padEnd(12)} ERROR`);
    } else {
      console.log(
        s.name.padEnd(12) +
        `${scoreEmoji(s.performance)} ${String(s.performance).padEnd(6)}` +
        `${scoreEmoji(s.accessibility)} ${String(s.accessibility).padEnd(6)}` +
        `${scoreEmoji(s.bestPractices)} ${String(s.bestPractices).padEnd(6)}` +
        `${scoreEmoji(s.seo)} ${s.seo}`
      );
    }
  }

  if (!usePsi) {
    console.log(`\nHTML レポート: ${reportDir}/\n`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
