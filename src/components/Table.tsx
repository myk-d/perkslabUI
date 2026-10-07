import React from 'react';
import { cn } from '../lib/cn';

/** Responsive wrapper: the table scrolls horizontally inside it instead of widening the page. */
export const Table = ({ className, containerClassName, ...props }: React.TableHTMLAttributes<HTMLTableElement> & { containerClassName?: string }) => (
	<div className={cn('w-full overflow-x-auto ui-border rounded-box bg-surface pk-scrollbar', containerClassName)}>
		<table className={cn('w-full border-collapse text-start text-sm text-page-text', className)} {...props} />
	</div>
);

export const TableHeader = ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => <thead className={cn('border-b-[length:var(--ui-border-w)] border-line bg-hover', className)} {...props} />;
export const TableBody = ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />;
export const TableRow = ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
	<tr className={cn('border-b border-line/30 transition-colors hover:bg-hover', className)} {...props} />
);
export const TableHead = ({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
	<th scope="col" className={cn('ui-label px-4 py-3 text-xs text-muted whitespace-nowrap', className)} {...props} />
);
export const TableCell = ({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => <td className={cn('px-4 py-3 align-middle', className)} {...props} />;
export const TableCaption = ({ className, ...props }: React.HTMLAttributes<HTMLTableCaptionElement>) => <caption className={cn('mt-3 text-sm text-muted', className)} {...props} />;
