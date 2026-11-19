import React, { useMemo, useRef, useState } from 'react';
import { Portal } from '../../lib/Portal';
import { cn } from '../../lib/cn';
import { useAnchoredPosition, useClickOutside, useEscape, useIsomorphicLayoutEffect } from '../../lib/dom';
import { ChevronDownIcon } from '../../lib/icons';
import { useLayer } from '../../lib/layers';
import { presenceAttrs, usePresence } from '../../lib/presence';
import { uiStyles, type ThemeDefinition, type UiStyle } from '../../theme/themes';
import { useAppTheme } from './ThemeContext';

const SYSTEM_ID = 'system';

interface ThemeSwitcherProps {
	/** Add an "Auto (system)" entry at the top. */
	showSystem?: boolean;
	/** Limit the list to some groups, e.g. `['Classic', 'Ocean']`. */
	groups?: string[];
	/** Also render the UI-style (perks / panel / soft / silk) picker inside the dropdown. */
	showUiStyles?: boolean;
	className?: string;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ showSystem = false, groups: only, showUiStyles = false, className }) => {
	const { theme, setTheme, ui, setUi, themes } = useAppTheme();
	const [isOpen, setIsOpen] = useState(false);
	const anchorRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);
	const popupRef = useRef<HTMLDivElement>(null);

	const { isTop, zIndex } = useLayer(isOpen, 'floating');
	const { mounted, state } = usePresence(isOpen, 140);
	const { style, side, align } = useAnchoredPosition(anchorRef, popupRef, { open: mounted, align: 'end', gap: 6 });

	useClickOutside([anchorRef, popupRef], () => setIsOpen(false), isOpen);
	useEscape(() => {
		if (!isTop()) return;
		setIsOpen(false);
		triggerRef.current?.focus();
	}, isOpen);

	const groups = useMemo(() => {
		const map = new Map<string, ThemeDefinition[]>();
		for (const t of themes) {
			const g = t.group ?? 'Custom';
			if (only && !only.includes(g)) continue;
			map.set(g, [...(map.get(g) ?? []), t]);
		}
		return [...map.entries()];
	}, [themes, only]);

	const current = theme === SYSTEM_ID ? 'Auto' : (themes.find((t) => t.id === theme)?.name ?? 'Theme');
	const currentBrand = themes.find((t) => t.id === theme)?.colors.brand;

	const pick = (id: string) => {
		setTheme(id);
		setIsOpen(false);
	};

	return (
		<div className={cn('relative inline-block text-start', className)} ref={anchorRef}>
			<button
				ref={triggerRef}
				type="button"
				data-state={isOpen ? 'open' : 'closed'}
				aria-haspopup="listbox"
				aria-expanded={isOpen}
				onClick={() => setIsOpen((v) => !v)}
				className={cn(
					'ui-label inline-flex h-(--ui-h-md) items-center gap-2 px-3.5 ui-border rounded-control bg-control text-page-text text-sm shadow-box transition-[color,background-color,border-color,box-shadow,transform] duration-150 hover:border-line-strong hover:bg-hover active:scale-[0.98] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand',
					isOpen && 'border-brand ring-3 ring-brand/15',
				)}
			>
				<span className="size-3 rounded-full bg-brand ring-1 ring-page-text/15" style={currentBrand ? { backgroundColor: currentBrand } : undefined} />
				{current}
				<ChevronDownIcon className={cn('size-4 text-muted transition-transform duration-200 ease-out', isOpen && 'rotate-180 text-page-text')} />
			</button>

			{mounted && (
				<Portal anchorRef={anchorRef}>
					<div
						ref={popupRef}
						role="listbox"
						aria-label="Theme"
						data-pk-layer=""
						data-side={side}
						data-align={align}
						style={{ ...style, maxHeight: typeof style.maxHeight === 'number' ? Math.min(420, style.maxHeight) : 420, zIndex }}
						{...presenceAttrs(state)}
						className={cn(
							'w-60 overflow-y-auto ui-border border-line rounded-pop bg-elevated text-page-text shadow-pop pk-scrollbar',
							state === 'open' ? 'animate-pk-pop-in' : 'animate-pk-pop-out pointer-events-none',
						)}
					>
						<div className="space-y-3 p-2">
							{showSystem && (
								<ThemeOption selected={theme === SYSTEM_ID} onClick={() => pick(SYSTEM_ID)}>
									Auto (system)
								</ThemeOption>
							)}
							{groups.map(([label, options]) => (
								<div key={label}>
									<p className="ui-label mb-1 px-2.5 text-[10px] text-muted">{label}</p>
									<div className="grid grid-cols-1 gap-0.5">
										{options.map((opt) => (
											<ThemeOption key={opt.id} selected={theme === opt.id} swatch={opt.colors.brand} onClick={() => pick(opt.id)}>
												{opt.name}
											</ThemeOption>
										))}
									</div>
								</div>
							))}
							{showUiStyles && (
								<div className="border-t border-line-subtle pt-2">
									<p className="ui-label mb-1 px-2.5 text-[10px] text-muted">Style</p>
									<div className="grid grid-cols-1 gap-0.5">
										{uiStyles.map((s) => (
											<ThemeOption key={s.id} selected={ui === s.id} onClick={() => setUi(s.id as UiStyle)}>
												{s.name}
											</ThemeOption>
										))}
									</div>
								</div>
							)}
						</div>
					</div>
				</Portal>
			)}
		</div>
	);
};

