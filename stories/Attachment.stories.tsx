import type { Meta, StoryObj } from '@storybook/react-vite';
import {
	Attachment, AttachmentAction, AttachmentActions, AttachmentContent, AttachmentDescription, AttachmentGroup, AttachmentMedia, AttachmentTitle, AttachmentTrigger,
} from 'perkslab-ui';
import { CloseIcon, FileIcon, ImageIcon, TrashIcon } from '../src/lib/icons';

const meta = {
	title: 'Chat/Attachment',
	component: Attachment,
	argTypes: {
		state: { control: 'select', options: ['idle', 'uploading', 'processing', 'error', 'done'] },
		size: { control: 'inline-radio', options: ['default', 'sm', 'xs'] },
		orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
	},
} satisfies Meta<typeof Attachment>;
export default meta;
type Story = StoryObj<typeof meta>;

const demo = (props: React.ComponentProps<typeof Attachment>, desc = '2.4 MB · PDF') => (
	<Attachment {...props}>
		<AttachmentMedia><FileIcon /></AttachmentMedia>
		<AttachmentContent>
			<AttachmentTitle>quarterly-report.pdf</AttachmentTitle>
			<AttachmentDescription>{desc}</AttachmentDescription>
		</AttachmentContent>
		<AttachmentActions>
			<AttachmentAction aria-label="Remove"><CloseIcon /></AttachmentAction>
		</AttachmentActions>
	</Attachment>
);

export const Default: Story = { render: (args) => demo(args) };
export const States: Story = {
	render: () => (
		<div className="flex flex-col gap-2">
			{demo({ state: 'idle' }, 'Ready to upload')}
			{demo({ state: 'uploading' }, 'Uploading…')}
			{demo({ state: 'processing' }, 'Processing…')}
			{demo({ state: 'error' }, 'Upload failed')}
			{demo({ state: 'done' })}
		</div>
	),
};
export const Sizes: Story = {
	render: () => (
		<div className="flex flex-col gap-2">
			{demo({ size: 'default' })}
			{demo({ size: 'sm' })}
			{demo({ size: 'xs' })}
		</div>
	),
};
export const Vertical: Story = {
	render: () => (
		<Attachment orientation="vertical">
			<AttachmentMedia variant="image"><img alt="" src="data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='120'%3E%3Crect width='160' height='120' fill='%23888'/%3E%3C/svg%3E" /></AttachmentMedia>
			<AttachmentContent>
				<AttachmentTitle>screenshot.png</AttachmentTitle>
				<AttachmentDescription>840 KB</AttachmentDescription>
			</AttachmentContent>
			<AttachmentActions><AttachmentAction aria-label="Remove"><TrashIcon /></AttachmentAction></AttachmentActions>
		</Attachment>
	),
};
export const Clickable: Story = {
	render: () => (
		<Attachment>
			<AttachmentMedia><ImageIcon /></AttachmentMedia>
			<AttachmentContent>
				<AttachmentTitle>design-v2.png</AttachmentTitle>
				<AttachmentDescription>Click anywhere to open</AttachmentDescription>
			</AttachmentContent>
			<AttachmentTrigger asChild><a href="#open" aria-label="Open design-v2.png" /></AttachmentTrigger>
			<AttachmentActions><AttachmentAction aria-label="Remove"><CloseIcon /></AttachmentAction></AttachmentActions>
		</Attachment>
	),
};
export const Group: Story = {
	render: () => (
		<div className="w-80 max-w-full">
			<AttachmentGroup>
				{['a.pdf', 'b.docx', 'c.xlsx', 'd.png'].map((n) => (
					<Attachment key={n} size="sm" className="w-48">
						<AttachmentMedia><FileIcon /></AttachmentMedia>
						<AttachmentContent><AttachmentTitle>{n}</AttachmentTitle><AttachmentDescription>120 KB</AttachmentDescription></AttachmentContent>
					</Attachment>
				))}
			</AttachmentGroup>
		</div>
	),
};
