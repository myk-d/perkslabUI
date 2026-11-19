import React, { useEffect, useRef, useState } from 'react';
import { Toast, ToastPosition, ToastType } from '../../helpers/types/toast';
import { cn } from '../../lib/cn';
import { AlertIcon, CloseIcon, InfoIcon, SpinnerIcon, SuccessIcon } from '../../lib/icons';

interface ToastItemProps {
	toast: Toast;
	position?: ToastPosition;
	onClose: (id: string) => void;
	timeout: number;
}

const EXIT_MS = 160;
const SWIPE_DISMISS_PX = 80;

const styles: Record<ToastType, string> = {
	success: 'border-ok/35 before:bg-ok/8 [&_.pk-ic]:text-ok',
	error: 'border-danger/35 before:bg-danger/8 [&_.pk-ic]:text-danger',
	warning: 'border-warning/35 before:bg-warning/8 [&_.pk-ic]:text-warning',
	info: 'border-info/35 before:bg-info/8 [&_.pk-ic]:text-info',
	loading: 'border-line [&_.pk-ic]:text-muted',
};
const icons = { success: SuccessIcon, error: AlertIcon, warning: AlertIcon, info: InfoIcon, loading: SpinnerIcon };

function positionOffsets(position: ToastPosition): { x: string; y: string } {
	if (position.endsWith('-left')) return { x: '-1.25rem', y: '0px' };
	if (position.endsWith('-right')) return { x: '1.25rem', y: '0px' };
	return position.startsWith('top-') ? { x: '0px', y: '-0.75rem' } : { x: '0px', y: '0.75rem' };
}

export const ToastItem: React.FC<ToastItemProps> = ({ toast, position = 'top-right', onClose, timeout }) => {
	const [closing, setClosing] = useState(false);
	const [paused, setPaused] = useState(false);
	const [dragX, setDragX] = useState<number | null>(null);
	const [exitDirX, setExitDirX] = useState<string | null>(null);
	const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
	const startX = useRef(0);
	const Icon = icons[toast.type];

	const close = (swipeDirection?: number) => {
		if (closing) return;
		if (swipeDirection) setExitDirX(swipeDirection > 0 ? '4rem' : '-4rem');
		setClosing(true);
		closeTimer.current = setTimeout(() => onClose(toast.id), EXIT_MS);
	};

	// re-arm whenever the toast is updated in place (loading → success) or the pause state changes
	useEffect(() => {
		if (!timeout || paused || closing || dragX !== null || toast.type === 'loading') return;
		const t = setTimeout(() => close(), timeout);
		return () => clearTimeout(t);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [timeout, paused, closing, dragX, toast.type, toast.message]);
	useEffect(() => () => clearTimeout(closeTimer.current), []);

	const offsets = positionOffsets(position);
	const cssVars = {
		'--pk-toast-x': offsets.x,
		'--pk-toast-y': offsets.y,
		...(exitDirX ? { '--pk-toast-out-x': exitDirX } : undefined),
	} as React.CSSProperties;

	return (
		<div
			role={toast.type === 'error' ? 'alert' : 'status'}
			onMouseEnter={() => setPaused(true)}
			onMouseLeave={() => setPaused(false)}
			onPointerDown={(e) => {
				if ((e.target as HTMLElement).closest('button')) return;
				startX.current = e.clientX;
				setDragX(0);
				e.currentTarget.setPointerCapture(e.pointerId);
			}}
			onPointerMove={(e) => dragX !== null && setDragX(e.clientX - startX.current)}
			onPointerUp={() => {
				if (dragX !== null && Math.abs(dragX) > SWIPE_DISMISS_PX) close(dragX);
				setDragX(null);
			}}
			onPointerCancel={() => setDragX(null)}
			style={
				dragX
					? { ...cssVars, transform: `translate3d(${dragX}px, 0, 0)`, opacity: 1 - Math.min(Math.abs(dragX) / 200, 0.6), transition: 'none' }
					: cssVars
			}
			className={cn(
				'pointer-events-auto relative isolate flex w-[min(23rem,calc(100vw-2.5rem))] touch-pan-y items-start gap-3 p-3.5 ui-border rounded-pop bg-elevated text-page-text shadow-pop before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:content-[""]',
				closing ? 'animate-pk-toast-out' : dragX === null && 'animate-pk-toast-in',
				styles[toast.type],
			)}
		>
			<Icon className={cn('pk-ic mt-0.5 size-4.5 shrink-0', toast.type === 'loading' && 'animate-spin')} />
			<div className="min-w-0 flex-1 text-sm leading-5">
				{toast.title && <p className="ui-heading mb-0.5 text-sm leading-5">{toast.title}</p>}
				<p className="font-medium break-words">{toast.message}</p>
				{toast.description && <p className="mt-0.5 text-xs leading-4 text-secondary break-words">{toast.description}</p>}
				{toast.action && (
					<button
						type="button"
						onClick={() => {
							toast.action!.onClick();
							close();
						}}
						className="ui-label mt-2 cursor-pointer rounded-control ui-border border-line bg-surface px-2.5 py-1 text-xs text-page-text transition-colors duration-150 hover:bg-hover outline-none focus-visible:ring-2 focus-visible:ring-brand"
					>
						{toast.action.label}
					</button>
				)}
			</div>
			<button
				type="button"
				onClick={() => close()}
				aria-label="Close notification"
				className="shrink-0 rounded-item p-1 text-muted transition-colors duration-150 hover:bg-hover hover:text-page-text cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-current"
			>
				<CloseIcon className="size-3.5" />
			</button>
		</div>
	);
};
