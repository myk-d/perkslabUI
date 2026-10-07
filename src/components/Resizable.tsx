import React, { createContext, forwardRef, useCallback, useContext, useEffect, useId, useImperativeHandle, useRef, useState } from 'react';
import { cn } from '../lib/cn';
import { useIsomorphicLayoutEffect } from '../lib/dom';

export type ResizableDirection = 'horizontal' | 'vertical';

interface PanelConfig {
	defaultSize?: number;
	minSize: number;
	maxSize: number;
	collapsible: boolean;
}
interface PanelEntry {
	id: string;
	el: () => HTMLElement | null;
	config: () => PanelConfig;
}
interface LayoutState {
	order: string[];
	sizes: number[];
}

interface ResizableContextValue {
	direction: ResizableDirection;
	groupRef: React.RefObject<HTMLDivElement | null>;
	state: LayoutState;
	stateRef: React.MutableRefObject<LayoutState>;
	register: (entry: PanelEntry) => () => void;
	getConfig: (index: number) => PanelConfig | undefined;
	resizePair: (a: number, b: number, delta: number, start: number[]) => number[];
	commit: (sizes: number[]) => void;
	setPanelSize: (index: number, size: number) => void;
	togglePanel: (index: number) => void;
}
const ResizableContext = createContext<ResizableContextValue | null>(null);
const useResizable = () => {
	const ctx = useContext(ResizableContext);
	if (!ctx) throw new Error('Resizable parts must be used within <ResizablePanelGroup>');
	return ctx;
};

const storageKey = (id: string) => `pk-resizable:${id}`;
function readSaved(id?: string): number[] | null {
	if (!id) return null;
	try {
		const parsed = JSON.parse(window.localStorage.getItem(storageKey(id)) ?? 'null');
		return Array.isArray(parsed) && parsed.every((n) => typeof n === 'number' && Number.isFinite(n)) ? parsed : null;
	} catch {
		return null;
	}
}

export interface ResizablePanelGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
	direction?: ResizableDirection;
	/** Called with the panel sizes (percentages summing to 100) whenever the layout changes. */
	onLayout?: (sizes: number[]) => void;
	/** Persists the layout in localStorage under this key. */
	autoSaveId?: string;
}

