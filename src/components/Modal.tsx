import { DialogAction, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, Dialog, DialogTitle, DialogTrigger, type DialogContentProps, type DialogProps } from './Dialog';

/**
 * Modal is an alias of Dialog (kept for existing code): `<Modal><ModalTrigger/><ModalContent>…</ModalContent></Modal>`.
 * Pass `open`/`onOpenChange` to control it from outside.
 */
export const Modal = Dialog;
export type ModalProps = DialogProps;
export const ModalTrigger = DialogTrigger;
export const ModalContent = DialogContent;
export type ModalContentProps = DialogContentProps;
export const ModalHeader = DialogHeader;
export const ModalFooter = DialogFooter;
export const ModalBody = DialogBody;
export const ModalTitle = DialogTitle;
export const ModalDescription = DialogDescription;
export const ModalClose = DialogClose;
export const ModalCloseButton = DialogClose;
/** Runs `onClick`, then closes. */
export const ModalActionButton = DialogAction;
