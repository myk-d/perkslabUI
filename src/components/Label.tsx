import React, { forwardRef, useId } from 'react';
import { cn } from '../lib/cn';

export const Label = forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(({ className, ...props }, ref) => (
	<label ref={ref} className={cn('ui-label block text-xs text-page-text/70 select-none', className)} {...props} />
));
Label.displayName = 'Label';

export interface FieldProps {
	label: React.ReactNode;
	/** Render prop — receives the generated `id` (and `aria-describedby`) to spread onto the control. */
	children: (control: { id: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }) => React.ReactNode;
	hint?: React.ReactNode;
	error?: React.ReactNode;
	required?: boolean;
	className?: string;
}

/** Pairs a visible label (+ hint / error text) with any control through `htmlFor`/`id`, so form fields stay accessible. */
export const Field: React.FC<FieldProps> = ({ label, children, hint, error, required, className }) => {
	const id = useId();
	const describedBy = error || hint ? `${id}-desc` : undefined;
	return (
		<div className={cn('flex flex-col gap-1.5', className)}>
			<Label htmlFor={id}>
				{label}
				{required && <span className="text-danger ms-0.5">*</span>}
			</Label>
			{children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined })}
			{(error || hint) && (
				<p id={describedBy} className={cn('text-xs', error ? 'text-danger' : 'text-muted')}>
					{error || hint}
				</p>
			)}
		</div>
	);
};