export const ResizablePanelGroup = forwardRef<HTMLDivElement, ResizablePanelGroupProps>(({ direction = 'horizontal', onLayout, autoSaveId, className, children, ...props }, ref) => {
	const groupRef = useRef<HTMLDivElement | null>(null);
	const panelsRef = useRef<PanelEntry[]>([]);
	const lastSizes = useRef(new Map<string, number>());
	const [state, setState] = useState<LayoutState>({ order: [], sizes: [] });
	const stateRef = useRef(state);
	stateRef.current = state;
	const onLayoutRef = useRef(onLayout);
	onLayoutRef.current = onLayout;
	const saveIdRef = useRef(autoSaveId);
	saveIdRef.current = autoSaveId;

	const sync = useCallback(() => {
		// Computed from the COMMITTED state (not inside a setState updater): React runs a first updater eagerly,
		// i.e. with only the first panel registered, which used to skew every initial layout (30/70 became 59/41).
		const prev = stateRef.current;
		const entries = [...panelsRef.current].sort((a, b) => {
			const ea = a.el();
			const eb = b.el();
			if (!ea || !eb) return 0;
			return ea.compareDocumentPosition(eb) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
		});
		const order = entries.map((e) => e.id);
		if (order.length === prev.order.length && order.every((id, i) => id === prev.order[i])) return;
		if (order.length === 0) return setState({ order, sizes: [] });

		const saved = prev.order.length === 0 ? readSaved(saveIdRef.current) : null;
		if (saved && saved.length === order.length) return setState({ order, sizes: saved });

		const raw = entries.map((e) => {
			const i = prev.order.indexOf(e.id);
			return i >= 0 ? prev.sizes[i] : e.config().defaultSize;
		});
		const known = raw.reduce<number>((sum, s) => sum + (s ?? 0), 0);
		const unknown = raw.filter((s) => s === undefined).length;
		const fill = unknown ? Math.max(0, 100 - known) / unknown : 0;
		const filled = raw.map((s) => s ?? fill);
		const total = filled.reduce((a, b) => a + b, 0);
		setState({ order, sizes: total > 0 ? filled.map((s) => (s / total) * 100) : filled.map(() => 100 / filled.length) });
	}, []);

	const register = useCallback(
		(entry: PanelEntry) => {
			panelsRef.current = [...panelsRef.current, entry];
			sync();
			return () => {
				panelsRef.current = panelsRef.current.filter((p) => p !== entry);
				sync();
			};
		},
		[sync],
	);

	useEffect(() => {
		if (state.order.length === 0) return;
		onLayoutRef.current?.(state.sizes);
		if (!saveIdRef.current) return;
		try {
			window.localStorage.setItem(storageKey(saveIdRef.current), JSON.stringify(state.sizes));
		} catch {
			/* storage unavailable or full: persistence is best-effort */
		}
	}, [state]);

	const getConfig = useCallback((index: number) => {
		const id = stateRef.current.order[index];
		return panelsRef.current.find((p) => p.id === id)?.config();
	}, []);

	/** Moves `delta` percent from panel `b` to panel `a`, honouring min/max and collapsing collapsible panels. */
	const resizePair = useCallback(
		(aIdx: number, bIdx: number, delta: number, start: number[]) => {
			const a = getConfig(aIdx);
			const b = getConfig(bIdx);
			if (!a || !b) return start;
			const sa = start[aIdx];
			const sb = start[bIdx];
			const collapseA = a.collapsible && sa + delta < a.minSize / 2;
			const collapseB = b.collapsible && sb - delta < b.minSize / 2;
			const loA = collapseA ? 0 : a.minSize;
			const hiA = collapseA ? 0 : a.maxSize;
			const loB = collapseB ? 0 : b.minSize;
			const hiB = collapseB ? 0 : b.maxSize;
			const dLo = Math.max(loA - sa, sb - hiB);
			const dHi = Math.min(hiA - sa, sb - loB);
			if (dLo > dHi) return start;
			const d = Math.min(Math.max(delta, dLo), dHi);
			const next = [...start];
			next[aIdx] = sa + d;
			next[bIdx] = sb - d;
			return next;
		},
		[getConfig],
	);

	const commit = useCallback((sizes: number[]) => {
		const { order, sizes: prev } = stateRef.current;
		prev.forEach((s, i) => {
			if (s > 0 && sizes[i] === 0) lastSizes.current.set(order[i], s);
		});
		if (sizes.every((s, i) => s === prev[i])) return;
		setState((p) => ({ order: p.order, sizes }));
	}, []);

	const setPanelSize = useCallback(
		(index: number, size: number) => {
			const { sizes } = stateRef.current;
			const neighbour = index < sizes.length - 1 ? index + 1 : index - 1;
			if (neighbour < 0 || index >= sizes.length) return;
			commit(resizePair(index, neighbour, size - sizes[index], sizes));
		},
		[commit, resizePair],
	);

	const togglePanel = useCallback(
		(index: number) => {
			const { order, sizes } = stateRef.current;
			const cfg = getConfig(index);
			if (!cfg?.collapsible) return;
			if (sizes[index] === 0) setPanelSize(index, lastSizes.current.get(order[index]) ?? Math.max(cfg.minSize, 10));
			else setPanelSize(index, 0);
		},
		[getConfig, setPanelSize],
	);

	// Must be stable: a fresh callback ref each render is detached (null) then re-attached AFTER children's layout
	// effects, so handles measuring `groupRef.current` in a layout effect would always see null.
	const setRefs = useCallback(
		(node: HTMLDivElement | null) => {
			groupRef.current = node;
			if (typeof ref === 'function') ref(node);
			else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
		},
		[ref],
	);

	return (
		<ResizableContext.Provider value={{ direction, groupRef, state, stateRef, register, getConfig, resizePair, commit, setPanelSize, togglePanel }}>
			<div ref={setRefs} data-pk-group="" data-direction={direction} className={cn('flex h-full w-full', direction === 'vertical' && 'flex-col', className)} {...props}>
				{children}
			</div>
		</ResizableContext.Provider>
	);
});
ResizablePanelGroup.displayName = 'ResizablePanelGroup';

export interface ResizablePanelHandle {
	collapse: () => void;
	expand: () => void;
	/** Set the size in percent. */
	resize: (size: number) => void;
	getSize: () => number;
	isCollapsed: () => boolean;
}

