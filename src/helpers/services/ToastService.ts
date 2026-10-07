import { ToastOptions, ToastPromiseMessages, ToastType } from '../types/toast';

type AddToastFn = (message: string, type: ToastType, options?: ToastOptions) => string;
type DismissFn = (id?: string) => void;

let addToastReference: AddToastFn = () => {
	console.warn('ToastService: <ToastProvider> is not mounted — the toast was dropped.');
	return '';
};
let dismissReference: DismissFn = () => {};

export const __setToastRef = (add: AddToastFn, dismiss: DismissFn) => {
	addToastReference = add;
	dismissReference = dismiss;
};

/**
 * Imperative toasts that work outside React (API clients, stores): `ToastService.success('Saved')`.
 * Needs <ToastProvider> mounted once. Every method returns the toast id.
 */
export const ToastService = {
	success: (msg: string, options?: ToastOptions) => addToastReference(msg, 'success', options),
	error: (msg: string, options?: ToastOptions) => addToastReference(msg, 'error', options),
	info: (msg: string, options?: ToastOptions) => addToastReference(msg, 'info', options),
	warning: (msg: string, options?: ToastOptions) => addToastReference(msg, 'warning', options),
	/** Spinner toast that stays until you update it (same `id`) or dismiss it. */
	loading: (msg: string, options?: ToastOptions) => addToastReference(msg, 'loading', { duration: 0, ...options }),
	/** Dismiss one toast, or all of them with no argument. */
	dismiss: (id?: string) => dismissReference(id),
	/** loading → success/error driven by a promise; resolves with the promise's own result. */
	promise: <T>(promise: Promise<T>, messages: ToastPromiseMessages<T>, options?: ToastOptions): Promise<T> => {
		const id = addToastReference(messages.loading, 'loading', { duration: 0, ...options });
		promise.then(
			(data) => addToastReference(typeof messages.success === 'function' ? messages.success(data) : messages.success, 'success', { ...options, id, duration: options?.duration }),
			(error) => addToastReference(typeof messages.error === 'function' ? messages.error(error) : messages.error, 'error', { ...options, id, duration: options?.duration }),
		);
		return promise;
	},
};
