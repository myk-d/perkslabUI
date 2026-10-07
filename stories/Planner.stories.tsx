import type { Meta, StoryObj } from '@storybook/react-vite';
import dayjs from 'dayjs';
import { useState } from 'react';
import { PeriodNavigator, PriorityPicker, RecurrencePicker, TagPicker, nextTagColor, type Priority, type RecurrenceRule, type Tag } from 'perkslab-ui';

const meta = { title: 'Planner/Pickers', parameters: { layout: 'padded' } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Period: Story = {
	render: () => {
		const [m, setM] = useState(dayjs());
		return <PeriodNavigator label={m.format('MMMM YYYY')} onPrev={() => setM(m.subtract(1, 'month'))} onNext={() => setM(m.add(1, 'month'))} onToday={() => setM(dayjs())} />;
	},
};

export const PriorityFlags: Story = { render: () => { const [p, setP] = useState<Priority>('medium'); return <PriorityPicker value={p} onChange={setP} />; } };

export const Tags: Story = {
	render: () => {
		const [tags, setTags] = useState<Tag[]>([{ id: '1', name: 'work', color: 'sky' }, { id: '2', name: 'home', color: 'emerald' }]);
		const [ids, setIds] = useState(['1']);
		return (
			<div className="w-72">
				<TagPicker
					allTags={tags}
					selectedTagIds={ids}
					onToggle={(id) => setIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))}
					onCreate={(name) => { const t = { id: String(Date.now()), name, color: nextTagColor(tags.length) }; setTags([...tags, t]); setIds([...ids, t.id]); }}
					onDeleteTag={(t) => setTags(tags.filter((x) => x.id !== t.id))}
				/>
			</div>
		);
	},
};

export const Recurrence: Story = { render: () => { const [r, setR] = useState<RecurrenceRule | null>(null); return <RecurrencePicker value={r} anchorDate={dayjs().format('YYYY-MM-DD')} onChange={setR} />; } };
