import React from 'react';
import { cn } from '../lib/cn';
import { ChevronRightIcon } from '../lib/icons';
import { Slot } from '../lib/Slot';

export const Breadcrumb = (props: React.HTMLAttributes<HTMLElement>) => <nav aria-label="Breadcrumb" {...props} />;
export const BreadcrumbList = ({ className, ...props }: React.OlHTMLAttributes<HTMLOListElement>) => (
	<ol className={cn('flex flex-wrap items-center gap-1.5 text-sm text-muted sm:gap-2.5', className)} {...props} />
);
export const BreadcrumbItem = ({ className, ...props }: React.LiHTMLAttributes<HTMLLIElement>) => <li className={cn('inline-flex items-center gap-1.5', className)} {...props} />;

/** A link crumb. Use `asChild` to render your router's `<Link>`. */
export const BreadcrumbLink = ({ asChild, className, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { asChild?: boolean }) => {
	const cls = cn('transition-colors hover:text-page-text outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-item', className);
	return asChild ? <Slot className={cls} {...props}>{children}</Slot> : <a className={cls} {...props}>{children}</a>;
};
export const BreadcrumbPage = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
	<span aria-current="page" aria-disabled="true" className={cn('font-medium text-page-text', className)} {...props} />
);
export const BreadcrumbSeparator = ({ children, className }: { children?: React.ReactNode; className?: string }) => (
	<li role="presentation" aria-hidden="true" className={cn('inline-flex items-center [&>svg]:size-3.5', className)}>
		{children ?? <ChevronRightIcon />}
	</li>
);
