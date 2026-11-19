import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { cn } from '../lib/cn';
import { CheckIcon, MinusIcon } from '../lib/icons';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
	label?: React.ReactNode;
	/** Shows the "some selected" dash state (visual + `indeterminate` DOM property). */
	indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ className, label, indeterminate, disabled, ...props }, ref) => {
	const inputRef = useRef<HTMLInputElement>(null);
	useImperativeHandle(ref, () => inputRef.current!);
	useEffect(() => {
		if (inputRef.current) inputRef.current.indeterminate = !!indeterminate;
	}, [indeterminate]);

	return (
		<label className={cn('inline-flex items-center gap-2.5 group select-none', disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer')}>
			<span className="relative flex items-center justify-center shrink-0">
				<input
					type="checkbox"
					ref={inputRef}
					disabled={disabled}
					className={cn(
						'peer appearance-none cursor-[inherit] size-4.5 ui-border border-line rounded-item bg-control shadow-box',
						'checked:bg-brand checked:border-brand indeterminate:bg-brand indeterminate:border-brand transition-[color,background-color,border-color,box-shadow,transform] duration-150 active:scale-95',
						'outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-page-bg',
						'group-hover:border-line-strong checked:group-hover:bg-brand-hover indeterminate:group-hover:bg-brand-hover',
						className,
					)}
					{...props}
				/>
				<CheckIcon className="absolute size-3 text-brand-fg pointer-events-none scale-50 opacity-0 peer-checked:scale-100 peer-checked:opacity-100 peer-indeterminate:opacity-0 transition-[transform,opacity] duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]" />
				<MinusIcon className="absolute size-3 text-brand-fg pointer-events-none scale-50 opacity-0 peer-indeterminate:scale-100 peer-indeterminate:opacity-100 transition-[transform,opacity] duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]" />
			</span>
			{label && <span className="ui-label text-sm text-page-text">{label}</span>}
		</label>
	);
});

Checkbox.displayName = 'Checkbox';
