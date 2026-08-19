import React from 'react';
import { cn } from '../../lib/utils';

export const Skeleton = ({ className }) => {
  return (
    <div className={cn('animate-pulse bg-slate-200 dark:bg-slate-800/80 rounded-xl', className)} />
  );
};
