import React from 'react';
import { cn } from '../lib/cn';

export const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div aria-hidden="true" className={cn('pk-skeleton rounded-item', className)} {...props} />
);
