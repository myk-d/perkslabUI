import React, { useState } from 'react';
import { cn } from '../lib/cn';

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
	src?: string | null;
	alt?: string;
	/** Shown when there is no image (or it fails to load): the initials of this name. */
	name?: string;
	size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 'size-8 text-xs', md: 'size-10 text-sm', lg: 'size-14 text-lg' };

const initials = (name = '') =>
	name
		.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map((p) => p[0]?.toUpperCase() ?? '')
		.join('');

export const Avatar = ({ src, alt, name, size = 'md', className, ...props }: AvatarProps) => {
	const [failed, setFailed] = useState(false);
	const showImage = src && !failed;
	return (
		<span
			className={cn('relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-bg text-brand ui-label select-none', sizes[size], className)}
			{...props}
		>
			{showImage ? <img src={src} alt={alt ?? name ?? ''} onError={() => setFailed(true)} className="size-full object-cover" /> : <span aria-label={name}>{initials(name) || '?'}</span>}
		</span>
	);
};
