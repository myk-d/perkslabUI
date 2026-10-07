import type { Meta, StoryObj } from '@storybook/react-vite';
import { BrandColorPicker, Button, Card, CardContent, CardHeader, CardTitle, ThemeProvider, ThemeSwitcher, UiStyleSwitcher, builtInThemes, uiStyles } from 'perkslab-ui';

const meta = { title: 'Theming/Overview', parameters: { layout: 'padded' } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Switchers: Story = {
	render: () => (
		<ThemeProvider persist={false}>
			<div className="flex flex-wrap items-center gap-4">
				<ThemeSwitcher showSystem showUiStyles />
				<UiStyleSwitcher />
				<BrandColorPicker />
			</div>
		</ThemeProvider>
	),
};

/** Every built-in theme × the same card — use the toolbar's UI switcher to see each structure. */
export const AllThemes: Story = {
	render: () => (
		<div className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-4">
			{builtInThemes.map((t) => (
				<div key={t.id} data-theme={t.id} className="rounded-box bg-page-bg p-4 text-page-text ui-border">
					<Card className="w-full"><CardHeader><CardTitle>{t.name}</CardTitle></CardHeader><CardContent><Button size="sm">Brand</Button></CardContent></Card>
				</div>
			))}
		</div>
	),
};

export const UiStyles: Story = {
	render: () => (
		<div className="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-4">
			{uiStyles.map((s) => (
				<div key={s.id} data-ui={s.id} className="rounded-box bg-page-bg p-4 text-page-text">
					<Card className="w-full"><CardHeader><CardTitle>{s.name}</CardTitle><p className="text-sm text-muted">{s.description}</p></CardHeader><CardContent className="flex gap-2"><Button size="sm">Primary</Button><Button size="sm" variant="outline">Outline</Button></CardContent></Card>
				</div>
			))}
		</div>
	),
};
