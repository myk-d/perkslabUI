import React, { useRef } from 'react';
import { cn } from '../lib/cn';
import { useControllableState } from '../lib/useControllableState';

export interface InputOTPProps {
	length?: number;
	value?: string;
	defaultValue?: string;
	onChange?: (value: string) => void;
	/** Fired once every slot is filled. */
	onComplete?: (value: string) => void;
	/** Restrict characters — default digits only. */
	pattern?: RegExp;
	mask?: boolean;
	disabled?: boolean;
	invalid?: boolean;
	autoFocus?: boolean;
	className?: string;
}

/** One box per character: auto-advance, Backspace goes back, arrows move, paste fills the rest. */
export const InputOTP = ({ length = 6, value, defaultValue = '', onChange, onComplete, pattern = /\d/, mask, disabled, invalid, autoFocus, className }: InputOTPProps) => {
	const [code, setCode] = useControllableState(value, defaultValue, onChange);
	const refs = useRef<(HTMLInputElement | null)[]>([]);
	const focus = (i: number) => refs.current[Math.min(Math.max(i, 0), length - 1)]?.focus();

	const commit = (next: string) => {
		setCode(next);
		if (next.length === length) onComplete?.(next);
	};
	const clean = (s: string) => Array.from(s).filter((c) => pattern.test(c)).join('');

	return (
		<div role="group" className={cn('inline-flex gap-2', className)}>
			{Array.from({ length }, (_, i) => (
				<input
					key={i}
					ref={(el) => {
						refs.current[i] = el;
					}}
					type={mask ? 'password' : 'text'}
					inputMode="numeric"
					autoComplete={i === 0 ? 'one-time-code' : 'off'}
					autoFocus={autoFocus && i === 0}
					maxLength={1}
					disabled={disabled}
					aria-label={`Digit ${i + 1}`}
					aria-invalid={invalid || undefined}
					value={code[i] ?? ''}
					onFocus={(e) => e.target.select()}
					onChange={(e) => {
						const ch = clean(e.target.value).slice(-1);
						if (!ch) return;
						commit((code.slice(0, i) + ch + code.slice(i + 1)).slice(0, length));
						focus(i + 1);
					}}
					onKeyDown={(e) => {
						if (e.key === 'Backspace') {
							e.preventDefault();
							if (code[i]) commit(code.slice(0, i) + code.slice(i + 1));
							else {
								commit(code.slice(0, Math.max(0, i - 1)) + code.slice(i));
								focus(i - 1);
							}
						} else if (e.key === 'ArrowLeft') focus(i - 1);
						else if (e.key === 'ArrowRight') focus(i + 1);
					}}
					onPaste={(e) => {
						e.preventDefault();
						const pasted = clean(e.clipboardData.getData('text')).slice(0, length - i);
						if (!pasted) return;
						commit((code.slice(0, i) + pasted + code.slice(i + pasted.length)).slice(0, length));
						focus(i + pasted.length);
					}}
					className="size-11 rounded-field ui-border border-line bg-control text-center font-mono text-lg text-page-text shadow-box outline-none transition-colors focus:border-brand focus-visible:ring-2 focus-visible:ring-brand aria-invalid:border-danger disabled:opacity-50"
				/>
			))}
		</div>
	);
};
