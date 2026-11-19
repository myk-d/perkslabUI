import React, { useEffect, useRef, useState } from 'react';
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
	return <span ref={anchorRef as React.RefObject<HTMLSpanElement>} aria-hidden="true" style={{ position: 'fixed', left: x, top: y, width: 0, height: 0, pointerEvents: 'none' }} />;
}

/**
 * Wrap the area that owns the menu: `<ContextMenu><ContextMenuTrigger>…</ContextMenuTrigger><ContextMenuContent>…</ContextMenuContent></ContextMenu>`.
 * The menu opens at the pointer and repositions immediately on subsequent right-clicks.
 */
export const ContextMenuTrigger = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
	const { setOpen, setRepositionKey } = useMenu();
	const [pos, setPos] = useState({ x: 0, y: 0 });
	const pressRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

	useEffect(() => () => clearTimeout(pressRef.current), []);

	const openAt = (x: number, y: number) => {
		setPos({ x, y });
		setRepositionKey(`${x},${y}`);
		setOpen(true);
	};

	return (
		<div
			className={cn(className)}
			onContextMenu={(e) => {
				e.preventDefault();
				openAt(e.clientX, e.clientY);
			}}
			onTouchStart={(e) => {
				const t = e.touches[0];
				if (!t) return;
				const { clientX, clientY } = t;
				clearTimeout(pressRef.current);
				pressRef.current = setTimeout(() => openAt(clientX, clientY), 500);
			}}
			onTouchEnd={() => clearTimeout(pressRef.current)}
			onTouchMove={() => clearTimeout(pressRef.current)}
			onTouchCancel={() => clearTimeout(pressRef.current)}
			{...props}
		>
			<VirtualAnchor {...pos} />
			{children}
		</div>
	);
};
