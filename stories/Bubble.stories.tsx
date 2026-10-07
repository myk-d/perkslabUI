import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from 'perkslab-ui';

const variants = ['default', 'secondary', 'muted', 'tinted', 'outline', 'ghost', 'destructive'] as const;

const meta = {
	title: 'Chat/Bubble',
	component: Bubble,
	argTypes: {
		variant: { control: 'select', options: variants },
		align: { control: 'inline-radio', options: ['start', 'end'] },
	},
	decorators: [(Story) => <div className="flex w-[420px] max-w-full flex-col gap-2"><Story /></div>],
} satisfies Meta<typeof Bubble>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: (args) => <Bubble {...args}><BubbleContent>Hello! How can I help you today?</BubbleContent></Bubble> };
export const Variants: Story = {
	render: () => (
		<>
			{variants.map((v) => (
				<Bubble key={v} variant={v}><BubbleContent>{v} bubble</BubbleContent></Bubble>
			))}
		</>
	),
};
export const Aligned: Story = {
	render: () => (
		<>
			<Bubble variant="secondary"><BubbleContent>Aligned to the start</BubbleContent></Bubble>
			<Bubble align="end"><BubbleContent>Aligned to the end</BubbleContent></Bubble>
		</>
	),
};
export const AsLink: Story = {
	render: () => (
		<Bubble variant="tinted"><BubbleContent asChild><a href="#docs">Open the documentation</a></BubbleContent></Bubble>
	),
};
export const WithReactions: Story = {
	render: () => (
		<>
			<Bubble variant="secondary">
				<BubbleContent>Ship it on Friday?</BubbleContent>
				<BubbleReactions><span>👍 2</span><span>🎉</span></BubbleReactions>
			</Bubble>
			<Bubble align="end">
				<BubbleReactions side="top" align="start"><span>❤️ 1</span></BubbleReactions>
				<BubbleContent>Yes, looks good.</BubbleContent>
			</Bubble>
		</>
	),
};
export const Grouped: Story = {
	render: () => (
		<>
			<BubbleGroup align="start">
				<Bubble variant="secondary"><BubbleContent>First message</BubbleContent></Bubble>
				<Bubble variant="secondary"><BubbleContent>Second, joined to the first</BubbleContent></Bubble>
				<Bubble variant="secondary"><BubbleContent>Third closes the group</BubbleContent></Bubble>
			</BubbleGroup>
			<BubbleGroup align="end">
				<Bubble align="end"><BubbleContent>Mine, first</BubbleContent></Bubble>
				<Bubble align="end"><BubbleContent>Mine, last</BubbleContent></Bubble>
			</BubbleGroup>
		</>
	),
};
