import { useEffect, useRef } from 'react';

const stack: symbol[] = [];

/** Tracks open overlays so only the top-most one reacts to Escape (nested dialog/drawer closes one layer at a time). Returns `isTop()`. */
export function useLayer(open: boolean) {
	const id = useRef(Symbol('layer'));
	useEffect(() => {
		if (!open) return;
		const mine = id.current;
		stack.push(mine);
		return () => {
			const i = stack.indexOf(mine);
			if (i >= 0) stack.splice(i, 1);
		};
	}, [open]);
	return () => stack[stack.length - 1] === id.current;
}
