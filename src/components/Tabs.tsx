import React, { createContext, useContext, useId, useMemo, useRef, useState } from 'react';
import { cn } from '../lib/cn';
import { useIsomorphicLayoutEffect } from '../lib/dom';
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

export const TabsList = ({ className, onKeyDown, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
	const ctx = useTabs();
	const ref = useRef<HTMLDivElement>(null);
	const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);
	const ready = useRef(false);

	useIsomorphicLayoutEffect(() => {
		const container = ref.current;
		if (!container) return;
		const measure = () => {
			const active = container.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
			if (!active) {
				setIndicator(null);
				return;
			}
			const next = { left: active.offsetLeft, width: active.offsetWidth };
			setIndicator((prev) => (prev && prev.left === next.left && prev.width === next.width ? prev : next));
		};
		measure();
		const frame = requestAnimationFrame(() => {
			ready.current = true;
		});
		if (typeof ResizeObserver === 'undefined') return () => cancelAnimationFrame(frame);
		const ro = new ResizeObserver(measure);
		ro.observe(container);
		return () => {
			cancelAnimationFrame(frame);
			ro.disconnect();
		};
	}, [ctx.value, children]);

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
			className={cn('relative inline-flex w-fit max-w-full items-center gap-0.5 overflow-x-auto ui-border border-line-subtle rounded-control bg-subtle p-1', className)}
			{...props}
		>
			{indicator && (
				<span
					aria-hidden="true"
					style={{ width: indicator.width, transform: `translate3d(${indicator.left}px, 0, 0)` }}
					className={cn(
						'pointer-events-none absolute inset-y-1 left-0 rounded-control bg-brand shadow-box motion-reduce:transition-none',
						ready.current && 'transition-[transform,width] duration-250 ease-[cubic-bezier(0.16,1,0.3,1)]',
					)}
				/>
			)}
			{children}
		</div>
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
				'ui-label relative z-10 cursor-pointer whitespace-nowrap rounded-control px-3.5 py-1.5 text-sm transition-colors duration-150 outline-none',
				'focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50 disabled:pointer-events-none',
				active ? 'text-brand-fg' : 'text-secondary hover:text-page-text',
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
			className={cn('outline-none animate-pk-tab-in', className)}
			{...props}
		/>
	);
};
