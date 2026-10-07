import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef, useState } from 'react';
import {
	Button,
	MessageScroller,
	MessageScrollerButton,
	MessageScrollerContent,
	MessageScrollerItem,
	MessageScrollerViewport,
	useMessageScroller,
	useMessageScrollerVisibility,
} from 'perkslab-ui';

interface Row {
	id: string;
	role: 'user' | 'assistant';
	text: string;
}

const meta = {
	title: 'Chat/MessageScroller',
	component: MessageScroller,
	argTypes: {
		autoScroll: { control: 'boolean' },
		defaultScrollPosition: { control: 'inline-radio', options: ['start', 'end', 'last-anchor'] },
		scrollPreviousItemPeek: { control: { type: 'number', min: 0, max: 120 } },
		preserveScrollOnPrepend: { control: 'boolean' },
	},
	args: { autoScroll: true, defaultScrollPosition: 'end', scrollPreviousItemPeek: 24, preserveScrollOnPrepend: true },
} satisfies Meta<typeof MessageScroller>;
export default meta;
type Story = StoryObj<typeof meta>;

const REPLY =
	'This is a streamed reply. It grows word by word so you can watch the transcript follow it while you stay at the live edge, and stop following as soon as you scroll away. '.repeat(4).split(' ');

const seed = (from: number, n: number): Row[] =>
	Array.from({ length: n }, (_, i) => {
		const k = from + i;
		return k % 2 === 0
			? { id: `m${k}`, role: 'user', text: `Question number ${k / 2 + 1}?` }
			: { id: `m${k}`, role: 'assistant', text: `Answer to question ${(k - 1) / 2 + 1}. ${'Some filler text to give the row height. '.repeat(3 + (k % 4))}` };
	});

const Bubble = ({ row }: { row: Row }) => (
	<div className={row.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
		<div
			className={
				row.role === 'user'
					? 'max-w-[80%] rounded-box bg-brand px-4 py-2 text-sm text-brand-fg'
					: 'max-w-[80%] ui-border border-line rounded-box bg-surface px-4 py-2 text-sm text-page-text'
			}
		>
			{row.text}
		</div>
	</div>
);

const Toolbar = ({ rows, onPrepend }: { rows: Row[]; onPrepend: () => void }) => {
	const { scrollToMessage, scrollToStart } = useMessageScroller();
	const { currentAnchorId, visibleMessageIds } = useMessageScrollerVisibility();
	return (
		<div className="flex flex-wrap items-center gap-2">
			<Button size="sm" variant="outline" onClick={onPrepend}>
				Prepend history
			</Button>
			<Button size="sm" variant="outline" onClick={() => scrollToMessage(rows[Math.floor(rows.length / 2)].id)}>
				Jump to middle
			</Button>
			<Button size="sm" variant="outline" onClick={() => scrollToStart()}>
				To start
			</Button>
			<span className="text-xs text-muted">
				anchor: {currentAnchorId ?? 'none'} · visible: {visibleMessageIds.length}
			</span>
		</div>
	);
};

const Demo = (args: React.ComponentProps<typeof MessageScroller>) => {
	const [rows, setRows] = useState<Row[]>(() => seed(100, 10));
	const [streaming, setStreaming] = useState(false);
	const older = useRef(99);
	const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
	useEffect(() => () => clearInterval(timer.current), []);

	const send = () => {
		if (streaming) return;
		const n = Date.now();
		setRows((r) => [...r, { id: `u${n}`, role: 'user', text: 'Tell me something long, please.' }, { id: `a${n}`, role: 'assistant', text: '' }]);
		setStreaming(true);
		let i = 0;
		timer.current = setInterval(() => {
			i += 1;
			setRows((r) => r.map((row) => (row.id === `a${n}` ? { ...row, text: REPLY.slice(0, i).join(' ') } : row)));
			if (i >= REPLY.length) {
				clearInterval(timer.current);
				setStreaming(false);
			}
		}, 60);
	};

	const prepend = () => {
		const batch = seed(older.current - 5, 6).map((r, i) => ({ ...r, id: `old${older.current - 5 + i}`, text: `[history] ${r.text}` }));
		older.current -= 6;
		setRows((r) => [...batch, ...r]);
	};

	return (
		<div className="mx-auto flex w-full max-w-xl flex-col gap-3">
			<MessageScroller {...args} className="h-[28rem] ui-border border-line rounded-box bg-page-bg">
				<div className="border-b border-line p-2">
					<Toolbar rows={rows} onPrepend={prepend} />
				</div>
				<MessageScrollerViewport aria-label="Conversation">
					<MessageScrollerContent>
						{rows.map((row) => (
							<MessageScrollerItem key={row.id} messageId={row.id} scrollAnchor={row.role === 'user'}>
								<Bubble row={row} />
							</MessageScrollerItem>
						))}
					</MessageScrollerContent>
				</MessageScrollerViewport>
				<MessageScrollerButton />
			</MessageScroller>
			<Button onClick={send} disabled={streaming}>
				{streaming ? 'Streaming…' : 'Send a message'}
			</Button>
		</div>
	);
};

export const Default: Story = { render: (args) => <Demo {...args} /> };
export const OpenAtStart: Story = { args: { defaultScrollPosition: 'start' }, render: (args) => <Demo {...args} /> };
export const OpenAtLastAnchor: Story = { args: { defaultScrollPosition: 'last-anchor' }, render: (args) => <Demo {...args} /> };
export const NoAutoScroll: Story = { args: { autoScroll: false }, render: (args) => <Demo {...args} /> };
