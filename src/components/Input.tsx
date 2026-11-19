import React, { forwardRef, useState } from 'react';
import { cn } from '../lib/cn';
import { EyeIcon, EyeOffIcon } from '../lib/icons';

export const fieldStyles =
	'w-full h-(--ui-h-md) text-(length:--ui-field-text) ui-border border-line rounded-field bg-control text-page-text font-normal placeholder:text-muted shadow-box transition-[color,background-color,border-color,box-shadow] duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] outline-none hover:border-line-strong focus:border-brand focus-visible:ring-3 focus-visible:ring-brand/15 disabled:opacity-50 disabled:cursor-not-allowed aria-invalid:border-danger aria-invalid:focus-visible:ring-danger/20';

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
			{startAdornment && <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted flex items-center">{startAdornment}</span>}
			<input
				ref={ref}
				type={inputType}
				aria-invalid={invalid || props['aria-invalid']}
				className={cn(fieldStyles, 'px-(--ui-field-px)', startAdornment && 'ps-9', isPassword && 'pe-10', className)}
				{...props}
			/>
			{isPassword && (
				<button
					type="button"
					onClick={() => setShowPassword((v) => !v)}
					aria-label={showPassword ? 'Hide password' : 'Show password'}
					aria-pressed={showPassword}
					className="absolute end-3 top-1/2 -translate-y-1/2 rounded-item p-1 text-muted hover:text-page-text transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-brand cursor-pointer"
				>
					{showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
				</button>
			)}
		</div>
	);
});

Input.displayName = 'Input';
