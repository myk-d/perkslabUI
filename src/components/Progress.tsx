import React from 'react';
import { cn } from '../lib/cn';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
	value: number;
	max?: number;
}

export const Progress = ({ value, max = 100, className, ...props }: ProgressProps) => {
	const pct = Math.min(100, Math.max(0, (value / max) * 100));
	return (
		<div
			role="progressbar"
			aria-valuenow={Math.round(value)}
			aria-valuemin={0}
			aria-valuemax={max}
			className={cn('h-2 w-full overflow-hidden rounded-full bg-line/30', className)}
			{...props}
		>
			<div className="h-full rounded-[inherit] bg-brand transition-[width] duration-300" style={{ width: `${pct}%` }} />
		</div>
	);
};
