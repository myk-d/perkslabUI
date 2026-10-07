import React, { useRef, useState } from 'react';
import { cn } from '../lib/cn';
import { useClickOutside, useEscape } from '../lib/dom';
import { CloseIcon } from '../lib/icons';

export interface SupportButtonProps {
	supportEmail?: string;
	title?: string;
	description?: string;
	note?: string;
	/** aria-label for the floating button. */
	label?: string;
	className?: string;
}

export const SupportButton: React.FC<SupportButtonProps> = ({
	supportEmail = 'support@myslennya.com',
	title = 'Need help?',
	description = 'We are currently setting up our automated support system. Please contact us directly via email:',
	note = '* Please describe your issue in detail for a faster response.',
	label = 'Support',
	className,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);
	useClickOutside(ref, () => setIsOpen(false), isOpen);
	useEscape(() => setIsOpen(false), isOpen);

	return (
		<div className={cn('fixed bottom-15 end-6 z-[100] flex flex-col items-end gap-4', className)} ref={ref}>
			{isOpen && (
				<div role="dialog" aria-label={title} className="w-72 max-w-[calc(100vw-3rem)] rounded-box ui-border bg-surface p-6 text-page-text shadow-pop animate-pk-slide-up">
					<h3 className="ui-heading mb-3 text-lg">{title}</h3>
					<p className="mb-4 text-sm leading-relaxed text-page-text/80">{description}</p>
					<a
						href={`mailto:${supportEmail}`}
						className="block rounded-field bg-brand-bg p-3 text-center font-bold text-action break-all transition-transform hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-brand outline-none"
					>
						{supportEmail}
					</a>
					<p className="mt-4 text-[10px] italic text-page-text/50">{note}</p>
				</div>
			)}
			<button
				type="button"
				aria-label={label}
				aria-expanded={isOpen}
				onClick={() => setIsOpen((v) => !v)}
				className={cn(
					'flex size-14 items-center justify-center rounded-full bg-brand text-brand-fg shadow-pop transition-[color,background-color,border-color,box-shadow,transform,opacity] cursor-pointer outline-none',
					'hover:scale-110 active:scale-95 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-page-bg',
					isOpen && 'rotate-90',
				)}
			>
				{isOpen ? (
					<CloseIcon className="size-6" strokeWidth={2.5} />
				) : (
					<svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" aria-hidden="true">
						<path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
				)}
			</button>
		</div>
	);
};
