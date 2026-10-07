import React from 'react';
import { cn } from '../lib/cn';

export const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div aria-hidden="true" className={cn('animate-pulse rounded-item bg-page-text/10', className)} {...props} />
);
