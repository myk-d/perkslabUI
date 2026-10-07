import React from 'react';
import { cn } from '../lib/cn';

/** Border + focus ring shared by everything inside; put a bare <input className="pk-bare"> / <InputGroupInput> in it. */
export const InputGroup = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		role="group"
		className={cn(
			'flex w-full items-stretch overflow-hidden ui-border rounded-field bg-control text-page-text shadow-box transition-colors',
			'focus-within:border-brand focus-within:ring-1 focus-within:ring-brand has-[[aria-invalid=true]]:border-danger',
			className,
		)}
		{...props}
	/>
);

export const InputGroupInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
	<input ref={ref} className={cn('min-w-0 flex-1 bg-transparent px-3 py-2.5 font-medium outline-none placeholder:text-muted disabled:opacity-50', className)} {...props} />
));
InputGroupInput.displayName = 'InputGroupInput';

/** Static prefix/suffix: text ("https://"), an icon, or a <Button size="sm" variant="ghost">. */
export const InputGroupAddon = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div className={cn('flex shrink-0 items-center gap-2 bg-hover px-3 text-sm text-muted first:border-r last:border-l border-line/40 [&>svg]:size-4', className)} {...props} />
);
