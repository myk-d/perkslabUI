import type { Meta, StoryObj } from '@storybook/react-vite';
import {
	Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem,
	SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarProvider, SidebarRail, SidebarSeparator, SidebarTrigger,
} from 'perkslab-ui';

const meta = { title: 'Navigation/Sidebar', parameters: { layout: 'fullscreen' } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const Dot = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><circle cx="12" cy="12" r="8" /></svg>;

const Demo = ({ side, variant, collapsible }: { side?: 'left' | 'right'; variant?: 'sidebar' | 'floating' | 'inset'; collapsible?: 'offcanvas' | 'icon' | 'none' }) => (
	<SidebarProvider>
		<Sidebar side={side} variant={variant} collapsible={collapsible}>
			<SidebarHeader><span className="ui-heading px-2 py-1 text-lg group-data-[collapsed=true]/sidebar:hidden">Acme</span></SidebarHeader>
			<SidebarSeparator />
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Platform</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem><SidebarMenuButton isActive tooltip="Dashboard"><Dot /><span>Dashboard</span></SidebarMenuButton><SidebarMenuBadge>12</SidebarMenuBadge></SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton tooltip="Projects"><Dot /><span>Projects</span></SidebarMenuButton>
								<SidebarMenuSub>
									<SidebarMenuSubItem><SidebarMenuSubButton asChild isActive><a href="#a">Active</a></SidebarMenuSubButton></SidebarMenuSubItem>
									<SidebarMenuSubItem><SidebarMenuSubButton asChild><a href="#b">Archived</a></SidebarMenuSubButton></SidebarMenuSubItem>
								</SidebarMenuSub>
							</SidebarMenuItem>
							<SidebarMenuItem><SidebarMenuButton tooltip="Settings"><Dot /><span>Settings</span></SidebarMenuButton></SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter><SidebarMenuButton tooltip="Account"><Dot /><span>Account</span></SidebarMenuButton></SidebarFooter>
			<SidebarRail />
		</Sidebar>
		<SidebarInset>
			<header className="flex h-12 items-center gap-2 px-4"><SidebarTrigger /><span className="text-sm text-muted">Ctrl/Cmd + B toggles</span></header>
			<div className="p-6">Page content</div>
		</SidebarInset>
	</SidebarProvider>
);

export const Default: Story = { render: () => <Demo /> };
export const IconCollapsible: Story = { render: () => <Demo collapsible="icon" /> };
export const Floating: Story = { render: () => <Demo variant="floating" collapsible="icon" /> };
export const Inset: Story = { render: () => <Demo variant="inset" /> };
export const Right: Story = { render: () => <Demo side="right" /> };