export interface ResizablePanelProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Initial size in percent. Panels without one share the remaining space equally. */
	defaultSize?: number;
	minSize?: number;
	maxSize?: number;
	/** Collapse to 0 when dragged below half of `minSize`. */
	collapsible?: boolean;
}

export const ResizablePanel = forwardRef<ResizablePanelHandle, ResizablePanelProps>(({ defaultSize, minSize = 0, maxSize = 100, collapsible = false, className, style, ...props }, ref) => {
	const { state, stateRef, register, setPanelSize, togglePanel } = useResizable();
	const id = useId();
	const elRef = useRef<HTMLDivElement>(null);
	const configRef = useRef<PanelConfig>({ defaultSize, minSize, maxSize, collapsible });
	configRef.current = { defaultSize, minSize, maxSize, collapsible };

	useIsomorphicLayoutEffect(() => register({ id, el: () => elRef.current, config: () => configRef.current }), [register, id]);

	const index = state.order.indexOf(id);
	const size = index >= 0 ? state.sizes[index] : defaultSize;
	const collapsed = collapsible && size === 0;

	useImperativeHandle(
		ref,
		() => ({
			collapse: () => {
				const i = stateRef.current.order.indexOf(id);
				if (i >= 0 && stateRef.current.sizes[i] > 0 && configRef.current.collapsible) togglePanel(i);
			},
			expand: () => {
				const i = stateRef.current.order.indexOf(id);
				if (i >= 0 && stateRef.current.sizes[i] === 0) togglePanel(i);
			},
			resize: (s: number) => {
				const i = stateRef.current.order.indexOf(id);
				if (i >= 0) setPanelSize(i, s);
			},
			getSize: () => stateRef.current.sizes[stateRef.current.order.indexOf(id)] ?? 0,
			isCollapsed: () => stateRef.current.sizes[stateRef.current.order.indexOf(id)] === 0,
		}),
		[id, stateRef, togglePanel, setPanelSize],
	);

	return (
		<div
			ref={elRef}
			id={id}
			data-pk-panel=""
			data-state={collapsed ? 'collapsed' : 'expanded'}
			// Sizes are flex-grow weights over a zero basis: percentages share the space left over by the handles.
			style={{ flexGrow: size ?? 1, flexShrink: 1, flexBasis: 0, ...style }}
			className={cn('min-h-0 min-w-0 overflow-hidden', className)}
			{...props}
		/>
	);
});
ResizablePanel.displayName = 'ResizablePanel';

export interface ResizableHandleProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Show a grip. */
	withHandle?: boolean;
	disabled?: boolean;
}

const KEY_STEP = 5;

