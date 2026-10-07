import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
	Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarLabel, MenubarMenu, MenubarRadioGroup, MenubarRadioItem, MenubarSeparator, MenubarShortcut, MenubarSub, MenubarSubContent,
	MenubarSubTrigger, MenubarTrigger,
} from 'perkslab-ui';

const meta = { title: 'Navigation/Menubar', parameters: { layout: 'padded' } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => {
		const [grid, setGrid] = useState(true);
		const [view, setView] = useState('comfortable');
		return (
			<Menubar>
				<MenubarMenu>
					<MenubarTrigger>File</MenubarTrigger>
					<MenubarContent>
						<MenubarItem>New tab <MenubarShortcut>⌘T</MenubarShortcut></MenubarItem>
						<MenubarItem>New window <MenubarShortcut>⌘N</MenubarShortcut></MenubarItem>
						<MenubarItem disabled>New incognito window</MenubarItem>
						<MenubarSeparator />
						<MenubarSub>
							<MenubarSubTrigger>Share</MenubarSubTrigger>
							<MenubarSubContent>
								<MenubarItem>Email link</MenubarItem>
								<MenubarItem>Messages</MenubarItem>
							</MenubarSubContent>
						</MenubarSub>
						<MenubarSeparator />
						<MenubarItem>Print <MenubarShortcut>⌘P</MenubarShortcut></MenubarItem>
					</MenubarContent>
				</MenubarMenu>
				<MenubarMenu>
					<MenubarTrigger>Edit</MenubarTrigger>
					<MenubarContent>
						<MenubarItem>Undo <MenubarShortcut>⌘Z</MenubarShortcut></MenubarItem>
						<MenubarItem>Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut></MenubarItem>
						<MenubarSeparator />
						<MenubarItem destructive>Delete</MenubarItem>
					</MenubarContent>
				</MenubarMenu>
				<MenubarMenu>
					<MenubarTrigger>View</MenubarTrigger>
					<MenubarContent>
						<MenubarCheckboxItem checked={grid} onCheckedChange={setGrid} keepOpen>Show grid</MenubarCheckboxItem>
						<MenubarSeparator />
						<MenubarLabel>Density</MenubarLabel>
						<MenubarRadioGroup value={view} onValueChange={setView}>
							<MenubarRadioItem value="compact" keepOpen>Compact</MenubarRadioItem>
							<MenubarRadioItem value="comfortable" keepOpen>Comfortable</MenubarRadioItem>
						</MenubarRadioGroup>
					</MenubarContent>
				</MenubarMenu>
			</Menubar>
		);
	},
};
