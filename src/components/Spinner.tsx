import React from 'react';
import { cn } from '../lib/cn';
import { SpinnerIcon } from '../lib/icons';

export const Spinner = ({ className, label = 'Loading' }: { className?: string; label?: string }) => (
	<span role="status" aria-label={label} className="inline-flex">
		<SpinnerIcon className={cn('animate-spin size-5 text-brand', className)} />
	</span>
);
