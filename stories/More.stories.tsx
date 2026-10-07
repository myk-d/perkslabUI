import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
	AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AspectRatio, Breadcrumb,
	BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, Button, ButtonGroup, Collapsible, CollapsibleContent, CollapsibleTrigger, Combobox, Command, CommandDialog,
	ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger, DataTable, Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger,
	HoverCard, Avatar, InputGroup, InputGroupAddon, InputGroupInput, InputOTP, Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle, Kbd, KbdGroup, NativeSelect,
	Pagination, Slider, ToastService, Toggle, ToggleGroup, ToggleGroupItem, TypographyBlockquote, TypographyH1, TypographyH2, TypographyInlineCode, TypographyLead, TypographyMuted, TypographyP,
	type DataTableColumn,
} from 'perkslab-ui';

const meta = { title: 'More/Overview', parameters: { layout: 'padded' } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Navigation: Story = {
	render: () => {
		const [page, setPage] = useState(6);
		return (
			<div className="flex flex-col gap-6">
				<Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink href="#">Home</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbLink href="#">Library</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>Dune</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
				<Pagination page={page} pageCount={20} onPageChange={setPage} />
			</div>
		);
	},
};

export const Grouping: Story = {
	render: () => (
		<div className="flex flex-col items-start gap-6">
			<ButtonGroup><Button variant="outline">Years</Button><Button variant="outline">Months</Button><Button variant="outline">Days</Button></ButtonGroup>
			<ToggleGroup type="single" defaultValue="b"><ToggleGroupItem value="a">Left</ToggleGroupItem><ToggleGroupItem value="b">Center</ToggleGroupItem><ToggleGroupItem value="c">Right</ToggleGroupItem></ToggleGroup>
			<div className="flex gap-3"><Toggle variant="outline">Bold</Toggle><Toggle>Italic</Toggle></div>
			<KbdGroup><Kbd>⌘</Kbd><Kbd>K</Kbd></KbdGroup>
		</div>
	),
};

export const FormExtras: Story = {
	render: () => {
		const [otp, setOtp] = useState('');
		const [city, setCity] = useState<string | null>(null);
		const [cities, setCities] = useState(['Kyiv', 'Lviv', 'Odesa', 'Kharkiv'].map((c) => ({ value: c, label: c })));
		return (
			<div className="flex w-96 flex-col gap-5">
				<InputOTP value={otp} onChange={setOtp} onComplete={(v) => ToastService.success(`Code ${v}`)} />
				<Slider defaultValue={40} showValue />
				<InputGroup><InputGroupAddon>https://</InputGroupAddon><InputGroupInput placeholder="example" /><InputGroupAddon>.com</InputGroupAddon></InputGroup>
				<NativeSelect defaultValue="b"><option value="a">Native A</option><option value="b">Native B</option></NativeSelect>
				<Combobox options={cities} value={city} onChange={setCity} onCreate={(l) => { setCities([...cities, { value: l, label: l }]); setCity(l); }} placeholder="Pick a city" />
			</div>
		);
	},
};

export const Overlays: Story = {
	render: () => (
		<div className="flex flex-wrap gap-3">
			<AlertDialog>
				<AlertDialogTrigger><Button variant="danger">Delete account</Button></AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This permanently deletes your account.</AlertDialogDescription></AlertDialogHeader>
					<AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction variant="danger" onClick={() => ToastService.error('Deleted')}>Delete</AlertDialogAction></AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
			<Drawer><DrawerTrigger asChild><Button variant="outline">Open drawer</Button></DrawerTrigger><DrawerContent><DrawerHeader><DrawerTitle>Move goal</DrawerTitle><DrawerDescription>Set your daily activity goal.</DrawerDescription></DrawerHeader></DrawerContent></Drawer>
			<HoverCard content={<div className="flex gap-3"><Avatar name="Mykola D" /><div><p className="font-bold">@perkslab</p><p className="text-muted">Themable React UI kit.</p></div></div>}><a href="#" className="underline">@perkslab</a></HoverCard>
			<ContextMenu>
				<ContextMenuTrigger className="flex h-24 w-64 items-center justify-center rounded-box border border-dashed border-line text-sm text-muted">Right-click here</ContextMenuTrigger>
				<ContextMenuContent><ContextMenuItem>Back</ContextMenuItem><ContextMenuItem>Reload</ContextMenuItem><ContextMenuSeparator /><ContextMenuItem destructive>Delete</ContextMenuItem></ContextMenuContent>
			</ContextMenu>
		</div>
	),
};

const actions = [
	{ heading: 'Suggestions', items: [{ value: 'cal', label: 'Calendar', shortcut: 'G C', onSelect: () => ToastService.info('Calendar') }, { value: 'set', label: 'Settings', keywords: ['preferences'], shortcut: '⌘,' }] },
	{ heading: 'Account', items: [{ value: 'out', label: 'Log out' }, { value: 'dis', label: 'Disabled', disabled: true }] },
];
export const CommandPalette: Story = {
	render: () => {
		const [open, setOpen] = useState(false);
		return (
			<div className="flex w-[28rem] flex-col gap-4">
				<Button variant="outline" onClick={() => setOpen(true)}>Open palette <Kbd>⌘K</Kbd></Button>
				<CommandDialog open={open} onOpenChange={setOpen} hotkey="k" groups={actions} />
				<div className="ui-border rounded-box"><Command groups={actions} /></div>
			</div>
		);
	},
};

export const Layout: Story = {
	render: () => (
		<div className="flex w-96 flex-col gap-6">
			<AspectRatio ratio={16 / 9} className="rounded-box bg-hover"><div className="flex size-full items-center justify-center text-muted">16 / 9</div></AspectRatio>
			<Collapsible><CollapsibleTrigger><Button variant="outline" size="sm">Toggle details</Button></CollapsibleTrigger><CollapsibleContent className="mt-2 text-sm text-muted">Hidden until you ask.</CollapsibleContent></Collapsible>
			<ItemGroup>
				<Item variant="outline"><ItemMedia>★</ItemMedia><ItemContent><ItemTitle>Dune</ItemTitle><ItemDescription>Frank Herbert · 64% read</ItemDescription></ItemContent><ItemActions><Button size="sm" variant="ghost">Open</Button></ItemActions></Item>
			</ItemGroup>
		</div>
	),
};

type Book = { id: string; title: string; author: string; pages: number };
const books: Book[] = ['Dune', 'Solaris', 'Hyperion', 'Neuromancer', 'Foundation', 'Ubik', 'Roadside Picnic', 'Snow Crash', 'Embassytown', 'Blindsight', 'Anathem', 'Ilium'].map((t, i) => ({ id: String(i), title: t, author: ['Herbert', 'Lem', 'Simmons', 'Gibson', 'Asimov', 'Dick'][i % 6], pages: 200 + i * 37 }));
const columns: DataTableColumn<Book>[] = [
	{ key: 'title', header: 'Title', sortable: true },
	{ key: 'author', header: 'Author', sortable: true },
	{ key: 'pages', header: 'Pages', sortable: true, align: 'right' },
];
export const DataTableExample: Story = { render: () => <div className="w-[36rem]"><DataTable columns={columns} data={books} rowKey={(b) => b.id} searchable selectable pageSize={5} /></div> };

export const Type: Story = {
	render: () => (
		<div className="w-[32rem]">
			<TypographyH1>Heading one</TypographyH1><TypographyLead>A lead paragraph.</TypographyLead><TypographyH2>Heading two</TypographyH2>
			<TypographyP>Body copy with <TypographyInlineCode>inline code</TypographyInlineCode>.</TypographyP><TypographyBlockquote>A quote.</TypographyBlockquote><TypographyMuted>Muted note.</TypographyMuted>
		</div>
	),
};
