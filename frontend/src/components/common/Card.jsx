import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export const Card = ({ className, children, hoverable = true, ...props }) => {
  return (
    <motion.div
      whileHover={hoverable ? { y: -3 } : undefined}
      transition={{ duration: 0.2 }}
      className={cn(
        'bg-white dark:bg-dark-card border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm dark:shadow-none transition-colors duration-300',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};
