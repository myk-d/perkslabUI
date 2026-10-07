import React from 'react';
import { cn } from '../lib/cn';

export const Kbd = ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
	<kbd className={cn('inline-flex h-5 min-w-5 items-center justify-center rounded-item ui-border border-line bg-hover px-1.5 font-mono text-[11px] font-medium text-muted select-none', className)} {...props} />
);
export const KbdGroup = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => <span className={cn('inline-flex items-center gap-1', className)} {...props} />;
