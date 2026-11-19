import dayjs, { type Dayjs } from 'dayjs';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
	Button, Checkbox, ConfirmService, DatePicker, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, Field, Input, Modal, ModalActionButton,
	ModalCloseButton, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle, ModalTrigger, Popover, PopoverContent, PopoverTrigger, Select, Sheet, SheetContent, SheetDescription, SheetTitle,
	SheetClose, SheetFooter, SheetHeader, SheetTrigger, ThemeProvider, ThemeSwitcher, ToastService, Tooltip, useConfirm,
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

export const NestedStacking: Story = {
	render: () => {
		const [date, setDate] = useState<Dayjs | null>(dayjs('2026-06-15'));
		const [country, setCountry] = useState('ua');
		const [modalOpen, setModalOpen] = useState(false);
		return (
			<ThemeProvider persist={false}>
				<div className="flex flex-wrap items-center gap-4">
					<Modal>
						<ModalTrigger asChild><Button>Modal with pickers</Button></ModalTrigger>
						<ModalContent>
							<ModalHeader>
								<ModalTitle>Schedule</ModalTitle>
								<ModalDescription>Escape closes only the topmost picker, keeping the modal open.</ModalDescription>
							</ModalHeader>
							<Select
								label="Country"
								searchable
								value={country}
								onChange={setCountry}
								options={[
									{ value: 'ua', label: 'Ukraine' },
									{ value: 'pl', label: 'Poland' },
									{ value: 'de', label: 'Germany' },
								]}
							/>
							<DatePicker value={date} onChange={setDate} />
						</ModalContent>
					</Modal>

					<Popover>
						<PopoverTrigger><Button variant="outline">Popover to modal</Button></PopoverTrigger>
						<PopoverContent>
							<p className="mb-3 text-sm text-secondary">Open a dialog on top of this popover.</p>
							<Button size="sm" onClick={() => setModalOpen(true)}>Launch dialog</Button>
						</PopoverContent>
					</Popover>
					<Modal open={modalOpen} onOpenChange={setModalOpen}>
						<ModalContent>
							<ModalHeader><ModalTitle>Stacked dialog</ModalTitle><ModalDescription>Must sit above the popover.</ModalDescription></ModalHeader>
						</ModalContent>
					</Modal>

					<div className="h-14 w-56 overflow-hidden rounded-box ui-border border-line bg-surface p-2">
						<ThemeSwitcher showUiStyles />
					</div>
				</div>
			</ThemeProvider>
		);
	},
};
