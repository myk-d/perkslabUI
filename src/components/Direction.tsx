import React, { createContext, useContext, useEffect } from 'react';

export type Direction = 'ltr' | 'rtl';

const DirectionContext = createContext<Direction>('ltr');

export interface DirectionProviderProps {
	dir: Direction;
	/** `wrapper` renders a `<div dir>`; `document` sets `dir` on `<html>` (and restores it on unmount). */
	applyTo?: 'wrapper' | 'document';
	className?: string;
	children?: React.ReactNode;
}

export const DirectionProvider = ({ dir, applyTo = 'wrapper', className, children }: DirectionProviderProps) => {
	useEffect(() => {
		if (applyTo !== 'document') return;
		const root = document.documentElement;
		const previous = root.getAttribute('dir');
		root.setAttribute('dir', dir);
		return () => {
			if (previous === null) root.removeAttribute('dir');
			else root.setAttribute('dir', previous);
		};
	}, [applyTo, dir]);

	return (
		<DirectionContext.Provider value={dir}>
			{applyTo === 'wrapper' ? (
				<div dir={dir} className={className}>
					{children}
				</div>
			) : (
				children
			)}
		</DirectionContext.Provider>
	);
};

/** Current reading direction ('ltr' when no provider is mounted). */
export const useDirection = (): Direction => useContext(DirectionContext);
