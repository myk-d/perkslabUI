import type { Meta, StoryObj } from '@storybook/react-vite';
import { Marker, MarkerContent, MarkerIcon, Spinner } from 'perkslab-ui';
import { InfoIcon } from '../src/lib/icons';

const meta = {
	title: 'Chat/Marker',
	component: Marker,
	argTypes: { variant: { control: 'select', options: ['default', 'border', 'separator'] } },
	decorators: [(Story) => <div className="w-[420px] max-w-full"><Story /></div>],
} satisfies Meta<typeof Marker>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: (args) => <Marker {...args} role="status"><MarkerIcon><InfoIcon /></MarkerIcon><MarkerContent>Anna joined the conversation</MarkerContent></Marker> };
export const Border: Story = { render: (args) => <Marker {...args} variant="border"><MarkerContent>Earlier messages</MarkerContent></Marker> };
export const Separator: Story = { render: (args) => <Marker {...args} variant="separator"><MarkerContent>Today</MarkerContent></Marker> };
export const Shimmer: Story = {
	render: () => (
		<Marker role="status"><MarkerIcon><Spinner className="size-4" /></MarkerIcon><MarkerContent shimmer>Thinking…</MarkerContent></Marker>
	),
};
export const AsButton: Story = {
	render: () => (
		<Marker asChild variant="separator"><button type="button"><MarkerContent>Load earlier messages</MarkerContent></button></Marker>
	),
};
