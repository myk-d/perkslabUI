import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
	Button, Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, Field, Input,
	ResponsiveDialog, ResponsiveDialogClose, ResponsiveDialogContent, ResponsiveDialogDescription, ResponsiveDialogFooter, ResponsiveDialogHeader, ResponsiveDialogTitle, ResponsiveDialogTrigger,
} from 'perkslab-ui';

const meta = { title: 'Overlays/Dialog', parameters: { layout: 'padded' } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Standard: Story = {
	render: () => (
		<Dialog>
			<DialogTrigger asChild><Button variant="outline">Edit profile</Button></DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit profile</DialogTitle>
					<DialogDescription>Make changes to your profile here. Click save when you are done.</DialogDescription>
				</DialogHeader>
				<Field label="Name">{(p) => <Input {...p} defaultValue="Pedro Duarte" />}</Field>
				<Field label="Username">{(p) => <Input {...p} defaultValue="@peduarte" />}</Field>
				<DialogFooter>
					<DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
					<DialogClose asChild><Button>Save changes</Button></DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	),
};

export const CustomClose: Story = {
	render: () => (
		<Dialog>
			<DialogTrigger asChild><Button variant="outline">Share</Button></DialogTrigger>
			<DialogContent showCloseButton={false}>
				<DialogHeader>
					<DialogTitle>Share link</DialogTitle>
					<DialogDescription>Anyone who has this link will be able to view this.</DialogDescription>
				</DialogHeader>
				<Input readOnly defaultValue="https://perkslab.dev/share/x7Qa" aria-label="Link" />
				<DialogFooter className="sm:justify-start">
					<DialogClose asChild><Button variant="secondary">Close</Button></DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	),
};

export const NoClose: Story = {
	render: () => (
		<Dialog>
			<DialogTrigger asChild><Button variant="outline">No close button</Button></DialogTrigger>
			<DialogContent showCloseButton={false}>
				<DialogHeader>
					<DialogTitle>No close button</DialogTitle>
					<DialogDescription>Close with Escape, by clicking the overlay, or with the button below.</DialogDescription>
				</DialogHeader>
				<DialogFooter><DialogClose asChild><Button>Got it</Button></DialogClose></DialogFooter>
			</DialogContent>
		</Dialog>
	),
};

const paragraphs = Array.from({ length: 14 }, (_, i) => <p key={i} className="text-sm text-muted">Paragraph {i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>);

export const StickyFooter: Story = {
	render: () => (
		<Dialog>
			<DialogTrigger asChild><Button variant="outline">Terms</Button></DialogTrigger>
			<DialogContent>
				<DialogHeader><DialogTitle>Terms and conditions</DialogTitle><DialogDescription>Scroll to read; the footer stays put.</DialogDescription></DialogHeader>
				<DialogBody className="flex flex-col gap-3">{paragraphs}</DialogBody>
				<DialogFooter><DialogClose asChild><Button variant="outline">Decline</Button></DialogClose><DialogClose asChild><Button>Accept</Button></DialogClose></DialogFooter>
			</DialogContent>
		</Dialog>
	),
};

export const Scrollable: Story = {
	render: () => (
		<Dialog>
			<DialogTrigger asChild><Button variant="outline">Scrollable content</Button></DialogTrigger>
			<DialogContent>
				<DialogHeader><DialogTitle>Release notes</DialogTitle><DialogDescription>The header is fixed, the body scrolls.</DialogDescription></DialogHeader>
				<DialogBody className="flex flex-col gap-3">{paragraphs}</DialogBody>
			</DialogContent>
		</Dialog>
	),
};

export const Controlled: Story = {
	render: () => {
		const [open, setOpen] = useState(false);
		return (
			<div className="flex items-center gap-3">
				<Button onClick={() => setOpen(true)}>Open from outside</Button>
				<span className="text-sm text-muted">open: {String(open)}</span>
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogContent>
						<DialogHeader><DialogTitle>Controlled</DialogTitle><DialogDescription>State lives in the parent.</DialogDescription></DialogHeader>
						<DialogFooter><Button onClick={() => setOpen(false)}>Done</Button></DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		);
	},
};

export const ResponsiveDialogStory: Story = {
	name: 'ResponsiveDialog',
	render: () => (
		<ResponsiveDialog>
			<ResponsiveDialogTrigger asChild><Button variant="outline">Edit profile (responsive)</Button></ResponsiveDialogTrigger>
			<ResponsiveDialogContent>
				<ResponsiveDialogHeader>
					<ResponsiveDialogTitle>Edit profile</ResponsiveDialogTitle>
					<ResponsiveDialogDescription>A Dialog from 768px up, a Drawer below.</ResponsiveDialogDescription>
				</ResponsiveDialogHeader>
				<Field label="Email">{(p) => <Input {...p} type="email" defaultValue="shadcn@example.com" />}</Field>
				<ResponsiveDialogFooter>
					<ResponsiveDialogClose asChild><Button variant="outline">Cancel</Button></ResponsiveDialogClose>
					<ResponsiveDialogClose asChild><Button>Save</Button></ResponsiveDialogClose>
				</ResponsiveDialogFooter>
			</ResponsiveDialogContent>
		</ResponsiveDialog>
	),
};