export const ResizableHandle = forwardRef<HTMLDivElement, ResizableHandleProps>(({ withHandle, disabled, className, onKeyDown, onPointerDown, onPointerMove, onPointerUp, onPointerCancel, ...props }, ref) => {
	const { direction, groupRef, state, stateRef, getConfig, resizePair, commit, togglePanel } = useResizable();
	const elRef = useRef<HTMLDivElement | null>(null);
	const [index, setIndex] = useState(-1);
	const [dragging, setDragging] = useState(false);
	const drag = useRef<{ pos: number; start: number[]; available: number; rtl: boolean } | null>(null);
	const horizontal = direction === 'horizontal';

	const setRefs = (node: HTMLDivElement | null) => {
		elRef.current = node;
		if (typeof ref === 'function') ref(node);
		else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
	};

	const handlesOf = useCallback(() => {
		const group = groupRef.current;
		if (!group) return [];
		return Array.from(group.querySelectorAll<HTMLElement>('[data-pk-resize-handle]')).filter((h) => h.closest('[data-pk-group]') === group);
	}, [groupRef]);

	useIsomorphicLayoutEffect(() => {
		setIndex(elRef.current ? handlesOf().indexOf(elRef.current) : -1);
	}, [state.order, handlesOf]);

	const before = index >= 0 ? state.order[index] : undefined;
	const beforeCfg = index >= 0 ? getConfig(index) : undefined;
	const valueNow = index >= 0 && state.sizes[index] !== undefined ? Math.round(state.sizes[index]) : undefined;

	const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		onKeyDown?.(e);
		if (e.defaultPrevented || disabled || index < 0) return;
		const rtl = horizontal && getComputedStyle(e.currentTarget).direction === 'rtl';
		const grow = horizontal ? (rtl ? 'ArrowLeft' : 'ArrowRight') : 'ArrowDown';
		const shrink = horizontal ? (rtl ? 'ArrowRight' : 'ArrowLeft') : 'ArrowUp';
		let delta: number | null = null;
		if (e.key === grow) delta = KEY_STEP;
		else if (e.key === shrink) delta = -KEY_STEP;
		else if (e.key === 'Home') delta = -100;
		else if (e.key === 'End') delta = 100;
		else if (e.key === 'Enter') {
			e.preventDefault();
			if (getConfig(index)?.collapsible) togglePanel(index);
			else if (getConfig(index + 1)?.collapsible) togglePanel(index + 1);
			return;
		}
		if (delta === null) return;
		e.preventDefault();
		const { sizes } = stateRef.current;
		commit(resizePair(index, index + 1, delta, sizes));
	};

	const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
		onPointerDown?.(e);
		if (e.defaultPrevented || disabled || index < 0 || e.button !== 0) return;
		const group = groupRef.current;
		if (!group) return;
		e.preventDefault();
		e.currentTarget.setPointerCapture(e.pointerId);
		const rect = group.getBoundingClientRect();
		const handlesPx = handlesOf().reduce((sum, h) => sum + (horizontal ? h.offsetWidth : h.offsetHeight), 0);
		drag.current = {
			pos: horizontal ? e.clientX : e.clientY,
			start: [...stateRef.current.sizes],
			available: Math.max(1, (horizontal ? rect.width : rect.height) - handlesPx),
			rtl: horizontal && getComputedStyle(group).direction === 'rtl',
		};
		setDragging(true);
	};

	const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
		onPointerMove?.(e);
		const d = drag.current;
		if (!d) return;
		let px = (horizontal ? e.clientX : e.clientY) - d.pos;
		if (d.rtl) px = -px;
		commit(resizePair(index, index + 1, (px / d.available) * 100, d.start));
	};

	const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
		if (!drag.current) return;
		drag.current = null;
		setDragging(false);
		if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
	};

	return (
		<div
			ref={setRefs}
			role="separator"
			tabIndex={disabled ? undefined : 0}
			data-pk-resize-handle=""
			data-direction={direction}
			data-dragging={dragging ? '' : undefined}
			aria-orientation={horizontal ? 'vertical' : 'horizontal'}
			aria-valuenow={valueNow}
			aria-valuemin={beforeCfg ? Math.round(beforeCfg.minSize) : undefined}
			aria-valuemax={beforeCfg ? Math.round(beforeCfg.maxSize) : undefined}
			aria-controls={before}
			aria-disabled={disabled || undefined}
			className={cn(
				'relative flex shrink-0 touch-none select-none items-center justify-center bg-line outline-none transition-colors',
				'after:absolute after:content-[""]',
				horizontal ? 'w-px cursor-col-resize after:inset-y-0 after:-inset-x-1.5' : 'h-px cursor-row-resize after:-inset-y-1.5 after:inset-x-0',
				'hover:bg-brand focus-visible:bg-brand focus-visible:ring-2 focus-visible:ring-brand data-[dragging]:bg-brand',
				disabled && 'pointer-events-none opacity-50',
				className,
			)}
			onKeyDown={handleKeyDown}
			onPointerDown={handlePointerDown}
			onPointerMove={handlePointerMove}
			onPointerUp={(e) => {
				onPointerUp?.(e);
				endDrag(e);
			}}
			onPointerCancel={(e) => {
				onPointerCancel?.(e);
				endDrag(e);
			}}
			{...props}
		>
			{withHandle && (
				<div aria-hidden="true" className={cn('z-10 flex items-center justify-center ui-border border-line rounded-item bg-surface text-muted', horizontal ? 'h-6 w-3' : 'h-3 w-6')}>
					<svg viewBox="0 0 10 10" width="8" height="8" fill="currentColor" className={horizontal ? '' : 'rotate-90'}>
						<circle cx="3" cy="2" r="1" />
						<circle cx="7" cy="2" r="1" />
						<circle cx="3" cy="5" r="1" />
						<circle cx="7" cy="5" r="1" />
						<circle cx="3" cy="8" r="1" />
						<circle cx="7" cy="8" r="1" />
					</svg>
				</div>
			)}
		</div>
	);
});
ResizableHandle.displayName = 'ResizableHandle';
