import React, { useMemo, useRef, useState } from 'react';
import { cn } from '../../lib/cn';
import { useClickOutside, useEscape } from '../../lib/dom';
import { ChevronDownIcon } from '../../lib/icons';
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
	const ref = useRef<HTMLDivElement>(null);
	useClickOutside(ref, () => setIsOpen(false), isOpen);
	useEscape(() => setIsOpen(false), isOpen);

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
		<div className={cn('relative inline-block text-start', className)} ref={ref}>
			<button
				type="button"
				aria-haspopup="listbox"
				aria-expanded={isOpen}
				onClick={() => setIsOpen((v) => !v)}
				className="ui-label flex items-center gap-2 px-4 py-2 ui-border rounded-control bg-control text-page-text text-sm transition-[color,background-color,border-color,box-shadow,transform,opacity] hover:bg-hover active:scale-95 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand"
			>
				<span className="size-3 rounded-full bg-brand" style={currentBrand ? { backgroundColor: currentBrand } : undefined} />
				{current}
				<ChevronDownIcon className={cn('size-4 transition-transform', isOpen && 'rotate-180')} />
			</button>

			{isOpen && (
				<div className="absolute end-0 z-[100] mt-2 w-60 max-h-[420px] overflow-y-auto ui-border rounded-box bg-surface text-page-text shadow-pop animate-pk-pop-in pk-scrollbar">
					<div role="listbox" aria-label="Theme" className="space-y-3 p-2">
						{showSystem && (
							<ThemeOption selected={theme === SYSTEM_ID} onClick={() => pick(SYSTEM_ID)}>
								Auto (system)
							</ThemeOption>
						)}
						{groups.map(([label, options]) => (
							<div key={label}>
								<p className="ui-label mb-1 px-3 text-[10px] text-muted">{label}</p>
								<div className="grid grid-cols-1 gap-1">
									{options.map((opt) => (
										<ThemeOption key={opt.id} selected={theme === opt.id} swatch={opt.colors.brand} onClick={() => pick(opt.id)}>
											{opt.name}
										</ThemeOption>
									))}
								</div>
							</div>
						))}
						{showUiStyles && (
							<div className="border-t border-line/30 pt-2">
								<p className="ui-label mb-1 px-3 text-[10px] text-muted">Style</p>
								{uiStyles.map((s) => (
									<ThemeOption key={s.id} selected={ui === s.id} onClick={() => setUi(s.id as UiStyle)}>
										{s.name}
									</ThemeOption>
								))}
							</div>
						)}
					</div>
				</div>
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
			'flex w-full items-center justify-between gap-2 rounded-item px-3 py-2 text-start text-xs font-bold transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand',
			selected ? 'bg-brand text-brand-fg' : 'text-page-text hover:bg-hover',
		)}
	>
		<span className="flex items-center gap-2">
			{swatch && <span className="size-2.5 rounded-full ring-1 ring-current/30" style={{ backgroundColor: swatch }} />}
			{children}
		</span>
		{selected && <span className="size-1.5 rounded-full bg-current" />}
	</button>
);

/** Standalone picker for the structural style (perks / panel / soft / silk). */
export const UiStyleSwitcher: React.FC<{ className?: string }> = ({ className }) => {
	const { ui, setUi } = useAppTheme();
	return (
		<div role="radiogroup" aria-label="UI style" className={cn('inline-flex gap-1 ui-border rounded-control bg-surface p-1', className)}>
			{uiStyles.map((s) => (
				<button
					key={s.id}
					type="button"
					role="radio"
					aria-checked={ui === s.id}
					title={s.description}
					onClick={() => setUi(s.id)}
					className={cn(
						'ui-label cursor-pointer rounded-control px-3 py-1.5 text-xs transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand',
						ui === s.id ? 'bg-brand text-brand-fg' : 'text-page-text hover:bg-hover',
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
