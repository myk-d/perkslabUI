import React, { forwardRef } from 'react';
import { cn } from '../lib/cn';
import { useControllableState } from '../lib/useControllableState';

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'defaultValue' | 'onChange'> {
	value?: number;
	defaultValue?: number;
	onValueChange?: (value: number) => void;
	min?: number;
	max?: number;
	step?: number;
	/** Shows the current value to the right. */
	showValue?: boolean;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(({ value, defaultValue = 0, onValueChange, min = 0, max = 100, step = 1, showValue, className, style, ...props }, ref) => {
	const [v, setV] = useControllableState(value, defaultValue, onValueChange);
	const pct = max === min ? 0 : ((v - min) / (max - min)) * 100;
	return (
		<div className={cn('flex w-full items-center gap-3', className)}>
			<input
				ref={ref}
				type="range"
				min={min}
				max={max}
				step={step}
				value={v}
				onChange={(e) => setV(Number(e.target.value))}
				style={{ ['--pk-fill' as string]: `${pct}%`, ...style }}
				className="pk-range w-full outline-none"
				{...props}
			/>
			{showValue && <span className="w-10 text-right font-mono text-sm tabular-nums text-muted">{v}</span>}
		</div>
	);
});
Slider.displayName = 'Slider';
