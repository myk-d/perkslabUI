import React, { createContext, useContext, useId } from 'react';
import { cn } from '../lib/cn';
import { withTriggerAria } from '../lib/trigger';
import { useControllableState } from '../lib/useControllableState';

const Ctx = createContext<{ open: boolean; setOpen: (v: boolean) => void; id: string } | null>(null);
const useCollapsible = () => {
	const c = useContext(Ctx);
	if (!c) throw new Error('Collapsible parts must be used within <Collapsible>');
	return c;
};

export interface CollapsibleProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export const Collapsible = ({ open, defaultOpen = false, onOpenChange, ...props }: CollapsibleProps) => {
	const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange);
	const id = useId();
	return (
		<Ctx.Provider value={{ open: isOpen, setOpen, id }}>
			<div data-state={isOpen ? 'open' : 'closed'} {...props} />
		</Ctx.Provider>
	);
};

/** Wraps your own trigger element (button); click toggles. */
export const CollapsibleTrigger = ({ children, className }: { children: React.ReactNode; className?: string }) => {
	const { open, setOpen, id } = useCollapsible();
	return (
		<span className={cn('inline-flex', className)} onClick={() => setOpen(!open)}>
			{withTriggerAria(children, { 'aria-expanded': open, 'aria-controls': `${id}-c` })}
		</span>
	);
};

export const CollapsibleContent = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
	const { open, id } = useCollapsible();
	return (
		<div
			id={`${id}-c`}
			data-state={open ? 'open' : 'closed'}
			aria-hidden={!open || undefined}
			{...(open ? {} : { inert: '' })}
			className={cn('grid transition-[grid-template-rows,opacity,visibility] duration-200 ease-out motion-reduce:transition-none', open ? 'grid-rows-[1fr] opacity-100 visible' : 'grid-rows-[0fr] opacity-0 invisible', className)}
			{...props}
		>
			<div className="min-h-0 overflow-hidden">{children}</div>
		</div>
	);
};
