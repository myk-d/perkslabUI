export interface ConfirmOptions {
	title?: string;
	confirmLabel?: string;
	cancelLabel?: string;
	/** 'danger' paints the confirm button red — for destructive actions. */
	variant?: 'default' | 'danger';
}

export interface ConfirmRequest extends ConfirmOptions {
	id: string;
	message: string;
}
