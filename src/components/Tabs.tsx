import React, { createContext, useContext, useId, useMemo, useRef } from 'react';
import { cn } from '../lib/cn';
import { useControllableState } from '../lib/useControllableState';

interface TabsContextValue {
	value: string | undefined;
	setValue: (v: string) => void;
	baseId: string;
}
const TabsContext = createContext<TabsContextValue | null>(null);
const useTabs = () => {
	const ctx = useContext(TabsContext);
	if (!ctx) throw new Error('Tabs components must be used within <Tabs>');
	return ctx;
};

export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
}

export const Tabs = ({ value, defaultValue, onValueChange, className, ...props }: TabsProps) => {
	const baseId = useId();
	const [current, setCurrent] = useControllableState<string | undefined>(value, defaultValue, onValueChange as ((v: string | undefined) => void) | undefined);
	const ctx = useMemo(() => ({ value: current, setValue: (v: string) => setCurrent(v), baseId }), [current, setCurrent, baseId]);
	return (
		<TabsContext.Provider value={ctx}>
			<div className={cn('flex flex-col gap-4', className)} {...props} />
		</TabsContext.Provider>
	);
};

export const TabsList = ({ className, onKeyDown, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
	const ref = useRef<HTMLDivElement>(null);
	const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		onKeyDown?.(e);
		if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
		const tabs = Array.from(ref.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])') ?? []);
		const index = tabs.indexOf(document.activeElement as HTMLButtonElement);
		if (index < 0) return;
		e.preventDefault();
		const next = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : (index + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
		tabs[next].focus();
		tabs[next].click();
	};
	return (
		<div
			ref={ref}
			role="tablist"
			onKeyDown={handleKeyDown}
			className={cn('inline-flex w-fit max-w-full items-center gap-1 overflow-x-auto ui-border border-line rounded-control bg-surface p-1', className)}
			{...props}
		/>
	);
};

export const TabsTrigger = ({ value, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) => {
	const ctx = useTabs();
	const active = ctx.value === value;
	return (
		<button
			type="button"
			role="tab"
			id={`${ctx.baseId}-tab-${value}`}
			aria-selected={active}
			aria-controls={`${ctx.baseId}-panel-${value}`}
			tabIndex={active ? 0 : -1}
			onClick={() => ctx.setValue(value)}
			className={cn(
				'ui-label cursor-pointer whitespace-nowrap rounded-control px-4 py-1.5 text-sm transition-colors outline-none',
				'focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50 disabled:pointer-events-none',
				active ? 'bg-brand text-brand-fg' : 'text-page-text hover:bg-hover',
				className,
			)}
			{...props}
		/>
	);
};

export const TabsContent = ({ value, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { value: string }) => {
	const ctx = useTabs();
	if (ctx.value !== value) return null;
	return (
		<div
			role="tabpanel"
			id={`${ctx.baseId}-panel-${value}`}
			aria-labelledby={`${ctx.baseId}-tab-${value}`}
			tabIndex={0}
			className={cn('outline-none animate-pk-fade-in', className)}
			{...props}
		/>
	);
};
