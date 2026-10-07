import React from 'react';
import { cn } from '../lib/cn';

export const AspectRatio = ({ ratio = 16 / 9, className, style, ...props }: React.HTMLAttributes<HTMLDivElement> & { ratio?: number }) => (
	<div className={cn('relative w-full overflow-hidden [&>img]:size-full [&>img]:object-cover [&>video]:size-full [&>video]:object-cover', className)} style={{ aspectRatio: String(ratio), ...style }} {...props} />
);
