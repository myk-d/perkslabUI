import type { Meta, StoryObj } from '@storybook/react-vite';
import { BarChart, ChartContainer, DonutChart, LineChart, Sparkline, Stat, type ChartConfig } from 'perkslab-ui';

const meta = { title: 'Charts/Overview', parameters: { layout: 'padded' } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
const data = months.map((month, i) => ({ month, sales: 40 + ((i * 37) % 60), costs: 20 + ((i * 23) % 40), refunds: 5 + ((i * 11) % 15) }));
const series = [
	{ key: 'sales', label: 'Sales' },
	{ key: 'costs', label: 'Costs' },
];
const config: ChartConfig = { sales: { label: 'Sales' }, costs: { label: 'Costs', color: 'var(--chart-2)' } };

export const Bars: Story = {
	render: () => (
		<ChartContainer config={config} height="auto" className="max-w-2xl">
			<BarChart data={data} xKey="month" series={series} showValues />
		</ChartContainer>
	),
};

export const BarsStacked: Story = {
	render: () => (
		<div className="max-w-2xl">
			<BarChart data={data} xKey="month" stacked series={[...series, { key: 'refunds', label: 'Refunds' }]} />
		</div>
	),
};

export const BarsHorizontal: Story = {
	render: () => (
		<div className="max-w-2xl">
			<BarChart data={data} xKey="month" layout="horizontal" height={320} series={[{ key: 'sales', label: 'Sales' }]} showValues />
		</div>
	),
};

export const Lines: Story = {
	render: () => (
		<div className="max-w-2xl">
			<LineChart data={data} xKey="month" series={series} smooth />
		</div>
	),
};

export const Area: Story = {
	render: () => (
		<div className="max-w-2xl">
			<LineChart data={data} xKey="month" series={[{ key: 'sales', label: 'Sales' }]} area smooth dots={false} />
		</div>
	),
};

export const Donut: Story = {
	render: () => (
		<DonutChart
			data={[
				{ name: 'Work', value: 42 },
				{ name: 'Study', value: 24 },
				{ name: 'Sport', value: 12 },
				{ name: 'Rest', value: 22 },
			]}
			centerValue="100h"
			centerLabel="Total"
		/>
	),
};

export const Sparklines: Story = {
	render: () => (
		<div className="grid max-w-md grid-cols-2 gap-3">
			<Stat label="Revenue" value="$12.4k" hint={<Sparkline data={[3, 5, 4, 7, 6, 9, 12]} area className="w-full" />} />
			<Stat label="Churn" value="2.1%" hint={<Sparkline data={[9, 8, 8, 6, 5, 4, 3]} color="var(--chart-2)" className="w-full" />} />
		</div>
	),
};
