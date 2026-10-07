import type { Meta, StoryObj } from '@storybook/react-vite';
import { ScrollArea } from 'perkslab-ui';

const meta = { title: 'Layout/ScrollArea', component: ScrollArea, parameters: { layout: 'padded' } } satisfies Meta<typeof ScrollArea>;
export default meta;
type Story = StoryObj<typeof meta>;

const rows = Array.from({ length: 30 }, (_, i) => `Item ${i + 1}`);

export const Vertical: Story = {
	render: () => (
		<ScrollArea className="h-64 w-64 rounded-box ui-border bg-surface">
			<ul className="p-3">
				{rows.map((r) => (
					<li key={r} className="border-b border-line/20 py-2 text-sm">{r}</li>
				))}
			</ul>
		</ScrollArea>
	),
};

export const WithFade: Story = {
	render: () => (
		<ScrollArea fade className="h-64 w-64 rounded-box ui-border bg-surface">
			<ul className="p-3">
				{rows.map((r) => (
					<li key={r} className="py-2 text-sm">{r}</li>
				))}
			</ul>
		</ScrollArea>
	),
};

export const Horizontal: Story = {
	render: () => (
		<ScrollArea orientation="horizontal" fade className="w-80 rounded-box ui-border bg-surface">
			<div className="flex w-max gap-3 p-3">
				{rows.slice(0, 12).map((r) => (
					<div key={r} className="grid size-24 place-items-center rounded-item bg-brand-bg text-sm font-semibold text-brand">{r}</div>
				))}
			</div>
		</ScrollArea>
	),
};
