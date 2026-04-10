export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-1/3 mb-3" />
      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full w-2/3 mb-6" />
      <div className="flex gap-3">
        <div className="h-6 w-16 bg-gray-100 dark:bg-gray-800 rounded-full" />
        <div className="h-6 w-20 bg-gray-100 dark:bg-gray-800 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-100 dark:border-gray-800 last:border-0 animate-pulse">
      <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-1/3" />
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full w-1/2" />
      </div>
      <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
    </div>
  );
}

export function SkeletonGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
