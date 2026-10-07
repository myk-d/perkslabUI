import React from 'react';
import { cn } from '../lib/cn';

/** Joins adjacent buttons/inputs into one segmented control (shared borders, only the outer corners rounded). */
export const ButtonGroup = ({ orientation = 'horizontal', className, ...props }: React.HTMLAttributes<HTMLDivElement> & { orientation?: 'horizontal' | 'vertical' }) => (
	<div
		role="group"
		className={cn(
			'inline-flex',
			orientation === 'horizontal'
				? 'flex-row [&>*:not(:first-child)]:rounded-s-none [&>*:not(:last-child)]:rounded-e-none [&>*:not(:first-child)]:-ms-px'
				: 'flex-col [&>*:not(:first-child)]:rounded-t-none [&>*:not(:last-child)]:rounded-b-none [&>*:not(:first-child)]:-mt-px',
			'[&>*:focus-visible]:z-10 [&>*:hover]:z-10 [&>*]:relative',
			className,
		)}
		{...props}
	/>
);
