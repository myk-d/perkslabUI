export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface ToastAction {
	label: string;
	onClick: () => void;
}

export interface ToastOptions {
	/** Reuse an id to update a toast in place (e.g. loading → success). */
	id?: string;
	/** Auto-dismiss delay in ms. `0` keeps it until closed. Default: provider timeout (loading toasts are sticky). */
	duration?: number;
	/** Bold first line above the message. */
	title?: string;
	/** Smaller secondary text under the message. */
	description?: string;
	/** Inline action button (e.g. "Undo"). Pressing it also dismisses the toast. */
	action?: ToastAction;
	/** Called when the toast is dismissed (closed, swiped, expired or action pressed). */
	onDismiss?: () => void;
}

export interface Toast extends ToastOptions {
	id: string;
	message: string;
	type: ToastType;
}

export interface ToastPromiseMessages<T> {
	loading: string;
	success: string | ((data: T) => string);
	error: string | ((error: unknown) => string);
}
