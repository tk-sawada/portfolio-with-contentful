// contentful クライアントをモックして env vars 不要にする
jest.mock("@/lib/contentful", () => ({
  contentfulClient: {
    getEntries: jest.fn().mockResolvedValue({ items: [] }),
  },
}));

import { toOgImage } from "@/lib/meta";

describe("toOgImage", () => {
  test("Contentful の相対 URL を絶対 URL に変換する", () => {
    const result = toOgImage("//images.ctfassets.net/space/asset/photo.jpg");
    expect(result).toHaveLength(1);
    expect(result[0].url).toBe(
      "https://images.ctfassets.net/space/asset/photo.jpg?w=1200&h=630&fit=fill&fm=jpg&q=85"
    );
  });

  test("幅・高さが OGP 推奨サイズである", () => {
    const result = toOgImage("//images.ctfassets.net/space/asset/photo.jpg");
    expect(result[0].width).toBe(1200);
    expect(result[0].height).toBe(630);
  });

  test("クエリパラメータが正しく付与される", () => {
    const result = toOgImage("//images.ctfassets.net/x/y/z.png");
    const url = new URL(result[0].url);
    expect(url.searchParams.get("w")).toBe("1200");
    expect(url.searchParams.get("h")).toBe("630");
    expect(url.searchParams.get("fit")).toBe("fill");
    expect(url.searchParams.get("fm")).toBe("jpg");
    expect(url.searchParams.get("q")).toBe("85");
  });

  test("配列を返す", () => {
    const result = toOgImage("//images.ctfassets.net/x/y/z.jpg");
    expect(Array.isArray(result)).toBe(true);
  });
});
