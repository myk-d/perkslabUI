import dayjs from 'dayjs';
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
	Accordion, AccordionContent, AccordionItem, AccordionTrigger, Alert, Avatar, Badge, BrandColorPicker, Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
	Checkbox, ConfirmProvider, DatePicker, DateTimePicker, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
	EmptyState, ErrorBoundary, Field, FileDropzone, Input, Modal, ModalActionButton, ModalCloseButton, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle, ModalTrigger,
	PageLoader, PeriodNavigator, PriorityPicker, RecurrencePicker, TagPicker, nextTagColor, type Tag, type RecurrenceRule, type Priority, Popover, PopoverContent, PopoverTrigger, Progress, Radio, RadioGroup, Select, Separator, Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger, Skeleton, Spinner, Stat, StatGroup,
	SupportButton, Switch, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Tabs, TabsContent, TabsList, TabsTrigger, Textarea, ThemeProvider, ThemeSwitcher,
	ToastProvider, ToastService, Tooltip, UiStyleSwitcher, useAppTheme, useConfirm, type ThemeDefinition,
} from 'perkslab-ui';
import './styles.css';

const customThemes: ThemeDefinition[] = [
	{ id: 'teal-light', name: 'Teal Light', mode: 'light', group: 'Custom', colors: { brand: '#0d9488', background: '#f0fdfa', foreground: '#134e4a' } },
	{ id: 'teal-dark', name: 'Teal Dark', mode: 'dark', group: 'Custom', colors: { brand: '#2dd4bf', background: '#042f2e', foreground: '#ccfbf1' } },
];

const countries = ['Ukraine', 'Poland', 'Germany', 'France', 'Spain', 'Italy', 'Portugal', 'Sweden', 'Norway', 'Canada'].map((c) => ({ value: c.toLowerCase(), label: c }));

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
	<section className="flex flex-col gap-4">
		<h2 className="ui-heading text-xl">{title}</h2>
		<div className="flex flex-wrap items-start gap-4">{children}</div>
	</section>
);

