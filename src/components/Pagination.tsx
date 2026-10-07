import React from 'react';
import { cn } from '../lib/cn';
import { ChevronLeftIcon, ChevronRightIcon } from '../lib/icons';

/** Page numbers with ellipses: 1 … 4 5 [6] 7 8 … 20 */
export function getPageRange(page: number, pageCount: number, siblings = 1): (number | 'ellipsis')[] {
	const total = siblings * 2 + 5;
	if (pageCount <= total) return Array.from({ length: pageCount }, (_, i) => i + 1);
	const left = Math.max(page - siblings, 2);
	const right = Math.min(page + siblings, pageCount - 1);
	const out: (number | 'ellipsis')[] = [1];
	if (left > 2) out.push('ellipsis');
	for (let p = left; p <= right; p++) out.push(p);
	if (right < pageCount - 1) out.push('ellipsis');
	out.push(pageCount);
	return out;
}

export interface PaginationProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
	/** 1-based current page. */
	page: number;
	pageCount: number;
	onPageChange: (page: number) => void;
	siblings?: number;
	prevLabel?: string;
	nextLabel?: string;
}

export const Pagination = ({ page, pageCount, onPageChange, siblings = 1, prevLabel = 'Previous page', nextLabel = 'Next page', className, ...props }: PaginationProps) => {
	const btn = 'flex size-9 items-center justify-center rounded-control text-sm transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-40 disabled:pointer-events-none';
	return (
		<nav aria-label="Pagination" className={cn('flex items-center gap-1 text-page-text', className)} {...props}>
			<button type="button" aria-label={prevLabel} disabled={page <= 1} onClick={() => onPageChange(page - 1)} className={cn(btn, 'hover:bg-hover')}>
				<ChevronLeftIcon className="size-4" />
			</button>
			{getPageRange(page, pageCount, siblings).map((p, i) =>
				p === 'ellipsis' ? (
					<span key={`e${i}`} aria-hidden="true" className="flex size-9 items-center justify-center text-muted">
						…
					</span>
				) : (
					<button key={p} type="button" aria-current={p === page ? 'page' : undefined} onClick={() => onPageChange(p)} className={cn(btn, p === page ? 'ui-border border-brand bg-brand-bg font-bold' : 'hover:bg-hover')}>
						{p}
					</button>
				),
			)}
			<button type="button" aria-label={nextLabel} disabled={page >= pageCount} onClick={() => onPageChange(page + 1)} className={cn(btn, 'hover:bg-hover')}>
				<ChevronRightIcon className="size-4" />
			</button>
		</nav>
	);
};
