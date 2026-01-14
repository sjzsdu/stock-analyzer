'use client';

import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export default function GlassCard({
  children,
  className = '',
  hover = false,
  padding = 'lg'
}: GlassCardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`
        glass-effect rounded-3xl
        ${paddingClasses[padding]}
        ${hover ? 'card-hover' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}