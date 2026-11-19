import { useRef } from 'react';
import { useIsomorphicLayoutEffect } from './dom';

export type LayerKind = 'overlay' | 'floating' | 'tooltip';

interface Entry {
	id: symbol;
	kind: LayerKind;
	slot: number;
}

const stack: Entry[] = [];
let seq = 0;

/** Toast container sits above all dialogs, popovers and tooltips, still respecting `--pk-z-base`. */
export const TOAST_Z_INDEX = 'calc(var(--pk-z-base, 1000) + 9000)' as unknown as number;

/**
 * Global overlay stacking & Escape-key coordinator.
 *
 * Every open modal, drawer, confirm dialog, popover, menu, select, combobox, date picker and tooltip
 * registers here so:
 *  1. `isTop()` is true only for the topmost dismissible layer (Escape closes one layer at a time).
 *  2. `zIndex` strictly increases in open order (a Dialog opened from a Popover sits above it;
 *     a DatePicker or Tooltip inside a ConfirmDialog sits above the ConfirmDialog).
 *  3. Consumers can shift the base stack via `--pk-z-base` (default 1000).
 */
export function useLayer(open: boolean, kind: LayerKind = 'overlay') {
	const idRef = useRef<symbol | null>(null);
	if (!idRef.current) idRef.current = Symbol(kind);

	const slotRef = useRef<number>(1);
	const prevOpenRef = useRef(false);

	// Allocate a strictly increasing slot synchronously on open so the first paint has the final z-index.
	if (open && !prevOpenRef.current) {
		seq += 1;
		slotRef.current = seq;
	}
	prevOpenRef.current = open;

	useIsomorphicLayoutEffect(() => {
		if (!open) return;
		const id = idRef.current!;
		const slot = slotRef.current;
		seq = Math.max(seq, slot);
		stack.push({ id, kind, slot });
		return () => {
			const i = stack.findIndex((e) => e.id === id);
			if (i >= 0) stack.splice(i, 1);
			if (stack.length === 0) seq = 0;
		};
	}, [open, kind]);

	const isTop = () => {
		if (kind === 'tooltip') return stack.some((e) => e.id === idRef.current);
		for (let i = stack.length - 1; i >= 0; i--) {
			if (stack[i].kind !== 'tooltip') return stack[i].id === idRef.current;
		}
		return false;
	};

	const offset = kind === 'tooltip' ? 5000 + slotRef.current : slotRef.current * 10;
	const zIndex = `calc(var(--pk-z-base, 1000) + ${offset})` as unknown as number;

	return { isTop, zIndex, slot: slotRef.current };
}
