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
				'relative h-6 w-11 shrink-0 cursor-pointer rounded-full ui-border transition-colors duration-200 outline-none',
				'focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-page-bg disabled:opacity-50 disabled:cursor-not-allowed',
				isOn ? 'bg-brand border-brand' : 'bg-control border-line',
				className,
			)}
			{...props}
		>
			<span
				className={cn(
					'absolute top-1/2 left-0.5 block size-4.5 -translate-y-1/2 rounded-full shadow-box transition-transform duration-200',
					isOn ? 'translate-x-5 bg-brand-fg' : 'translate-x-0 bg-muted',
				)}
			/>
		</button>
	);

	if (!label) return control;
	return (
		<label className="inline-flex items-center gap-3 cursor-pointer">
			{control}
			<span className="ui-label text-sm text-page-text">{label}</span>
		</label>
	);
});

Switch.displayName = 'Switch';
