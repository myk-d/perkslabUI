import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, ToastService } from 'perkslab-ui';

const meta = { title: 'Feedback/Toast', parameters: { layout: 'padded' } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Types: Story = {
	render: () => (
		<div className="flex flex-wrap gap-3">
			<Button variant="success" onClick={() => ToastService.success('Saved', { description: 'Your changes are live.' })}>Success</Button>
			<Button variant="danger" onClick={() => ToastService.error('Something broke')}>Error</Button>
			<Button variant="warning" onClick={() => ToastService.warning('Careful')}>Warning</Button>
			<Button variant="info" onClick={() => ToastService.info('FYI', { title: 'Heads up' })}>Info</Button>
		</div>
	),
};

export const WithAction: Story = {
	render: () => <Button variant="outline" onClick={() => ToastService.success('Event deleted', { action: { label: 'Undo', onClick: () => ToastService.info('Restored') } })}>Delete with undo</Button>,
};

export const Loading: Story = {
	render: () => (
		<Button
			variant="outline"
			onClick={() => {
				const id = ToastService.loading('Uploading…');
				setTimeout(() => ToastService.success('Uploaded', { id }), 1800);
			}}
		>
			Loading → success
		</Button>
	),
};

export const PromiseToast: Story = {
	render: () => (
		<div className="flex gap-3">
			<Button variant="outline" onClick={() => ToastService.promise(new Promise((r) => setTimeout(() => r(42), 1500)), { loading: 'Saving…', success: (n) => `Saved (${n})`, error: 'Failed' })}>Resolve</Button>
			<Button variant="outline" onClick={() => ToastService.promise(new Promise<never>((_, reject) => setTimeout(() => reject(new Error('nope')), 1500)), { loading: 'Saving…', success: 'Saved', error: 'Failed' }).catch(() => undefined)}>Reject</Button>
		</div>
	),
};

export const Sticky: Story = { render: () => <div className="flex gap-3"><Button variant="outline" onClick={() => ToastService.info('Stays until closed or swiped', { duration: 0 })}>Sticky (swipe me)</Button><Button variant="ghost" onClick={() => ToastService.dismiss()}>Dismiss all</Button></div> };
