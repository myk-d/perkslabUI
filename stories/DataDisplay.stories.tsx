import type { Meta, StoryObj } from '@storybook/react-vite';
import {
	Accordion, AccordionContent, AccordionItem, AccordionTrigger, Alert, Avatar, Badge, Button, Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, EmptyState, ErrorBoundary,
	PageLoader, Progress, Separator, Skeleton, Spinner, Stat, StatGroup, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Tabs, TabsContent, TabsList, TabsTrigger,
} from 'perkslab-ui';

const meta = { title: 'Display/Overview', parameters: { layout: 'padded' } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Badges: Story = { render: () => <div className="flex flex-wrap gap-2">{(['default', 'secondary', 'outline', 'success', 'warning', 'danger', 'info'] as const).map((v) => <Badge key={v} variant={v}>{v}</Badge>)}</div> };

export const Alerts: Story = {
	render: () => (
		<div className="grid w-[32rem] gap-3">
			{(['default', 'info', 'success', 'warning', 'danger'] as const).map((v) => <Alert key={v} variant={v} title={v}>Something worth knowing about.</Alert>)}
		</div>
	),
};

export const CardExample: Story = {
	render: () => (
		<Card>
			<CardHeader><CardTitle>Card title</CardTitle><CardDescription>Short description.</CardDescription><CardAction><Badge variant="outline">New</Badge></CardAction></CardHeader>
			<CardContent>Body content.</CardContent>
			<CardFooter><Button size="sm">Action</Button><Button size="sm" variant="ghost">Cancel</Button></CardFooter>
		</Card>
	),
};

export const TabsExample: Story = {
	render: () => (
		<Tabs defaultValue="a" className="w-96">
			<TabsList><TabsTrigger value="a">Books</TabsTrigger><TabsTrigger value="b">Marks</TabsTrigger><TabsTrigger value="c">Stats</TabsTrigger></TabsList>
			<TabsContent value="a">Your library.</TabsContent><TabsContent value="b">Bookmarks.</TabsContent><TabsContent value="c">Statistics.</TabsContent>
		</Tabs>
	),
};

export const AccordionExample: Story = {
	args: {},
	render: () => (
		<div className="w-96">
			<Accordion type="multiple" defaultValue={['1']}>
				<AccordionItem value="1"><AccordionTrigger>What is this?</AccordionTrigger><AccordionContent>A themable React UI kit.</AccordionContent></AccordionItem>
				<AccordionItem value="2"><AccordionTrigger>Can I recolour it?</AccordionTrigger><AccordionContent>Yes.</AccordionContent></AccordionItem>
			</Accordion>
		</div>
	),
};

export const TableExample: Story = {
	render: () => (
		<div className="w-[32rem]">
			<Table>
				<TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Progress</TableHead></TableRow></TableHeader>
				<TableBody>
					<TableRow><TableCell>Dune</TableCell><TableCell><Badge variant="success">Reading</Badge></TableCell><TableCell className="text-right font-mono">64%</TableCell></TableRow>
					<TableRow><TableCell>Solaris</TableCell><TableCell><Badge variant="outline">Queued</Badge></TableCell><TableCell className="text-right font-mono">0%</TableCell></TableRow>
				</TableBody>
			</Table>
		</div>
	),
};

export const Stats: Story = { render: () => <StatGroup className="w-[32rem]"><Stat label="Books" value="128" hint="+4 this week" /><Stat label="Pages" value="12,480" /><Stat label="Streak" value="17 days" /></StatGroup> };

export const Feedback: Story = {
	render: () => (
		<div className="flex w-96 flex-col gap-4">
			<Progress value={64} />
			<div className="flex items-center gap-3"><Avatar name="Mykola Dzoban" /><Avatar name="Ada" size="lg" /><Spinner /></div>
			<div className="flex gap-3"><Skeleton className="size-10 rounded-full" /><div className="flex flex-1 flex-col gap-2"><Skeleton className="h-3 w-1/2" /><Skeleton className="h-3 w-3/4" /></div></div>
			<Separator />
			<PageLoader className="py-0" />
		</div>
	),
};

export const Empty: Story = { render: () => <EmptyState title="Nothing here yet" description="Add your first item to get started." action={<Button size="sm">Add item</Button>} /> };

const Boom = () => { throw new Error('Boom'); };
export const Boundary: Story = { render: () => <ErrorBoundary><Boom /></ErrorBoundary> };