function Gallery() {
	const { theme, ui } = useAppTheme();
	const confirm = useConfirm();
	const [date, setDate] = useState<dayjs.Dayjs | null>(dayjs());
	const [dateTime, setDateTime] = useState(dayjs());
	const [country, setCountry] = useState<string>();
	const [on, setOn] = useState(true);
	const [plan, setPlan] = useState('pro');
	const [month, setMonth] = useState(dayjs());
	const [priority, setPriority] = useState<Priority>('medium');
	const [tags, setTags] = useState<Tag[]>([{ id: '1', name: 'work', color: 'sky' }, { id: '2', name: 'home', color: 'emerald' }]);
	const [tagIds, setTagIds] = useState<string[]>(['1']);
	const [rule, setRule] = useState<RecurrenceRule | null>(null);

	return (
		<div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-8 pb-32">
			<header className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<h1 className="ui-heading text-3xl">perkslab-ui</h1>
					<p className="text-sm text-muted">
						theme <b>{theme}</b> · ui <b>{ui}</b>
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-3">
					<BrandColorPicker />
					<UiStyleSwitcher />
					<ThemeSwitcher showSystem />
				</div>
			</header>

			<Section title="Buttons">
				<Button>Default</Button>
				<Button variant="secondary">Secondary</Button>
				<Button variant="outline">Outline</Button>
				<Button variant="ghost">Ghost</Button>
				<Button variant="link">Link</Button>
				<Button variant="danger">Danger</Button>
				<Button variant="success">Success</Button>
				<Button variant="warning">Warning</Button>
				<Button variant="info">Info</Button>
				<Button isLoading>Loading</Button>
				<Button disabled>Disabled</Button>
				<Button size="sm">Small</Button>
				<Button size="lg">Large</Button>
				<Button asChild variant="outline"><a href="#top">As link</a></Button>
			</Section>

			<Section title="Form controls">
				<div className="grid w-full gap-4 sm:grid-cols-2">
					<Field label="Email" hint="We never share it">{(p) => <Input placeholder="you@example.com" {...p} />}</Field>
					<Field label="Password" error="Too short">{(p) => <Input type="password" defaultValue="abc" {...p} />}</Field>
					<Select label="Country" options={countries} value={country} onChange={setCountry} searchable placeholder="Pick a country" />
					<Field label="Message">{(p) => <Textarea placeholder="Write something…" {...p} />}</Field>
					<DatePicker value={date} onChange={setDate} shortcuts={{ today: 'Today', tomorrow: 'Tomorrow' }} />
					<DateTimePicker value={dateTime} onChange={setDateTime} />
				</div>
				<Checkbox label="Accept terms" defaultChecked />
				<Checkbox label="Indeterminate" indeterminate />
				<Switch checked={on} onCheckedChange={setOn} label="Notifications" />
				<RadioGroup value={plan} onValueChange={setPlan} orientation="horizontal">
					<Radio value="free" label="Free" />
					<Radio value="pro" label="Pro" />
				</RadioGroup>
			</Section>

			<Section title="Overlays">
				<Modal>
					<ModalTrigger><Button>Open modal</Button></ModalTrigger>
					<ModalContent showCloseButton>
						<ModalHeader>
							<ModalTitle>Delete project?</ModalTitle>
							<ModalDescription>This action cannot be undone.</ModalDescription>
						</ModalHeader>
						<Field label="Type the name">{(p) => <Input {...p} />}</Field>
						<DatePicker value={date} onChange={setDate} />
						<ModalFooter>
							<ModalCloseButton><Button variant="outline">Cancel</Button></ModalCloseButton>
							<ModalActionButton onClick={() => ToastService.success('Deleted')}><Button variant="danger">Delete</Button></ModalActionButton>
						</ModalFooter>
					</ModalContent>
				</Modal>
				<Sheet>
					<SheetTrigger><Button variant="outline">Open sheet</Button></SheetTrigger>
					<SheetContent showCloseButton>
						<SheetTitle>Filters</SheetTitle>
						<SheetDescription>Narrow the results.</SheetDescription>
						<Checkbox label="Only active" />
					</SheetContent>
				</Sheet>
				<Button variant="outline" onClick={async () => ToastService.info((await confirm('Really?', { variant: 'danger', confirmLabel: 'Yes' })) ? 'Confirmed' : 'Cancelled')}>Confirm</Button>
				<Button variant="ghost" onClick={() => ToastService.success('Saved', { title: 'Done' })}>Success toast</Button>
				<Button variant="ghost" onClick={() => ToastService.error('Something broke')}>Error toast</Button>
				<Button variant="ghost" onClick={() => ToastService.warning('Careful')}>Warning toast</Button>
				<Tooltip content="I am a tooltip"><Button variant="outline">Hover me</Button></Tooltip>
				<Popover>
					<PopoverTrigger><Button variant="outline">Popover</Button></PopoverTrigger>
					<PopoverContent><p className="text-sm">Anything can live in here.</p></PopoverContent>
				</Popover>
				<DropdownMenu>
					<DropdownMenuTrigger><Button variant="outline">Menu</Button></DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuLabel>Account</DropdownMenuLabel>
						<DropdownMenuItem>Profile</DropdownMenuItem>
						<DropdownMenuItem>Settings</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem destructive>Log out</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</Section>

			<Section title="Planner pieces">
				<PeriodNavigator label={month.format('MMMM YYYY')} onPrev={() => setMonth(month.subtract(1, 'month'))} onNext={() => setMonth(month.add(1, 'month'))} onToday={() => setMonth(dayjs())} />
				<PriorityPicker value={priority} onChange={setPriority} />
				<div className="w-64"><TagPicker allTags={tags} selectedTagIds={tagIds} onToggle={(id) => setTagIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))} onCreate={(name) => { const t = { id: String(Date.now()), name, color: nextTagColor(tags.length) }; setTags([...tags, t]); setTagIds([...tagIds, t.id]); }} onDeleteTag={(t) => setTags(tags.filter((x) => x.id !== t.id))} /></div>
				<RecurrencePicker value={rule} anchorDate={date?.format('YYYY-MM-DD') ?? null} onChange={setRule} />
				<PageLoader className="py-0" />
			</Section>

			<Section title="Data display">
				<StatGroup className="w-full">
					<Stat label="Books" value="128" hint="+4 this week" />
					<Stat label="Pages read" value="12,480" />
					<Stat label="Streak" value="17 days" />
				</StatGroup>
				<Table containerClassName="w-full">
					<TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Progress</TableHead></TableRow></TableHeader>
					<TableBody>
						<TableRow><TableCell>Dune</TableCell><TableCell><Badge variant="success">Reading</Badge></TableCell><TableCell className="text-right font-mono">64%</TableCell></TableRow>
						<TableRow><TableCell>Solaris</TableCell><TableCell><Badge variant="outline">Queued</Badge></TableCell><TableCell className="text-right font-mono">0%</TableCell></TableRow>
						<TableRow><TableCell>Hyperion</TableCell><TableCell><Badge variant="danger">Dropped</Badge></TableCell><TableCell className="text-right font-mono">12%</TableCell></TableRow>
					</TableBody>
				</Table>
				<div className="flex flex-wrap gap-2">
					<Badge>Default</Badge><Badge variant="secondary">Secondary</Badge><Badge variant="outline">Outline</Badge><Badge variant="info">Info</Badge><Badge variant="warning">Warning</Badge>
					<Avatar name="Mykola Dzoban" /><Spinner />
				</div>
				<div className="grid w-full gap-3 sm:grid-cols-2">
					<Alert variant="info" title="Heads up">A new version is available.</Alert>
					<Alert variant="danger" title="Failed">Could not save your changes.</Alert>
				</div>
				<Progress value={64} />
				<div className="flex w-full gap-3"><Skeleton className="h-10 w-10 rounded-full" /><div className="flex flex-1 flex-col gap-2"><Skeleton className="h-3 w-1/2" /><Skeleton className="h-3 w-3/4" /></div></div>
				<Card>
					<CardHeader><CardTitle>Card title</CardTitle><CardDescription>Short description of the card.</CardDescription></CardHeader>
					<CardContent>Body content goes here.</CardContent>
					<CardFooter><Button size="sm">Action</Button><Button size="sm" variant="ghost">Cancel</Button></CardFooter>
				</Card>
				<div className="flex min-w-72 flex-1 flex-col gap-4">
					<Tabs defaultValue="a">
						<TabsList><TabsTrigger value="a">Books</TabsTrigger><TabsTrigger value="b">Marks</TabsTrigger><TabsTrigger value="c">Stats</TabsTrigger></TabsList>
						<TabsContent value="a">Your library.</TabsContent><TabsContent value="b">Bookmarks.</TabsContent><TabsContent value="c">Statistics.</TabsContent>
					</Tabs>
					<Accordion defaultValue="1">
						<AccordionItem value="1"><AccordionTrigger>What is this?</AccordionTrigger><AccordionContent>A themable React UI kit.</AccordionContent></AccordionItem>
						<AccordionItem value="2"><AccordionTrigger>Can I recolour it?</AccordionTrigger><AccordionContent>Yes — pick a brand colour above.</AccordionContent></AccordionItem>
					</Accordion>
				</div>
				<FileDropzone onFiles={(f) => ToastService.info(`${f.length} file(s)`)} hint="EPUB · FB2 · TXT" />
				<EmptyState title="Nothing here yet" description="Add your first item to get started." action={<Button size="sm">Add item</Button>} />
			</Section>
			<Separator />
			<ErrorBoundary><p className="text-sm text-muted">ErrorBoundary wraps this paragraph.</p></ErrorBoundary>
			<SupportButton supportEmail="hello@example.com" />
		</div>
	);
}

// ?ui=silk&theme=paper-light — handy for sharing/screenshotting a specific combination
const params = new URLSearchParams(location.search);
if (params.get('theme')) localStorage.setItem('app-theme', params.get('theme')!);
if (params.get('ui')) localStorage.setItem('app-theme-ui', params.get('ui')!);

createRoot(document.getElementById('root')!).render(
	<ThemeProvider themes={customThemes} defaultTheme="light">
		<ToastProvider>
			<ConfirmProvider>
				<Gallery />
			</ConfirmProvider>
		</ToastProvider>
	</ThemeProvider>,
);
