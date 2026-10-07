import { ConfirmOptions } from '../types/confirm';

type AskFn = (message: string, options?: ConfirmOptions) => Promise<boolean>;

let askReference: AskFn = () => {
	console.warn('ConfirmService: <ConfirmProvider> is not mounted — resolving as "cancelled".');
	return Promise.resolve(false);
};

export const __setConfirmRef = (fn: AskFn) => {
	askReference = fn;
};

/** Promise-based confirm dialog usable anywhere: `if (await ConfirmService.confirm('Delete?', { variant: 'danger' })) …`. */
export const ConfirmService = {
	confirm: (message: string, options?: ConfirmOptions) => askReference(message, options),
};
