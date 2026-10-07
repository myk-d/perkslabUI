import React, { createContext, useCallback, useContext, useLayoutEffect, useRef, useState } from 'react';
import { __setConfirmRef } from '../../helpers/services/ConfirmService';
import { ConfirmOptions, ConfirmRequest } from '../../helpers/types/confirm';
import { usePresence } from '../../lib/presence';
import { ConfirmDialog } from './ConfirmDialog';

type AskFn = (message: string, options?: ConfirmOptions) => Promise<boolean>;
const ConfirmContext = createContext<AskFn | null>(null);

export const ConfirmProvider: React.FC<{ children: React.ReactNode; defaults?: ConfirmOptions }> = ({ children, defaults }) => {
	// The last request stays in state while the exit animation plays; `open` flags whether it is still awaiting an answer.
	const [request, setRequest] = useState<ConfirmRequest | null>(null);
	const [open, setOpen] = useState(false);
	const { mounted } = usePresence(open);
	const resolveRef = useRef<((value: boolean) => void) | null>(null);

	const ask = useCallback<AskFn>(
		(message, options) =>
			new Promise<boolean>((resolve) => {
				resolveRef.current?.(false); // a newer question supersedes an unanswered one
				resolveRef.current = resolve;
				setOpen(true);
				setRequest({ id: Math.random().toString(36).slice(2, 9), message, ...defaults, ...options });
			}),
		[defaults],
	);

	useLayoutEffect(() => {
		__setConfirmRef(ask);
	}, [ask]);

	const settle = (value: boolean) => {
		resolveRef.current?.(value);
		resolveRef.current = null;
		setOpen(false);
	};

	return (
		<ConfirmContext.Provider value={ask}>
			{children}
			{request && mounted && <ConfirmDialog request={request} closing={!open} onConfirm={() => settle(true)} onCancel={() => settle(false)} />}
		</ConfirmContext.Provider>
	);
};

/** `const confirm = useConfirm(); if (await confirm('Delete?', { variant: 'danger' })) …` */
// eslint-disable-next-line react-refresh/only-export-components
export const useConfirm = () => {
	const ctx = useContext(ConfirmContext);
	if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
	return ctx;
};
