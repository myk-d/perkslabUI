import React, { useRef } from 'react';
import { ConfirmRequest } from '../../helpers/types/confirm';
import { Portal } from '../../lib/Portal';
import { cn } from '../../lib/cn';
import { useEscape, useFocusTrap, useScrollLock } from '../../lib/dom';
import { useLayer } from '../../lib/layers';
import { Button } from '../Button';

interface ConfirmDialogProps {
	request: ConfirmRequest;
	/** True while the exit animation plays: interaction, scroll lock, focus trap and Escape are already released. */
	closing?: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ request, closing = false, onConfirm, onCancel }) => {
	const panelRef = useRef<HTMLDivElement>(null);
	const { isTop, zIndex } = useLayer(!closing, 'overlay');
	useScrollLock(!closing);
	useEscape(() => isTop() && onCancel(), !closing);
	useFocusTrap(panelRef, !closing);

	return (
		<Portal>
			<div data-pk-layer="" style={{ zIndex }} className={cn('fixed inset-0 flex items-center justify-center p-4', closing && 'pointer-events-none')} {...(closing ? { 'data-state': 'closed', 'aria-hidden': true, inert: '' } : { 'data-state': 'open' })}>
				<div className={cn('absolute inset-0 bg-scrim backdrop-blur-[2px]', closing ? 'animate-pk-fade-out' : 'animate-pk-fade-in')} onClick={onCancel} aria-hidden="true" />
				<div
					ref={panelRef}
					role="alertdialog"
					aria-modal="true"
					aria-labelledby={request.title ? `${request.id}-t` : undefined}
					aria-describedby={`${request.id}-m`}
					tabIndex={-1}
					className={cn('relative w-full max-w-sm rounded-pop ui-border border-line bg-elevated p-6 text-page-text shadow-pop outline-none', closing ? 'animate-pk-slide-down' : 'animate-pk-slide-up')}
				>
					{request.title && (
						<h3 id={`${request.id}-t`} className="ui-heading mb-2 text-lg">
							{request.title}
						</h3>
					)}
					<p id={`${request.id}-m`} className="mb-6 whitespace-pre-line text-sm text-secondary leading-relaxed">
						{request.message}
					</p>
					<div className="flex justify-end gap-2.5">
						<Button type="button" variant="outline" size="sm" onClick={onCancel}>
							{request.cancelLabel || 'Cancel'}
						</Button>
						<Button type="button" data-autofocus="" variant={request.variant === 'danger' ? 'danger' : 'default'} size="sm" onClick={onConfirm}>
							{request.confirmLabel || 'Confirm'}
						</Button>
					</div>
				</div>
			</div>
		</Portal>
	);
};
