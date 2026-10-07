import type { Meta, StoryObj } from '@storybook/react-vite';
import dayjs from 'dayjs';
import { useState } from 'react';
import { Calendar, Checkbox, DatePicker, DateTimePicker, Field, FileDropzone, Input, Radio, RadioGroup, Select, Switch, Textarea, ToastService } from 'perkslab-ui';

const meta = { title: 'Forms/Overview', parameters: { layout: 'padded' } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const InputStates: Story = {
	render: () => (
		<div className="grid w-96 gap-4">
			<Field label="Email" hint="We never share it">{(p) => <Input placeholder="you@example.com" {...p} />}</Field>
			<Field label="Password">{(p) => <Input type="password" defaultValue="secret" {...p} />}</Field>
			<Field label="Name" error="Required" required>{(p) => <Input {...p} />}</Field>
			<Field label="Disabled">{(p) => <Input disabled defaultValue="Read only" {...p} />}</Field>
		</div>
	),
};

export const TextareaField: Story = { render: () => <div className="w-96"><Field label="Message">{(p) => <Textarea placeholder="Write something…" {...p} />}</Field></div> };

export const SelectBasic: Story = {
	render: () => {
		const [v, setV] = useState<string>();
		const options = ['Ukraine', 'Poland', 'Germany', 'France', 'Spain', 'Italy'].map((c) => ({ value: c, label: c }));
		return <div className="w-72"><Select label="Country" options={options} value={v} onChange={setV} searchable /></div>;
	},
};

export const Toggles: Story = {
	render: () => {
		const [plan, setPlan] = useState('pro');
		return (
			<div className="flex flex-col gap-4">
				<Checkbox label="Accept terms" defaultChecked />
				<Checkbox label="Indeterminate" indeterminate />
				<Checkbox label="Disabled" disabled />
				<Switch label="Notifications" defaultChecked />
				<RadioGroup value={plan} onValueChange={setPlan}><Radio value="free" label="Free" /><Radio value="pro" label="Pro" /></RadioGroup>
			</div>
		);
	},
};

export const Dates: Story = {
	render: () => {
		const [d, setD] = useState<dayjs.Dayjs | null>(dayjs());
		const [dt, setDt] = useState(dayjs());
		return (
			<div className="grid w-80 gap-4">
				<DatePicker value={d} onChange={setD} shortcuts={{ today: 'Today', tomorrow: 'Tomorrow' }} />
				<DateTimePicker value={dt} onChange={setDt} />
			</div>
		);
	},
};

export const CalendarOnly: Story = { render: () => { const [d, setD] = useState<dayjs.Dayjs | null>(dayjs()); return <div className="w-80"><Calendar value={d} onSelect={setD} /></div>; } };

export const Dropzone: Story = { render: () => <div className="w-96"><FileDropzone onFiles={(f) => ToastService.info(`${f.length} file(s) dropped`)} hint="EPUB · FB2 · TXT" /></div> };
