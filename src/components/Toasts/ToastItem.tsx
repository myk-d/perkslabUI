import React, { useEffect, useRef, useState } from 'react';
import { Toast, ToastType } from '../../helpers/types/toast';
import { cn } from '../../lib/cn';
import { AlertIcon, CloseIcon, InfoIcon, SpinnerIcon, SuccessIcon } from '../../lib/icons';

interface ToastItemProps {
	toast: Toast;
	onClose: (id: string) => void;
	timeout: number;
}

const EXIT_MS = 150;
const SWIPE_DISMISS_PX = 80;

const styles: Record<ToastType, string> = {
	success: 'border-ok before:bg-ok/10 [&_.pk-ic]:text-ok',
	error: 'border-danger before:bg-danger/10 [&_.pk-ic]:text-danger',
	warning: 'border-warning before:bg-warning/10 [&_.pk-ic]:text-warning',
	info: 'border-brand before:bg-brand-bg [&_.pk-ic]:text-brand',
	loading: 'border-line [&_.pk-ic]:text-muted',
};
const icons = { success: SuccessIcon, error: AlertIcon, warning: AlertIcon, info: InfoIcon, loading: SpinnerIcon };

export const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose, timeout }) => {
	const [closing, setClosing] = useState(false);
	const [paused, setPaused] = useState(false);
	const [dragX, setDragX] = useState<number | null>(null);
	const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
	const startX = useRef(0);
	const Icon = icons[toast.type];

	const close = () => {
		if (closing) return;
		setClosing(true);
		closeTimer.current = setTimeout(() => onClose(toast.id), EXIT_MS);
	};

	// re-arm whenever the toast is updated in place (loading → success) or the pause state changes
	useEffect(() => {
		if (!timeout || paused || closing || dragX !== null || toast.type === 'loading') return;
		const t = setTimeout(close, timeout);
		return () => clearTimeout(t);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [timeout, paused, closing, dragX, toast.type, toast.message]);
	useEffect(() => () => clearTimeout(closeTimer.current), []);

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
				if (dragX !== null && Math.abs(dragX) > SWIPE_DISMISS_PX) close();
				setDragX(null);
			}}
			onPointerCancel={() => setDragX(null)}
			style={dragX ? { transform: `translateX(${dragX}px)`, opacity: 1 - Math.min(Math.abs(dragX) / 200, 0.6), transition: 'none' } : undefined}
			className={cn(
				'pointer-events-auto relative isolate flex w-[min(24rem,calc(100vw-2.5rem))] touch-pan-y items-start gap-3 p-4 ui-border rounded-box bg-surface text-page-text shadow-pop before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:content-[""]',
				closing ? 'animate-pk-toast-out' : dragX === null && 'animate-pk-toast-in',
				styles[toast.type],
			)}
		>
			<Icon className={cn('pk-ic size-5 shrink-0', toast.type === 'loading' && 'animate-spin')} />
			<div className="min-w-0 flex-1 text-sm leading-5">
				{toast.title && <p className="ui-heading mb-0.5 text-sm leading-5">{toast.title}</p>}
				<p className="font-medium break-words">{toast.message}</p>
				{toast.description && <p className="mt-0.5 text-xs leading-4 text-page-text/70 break-words">{toast.description}</p>}
				{toast.action && (
					<button
						type="button"
						onClick={() => {
							toast.action!.onClick();
							close();
						}}
						className="ui-label mt-2 cursor-pointer rounded-control ui-border border-line px-2.5 py-1 text-xs text-page-text transition-colors hover:bg-hover outline-none focus-visible:ring-2 focus-visible:ring-brand"
					>
						{toast.action.label}
					</button>
				)}
			</div>
			<button
				type="button"
				onClick={close}
				aria-label="Close notification"
				className="shrink-0 rounded-item p-0.5 opacity-60 transition-opacity hover:opacity-100 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-current"
			>
				<CloseIcon className="size-4" />
			</button>
		</div>
	);
};
