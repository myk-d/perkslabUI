import React, { createContext, useContext, useId } from 'react';
import { cn } from '../lib/cn';
import { ChevronDownIcon } from '../lib/icons';
import { useControllableState } from '../lib/useControllableState';

interface AccordionContextProps {
	isOpen: (value: string) => boolean;
	toggleItem: (value: string) => void;
	baseId: string;
}

const AccordionContext = createContext<AccordionContextProps | null>(null);
const ItemContext = createContext<string | null>(null);

const useAccordion = (part: string) => {
	const ctx = useContext(AccordionContext);
	if (!ctx) throw new Error(`${part} must be used within Accordion`);
	return ctx;
};
const useItemValue = (explicit: string | undefined, part: string) => {
	const fromItem = useContext(ItemContext);
	const value = explicit ?? fromItem;
	if (value == null) throw new Error(`${part} must be used within AccordionItem (or receive a "value")`);
	return value;
};

export interface AccordionProps {
	children: React.ReactNode;
	className?: string;
	/** 'single' (default) keeps one item open; 'multiple' lets several be open. */
	type?: 'single' | 'multiple';
	/** shadcn's spelling of `type="multiple"`. */
	multiple?: boolean;
	/** Single mode: allow closing the open item by clicking it again. Default true. */
	collapsible?: boolean;
	/** Open item value(s). Strings for single, arrays for multiple. */
	value?: string | string[] | null;
	defaultValue?: string | string[] | null;
	onValueChange?: (value: string | string[] | null) => void;
}

export const Accordion = ({ children, className, type: typeProp = 'single', multiple, collapsible = true, value, defaultValue = null, onValueChange }: AccordionProps) => {
	const type = multiple ? 'multiple' : typeProp;
	const baseId = useId();
	const [current, setCurrent] = useControllableState<string | string[] | null>(value, defaultValue ?? (type === 'multiple' ? [] : null), onValueChange);
	const openList = Array.isArray(current) ? current : current ? [current] : [];

	const toggleItem = (item: string) => {
		const open = openList.includes(item);
		if (type === 'multiple') setCurrent(open ? openList.filter((v) => v !== item) : [...openList, item]);
		else setCurrent(open ? (collapsible ? null : item) : item);
	};

	return (
		<AccordionContext.Provider value={{ isOpen: (v) => openList.includes(v), toggleItem, baseId }}>
			<div data-slot="accordion" className={cn('flex flex-col gap-3 w-full [[data-ui=shadcn]_&]:gap-0', className)}>{children}</div>
		</AccordionContext.Provider>
	);
};

const DisabledContext = createContext(false);

export const AccordionItem = ({ value, children, className, disabled = false }: { value: string; children: React.ReactNode; className?: string; disabled?: boolean }) => (
	<ItemContext.Provider value={value}>
		<DisabledContext.Provider value={disabled}>
			<div
				data-slot="accordion-item"
				className={cn(
					'ui-border rounded-box overflow-hidden bg-surface transition-colors duration-300',
					// under the shadcn UI style items become a flat list divided by hairlines
					'[[data-ui=shadcn]_&]:rounded-none [[data-ui=shadcn]_&]:border-0 [[data-ui=shadcn]_&]:border-b [[data-ui=shadcn]_&]:border-line [[data-ui=shadcn]_&]:bg-transparent [[data-ui=shadcn]_&:last-child]:border-b-0',
					disabled && 'opacity-50',
					className,
				)}
			>
				{children}
			</div>
		</DisabledContext.Provider>
	</ItemContext.Provider>
);

export const AccordionTrigger = ({ value, children, className }: { value?: string; children: React.ReactNode; className?: string }) => {
	const ctx = useAccordion('AccordionTrigger');
	const item = useItemValue(value, 'AccordionTrigger');
	const open = ctx.isOpen(item);
	const disabled = useContext(DisabledContext);

	return (
		<button
			type="button"
			disabled={disabled}
			id={`${ctx.baseId}-trigger-${item}`}
			aria-expanded={open}
			aria-controls={`${ctx.baseId}-content-${item}`}
			onClick={() => ctx.toggleItem(item)}
			className={cn(
				'ui-label flex items-center justify-between gap-4 w-full px-6 py-4 text-start text-sm text-page-text',
				'hover:bg-hover transition-colors duration-300 cursor-pointer outline-none focus-visible:bg-hover',
				className,
			)}
		>
			{children}
			<ChevronDownIcon className={cn('size-5 shrink-0 text-action transition-transform duration-300', open && 'rotate-180')} />
		</button>
	);
};

export const AccordionContent = ({ value, children, className }: { value?: string; children: React.ReactNode; className?: string }) => {
	const ctx = useAccordion('AccordionContent');
	const item = useItemValue(value, 'AccordionContent');
	const open = ctx.isOpen(item);

	return (
		<div
			role="region"
			id={`${ctx.baseId}-content-${item}`}
			aria-labelledby={`${ctx.baseId}-trigger-${item}`}
			data-state={open ? 'open' : 'closed'}
			aria-hidden={!open || undefined}
			{...(open ? {} : { inert: '' })}
			className={cn(
				'grid transition-[grid-template-rows,opacity,visibility] duration-200 ease-out motion-reduce:transition-none',
				open ? 'grid-rows-[1fr] opacity-100 visible' : 'grid-rows-[0fr] opacity-0 invisible',
			)}
		>
			<div className="min-h-0 overflow-hidden">
				<div className={cn('px-6 pb-5 text-page-text/80 text-sm leading-relaxed', className)}>{children}</div>
			</div>
		</div>
	);
};
