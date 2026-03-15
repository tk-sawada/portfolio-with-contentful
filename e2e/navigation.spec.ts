import { test, expect } from "@playwright/test";

test.describe("グローバルナビゲーション", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("NEWS リンクが /news へ遷移する", async ({ page }) => {
    await page.getByRole("navigation").getByRole("link", { name: /news/i }).click();
    await expect(page).toHaveURL(/\/news$/);
  });

  test("WORKS リンクが /works へ遷移する", async ({ page }) => {
    await page.getByRole("navigation").getByRole("link", { name: /works/i }).click();
    await expect(page).toHaveURL(/\/works$/);
  });

  test("BIOGRAPHY リンクが /biography へ遷移する", async ({ page }) => {
    await page.getByRole("navigation").getByRole("link", { name: /biography/i }).click();
    await expect(page).toHaveURL(/\/biography$/);
  });

  test("ABOUT リンクが /about へ遷移する", async ({ page }) => {
    await page.getByRole("navigation").getByRole("link", { name: /about/i }).click();
    await expect(page).toHaveURL(/\/about$/);
  });

  test("ロゴ（正方形）クリックでトップに戻る", async ({ page }) => {
    await page.goto("/works");
    await page.getByRole("link", { name: /home/i }).first().click();
    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe("トップページ内リンク", () => {
  test("WORKS ラベルクリックで /works へ遷移する", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /^works$/i }).first().click();
    await expect(page).toHaveURL(/\/works$/);
  });

  test("NEWS ラベルクリックで /news へ遷移する", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /^news$/i }).first().click();
    await expect(page).toHaveURL(/\/news$/);
  });
});

test.describe("News 詳細ページ遷移", () => {
  test("News 一覧のタイトルリンクをクリックすると詳細ページに遷移する", async ({ page }) => {
    await page.goto("/news");
    const firstTitle = page.getByRole("main").getByRole("link").first();
    const href = await firstTitle.getAttribute("href");

    if (href && /\/news\//.test(href)) {
      await firstTitle.click();
      await expect(page).toHaveURL(/\/news\/.+/);
      await expect(page.getByRole("link", { name: /← news/i })).toBeVisible();
    } else {
      test.skip();
    }
  });
});

test.describe("Works 詳細ページ遷移", () => {
  test("Works 一覧のタイトルリンクをクリックすると詳細ページに遷移する", async ({ page }) => {
    await page.goto("/works");
    const firstLink = page.getByRole("main").getByRole("link").first();
    const href = await firstLink.getAttribute("href");

    if (href && /\/works\//.test(href)) {
      await firstLink.click();
      await expect(page).toHaveURL(/\/works\/.+/);
    } else {
      test.skip();
    }
  });
});
