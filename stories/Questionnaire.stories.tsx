import type { Meta, StoryObj } from '@storybook/react-vite';
import {
	Questionnaire,
	QuestionnaireActions,
	QuestionnaireChoice,
	QuestionnaireChoices,
	QuestionnaireDescription,
	QuestionnaireError,
	QuestionnaireInput,
	QuestionnaireItem,
	QuestionnaireNext,
	QuestionnairePrevious,
	QuestionnaireProgress,
	QuestionnaireSkip,
	QuestionnaireSubmit,
	QuestionnaireTitle,
	ToastService,
	type QuestionnaireItemConfig,
} from 'perkslab-ui';

const meta = { title: 'Forms/Questionnaire' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const submit = (e: React.FormEvent<HTMLFormElement>) => {
	e.preventDefault();
	ToastService.success(JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))));
};

const Frame = ({ children }: { children: React.ReactNode }) => <div className="mx-auto w-full max-w-lg ui-border border-line rounded-box bg-surface p-6 shadow-box">{children}</div>;

const single: QuestionnaireItemConfig[] = [
	{
		name: 'role',
		required: true,
		prompt: 'What best describes you?',
		description: 'Press a number key to pick quickly.',
		choices: [
			{ value: 'dev', label: 'Developer' },
			{ value: 'design', label: 'Designer' },
			{ value: 'pm', label: 'Product manager' },
		],
	},
	{ name: 'team', required: true, prompt: 'How big is your team?', choices: [{ value: '1', label: 'Just me' }, { value: '2-10', label: '2 to 10' }, { value: '10+', label: 'More than 10' }] },
];

export const Single: Story = { render: () => <Frame><Questionnaire items={single} onSubmit={submit} /></Frame> };

export const Multiple: Story = {
	render: () => (
		<Frame>
			<Questionnaire
				onSubmit={submit}
				items={[
					{
						name: 'topics',
						required: true,
						multiple: true,
						prompt: 'Which topics interest you?',
						choices: [
							{ value: 'ui', label: 'Interfaces', shortcut: 'u' },
							{ value: 'a11y', label: 'Accessibility', shortcut: 'a' },
							{ value: 'perf', label: 'Performance', shortcut: 'p' },
						],
					},
				]}
			/>
		</Frame>
	),
};

export const Freeform: Story = {
	render: () => (
		<Frame>
			<Questionnaire
				onSubmit={submit}
				items={[
					{ name: 'source', prompt: 'How did you hear about us?', freeform: true, required: true, choices: [{ value: 'friend', label: 'A friend' }, { value: 'search', label: 'Search' }] },
					{ name: 'notes', prompt: 'Anything else?', description: 'Free text.', freeform: true },
				]}
			/>
		</Frame>
	),
};

export const OptionalWithSkip: Story = {
	render: () => (
		<Frame>
			<Questionnaire
				onSubmit={submit}
				items={[
					{ name: 'name', required: true, prompt: 'Your name', freeform: true },
					{ name: 'newsletter', prompt: 'Subscribe to the newsletter? (optional)', choices: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
					{ name: 'comment', prompt: 'Leave a comment (optional)', freeform: true },
				]}
			/>
		</Frame>
	),
};

export const ConditionalItem: Story = {
	render: () => (
		<Frame>
			<Questionnaire
				onSubmit={submit}
				items={[
					{ name: 'hasPet', required: true, prompt: 'Do you have a pet?', choices: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
					{ name: 'petName', required: true, prompt: "What is your pet's name?", freeform: true, disabled: (a) => a.hasPet !== 'yes' },
					{ name: 'happy', required: true, prompt: 'Are you happy?', choices: [{ value: 'yes', label: 'Yes' }, { value: 'very', label: 'Very' }] },
				]}
			/>
		</Frame>
	),
};

export const ResumeWithDefaultAnswers: Story = {
	render: () => (
		<Frame>
			<Questionnaire items={single} defaultAnswers={{ role: 'design' }} defaultStep={1} onSubmit={submit} />
		</Frame>
	),
};

export const CustomComposition: Story = {
	render: () => (
		<Frame>
			<Questionnaire onSubmit={submit} items={[{ name: 'lang', required: true, prompt: 'Favourite language?', choices: [{ value: 'ts', label: 'TypeScript' }, { value: 'rs', label: 'Rust' }], freeform: true }]}>
				<QuestionnaireProgress label={({ current, count }) => `Step ${current}/${count}`} />
				<QuestionnaireItem name="lang">
					<QuestionnaireTitle>Favourite language?</QuestionnaireTitle>
					<QuestionnaireDescription>Pick one or type your own.</QuestionnaireDescription>
					<QuestionnaireChoices>
						<QuestionnaireChoice value="ts">TypeScript</QuestionnaireChoice>
						<QuestionnaireChoice value="rs">Rust</QuestionnaireChoice>
					</QuestionnaireChoices>
					<QuestionnaireInput />
				</QuestionnaireItem>
				<QuestionnaireError />
				<QuestionnaireActions>
					<QuestionnairePrevious>Previous</QuestionnairePrevious>
					<QuestionnaireSkip />
					<QuestionnaireNext />
					<QuestionnaireSubmit>Finish</QuestionnaireSubmit>
				</QuestionnaireActions>
			</Questionnaire>
		</Frame>
	),
};
