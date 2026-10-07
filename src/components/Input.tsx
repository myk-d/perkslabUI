import React, { forwardRef, useState } from 'react';
import { cn } from '../lib/cn';
import { EyeIcon, EyeOffIcon } from '../lib/icons';

export const fieldStyles =
	'w-full text-(length:--ui-field-text) ui-border border-line rounded-field bg-control text-page-text font-medium placeholder:text-muted shadow-box transition-[color,background-color,border-color,box-shadow,transform,opacity] duration-200 outline-none hover:bg-hover focus:bg-hover focus:border-brand focus-visible:ring-1 focus-visible:ring-brand disabled:opacity-50 disabled:cursor-not-allowed aria-invalid:border-danger aria-invalid:focus-visible:ring-danger';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	/** Marks the field as invalid (red border + `aria-invalid`). */
	invalid?: boolean;
	/** Content rendered inside the field on the left, e.g. an icon. */
	startAdornment?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, type, invalid, startAdornment, ...props }, ref) => {
	const [showPassword, setShowPassword] = useState(false);
	const isPassword = type === 'password';
	const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

	return (
		<div className="relative w-full group">
			{startAdornment && <span className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-muted flex items-center">{startAdornment}</span>}
			<input
				ref={ref}
				type={inputType}
				aria-invalid={invalid || props['aria-invalid']}
				className={cn(fieldStyles, 'px-(--ui-field-px) py-(--ui-field-py)', startAdornment && 'ps-10', isPassword && 'pe-12', className)}
				{...props}
			/>
			{isPassword && (
				<button
					type="button"
					onClick={() => setShowPassword((v) => !v)}
					aria-label={showPassword ? 'Hide password' : 'Show password'}
					aria-pressed={showPassword}
					className="absolute end-4 top-1/2 -translate-y-1/2 text-muted hover:text-brand transition-colors outline-none focus-visible:text-brand cursor-pointer"
				>
					{showPassword ? <EyeOffIcon className="size-5" /> : <EyeIcon className="size-5" />}
				</button>
			)}
		</div>
	);
});

Input.displayName = 'Input';
