import React, { createContext, useCallback, useContext, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { __setToastRef } from '../../helpers/services/ToastService';
import { Toast, ToastOptions, ToastPosition, ToastType } from '../../helpers/types/toast';
import { ToastContainer } from './ToastContainer';

interface ToastContextData {
	addToast: (message: string, type: ToastType, options?: ToastOptions) => string;
	removeToast: (id: string) => void;
	/** Dismiss one toast, or every toast when called without an id. */
	dismiss: (id?: string) => void;
}

const ToastContext = createContext<ToastContextData | null>(null);

export interface ToastProviderProps {
	children: React.ReactNode;
	position?: ToastPosition;
	/** Default auto-dismiss delay in ms (`0` = sticky). */
	timeout?: number;
	/** Oldest toasts are dropped beyond this many. */
	max?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children, position = 'top-right', timeout = 3000, max = 5 }) => {
	const [toasts, setToasts] = useState<Toast[]>([]);

	const toastsRef = useRef<Toast[]>([]);
	toastsRef.current = toasts;

	const addToast = useCallback(
		(message: string, type: ToastType, options?: ToastOptions) => {
			const id = options?.id ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
			setToasts((prev) => {
				const next: Toast = { ...options, id, message, type };
				// same id → update in place (keeps its position; ToastItem re-arms its timer when type/message change)
				return prev.some((t) => t.id === id) ? prev.map((t) => (t.id === id ? next : t)) : [...prev, next].slice(-max);
			});
			return id;
		},
		[max],
	);

	const removeToast = useCallback((id: string) => {
		toastsRef.current.find((t) => t.id === id)?.onDismiss?.();
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);

	const dismiss = useCallback(
		(id?: string) => {
			if (id) removeToast(id);
			else toastsRef.current.forEach((t) => removeToast(t.id));
		},
		[removeToast],
	);

	useLayoutEffect(() => {
		__setToastRef(addToast, dismiss);
	}, [addToast, dismiss]);

	const value = useMemo(() => ({ addToast, removeToast, dismiss }), [addToast, removeToast, dismiss]);

	return (
		<ToastContext.Provider value={value}>
			{children}
			<ToastContainer toasts={toasts} position={position} timeout={timeout} onClose={removeToast} />
		</ToastContext.Provider>
	);
};

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
	const ctx = useContext(ToastContext);
	if (!ctx) throw new Error('useToast must be used within ToastProvider');
	return ctx;
};
