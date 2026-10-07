import React, { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from 'react';
import { cn } from '../lib/cn';
import { isBrowser } from '../lib/dom';

/* ------------------------------------------------------------------ types + helpers */

export interface ChartSeries {
	key: string;
	label?: string;
	color?: string;
}

export type ChartConfig = Record<string, { label?: React.ReactNode; color?: string }>;

type Datum = Record<string, any>;

export const CHART_COLORS = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => `var(--chart-${n})`);

export const chartColor = (index: number) => CHART_COLORS[index % CHART_COLORS.length];

/** "Nice" axis ticks (1/2/5 x 10^n steps) covering [min, max]. */
export function niceTicks(min: number, max: number, count = 5): number[] {
	if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1];
	if (min === max) {
		if (max === 0) return [0, 1];
		max = max > 0 ? max * 1.1 : 0;
		min = min < 0 ? min * 1.1 : 0;
	}
	const rough = (max - min) / Math.max(1, count);
	const pow = 10 ** Math.floor(Math.log10(rough));
	const frac = rough / pow;
	const step = (frac <= 1 ? 1 : frac <= 2 ? 2 : frac <= 5 ? 5 : 10) * pow;
	const start = Math.floor(min / step) * step;
	const end = Math.ceil(max / step) * step;
	const ticks: number[] = [];
	for (let v = start; v <= end + step / 2; v += step) ticks.push(Number(v.toPrecision(12)));
	return ticks;
}

const defaultFormat = (v: number) => {
	const abs = Math.abs(v);
	if (abs >= 1e9) return `${+(v / 1e9).toFixed(1)}B`;
	if (abs >= 1e6) return `${+(v / 1e6).toFixed(1)}M`;
	if (abs >= 1e4) return `${+(v / 1e3).toFixed(1)}k`;
	return String(Number(v.toFixed(2)));
};

const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : Number(v) || 0);

const CHAR_W = 6.5;

function useSeries(series: ChartSeries[], config: ChartConfig) {
	return useMemo(
		() =>
			series.map((s, i) => ({
				key: s.key,
				label: s.label ?? (typeof config[s.key]?.label === 'string' ? (config[s.key].label as string) : s.key),
				color: s.color ?? config[s.key]?.color ?? chartColor(i),
			})),
		[series, config],
	);
}

/* ------------------------------------------------------------------ container + context */

interface ChartContextValue {
	config: ChartConfig;
	width: number;
}
const ChartContext = createContext<ChartContextValue>({ config: {}, width: 0 });
export const useChart = () => useContext(ChartContext);

export interface ChartContainerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
	config?: ChartConfig;
	/** Chart height in px. */
	height?: number | 'auto';
	children?: React.ReactNode | ((size: { width: number; height: number }) => React.ReactNode);
}

/** Responsive wrapper: measures its width (ResizeObserver) and provides the series `config` to legend/tooltip. Positioning context for `ChartTooltip`. */
export const ChartContainer = ({ config = {}, height = 260, className, children, style, ...props }: ChartContainerProps) => {
	const ref = useRef<HTMLDivElement>(null);
	const [width, setWidth] = useState(0);

	useEffect(() => {
		const el = ref.current;
		if (!isBrowser || !el) return;
		const read = () => setWidth(Math.floor(el.getBoundingClientRect().width));
		read();
		if (typeof ResizeObserver === 'undefined') return;
		const ro = new ResizeObserver(read);
		ro.observe(el);
		return () => ro.disconnect();
	}, []);

	const value = useMemo(() => ({ config, width }), [config, width]);
	return (
		<ChartContext.Provider value={value}>
			<div ref={ref} className={cn('relative w-full text-page-text', className)} style={{ height: height === 'auto' ? undefined : height, ...style }} {...props}>
				{typeof children === 'function' ? (width > 0 ? children({ width, height: height === 'auto' ? 260 : height }) : null) : children}
			</div>
		</ChartContext.Provider>
	);
};

/* ------------------------------------------------------------------ legend + tooltip */

export interface ChartLegendItem {
	key: string;
	label?: React.ReactNode;
	color?: string;
}

