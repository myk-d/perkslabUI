import React from 'react';
import { cn } from '../lib/cn';
import { Button, type ButtonProps } from './Button';
import { Modal, ModalActionButton, ModalCloseButton, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle, ModalTrigger } from './Modal';

/**
 * Modal that demands an answer: role="alertdialog", no backdrop-dismiss. Declarative sibling of `useConfirm()` —
 * use this when the dialog has its own trigger or custom content.
 */
export const AlertDialog = Modal;
export const AlertDialogTrigger = ModalTrigger;
export const AlertDialogContent = (props: React.ComponentProps<typeof ModalContent>) => <ModalContent role="alertdialog" showCloseButton={false} closeOnBackdrop={false} {...props} className={cn('sm:max-w-md', props.className)} />;
export const AlertDialogHeader = ModalHeader;
export const AlertDialogFooter = ModalFooter;
export const AlertDialogTitle = ModalTitle;
export const AlertDialogDescription = ModalDescription;

/** Runs `onClick`, then closes. */
export const AlertDialogAction = ({ onClick, ...props }: ButtonProps) => (
	<ModalActionButton asChild onClick={onClick as (() => void) | undefined}>
		<Button {...props} />
	</ModalActionButton>
);
export const AlertDialogCancel = ({ variant = 'outline', ...props }: ButtonProps) => (
	<ModalCloseButton asChild>
		<Button variant={variant} {...props} />
	</ModalCloseButton>
);
