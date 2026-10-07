import React, { useState } from 'react';
import { cn } from '../lib/cn';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, useMenu } from './DropdownMenu';

/** Right-click (or long-press on touch) menu. Items are the same as DropdownMenu's. */
export const ContextMenu = DropdownMenu;
export const ContextMenuContent = DropdownMenuContent;
export const ContextMenuItem = DropdownMenuItem;
export const ContextMenuLabel = DropdownMenuLabel;
export const ContextMenuSeparator = DropdownMenuSeparator;

function VirtualAnchor({ x, y }: { x: number; y: number }) {
	const { anchorRef } = useMenu();
	return <span ref={anchorRef as React.RefObject<HTMLSpanElement>} aria-hidden="true" style={{ position: 'fixed', left: x, top: y, width: 0, height: 0 }} />;
}

/**
 * Wrap the area that owns the menu: `<ContextMenu><ContextMenuTrigger>…</ContextMenuTrigger><ContextMenuContent>…</ContextMenuContent></ContextMenu>`.
 * The menu opens at the pointer.
 */
export const ContextMenuTrigger = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
	const { setOpen } = useMenu();
	const [pos, setPos] = useState({ x: 0, y: 0 });
	let press: ReturnType<typeof setTimeout> | undefined;
	return (
		<div
			className={cn(className)}
			onContextMenu={(e) => {
				e.preventDefault();
				setPos({ x: e.clientX, y: e.clientY });
				setOpen(true);
			}}
			onTouchStart={(e) => {
				const t = e.touches[0];
				press = setTimeout(() => {
					setPos({ x: t.clientX, y: t.clientY });
					setOpen(true);
				}, 500);
			}}
			onTouchEnd={() => clearTimeout(press)}
			onTouchMove={() => clearTimeout(press)}
			{...props}
		>
			<VirtualAnchor {...pos} />
			{children}
		</div>
	);
};
