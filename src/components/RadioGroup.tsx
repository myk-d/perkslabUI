import React, { createContext, forwardRef, useContext, useId } from 'react';
import { useControllableState } from '../lib/useControllableState';
import { cn } from '../lib/cn';

interface RadioContextValue {
	name: string;
	value: string | undefined;
	setValue: (value: string) => void;
	disabled?: boolean;
}

const RadioContext = createContext<RadioContextValue | null>(null);

export interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	name?: string;
	disabled?: boolean;
	orientation?: 'vertical' | 'horizontal';
}

export const RadioGroup = ({ value, defaultValue, onValueChange, name, disabled, orientation = 'vertical', className, children, ...props }: RadioGroupProps) => {
	const generated = useId();
	const [current, setCurrent] = useControllableState<string | undefined>(value, defaultValue, onValueChange as ((v: string | undefined) => void) | undefined);
	return (
		<RadioContext.Provider value={{ name: name ?? generated, value: current, setValue: (v) => setCurrent(v), disabled }}>
			<div role="radiogroup" className={cn('flex gap-3', orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap', className)} {...props}>
				{children}
			</div>
		</RadioContext.Provider>
	);
};

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'checked' | 'name'> {
	value: string;
	label?: React.ReactNode;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(({ value, label, className, disabled, ...props }, ref) => {
	const ctx = useContext(RadioContext);
	if (!ctx) throw new Error('Radio must be used within RadioGroup');
	const isDisabled = disabled ?? ctx.disabled;
	return (
		<label className={cn('inline-flex items-center gap-3 group', isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer')}>
			<span className="relative flex items-center justify-center shrink-0">
				<input
					ref={ref}
					type="radio"
					name={ctx.name}
					value={value}
					checked={ctx.value === value}
					disabled={isDisabled}
					onChange={() => ctx.setValue(value)}
					className={cn(
						'peer appearance-none cursor-[inherit] size-5 rounded-full ui-border border-line bg-control transition-[color,background-color,border-color,box-shadow,transform,opacity] duration-200',
						'checked:border-brand outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-page-bg group-hover:bg-hover',
						className,
					)}
					{...props}
				/>
				<span className="absolute size-2.5 rounded-full bg-brand pointer-events-none scale-0 peer-checked:scale-100 transition-transform duration-150" />
			</span>
			{label && <span className="ui-label text-sm text-page-text">{label}</span>}
		</label>
	);
});
Radio.displayName = 'Radio';
