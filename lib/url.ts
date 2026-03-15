/**
 * http / https スキームのみ許可し、javascript: などの危険な URL を除外する
 */
export function isSafeUrl(url: string | undefined | null): url is string {
  if (!url) return false;
  try {
    const { protocol } = new URL(url);
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
}