export interface ChartLegendProps extends React.HTMLAttributes<HTMLUListElement> {
	/** Defaults to every entry of the surrounding `ChartContainer` config. */
	items?: ChartLegendItem[];
}

export const ChartLegend = ({ items, className, ...props }: ChartLegendProps) => {
	const { config } = useChart();
	const list: ChartLegendItem[] = items ?? Object.keys(config).map((key) => ({ key }));
	return (
		<ul className={cn('flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted', className)} {...props}>
			{list.map((item, i) => (
				<li key={item.key} className="flex items-center gap-1.5">
					<span aria-hidden="true" className="size-2.5 shrink-0 rounded-[3px]" style={{ background: item.color ?? config[item.key]?.color ?? chartColor(i) }} />
					{item.label ?? config[item.key]?.label ?? item.key}
				</li>
			))}
		</ul>
	);
};

export interface ChartTooltipItem {
	label: React.ReactNode;
	value: React.ReactNode;
	color?: string;
}

export interface ChartTooltipProps {
	open: boolean;
	/** Position inside the `ChartContainer`, in px. */
	x: number;
	y: number;
	title?: React.ReactNode;
	items: ChartTooltipItem[];
	className?: string;
}

/** Themed tooltip card. Render it inside a `ChartContainer`; it flips to the left of the anchor on the right half. */
export const ChartTooltip = ({ open, x, y, title, items, className }: ChartTooltipProps) => {
	const { width } = useChart();
	if (!open) return null;
	const flip = width > 0 && x > width / 2;
	return (
		<div
			role="status"
			style={{ left: x, top: Math.max(0, y), transform: `translate(${flip ? 'calc(-100% - 12px)' : '12px'}, -50%)` }}
			className={cn('pointer-events-none absolute z-10 min-w-28 max-w-60 rounded-item ui-border bg-surface px-3 py-2 text-xs text-page-text shadow-pop', className)}
		>
			{title != null && <div className="ui-label mb-1 text-[11px] text-muted">{title}</div>}
			<ul className="flex flex-col gap-1">
				{items.map((item, i) => (
					<li key={i} className="flex items-center gap-2">
						{item.color && <span aria-hidden="true" className="size-2 shrink-0 rounded-[2px]" style={{ background: item.color }} />}
						<span className="min-w-0 flex-1 truncate text-muted">{item.label}</span>
						<span className="font-semibold tabular-nums">{item.value}</span>
					</li>
				))}
			</ul>
		</div>
	);
};

/* ------------------------------------------------------------------ shared internals */

interface TipState {
	index: number;
	x: number;
	y: number;
}

