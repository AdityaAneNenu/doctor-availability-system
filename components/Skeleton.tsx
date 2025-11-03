/**
 * Skeleton Loading Components
 * Provides visual feedback while content is loading
 */

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function Skeleton({ 
  className = '', 
  width = 'w-full', 
  height = 'h-4',
  rounded = 'md'
}: SkeletonProps) {
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full'
  };

  return (
    <div 
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${width} ${height} ${roundedClasses[rounded]} ${className}`}
      role="status"
      aria-label="Loading..."
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
      <div className="animate-pulse space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton width="w-32" height="h-6" />
          <Skeleton width="w-16" height="h-8" rounded="lg" />
        </div>
        <Skeleton width="w-full" height="h-24" />
        <div className="space-y-2">
          <Skeleton width="w-3/4" height="h-4" />
          <Skeleton width="w-1/2" height="h-4" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="animate-pulse">
        {/* Table Header */}
        <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-4">
            <Skeleton width="w-32" height="h-4" />
            <Skeleton width="w-24" height="h-4" />
            <Skeleton width="w-24" height="h-4" />
            <Skeleton width="w-24" height="h-4" />
          </div>
        </div>
        {/* Table Rows */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex gap-4">
              <Skeleton width="w-32" height="h-4" />
              <Skeleton width="w-24" height="h-4" />
              <Skeleton width="w-24" height="h-4" />
              <Skeleton width="w-24" height="h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
      <div className="animate-pulse space-y-3">
        <Skeleton width="w-12" height="h-12" rounded="lg" />
        <Skeleton width="w-24" height="h-8" />
        <Skeleton width="w-32" height="h-4" />
      </div>
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
      <div className="animate-pulse space-y-4">
        <Skeleton width="w-48" height="h-6" />
        <div className="flex items-end gap-2 h-64">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <Skeleton 
              key={i} 
              width="flex-1" 
              height={`h-${Math.floor(Math.random() * 48) + 16}`} 
              rounded="sm"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