const ThemeOption = ({ selected, swatch, onClick, children }: { selected: boolean; swatch?: string; onClick: () => void; children: React.ReactNode }) => (
	<button
		type="button"
		role="option"
		aria-selected={selected}
		onClick={onClick}
		className={cn(
			'flex w-full items-center justify-between gap-2 rounded-item px-2.5 py-1.5 text-start text-xs font-medium transition-colors duration-150 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand',
			selected ? 'bg-brand text-brand-fg font-semibold' : 'text-page-text hover:bg-hover',
		)}
	>
		<span className="flex items-center gap-2">
			{swatch && <span className="size-2.5 rounded-full ring-1 ring-current/25" style={{ backgroundColor: swatch }} />}
			{children}
		</span>
		{selected && <span className="size-1.5 rounded-full bg-current" />}
	</button>
);

/** Standalone picker for the structural style (perks / panel / soft / shadcn / silk) with a sliding active pill. */
export const UiStyleSwitcher: React.FC<{ className?: string }> = ({ className }) => {
	const { ui, setUi } = useAppTheme();
	const groupRef = useRef<HTMLDivElement>(null);
	const [pill, setPill] = useState<{ left: number; width: number } | null>(null);

	useIsomorphicLayoutEffect(() => {
		const container = groupRef.current;
		if (!container) return;
		const measure = () => {
			const active = container.querySelector<HTMLElement>('[aria-checked="true"]');
			if (!active) return;
			setPill({ left: active.offsetLeft, width: active.offsetWidth });
		};
		measure();
		if (typeof ResizeObserver === 'undefined') return;
		const ro = new ResizeObserver(measure);
		ro.observe(container);
		return () => ro.disconnect();
	}, [ui]);

	return (
		<div ref={groupRef} role="radiogroup" aria-label="UI style" className={cn('relative inline-flex gap-0.5 ui-border rounded-control bg-subtle p-1', className)}>
			{pill && (
				<span
					aria-hidden="true"
					style={{ width: pill.width, transform: `translate3d(${pill.left}px, 0, 0)` }}
					className="pointer-events-none absolute inset-y-1 left-0 rounded-control bg-brand shadow-box transition-[transform,width] duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
				/>
			)}
			{uiStyles.map((s) => (
				<button
					key={s.id}
					type="button"
					role="radio"
					aria-checked={ui === s.id}
					title={s.description}
					onClick={() => setUi(s.id)}
					className={cn(
						'ui-label relative z-10 cursor-pointer rounded-control px-3 py-1.5 text-xs transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-brand',
						ui === s.id ? 'text-brand-fg' : 'text-secondary hover:text-page-text',
					)}
				>
					{s.name}
				</button>
			))}
		</div>
	);
};

/** Lets the user pick their own brand colour on top of the active theme (stored via `setColors`; hover/tint shades are derived). */
export const BrandColorPicker: React.FC<{ label?: string; resetLabel?: string; className?: string }> = ({ label = 'Brand colour', resetLabel = 'Reset', className }) => {
	const { colors, setColors, resolvedTheme, themes } = useAppTheme();
	const base = themes.find((t) => t.id === resolvedTheme)?.colors.brand ?? '#18181b';
	const value = colors.brand ?? base;
	const customised = !!colors.brand;

	return (
		<div className={cn('inline-flex items-center gap-3 text-page-text', className)}>
			<label className="ui-label flex cursor-pointer items-center gap-2 text-xs">
				<input
					type="color"
					value={/^#[0-9a-f]{6}$/i.test(value) ? value : base}
					onChange={(e) => setColors({ ...colors, brand: e.target.value })}
					className="size-8 cursor-pointer rounded-item border border-line bg-transparent p-0.5"
				/>
				{label}
			</label>
			{customised && (
				<button
					type="button"
					onClick={() => {
						const { brand: _brand, brandHover: _h, brandBg: _b, ...rest } = colors;
						setColors(Object.keys(rest).length ? rest : null);
					}}
					className="ui-label cursor-pointer text-xs text-muted underline-offset-4 hover:text-page-text hover:underline"
				>
					{resetLabel}
				</button>
			)}
		</div>
	);
};
