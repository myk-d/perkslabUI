import React, { forwardRef } from 'react';
import { cn } from '../lib/cn';
import { fieldStyles } from './Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, invalid, ...props }, ref) => (
	<textarea ref={ref} aria-invalid={invalid || props['aria-invalid']} className={cn(fieldStyles, 'px-4 py-2.5 min-h-24 resize-y', className)} {...props} />
));

Textarea.displayName = 'Textarea';
