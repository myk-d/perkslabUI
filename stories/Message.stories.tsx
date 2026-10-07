import type { Meta, StoryObj } from '@storybook/react-vite';
import {
	Attachment, AttachmentContent, AttachmentDescription, AttachmentMedia, AttachmentTitle, Avatar, Bubble, BubbleContent, BubbleGroup, BubbleReactions, Marker, MarkerContent, MarkerIcon,
	Message, MessageAvatar, MessageContent, MessageFooter, MessageGroup, MessageHeader, Spinner,
} from 'perkslab-ui';
import { AlertIcon, FileIcon } from '../src/lib/icons';

const meta = {
	title: 'Chat/Message',
	component: Message,
	argTypes: { align: { control: 'inline-radio', options: ['start', 'end'] } },
	decorators: [(Story) => <div className="w-[520px] max-w-full"><Story /></div>],
} satisfies Meta<typeof Message>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: (args) => (
		<Message {...args}>
			<MessageAvatar><Avatar name="Perks Bot" size="sm" /></MessageAvatar>
			<MessageContent>
				<MessageHeader>Perks Bot</MessageHeader>
				<Bubble variant="secondary"><BubbleContent>Hi there, what can I do for you?</BubbleContent></Bubble>
				<MessageFooter>Delivered · 10:24</MessageFooter>
			</MessageContent>
		</Message>
	),
};
export const FromUser: Story = {
	render: () => (
		<Message align="end">
			<MessageAvatar><Avatar name="Me Myself" size="sm" /></MessageAvatar>
			<MessageContent>
				<Bubble align="end"><BubbleContent>Show me last month's numbers.</BubbleContent></Bubble>
			</MessageContent>
		</Message>
	),
};
export const Grouped: Story = {
	render: () => (
		<MessageGroup>
			{['One', 'Two', 'Three'].map((t) => (
				<Message key={t}>
					<MessageAvatar><Avatar name="Perks Bot" size="sm" /></MessageAvatar>
					<MessageContent><Bubble variant="secondary"><BubbleContent>{t}</BubbleContent></Bubble></MessageContent>
				</Message>
			))}
		</MessageGroup>
	),
};

export const Conversation: Story = {
	render: () => (
		<div className="flex flex-col gap-4 rounded-box ui-border bg-surface p-4">
			<Marker variant="separator"><MarkerContent>Today</MarkerContent></Marker>

			<Message align="end">
				<MessageAvatar><Avatar name="Me Myself" size="sm" /></MessageAvatar>
				<MessageContent>
					<BubbleGroup align="end">
						<Bubble align="end"><BubbleContent>Can you summarise this report?</BubbleContent></Bubble>
						<Bubble align="end"><BubbleContent>Focus on revenue, please.</BubbleContent></Bubble>
					</BubbleGroup>
					<Attachment size="sm">
						<AttachmentMedia><FileIcon /></AttachmentMedia>
						<AttachmentContent>
							<AttachmentTitle>quarterly-report.pdf</AttachmentTitle>
							<AttachmentDescription>2.4 MB · PDF</AttachmentDescription>
						</AttachmentContent>
					</Attachment>
					<MessageFooter>Read · 10:24</MessageFooter>
				</MessageContent>
			</Message>

			<Message>
				<MessageAvatar><Avatar name="Perks Bot" size="sm" /></MessageAvatar>
				<MessageContent>
					<MessageHeader>Perks Bot</MessageHeader>
					<BubbleGroup>
						<Bubble variant="secondary"><BubbleContent>Sure. Revenue grew 12% quarter over quarter.</BubbleContent></Bubble>
						<Bubble variant="secondary">
							<BubbleContent>The main driver was the new subscription tier.</BubbleContent>
							<BubbleReactions><span>👍 2</span><span>🎉</span></BubbleReactions>
						</Bubble>
					</BubbleGroup>
				</MessageContent>
			</Message>

			<Marker role="status">
				<MarkerIcon><Spinner className="size-4" /></MarkerIcon>
				<MarkerContent shimmer>Perks Bot is writing a chart…</MarkerContent>
			</Marker>

			<Message align="end">
				<MessageAvatar><Avatar name="Me Myself" size="sm" /></MessageAvatar>
				<MessageContent>
					<Bubble variant="destructive" align="end">
						<BubbleContent className="flex items-center gap-2"><AlertIcon /> Failed to send. Tap to retry.</BubbleContent>
					</Bubble>
				</MessageContent>
			</Message>
		</div>
	),
};
