import React from 'react';
import { cn } from '../lib/cn';

export const Separator = ({ orientation = 'horizontal', className, ...props }: React.HTMLAttributes<HTMLDivElement> & { orientation?: 'horizontal' | 'vertical' }) => (
	<div
		role="separator"
		aria-orientation={orientation}
		className={cn('shrink-0 bg-line/40', orientation === 'horizontal' ? 'h-px w-full' : 'w-px self-stretch', className)}
		{...props}
	/>
);
