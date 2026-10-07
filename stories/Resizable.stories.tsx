import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef } from 'react';
import { Button, ResizableHandle, ResizablePanel, ResizablePanelGroup, type ResizablePanelApi } from 'perkslab-ui';

const meta = {
	title: 'Layout/Resizable',
	component: ResizablePanelGroup,
	argTypes: { direction: { control: 'inline-radio', options: ['horizontal', 'vertical'] } },
	args: { direction: 'horizontal' },
} satisfies Meta<typeof ResizablePanelGroup>;
export default meta;
type Story = StoryObj<typeof meta>;

const Box = ({ children }: { children: React.ReactNode }) => <div className="flex h-full items-center justify-center p-6 font-bold text-page-text">{children}</div>;

export const Default: Story = {
	render: (args) => (
		<ResizablePanelGroup {...args} className="h-72 max-w-xl ui-border border-line rounded-box">
			<ResizablePanel defaultSize={30} minSize={15}>
				<Box>One</Box>
			</ResizablePanel>
			<ResizableHandle withHandle />
			<ResizablePanel defaultSize={70}>
				<Box>Two</Box>
			</ResizablePanel>
		</ResizablePanelGroup>
	),
};

export const Nested: Story = {
	render: () => (
		<ResizablePanelGroup direction="horizontal" className="h-80 max-w-2xl ui-border border-line rounded-box">
			<ResizablePanel defaultSize={25} minSize={10}>
				<Box>Sidebar</Box>
			</ResizablePanel>
			<ResizableHandle withHandle />
			<ResizablePanel defaultSize={75}>
				<ResizablePanelGroup direction="vertical">
					<ResizablePanel defaultSize={60}>
						<Box>Content</Box>
					</ResizablePanel>
					<ResizableHandle withHandle />
					<ResizablePanel defaultSize={40} minSize={10}>
						<Box>Console</Box>
					</ResizablePanel>
				</ResizablePanelGroup>
			</ResizablePanel>
		</ResizablePanelGroup>
	),
};

export const CollapsibleAndPersisted: Story = {
	render: () => {
		const side = useRef<ResizablePanelApi>(null);
		return (
			<div className="max-w-xl space-y-3">
				<div className="flex gap-2">
					<Button size="sm" variant="outline" onClick={() => side.current?.collapse()}>
						Collapse
					</Button>
					<Button size="sm" variant="outline" onClick={() => side.current?.expand()}>
						Expand
					</Button>
				</div>
				<ResizablePanelGroup direction="horizontal" autoSaveId="storybook-resizable" className="h-56 ui-border border-line rounded-box">
					<ResizablePanel ref={side} defaultSize={30} minSize={15} collapsible>
						<Box>Collapsible</Box>
					</ResizablePanel>
					<ResizableHandle withHandle />
					<ResizablePanel defaultSize={70}>
						<Box>Main (layout is saved)</Box>
					</ResizablePanel>
				</ResizablePanelGroup>
			</div>
		);
	},
};
