import React, { forwardRef } from 'react';
import { useControllableState } from '../lib/useControllableState';
import { cn } from '../lib/cn';

export interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'defaultValue'> {
	checked?: boolean;
	defaultChecked?: boolean;
	onCheckedChange?: (checked: boolean) => void;
	label?: React.ReactNode;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(({ checked, defaultChecked = false, onCheckedChange, label, className, disabled, ...props }, ref) => {
	const [isOn, setOn] = useControllableState(checked, defaultChecked, onCheckedChange);

	const control = (
		<button
			ref={ref}
			type="button"
			role="switch"
			aria-checked={isOn}
			disabled={disabled}
			onClick={() => setOn(!isOn)}
			className={cn(
				'group/switch relative h-6 w-11 shrink-0 cursor-pointer rounded-full ui-border transition-colors duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] outline-none',
				'focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-page-bg disabled:opacity-50 disabled:cursor-not-allowed',
				isOn ? 'bg-brand border-brand' : 'bg-subtle border-line hover:border-line-strong',
				className,
			)}
			{...props}
		>
			<span
				className={cn(
					'absolute top-1/2 start-0.5 block size-4.5 -translate-y-1/2 rounded-full shadow-box transition-[transform,width,background-color] duration-250 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none',
					'group-active/switch:w-5',
					isOn ? 'ltr:translate-x-5 rtl:-translate-x-5 bg-brand-fg' : 'translate-x-0 bg-surface ring-1 ring-page-text/10',
				)}
			/>
		</button>
	);

	if (!label) return control;
	return (
		<label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
			{control}
			<span className="ui-label text-sm text-page-text">{label}</span>
		</label>
	);
});

Switch.displayName = 'Switch';
