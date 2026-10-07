import type { Meta, StoryObj } from '@storybook/react-vite';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from 'perkslab-ui';

const meta = {
	title: 'Navigation/NavigationMenu',
	component: NavigationMenu,
	parameters: { layout: 'padded' },
} satisfies Meta<typeof NavigationMenu>;
export default meta;
type Story = StoryObj<typeof meta>;

const items = [
	{ title: 'Introduction', description: 'Re-usable components built with Tailwind.' },
	{ title: 'Installation', description: 'How to install and structure your app.' },
	{ title: 'Theming', description: 'Four UI styles and a set of colour themes.' },
];

export const Default: Story = {
	render: () => (
		<div className="min-h-72">
			<NavigationMenu>
				<NavigationMenuList>
					<NavigationMenuItem>
						<NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
						<NavigationMenuContent>
							<ul className="grid w-80 gap-1">
								{items.map((i) => (
									<li key={i.title}>
										<NavigationMenuLink href="#" className="space-y-1">
											<div className="font-bold">{i.title}</div>
											<p className="text-xs text-muted">{i.description}</p>
										</NavigationMenuLink>
									</li>
								))}
							</ul>
						</NavigationMenuContent>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<NavigationMenuTrigger>Components</NavigationMenuTrigger>
						<NavigationMenuContent>
							<ul className="grid w-72 grid-cols-2 gap-1">
								{['Button', 'Dialog', 'Tabs', 'Popover'].map((c) => (
									<li key={c}>
										<NavigationMenuLink href="#">{c}</NavigationMenuLink>
									</li>
								))}
							</ul>
						</NavigationMenuContent>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<NavigationMenuLink href="#" active className={navigationMenuTriggerStyle()}>
							Docs
						</NavigationMenuLink>
					</NavigationMenuItem>
				</NavigationMenuList>
			</NavigationMenu>
		</div>
	),
};
