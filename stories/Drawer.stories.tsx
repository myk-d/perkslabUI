import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Drawer, DrawerBody, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger, type DrawerSnapPoint, type DrawerSwipeDirection } from 'perkslab-ui';

const meta = { title: 'Overlays/Drawer', parameters: { layout: 'padded' } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const Body = ({ title = 'Move goal' }: { title?: string }) => (
	<>
		<DrawerHeader><DrawerTitle>{title}</DrawerTitle><DrawerDescription>Swipe it away, or use the buttons.</DrawerDescription></DrawerHeader>
		<DrawerBody className="flex flex-col gap-2">
			{Array.from({ length: 8 }, (_, i) => <p key={i} className="text-sm text-muted">Line {i + 1}: you can drag from anywhere that is not scrolled.</p>)}
		</DrawerBody>
		<DrawerFooter>
			<DrawerClose asChild><Button>Submit</Button></DrawerClose>
			<DrawerClose asChild><Button variant="outline">Cancel</Button></DrawerClose>
		</DrawerFooter>
	</>
);

const directional = (dir: DrawerSwipeDirection): Story => ({
	render: () => (
		<Drawer swipeDirection={dir}>
			<DrawerTrigger asChild><Button variant="outline">Open {dir === 'down' ? 'bottom' : dir === 'up' ? 'top' : dir} drawer</Button></DrawerTrigger>
			<DrawerContent><Body /></DrawerContent>
		</Drawer>
	),
});

export const Bottom: Story = directional('down');
export const Top: Story = directional('up');
export const Left: Story = directional('left');
export const Right: Story = directional('right');

export const SnapPoints: Story = {
	render: () => (
		<Drawer snapPoints={['148px', 0.5, 1]}>
			<DrawerTrigger asChild><Button variant="outline">Open with snap points</Button></DrawerTrigger>
			<DrawerContent><Body title="Snap points" /></DrawerContent>
		</Drawer>
	),
};

export const Nested: Story = {
	render: () => (
		<Drawer>
			<DrawerTrigger asChild><Button variant="outline">Open parent</Button></DrawerTrigger>
			<DrawerContent>
				<DrawerHeader><DrawerTitle>Parent</DrawerTitle><DrawerDescription>The child stacks on top and this one scales back.</DrawerDescription></DrawerHeader>
				<Drawer>
					<DrawerTrigger asChild><Button>Open child</Button></DrawerTrigger>
					<DrawerContent><DrawerHeader><DrawerTitle>Child</DrawerTitle><DrawerDescription>Nested drawer.</DrawerDescription></DrawerHeader><DrawerFooter><DrawerClose asChild><Button variant="outline">Close child</Button></DrawerClose></DrawerFooter></DrawerContent>
				</Drawer>
			</DrawerContent>
		</Drawer>
	),
};

export const NoHandle: Story = {
	render: () => (
		<Drawer showSwipeHandle={false}>
			<DrawerTrigger asChild><Button variant="outline">No handle</Button></DrawerTrigger>
			<DrawerContent><Body title="No handle" /></DrawerContent>
		</Drawer>
	),
};

export const Controlled: Story = {
	render: () => {
		const [open, setOpen] = useState(false);
		const [snap, setSnap] = useState<DrawerSnapPoint | null>(0.4);
		return (
			<div className="flex items-center gap-3">
				<Button onClick={() => setOpen(true)}>Open</Button>
				<span className="text-sm text-muted">open: {String(open)} · snap: {String(snap)}</span>
				<Drawer open={open} onOpenChange={setOpen} snapPoints={[0.4, 0.8]} snapPoint={snap} onSnapPointChange={setSnap}>
					<DrawerContent><Body title="Controlled" /></DrawerContent>
				</Drawer>
			</div>
		);
	},
};