function DataTable({ caption, data, xKey, series, format }: { caption: string; data: Datum[]; xKey: string; series: { key: string; label: string }[]; format: (v: number) => string }) {
	return (
		<table className="sr-only">
			<caption>{caption}</caption>
			<thead>
				<tr>
					<th scope="col">{xKey}</th>
					{series.map((s) => (
						<th key={s.key} scope="col">
							{s.label}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{data.map((d, i) => (
					<tr key={i}>
						<th scope="row">{String(d[xKey])}</th>
						{series.map((s) => (
							<td key={s.key}>{format(num(d[s.key]))}</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	);
}

const axisText = 'fill-muted text-[11px] tabular-nums select-none';

interface Frame {
	W: number;
	H: number;
	l: number;
	r: number;
	t: number;
	b: number;
}

function Grid({ ticks, scale, frame, horizontal }: { ticks: number[]; scale: (v: number) => number; frame: Frame; horizontal?: boolean }) {
	return (
		<g aria-hidden="true">
			{ticks.map((tick) => {
				const p = scale(tick);
				return horizontal ? (
					<line key={tick} x1={p} x2={p} y1={frame.t} y2={frame.H - frame.b} className="stroke-line" strokeOpacity={tick === 0 ? 0.6 : 0.25} strokeDasharray={tick === 0 ? undefined : '3 4'} />
				) : (
					<line key={tick} x1={frame.l} x2={frame.W - frame.r} y1={p} y2={p} className="stroke-line" strokeOpacity={tick === 0 ? 0.6 : 0.25} strokeDasharray={tick === 0 ? undefined : '3 4'} />
				);
			})}
		</g>
	);
}

/* ------------------------------------------------------------------ BarChart */

export interface BarChartProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
	data: Datum[];
	xKey: string;
	series: ChartSeries[];
	/** `vertical` = bars grow up (default); `horizontal` = bars grow to the right. */
	layout?: 'vertical' | 'horizontal';
	stacked?: boolean;
	height?: number;
	showGrid?: boolean;
	showAxes?: boolean;
	showValues?: boolean;
	showLegend?: boolean;
	valueFormatter?: (value: number) => string;
	/** Accessible name of the chart. */
	label?: string;
}

export const BarChart = ({
	data,
	xKey,
	series: seriesProp,
	layout = 'vertical',
	stacked = false,
	height = 260,
	showGrid = true,
	showAxes = true,
	showValues = false,
	showLegend,
	valueFormatter = defaultFormat,
	label = 'Bar chart',
	className,
	...props
}: BarChartProps) => {
	const { config } = useChart();
	const series = useSeries(seriesProp, config);
	const legend = showLegend ?? series.length > 1;
	return (
		<div className={cn('flex w-full flex-col gap-3', className)} {...props}>
			<ChartContainer config={config} height={height}>
				{({ width }) => <BarChartSvg {...{ data, xKey, series, layout, stacked, height, showGrid, showAxes, showValues, valueFormatter, label, width }} />}
			</ChartContainer>
			{legend && <ChartLegend items={series} />}
		</div>
	);
};

function BarChartSvg({ data, xKey, series, layout, stacked, height, showGrid, showAxes, showValues, valueFormatter, label, width }: any) {
	const horizontal = layout === 'horizontal';
	const [tip, setTip] = useState<TipState | null>(null);
	const containerRef = useRef<SVGSVGElement>(null);
	const n = data.length;

	const totals = (d: Datum) => series.reduce((a: number, s: any) => a + Math.max(0, num(d[s.key])), 0);
	const all: number[] = stacked ? data.map(totals) : data.flatMap((d: Datum) => series.map((s: any) => num(d[s.key])));
	const lows: number[] = stacked ? [0] : all;
	const ticks = niceTicks(Math.min(0, ...lows), Math.max(0, ...all), horizontal ? 4 : 5);
	const d0 = ticks[0];
	const d1 = ticks[ticks.length - 1];

	const tickW = Math.max(...ticks.map((tk) => valueFormatter(tk).length)) * CHAR_W;
	const catW = horizontal ? Math.min(120, Math.max(...data.map((d: Datum) => String(d[xKey]).length), 1) * CHAR_W) : 0;
	const frame: Frame = {
		W: width,
		H: height,
		l: showAxes ? (horizontal ? catW + 12 : tickW + 12) : 4,
		r: showValues && horizontal ? Math.max(16, tickW + 8) : 12,
		t: showValues && !horizontal ? 20 : 10,
		b: showAxes ? (horizontal ? 24 : 28) : 4,
	};
	const iw = Math.max(1, frame.W - frame.l - frame.r);
	const ih = Math.max(1, frame.H - frame.t - frame.b);
	const scale = (v: number) => (horizontal ? frame.l + ((v - d0) / (d1 - d0)) * iw : frame.t + ih - ((v - d0) / (d1 - d0)) * ih);
	const step = (horizontal ? ih : iw) / Math.max(1, n);
	const bandW = step * 0.72;
	const stride = horizontal ? 1 : Math.max(1, Math.ceil(((Math.max(...data.map((d: Datum) => String(d[xKey]).length), 1) * CHAR_W + 8) * 1) / step));

	const rect = (start: number, size: number, v0: number, v1: number) => {
		const a = scale(v0);
		const b = scale(v1);
		return horizontal ? { x: Math.min(a, b), y: start, width: Math.abs(b - a), height: size } : { x: start, y: Math.min(a, b), width: size, height: Math.abs(b - a) };
	};

	const show = (i: number, x: number, y: number) => setTip({ index: i, x, y });
	const anchor = (i: number) => {
		const c = (horizontal ? frame.t : frame.l) + step * (i + 0.5);
		const top = Math.max(...series.map((s: any) => num(data[i][s.key])), stacked ? totals(data[i]) : 0);
		return horizontal ? { x: scale(top), y: c } : { x: c, y: scale(top) };
	};

	const tipDatum = tip ? data[tip.index] : null;

	return (
		<>
			<svg ref={containerRef} width={width} height={height} role="img" aria-label={label} className="block overflow-visible" onPointerLeave={() => setTip(null)}>
				{showGrid && <Grid ticks={ticks} scale={scale} frame={frame} horizontal={horizontal} />}
				{showAxes && (
					<g aria-hidden="true">
						{ticks.map((tk) => (
							<text key={tk} className={axisText} {...(horizontal ? { x: scale(tk), y: frame.H - 6, textAnchor: 'middle' } : { x: frame.l - 8, y: scale(tk), textAnchor: 'end', dominantBaseline: 'middle' })}>
								{valueFormatter(tk)}
							</text>
						))}
						{data.map((d: Datum, i: number) => {
							if (i % stride) return null;
							const c = (horizontal ? frame.t : frame.l) + step * (i + 0.5);
							return (
								<text key={i} className={axisText} {...(horizontal ? { x: frame.l - 8, y: c, textAnchor: 'end', dominantBaseline: 'middle' } : { x: c, y: frame.H - 8, textAnchor: 'middle' })}>
									{String(d[xKey])}
								</text>
							);
						})}
					</g>
				)}
				{data.map((d: Datum, i: number) => {
					const bandStart = (horizontal ? frame.t : frame.l) + step * i + (step - bandW) / 2;
					let acc = 0;
					return (
						<g key={i} aria-hidden="true">
							{series.map((s: any, si: number) => {
								const v = num(d[s.key]);
								const bw = stacked ? bandW : bandW / series.length;
								const start = stacked ? bandStart : bandStart + si * bw;
								const size = stacked ? bw : Math.max(1, bw - 2);
								const r = stacked ? rect(start, size, acc, acc + Math.max(0, v)) : rect(start, size, 0, v);
								if (stacked) acc += Math.max(0, v);
								const dim = tip && tip.index !== i;
								return (
									<rect
										key={s.key}
										{...r}
										fill={s.color}
										stroke={stacked ? 'var(--bg-page)' : undefined}
										strokeWidth={stacked ? 1 : undefined}
										opacity={dim ? 0.55 : 1}
										style={{ rx: 'min(var(--ui-radius-item), 6px)', transition: 'opacity 120ms' }}
									/>
								);
							})}
							{showValues && !stacked && series.map((s: any, si: number) => {
								const v = num(d[s.key]);
								const bw = bandW / series.length;
								const pos = scale(v);
								const mid = bandStart + si * bw + bw / 2;
								return (
									<text key={s.key} className="fill-page-text text-[10px] font-semibold tabular-nums select-none" {...(horizontal ? { x: pos + 4, y: mid, dominantBaseline: 'middle' } : { x: mid, y: pos - 5, textAnchor: 'middle' })}>
										{valueFormatter(v)}
									</text>
								);
							})}
							{showValues && stacked && (
								<text className="fill-page-text text-[10px] font-semibold tabular-nums select-none" {...(horizontal ? { x: scale(acc) + 4, y: bandStart + bandW / 2, dominantBaseline: 'middle' } : { x: bandStart + bandW / 2, y: scale(acc) - 5, textAnchor: 'middle' })}>
									{valueFormatter(acc)}
								</text>
							)}
						</g>
					);
				})}
				{/* one focusable hit area per category: pointer + keyboard share the same tooltip */}
				{data.map((d: Datum, i: number) => {
					const start = (horizontal ? frame.t : frame.l) + step * i;
					const box = horizontal ? { x: frame.l, y: start, width: iw, height: step } : { x: start, y: frame.t, width: step, height: ih };
					const a = anchor(i);
					return (
						<rect
							key={i}
							{...box}
							fill="transparent"
							tabIndex={0}
							role="img"
							aria-label={`${String(d[xKey])}: ${series.map((s: any) => `${s.label} ${valueFormatter(num(d[s.key]))}`).join(', ')}`}
							className="outline-none focus-visible:fill-hover focus-visible:stroke-brand focus-visible:stroke-2"
							onPointerMove={(e) => {
								const box = containerRef.current?.getBoundingClientRect();
								if (box) show(i, e.clientX - box.left, e.clientY - box.top);
							}}
							onFocus={() => show(i, a.x, a.y)}
							onBlur={() => setTip(null)}
							onKeyDown={(e) => e.key === 'Escape' && setTip(null)}
						/>
					);
				})}
			</svg>
			<ChartTooltip open={!!tip} x={tip?.x ?? 0} y={tip?.y ?? 0} title={tipDatum ? String(tipDatum[xKey]) : ''} items={tipDatum ? series.map((s: any) => ({ label: s.label, color: s.color, value: valueFormatter(num(tipDatum[s.key])) })) : []} />
			<DataTable caption={label} data={data} xKey={xKey} series={series} format={valueFormatter} />
		</>
	);
}

/* ------------------------------------------------------------------ LineChart */

export interface LineChartProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
	data: Datum[];
	xKey: string;
	series: ChartSeries[];
	height?: number;
	/** Fill under each line. */
	area?: boolean;
	dots?: boolean;
	smooth?: boolean;
	showGrid?: boolean;
	showAxes?: boolean;
	showLegend?: boolean;
	valueFormatter?: (value: number) => string;
	label?: string;
}

export const LineChart = ({
	data,
	xKey,
	series: seriesProp,
	height = 260,
	area = false,
	dots = true,
	smooth = false,
	showGrid = true,
	showAxes = true,
	showLegend,
	valueFormatter = defaultFormat,
	label = 'Line chart',
	className,
	...props
}: LineChartProps) => {
	const { config } = useChart();
	const series = useSeries(seriesProp, config);
	const legend = showLegend ?? series.length > 1;
	return (
		<div className={cn('flex w-full flex-col gap-3', className)} {...props}>
			<ChartContainer config={config} height={height}>
				{({ width }) => <LineChartSvg {...{ data, xKey, series, height, area, dots, smooth, showGrid, showAxes, valueFormatter, label, width }} />}
			</ChartContainer>
			{legend && <ChartLegend items={series} />}
		</div>
	);
};

function linePath(pts: [number, number][], smooth: boolean) {
	if (pts.length === 0) return '';
	let d = `M${pts[0][0]},${pts[0][1]}`;
	for (let i = 1; i < pts.length; i++) {
		const [x0, y0] = pts[i - 1];
		const [x1, y1] = pts[i];
		d += smooth ? `C${(x0 + x1) / 2},${y0} ${(x0 + x1) / 2},${y1} ${x1},${y1}` : `L${x1},${y1}`;
	}
	return d;
}

function LineChartSvg({ data, xKey, series, height, area, dots, smooth, showGrid, showAxes, valueFormatter, label, width }: any) {
	const svgRef = useRef<SVGSVGElement>(null);
	const [active, setActive] = useState<number | null>(null);
	const [pointerY, setPointerY] = useState<number | null>(null);
	const n = data.length;

	const all: number[] = data.flatMap((d: Datum) => series.map((s: any) => num(d[s.key])));
	const ticks = niceTicks(Math.min(0, ...all), Math.max(0, ...all), 5);
	const d0 = ticks[0];
	const d1 = ticks[ticks.length - 1];
	const tickW = Math.max(...ticks.map((tk) => valueFormatter(tk).length)) * CHAR_W;
	const frame: Frame = { W: width, H: height, l: showAxes ? tickW + 12 : 8, r: 12, t: 12, b: showAxes ? 28 : 8 };
	const iw = Math.max(1, frame.W - frame.l - frame.r);
	const ih = Math.max(1, frame.H - frame.t - frame.b);
	const pad = Math.min(10, iw / 10);
	const sx = (i: number) => (n <= 1 ? frame.l + iw / 2 : frame.l + pad + ((iw - pad * 2) * i) / (n - 1));
	const sy = (v: number) => frame.t + ih - ((v - d0) / (d1 - d0)) * ih;
	const labelStride = Math.max(1, Math.ceil((Math.max(...data.map((d: Datum) => String(d[xKey]).length), 1) * CHAR_W + 12) / (n <= 1 ? iw : (iw - pad * 2) / (n - 1))));
	const uid = useId();

	const nearest = (clientX: number) => {
		const box = svgRef.current?.getBoundingClientRect();
		if (!box || n === 0) return 0;
		const x = clientX - box.left;
		return Math.min(n - 1, Math.max(0, n <= 1 ? 0 : Math.round(((x - frame.l - pad) / (iw - pad * 2)) * (n - 1))));
	};

	const tipDatum = active != null ? data[active] : null;
	const tipY = pointerY ?? (tipDatum ? Math.min(...series.map((s: any) => sy(num(tipDatum[s.key])))) : 0);

	const onKey = (e: React.KeyboardEvent) => {
		const move = (to: number) => {
			e.preventDefault();
			setPointerY(null);
			setActive(Math.min(n - 1, Math.max(0, to)));
		};
		const cur = active ?? -1;
		const rtl = isBrowser && getComputedStyle(e.currentTarget as Element).direction === 'rtl';
		if (e.key === 'ArrowRight') move(cur + (rtl ? -1 : 1));
		else if (e.key === 'ArrowLeft') move(cur === -1 ? 0 : cur + (rtl ? 1 : -1));
		else if (e.key === 'Home') move(0);
		else if (e.key === 'End') move(n - 1);
		else if (e.key === 'Escape') setActive(null);
	};

	return (
		<>
			<svg ref={svgRef} width={width} height={height} role="img" aria-label={label} className="block overflow-visible" onPointerLeave={() => setActive(null)}>
				{showGrid && <Grid ticks={ticks} scale={sy} frame={frame} />}
				{showAxes && (
					<g aria-hidden="true">
						{ticks.map((tk) => (
							<text key={tk} className={axisText} x={frame.l - 8} y={sy(tk)} textAnchor="end" dominantBaseline="middle">
								{valueFormatter(tk)}
							</text>
						))}
						{data.map((d: Datum, i: number) => (i % labelStride ? null : (
							<text key={i} className={axisText} x={sx(i)} y={frame.H - 8} textAnchor="middle">
								{String(d[xKey])}
							</text>
						)))}
					</g>
				)}
				{active != null && <line aria-hidden="true" x1={sx(active)} x2={sx(active)} y1={frame.t} y2={frame.t + ih} className="stroke-line" strokeOpacity={0.6} />}
				{series.map((s: any, si: number) => {
					const pts: [number, number][] = data.map((d: Datum, i: number) => [sx(i), sy(num(d[s.key]))]);
					const line = linePath(pts, smooth);
					const base = sy(Math.max(d0, Math.min(0, d1)));
					return (
						<g key={s.key} aria-hidden="true">
							{area && n > 1 && (
								<>
									<defs>
										<linearGradient id={`${uid}-${si}`} x1="0" x2="0" y1="0" y2="1">
											<stop offset="0%" stopColor={s.color} stopOpacity={0.3} />
											<stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
										</linearGradient>
									</defs>
									<path d={`${line}L${pts[n - 1][0]},${base}L${pts[0][0]},${base}Z`} fill={`url(#${uid}-${si})`} />
								</>
							)}
							<path d={line} fill="none" stroke={s.color} strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round" />
							{pts.map(([x, y], i) =>
								dots || i === active ? (
									<circle key={i} cx={x} cy={y} r={i === active ? 5 : 3.5} fill="var(--bg-page)" stroke={s.color} strokeWidth={2} />
								) : null,
							)}
						</g>
					);
				})}
				<rect
					x={frame.l}
					y={frame.t}
					width={iw}
					height={ih}
					fill="transparent"
					tabIndex={0}
					aria-label={`${label}. Use the left and right arrow keys to read each point.`}
					className="outline-none focus-visible:stroke-brand focus-visible:stroke-2"
					onPointerMove={(e) => {
						const box = svgRef.current?.getBoundingClientRect();
						setActive(nearest(e.clientX));
						setPointerY(box ? e.clientY - box.top : null);
					}}
					onFocus={() => active == null && (setPointerY(null), setActive(0))}
					onBlur={() => setActive(null)}
					onKeyDown={onKey}
				/>
			</svg>
			<ChartTooltip open={active != null} x={active != null ? sx(active) : 0} y={tipY} title={tipDatum ? String(tipDatum[xKey]) : ''} items={tipDatum ? series.map((s: any) => ({ label: s.label, color: s.color, value: valueFormatter(num(tipDatum[s.key])) })) : []} />
			<DataTable caption={label} data={data} xKey={xKey} series={series} format={valueFormatter} />
		</>
	);
}

/* ------------------------------------------------------------------ DonutChart */

export interface DonutChartProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
	data: Datum[];
	/** Field with the slice name (default `name`). */
	nameKey?: string;
	/** Field with the slice value (default `value`). */
	valueKey?: string;
	/** Field with an optional per-slice colour (default `color`). */
	colorKey?: string;
	size?: number;
	/** Ring thickness in px. */
	thickness?: number;
	centerLabel?: React.ReactNode;
	centerValue?: React.ReactNode;
	showLegend?: boolean;
	valueFormatter?: (value: number) => string;
	label?: string;
}

export const DonutChart = ({
	data,
	nameKey = 'name',
	valueKey = 'value',
	colorKey = 'color',
	size = 200,
	thickness = 28,
	centerLabel,
	centerValue,
	showLegend = true,
	valueFormatter = defaultFormat,
	label = 'Donut chart',
	className,
	...props
}: DonutChartProps) => {
	const { config } = useChart();
	const [active, setActive] = useState<number | null>(null);
	const [pos, setPos] = useState({ x: 0, y: 0 });
	const svgRef = useRef<SVGSVGElement>(null);

	const slices = data.map((d, i) => {
		const name = String(d[nameKey]);
		return { name, value: Math.max(0, num(d[valueKey])), color: (d[colorKey] as string | undefined) ?? config[name]?.color ?? chartColor(i), label: config[name]?.label ?? name };
	});
	const total = slices.reduce((a, s) => a + s.value, 0);
	const R = size / 2;
	const r = R - thickness / 2 - 2;
	const C = 2 * Math.PI * r;
	let offset = 0;
	const percent = (v: number) => (total ? `${Math.round((v / total) * 100)}%` : '0%');

	const arcs = slices.map((s) => {
		const len = total ? (s.value / total) * C : 0;
		const gap = slices.filter((x) => x.value > 0).length > 1 ? Math.min(2, len) : 0;
		const arc = { ...s, dash: `${Math.max(0, len - gap)} ${C - Math.max(0, len - gap)}`, offset: -offset };
		offset += len;
		return arc;
	});

	const at = (i: number) => {
		// midpoint angle of slice i, for keyboard focus
		const before = slices.slice(0, i).reduce((a, s) => a + s.value, 0);
		const angle = ((before + slices[i].value / 2) / (total || 1)) * Math.PI * 2 - Math.PI / 2;
		return { x: R + Math.cos(angle) * r, y: R + Math.sin(angle) * r };
	};

	return (
		<div className={cn('flex w-full flex-col items-center gap-3', className)} {...props}>
			<ChartContainer config={config} height={size} className="mx-auto" style={{ width: size }}>
				<svg ref={svgRef} width={size} height={size} role="img" aria-label={`${label}. Total ${valueFormatter(total)}.`} className="block" onPointerLeave={() => setActive(null)}>
					<circle cx={R} cy={R} r={r} fill="none" strokeWidth={thickness} className="stroke-line" strokeOpacity={0.15} aria-hidden="true" />
					<g transform={`rotate(-90 ${R} ${R})`}>
						{arcs.map((a, i) =>
							a.value > 0 ? (
								<circle
									key={a.name}
									cx={R}
									cy={R}
									r={r}
									fill="none"
									stroke={a.color}
									strokeWidth={active === i ? thickness + 4 : thickness}
									strokeDasharray={a.dash}
									strokeDashoffset={a.offset}
									opacity={active != null && active !== i ? 0.55 : 1}
									tabIndex={0}
									role="img"
									aria-label={`${a.label}: ${valueFormatter(a.value)} (${percent(a.value)})`}
									className="outline-none focus-visible:stroke-brand"
									style={{ transition: 'opacity 120ms, stroke-width 120ms' }}
									onPointerMove={(e) => {
										const box = svgRef.current?.getBoundingClientRect();
										if (box) setPos({ x: e.clientX - box.left, y: e.clientY - box.top });
										setActive(i);
									}}
									onFocus={() => (setPos(at(i)), setActive(i))}
									onBlur={() => setActive(null)}
								/>
							) : null,
						)}
					</g>
				</svg>
				{(centerLabel != null || centerValue != null) && (
					<div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center" style={{ padding: thickness + 8 }}>
						{centerValue != null && <span className="ui-heading text-2xl leading-none tabular-nums">{centerValue}</span>}
						{centerLabel != null && <span className="ui-label mt-1 text-[11px] text-muted">{centerLabel}</span>}
					</div>
				)}
				<ChartTooltip open={active != null} x={pos.x} y={pos.y} items={active != null ? [{ label: arcs[active].label, color: arcs[active].color, value: `${valueFormatter(arcs[active].value)} (${percent(arcs[active].value)})` }] : []} />
				<table className="sr-only">
					<caption>{label}</caption>
					<thead>
						<tr>
							<th scope="col">{nameKey}</th>
							<th scope="col">{valueKey}</th>
						</tr>
					</thead>
					<tbody>
						{slices.map((s) => (
							<tr key={s.name}>
								<th scope="row">{s.name}</th>
								<td>{valueFormatter(s.value)}</td>
							</tr>
						))}
					</tbody>
				</table>
			</ChartContainer>
			{showLegend && <ChartLegend items={slices.map((s) => ({ key: s.name, label: s.label, color: s.color }))} />}
		</div>
	);
};

/* ------------------------------------------------------------------ Sparkline */

export interface SparklineProps extends Omit<React.SVGAttributes<SVGSVGElement>, 'data' | 'color'> {
	/** Numbers, or objects read through `dataKey`. */
	data: (number | Datum)[];
	dataKey?: string;
	color?: string;
	/** Fill under the line. */
	area?: boolean;
	smooth?: boolean;
	/** Height in px; width fills the parent (set `className="w-24"` to size it). */
	height?: number;
	label?: string;
}

/** Tiny inline trend line — no axes, no tooltip; the values are exposed through the accessible name. */
export const Sparkline = ({ data, dataKey = 'value', color = 'var(--chart-1)', area = false, smooth = true, height = 28, label, className, ...props }: SparklineProps) => {
	const uid = useId();
	const values = data.map((d) => (typeof d === 'number' ? d : num(d[dataKey])));
	const W = 100;
	const min = Math.min(...values);
	const max = Math.max(...values);
	const span = max - min || 1;
	const pad = 3;
	const pts: [number, number][] = values.map((v, i) => [values.length <= 1 ? W / 2 : (W * i) / (values.length - 1), pad + (1 - (v - min) / span) * (height - pad * 2)]);
	const line = linePath(pts, smooth);
	const name = label ?? `Trend: ${values.join(', ')}`;
	if (values.length === 0) return null;
	return (
		<svg viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" height={height} role="img" aria-label={name} className={cn('inline-block w-24 overflow-visible align-middle', className)} {...props}>
			{area && values.length > 1 && (
				<>
					<defs>
						<linearGradient id={uid} x1="0" x2="0" y1="0" y2="1">
							<stop offset="0%" stopColor={color} stopOpacity={0.3} />
							<stop offset="100%" stopColor={color} stopOpacity={0.02} />
						</linearGradient>
					</defs>
					<path d={`${line}L${W},${height}L0,${height}Z`} fill={`url(#${uid})`} />
				</>
			)}
			<path d={line} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
		</svg>
	);
};

// kept for consumers building their own charts on top of the container
export const useChartTooltip = () => {
	const [tip, setTip] = useState<{ x: number; y: number } | null>(null);
	const hide = useCallback(() => setTip(null), []);
	return { tip, show: setTip, hide };
};
