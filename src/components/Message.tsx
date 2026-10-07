import React from 'react';
import { cn } from '../lib/cn';

export type MessageAlign = 'start' | 'end';

export interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
	align?: MessageAlign;
}

/** One chat row: avatar + content. `align="end"` reverses the row (the current user). */
export const Message = ({ className, align = 'start', ...props }: MessageProps) => (
	<div
		role="article"
		data-slot="message"
		data-align={align}
		className={cn('group/message flex w-full items-end gap-2', align === 'end' && 'flex-row-reverse', className)}
		{...props}
	/>
);

/** Stack of consecutive messages from one sender; only the last one shows its avatar (the others keep the space). */
export const MessageGroup = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div role="group" data-slot="message-group" className={cn('flex w-full flex-col gap-1 [&>*:not(:last-child)_[data-slot=message-avatar]]:invisible', className)} {...props} />
);

/** Anchored to the bottom of the message; shifts up when a MessageFooter is present. */
export const MessageAvatar = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		data-slot="message-avatar"
		className={cn('flex shrink-0 items-end group-has-[[data-slot=message-footer]]/message:mb-5', className)}
		{...props}
	/>
);

export const MessageContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		data-slot="message-content"
		className={cn('flex min-w-0 flex-1 flex-col gap-1 items-start group-data-[align=end]/message:items-end', className)}
		{...props}
	/>
);

export const MessageHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div data-slot="message-header" className={cn('flex items-center gap-2 px-1 text-xs text-muted ui-label', className)} {...props} />
);

export const MessageFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div data-slot="message-footer" className={cn('flex h-4 items-center gap-2 px-1 text-xs text-muted', className)} {...props} />
);
