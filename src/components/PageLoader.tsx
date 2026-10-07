import React from 'react';
import { cn } from '../lib/cn';
import { Spinner } from './Spinner';

export const PageLoader = ({ fullScreen = false, className, label }: { fullScreen?: boolean; className?: string; label?: string }) => (
	<div className={cn('flex items-center justify-center animate-pk-fade-in', fullScreen ? 'min-h-screen' : 'py-12', className)}>
		<Spinner label={label} />
	</div>
);
