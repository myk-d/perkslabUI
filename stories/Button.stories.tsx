import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from 'perkslab-ui';

const meta = {
	title: 'Actions/Button',
	component: Button,
	args: { children: 'Button' },
	argTypes: {
		variant: { control: 'select', options: ['default', 'secondary', 'outline', 'ghost', 'link', 'danger', 'success', 'warning', 'info'] },
		size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'icon', 'icon-xs', 'icon-sm', 'icon-lg', 'full'] },
	},
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Loading: Story = { args: { isLoading: true, children: 'Saving' } };
export const Disabled: Story = { args: { disabled: true } };
export const AsLink: Story = { args: { asChild: true, variant: 'outline' }, render: (args) => <Button {...args}><a href="#link">I am an anchor</a></Button> };
export const Variants: Story = {
	render: () => (
		<div className="flex flex-wrap gap-3">
			{(['default', 'secondary', 'outline', 'ghost', 'link', 'danger', 'success', 'warning', 'info'] as const).map((v) => (
				<Button key={v} variant={v}>{v}</Button>
			))}
		</div>
	),
};
export const Sizes: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-3">
			<Button size="sm">Small</Button><Button>Medium</Button><Button size="lg">Large</Button><Button size="icon" aria-label="Add">+</Button>
		</div>
	),
};

export const IconSizes: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-3">
			{(['icon-xs', 'icon-sm', 'icon', 'icon-lg'] as const).map((s) => <Button key={s} size={s} variant="outline" aria-label={s}>+</Button>)}
			<Button size="xs">Extra small</Button>
			<Button variant="destructive">Destructive</Button>
		</div>
	),
};
