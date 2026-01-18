'use client';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-xl',
  };

  const animationClasses = {
    pulse: 'animate-pulse bg-white/10',
    wave: 'animate-[wave_1.5s_ease-in-out_infinite]',
    none: '',
  };

  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={`bg-white/10 ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
}

interface SkeletonTextProps {
  lines?: number;
  className?: string;
  width?: string | number;
}

export function SkeletonText({ lines = 3, className = '', width }: SkeletonTextProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 && width ? width : '100%'}
        />
      ))}
    </div>
  );
}

interface SkeletonCardProps {
  showAvatar?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  showStats?: boolean;
  className?: string;
}

export function SkeletonCard({
  showAvatar = true,
  showTitle = true,
  showDescription = true,
  showStats = true,
  className = '',
}: SkeletonCardProps) {
  return (
    <div className={`glass-effect rounded-3xl p-6 card-hover ${className}`}>
      <div className="flex items-start gap-4 mb-6">
        {showAvatar && (
          <Skeleton variant="circular" width={56} height={56} />
        )}
        <div className="flex-1 space-y-3">
          {showTitle && (
            <div className="space-y-2">
              <Skeleton variant="text" width="40%" height={24} />
              <Skeleton variant="text" width="30%" />
            </div>
          )}
          {showDescription && (
            <SkeletonText lines={2} width="60%" />
          )}
        </div>
      </div>
      {showStats && (
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="card" height={80} />
          ))}
        </div>
      )}
    </div>
  );
}

interface SkeletonChartProps {
  showLegend?: boolean;
  className?: string;
}

export function SkeletonChart({ showLegend = false, className = '' }: SkeletonChartProps) {
  return (
    <div className={`glass-effect rounded-3xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <Skeleton variant="text" width="30%" height={24} />
        <div className="flex gap-2">
          {showLegend && Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="circular" width={12} height={12} />
          ))}
        </div>
      </div>
      <div className="h-64 flex items-end justify-center gap-2">
        {[60, 120, 90, 150, 110, 80].map((height, i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            width={40}
            height={height}
            animation="wave"
          />
        ))}
      </div>
    </div>
  );
}
