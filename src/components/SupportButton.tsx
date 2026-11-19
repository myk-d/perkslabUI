import React, { useRef, useState } from 'react';
import { Portal } from '../lib/Portal';
import { cn } from '../lib/cn';
import { useClickOutside, useEscape } from '../lib/dom';
import { CloseIcon } from '../lib/icons';
import { useLayer } from '../lib/layers';
import { presenceAttrs, usePresence } from '../lib/presence';

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
	const hostRef = useRef<HTMLSpanElement>(null);
	const wrapRef = useRef<HTMLDivElement>(null);
	const { isTop, zIndex } = useLayer(isOpen, 'floating');
	const { mounted, state } = usePresence(isOpen, 140);

	useClickOutside(wrapRef, () => setIsOpen(false), isOpen);
	useEscape(() => isTop() && setIsOpen(false), isOpen);

	return (
		<>
			<span ref={hostRef} aria-hidden="true" className="hidden" />
			<Portal anchorRef={hostRef}>
				<div
					ref={wrapRef}
					data-pk-layer=""
					style={{ zIndex: isOpen ? zIndex : ('calc(var(--pk-z-base, 1000) - 10)' as unknown as number) }}
					className={cn('fixed bottom-15 end-6 flex flex-col items-end gap-3', className)}
				>
					{mounted && (
						<div
							role="dialog"
							aria-label={title}
							data-pk-layer=""
							data-side="top"
							style={{ transformOrigin: 'bottom right' }}
							{...presenceAttrs(state)}
							className={cn(
								'w-72 max-w-[calc(100vw-3rem)] rounded-pop ui-border border-line bg-elevated p-5 text-page-text shadow-pop',
								state === 'open' ? 'animate-pk-pop-in' : 'animate-pk-pop-out pointer-events-none',
							)}
						>
							<h3 className="ui-heading mb-2 text-base">{title}</h3>
							<p className="mb-4 text-sm leading-relaxed text-secondary">{description}</p>
							<a
								href={`mailto:${supportEmail}`}
								className="block rounded-field bg-subtle px-3 py-2.5 text-center text-sm font-medium text-brand break-all transition-[background-color,transform] duration-150 hover:bg-hover active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-brand outline-none"
							>
								{supportEmail}
							</a>
							<p className="mt-3 text-[11px] text-muted">{note}</p>
						</div>
					)}
					<button
						type="button"
						aria-label={label}
						aria-expanded={isOpen}
						onClick={() => setIsOpen((v) => !v)}
						className={cn(
							'flex size-13 items-center justify-center rounded-full bg-brand text-brand-fg shadow-pop transition-[color,background-color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-pointer outline-none',
							'hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-page-bg',
							isOpen && 'rotate-90',
						)}
					>
						{isOpen ? (
							<CloseIcon className="size-5" strokeWidth={2.5} />
						) : (
							<svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2" aria-hidden="true">
								<path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
						)}
					</button>
				</div>
			</Portal>
		</>
	);
};
