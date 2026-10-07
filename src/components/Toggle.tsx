import React, { createContext, forwardRef, useContext } from 'react';
import { cn } from '../lib/cn';
import { useControllableState } from '../lib/useControllableState';

type ToggleVariant = 'default' | 'outline';
type ToggleSize = 'sm' | 'md' | 'lg';

const sizes: Record<ToggleSize, string> = { sm: 'h-8 px-2.5 text-xs', md: 'h-10 px-3 text-sm', lg: 'h-12 px-5 text-base' };
const toggleClass = (variant: ToggleVariant, size: ToggleSize, pressed: boolean) =>
	cn(
		'ui-label inline-flex cursor-pointer items-center justify-center gap-2 rounded-control transition-colors outline-none whitespace-nowrap',
		'focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50 disabled:pointer-events-none',
		variant === 'outline' && 'ui-border',
		pressed ? 'bg-brand-bg text-brand border-brand' : 'bg-transparent text-page-text hover:bg-hover',
		sizes[size],
	);

export interface ToggleProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
	pressed?: boolean;
	defaultPressed?: boolean;
	onPressedChange?: (pressed: boolean) => void;
	variant?: ToggleVariant;
	size?: ToggleSize;
}

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(({ pressed, defaultPressed = false, onPressedChange, variant = 'default', size = 'md', className, ...props }, ref) => {
	const [on, setOn] = useControllableState(pressed, defaultPressed, onPressedChange);
	return <button ref={ref} type="button" aria-pressed={on} onClick={() => setOn(!on)} className={cn(toggleClass(variant, size, on), className)} {...props} />;
});
Toggle.displayName = 'Toggle';

interface GroupCtx {
	isOn: (v: string) => boolean;
	toggle: (v: string) => void;
	variant: ToggleVariant;
	size: ToggleSize;
}
const GroupContext = createContext<GroupCtx | null>(null);

export interface ToggleGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
	type?: 'single' | 'multiple';
	/** string for single, string[] for multiple. */
	value?: string | string[];
	defaultValue?: string | string[];
	onValueChange?: (value: string | string[]) => void;
	variant?: ToggleVariant;
	size?: ToggleSize;
}

export const ToggleGroup = ({ type = 'single', value, defaultValue, onValueChange, variant = 'outline', size = 'md', className, ...props }: ToggleGroupProps) => {
	const [current, setCurrent] = useControllableState<string | string[]>(value, defaultValue ?? (type === 'multiple' ? [] : ''), onValueChange);
	const list = Array.isArray(current) ? current : current ? [current] : [];
	const toggle = (v: string) => {
		const on = list.includes(v);
		if (type === 'multiple') setCurrent(on ? list.filter((x) => x !== v) : [...list, v]);
		else setCurrent(on ? '' : v);
	};
	return (
		<GroupContext.Provider value={{ isOn: (v) => list.includes(v), toggle, variant, size }}>
			<div role="group" className={cn('inline-flex gap-1', className)} {...props} />
		</GroupContext.Provider>
	);
};

export const ToggleGroupItem = ({ value, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) => {
	const g = useContext(GroupContext);
	if (!g) throw new Error('ToggleGroupItem must be used within <ToggleGroup>');
	const on = g.isOn(value);
	return <button type="button" aria-pressed={on} onClick={() => g.toggle(value)} className={cn(toggleClass(g.variant, g.size, on), className)} {...props} />;
};
