import React, { forwardRef } from 'react';
import { cn } from '../lib/cn';
import { ChevronDownIcon } from '../lib/icons';
import { fieldStyles } from './Input';

/** The browser's own <select> (best on mobile, free form-integration) wearing the theme. Use <Select> for a fully styled list. */
export const NativeSelect = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }>(({ className, children, invalid, ...props }, ref) => (
	<div className="relative w-full">
		<select ref={ref} aria-invalid={invalid || props['aria-invalid']} className={cn(fieldStyles, 'appearance-none cursor-pointer py-2.5 ps-4 pe-10', className)} {...props}>
			{children}
		</select>
		<ChevronDownIcon className="pointer-events-none absolute end-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
	</div>
));
NativeSelect.displayName = 'NativeSelect';
