import React from 'react';
import { Toast, ToastPosition } from '../../helpers/types/toast';
import { cn } from '../../lib/cn';
import { Portal } from '../../lib/Portal';
import { ToastItem } from './ToastItem';

interface ContainerProps {
	toasts: Toast[];
	position: ToastPosition;
	timeout: number;
	onClose: (id: string) => void;
}

const positionClasses: Record<ToastPosition, string> = {
	'top-right': 'top-5 right-5 items-end',
	'top-left': 'top-5 left-5 items-start',
	'top-center': 'top-5 left-1/2 -translate-x-1/2 items-center',
	'bottom-right': 'bottom-5 right-5 items-end flex-col-reverse',
	'bottom-left': 'bottom-5 left-5 items-start flex-col-reverse',
	'bottom-center': 'bottom-5 left-1/2 -translate-x-1/2 items-center flex-col-reverse',
};

export const ToastContainer: React.FC<ContainerProps> = ({ toasts, position, timeout, onClose }) => (
	<Portal>
		<div aria-live="polite" aria-relevant="additions" className={cn('fixed z-[9999] flex max-w-[calc(100vw-2.5rem)] flex-col gap-3 pointer-events-none', positionClasses[position])}>
			{toasts.map((toast) => (
				<ToastItem key={toast.id} toast={toast} onClose={onClose} timeout={toast.duration ?? timeout} />
			))}
		</div>
	</Portal>
);
