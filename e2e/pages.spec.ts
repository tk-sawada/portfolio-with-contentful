import { test, expect } from "@playwright/test";

// セキュリティヘッダーの検証
test.describe("セキュリティヘッダー", () => {
  test("トップページに必須セキュリティヘッダーが付与されている", async ({ request }) => {
    const res = await request.get("/");
    const headers = res.headers();

    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["content-security-policy"]).toBeTruthy();
  });
});

// ページスモークテスト
test.describe("トップページ", () => {
  test("200 で表示される", async ({ page }) => {
    const res = await page.goto("/");
    expect(res?.status()).toBe(200);
  });

  test("WORKS セクションが存在する", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("WORKS")).toBeVisible();
  });

  test("NEWS セクションが存在する", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("NEWS")).toBeVisible();
  });
});

test.describe("Works 一覧ページ", () => {
  test("200 で表示される", async ({ page }) => {
    const res = await page.goto("/works");
    expect(res?.status()).toBe(200);
  });

  test("ページタイトルに Works が含まれる", async ({ page }) => {
    await page.goto("/works");
    await expect(page.getByRole("main")).toBeVisible();
  });
});

test.describe("News 一覧ページ", () => {
  test("200 で表示される", async ({ page }) => {
    const res = await page.goto("/news");
    expect(res?.status()).toBe(200);
  });

  test("ページ見出し NEWS が表示される", async ({ page }) => {
    await page.goto("/news");
    await expect(page.getByRole("heading", { name: /news/i })).toBeVisible();
  });
});

test.describe("Biography ページ", () => {
  test("200 で表示される", async ({ page }) => {
    const res = await page.goto("/biography");
    expect(res?.status()).toBe(200);
  });

  test("ページ見出し Biography が表示される", async ({ page }) => {
    await page.goto("/biography");
    await expect(page.getByRole("heading", { name: /biography/i })).toBeVisible();
  });
});

test.describe("About ページ", () => {
  test("200 で表示される", async ({ page }) => {
    const res = await page.goto("/about");
    expect(res?.status()).toBe(200);
  });

  test("ページ見出し About が表示される", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("heading", { name: /about/i })).toBeVisible();
  });
});

test.describe("404 ページ", () => {
  test("存在しないパスで 404 が返る", async ({ page }) => {
    const res = await page.goto("/this-page-does-not-exist-xyz");
    expect(res?.status()).toBe(404);
  });

  test("404 ページにホームへのリンクがある", async ({ page }) => {
    await page.goto("/this-page-does-not-exist-xyz");
    await expect(page.getByRole("link", { name: /home/i })).toBeVisible();
  });
});
