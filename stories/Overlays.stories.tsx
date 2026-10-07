import type { Meta, StoryObj } from '@storybook/react-vite';
import {
	Button, Checkbox, ConfirmService, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, Field, Input, Modal, ModalActionButton,
	ModalCloseButton, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle, ModalTrigger, Popover, PopoverContent, PopoverTrigger, Sheet, SheetContent, SheetDescription, SheetTitle,
	SheetClose, SheetFooter, SheetHeader, SheetTrigger, ToastService, Tooltip, useConfirm,
} from 'perkslab-ui';

const meta = { title: 'Overlays/Overview', parameters: { layout: 'padded' } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const ModalDialog: Story = {
	render: () => (
		<Modal>
			<ModalTrigger asChild><Button>Open modal</Button></ModalTrigger>
			<ModalContent>
				<ModalHeader><ModalTitle>Delete project?</ModalTitle><ModalDescription>This action cannot be undone.</ModalDescription></ModalHeader>
				<Field label="Type the name">{(p) => <Input {...p} />}</Field>
				<ModalFooter>
					<ModalCloseButton><Button variant="outline">Cancel</Button></ModalCloseButton>
					<ModalActionButton onClick={() => ToastService.success('Deleted')}><Button variant="danger">Delete</Button></ModalActionButton>
				</ModalFooter>
			</ModalContent>
		</Modal>
	),
};

export const SheetPanel: Story = {
	render: () => (
		<div className="flex gap-3">
			{(['right', 'left', 'top', 'bottom'] as const).map((side) => (
				<Sheet key={side}>
					<SheetTrigger asChild><Button variant="outline">{side}</Button></SheetTrigger>
					<SheetContent side={side}>
						<SheetHeader><SheetTitle>Filters</SheetTitle><SheetDescription>Narrow the results.</SheetDescription></SheetHeader>
						<Checkbox label="Only active" />
						<SheetFooter><SheetClose asChild><Button>Apply</Button></SheetClose></SheetFooter>
					</SheetContent>
				</Sheet>
			))}
		</div>
	),
};

export const SheetNoClose: Story = {
	render: () => (
		<Sheet>
			<SheetTrigger asChild><Button variant="outline">Sheet without X</Button></SheetTrigger>
			<SheetContent showCloseButton={false}><SheetTitle>No X</SheetTitle><SheetDescription>Escape or the overlay closes it.</SheetDescription></SheetContent>
		</Sheet>
	),
};

export const Toasts: Story = {
	render: () => (
		<div className="flex flex-wrap gap-3">
			<Button variant="success" onClick={() => ToastService.success('Saved', { title: 'Done' })}>Success</Button>
			<Button variant="danger" onClick={() => ToastService.error('Something broke')}>Error</Button>
			<Button variant="warning" onClick={() => ToastService.warning('Careful')}>Warning</Button>
			<Button variant="info" onClick={() => ToastService.info('FYI', { duration: 0 })}>Sticky info</Button>
		</div>
	),
};

export const Confirm: Story = {
	render: () => {
		const confirm = useConfirm();
		return (
			<div className="flex gap-3">
				<Button variant="outline" onClick={async () => ToastService.info((await confirm('Really delete?', { variant: 'danger', confirmLabel: 'Delete' })) ? 'Confirmed' : 'Cancelled')}>useConfirm()</Button>
				<Button variant="outline" onClick={async () => ToastService.info((await ConfirmService.confirm('Continue?')) ? 'Yes' : 'No')}>ConfirmService</Button>
			</div>
		);
	},
};

export const Floating: Story = {
	render: () => (
		<div className="flex gap-3">
			<Tooltip content="I am a tooltip"><Button variant="outline">Hover me</Button></Tooltip>
			<Popover><PopoverTrigger><Button variant="outline">Popover</Button></PopoverTrigger><PopoverContent><p className="text-sm">Anything can live in here.</p></PopoverContent></Popover>
			<DropdownMenu>
				<DropdownMenuTrigger><Button variant="outline">Menu</Button></DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuLabel>Account</DropdownMenuLabel><DropdownMenuItem>Profile</DropdownMenuItem><DropdownMenuItem>Settings</DropdownMenuItem>
					<DropdownMenuSeparator /><DropdownMenuItem destructive>Log out</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	),
};
