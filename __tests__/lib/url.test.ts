import { isSafeUrl } from "@/lib/url";

describe("isSafeUrl", () => {
  describe("安全な URL を許可する", () => {
    test("https URL を受け入れる", () => {
      expect(isSafeUrl("https://example.com")).toBe(true);
    });

    test("http URL を受け入れる", () => {
      expect(isSafeUrl("http://example.com")).toBe(true);
    });

    test("クエリパラメータ付きの URL を受け入れる", () => {
      expect(isSafeUrl("https://example.com/path?foo=bar")).toBe(true);
    });
  });

  describe("危険な URL を拒否する", () => {
    test("javascript: スキームを拒否する", () => {
      expect(isSafeUrl("javascript:alert(1)")).toBe(false);
    });

    test("javascript: スキーム（大文字）を拒否する", () => {
      expect(isSafeUrl("JAVASCRIPT:alert(1)")).toBe(false);
    });

    test("data: スキームを拒否する", () => {
      expect(isSafeUrl("data:text/html,<script>alert(1)</script>")).toBe(false);
    });

    test("vbscript: スキームを拒否する", () => {
      expect(isSafeUrl("vbscript:msgbox(1)")).toBe(false);
    });
  });

  describe("空・不正な値を拒否する", () => {
    test("空文字列を拒否する", () => {
      expect(isSafeUrl("")).toBe(false);
    });

    test("undefined を拒否する", () => {
      expect(isSafeUrl(undefined)).toBe(false);
    });

    test("null を拒否する", () => {
      expect(isSafeUrl(null)).toBe(false);
    });

    test("不正な URL 文字列を拒否する", () => {
      expect(isSafeUrl("not-a-url")).toBe(false);
    });

    test("プロトコルなし URL を拒否する", () => {
      expect(isSafeUrl("//example.com")).toBe(false);
    });
  });
});
