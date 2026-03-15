export default function Loading() {
  return (
    <div className="animate-pulse">
      {/* ページヘッダー */}
      <div className="px-8 pt-10 pb-14 sm:px-12 lg:px-16">
        <div className="h-2.5 w-14 rounded-sm bg-zinc-100 dark:bg-zinc-800" />
      </div>

      {/* コンテンツグリッド */}
      <div className="grid grid-cols-1 border-t border-zinc-200 sm:grid-cols-2 dark:border-zinc-800">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="border-b border-r border-zinc-200 dark:border-zinc-800"
          >
            <div className="aspect-[3/2] w-full bg-zinc-100 dark:bg-zinc-800" />
            <div className="px-8 py-8 sm:px-10 lg:px-12">
              <div className="h-2 w-8 rounded-sm bg-zinc-100 dark:bg-zinc-800" />
              <div className="mt-3 h-2.5 w-36 rounded-sm bg-zinc-100 dark:bg-zinc-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
