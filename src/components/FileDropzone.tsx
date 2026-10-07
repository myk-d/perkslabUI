import React, { useId, useRef, useState } from 'react';
import { cn } from '../lib/cn';
import { UploadIcon } from '../lib/icons';
import { Button } from './Button';

export interface FileDropzoneProps {
	onFiles: (files: File[]) => void;
	/** Same format as <input accept>, e.g. ".epub,.fb2". */
	accept?: string;
	multiple?: boolean;
	disabled?: boolean;
	title?: React.ReactNode;
	buttonLabel?: React.ReactNode;
	hint?: React.ReactNode;
	className?: string;
}

/** Drag-and-drop area with a "choose files" fallback button (keyboard + screen-reader friendly). */
export const FileDropzone = ({ onFiles, accept, multiple = true, disabled, title = 'Drop files here', buttonLabel = 'Choose files', hint, className }: FileDropzoneProps) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const hintId = useId();
	const [over, setOver] = useState(false);

	const handle = (list: FileList | null) => {
		const files = Array.from(list ?? []);
		if (files.length) onFiles(multiple ? files : files.slice(0, 1));
	};

	return (
		<div
			onDragOver={(e) => {
				e.preventDefault();
				if (!disabled) setOver(true);
			}}
			onDragLeave={() => setOver(false)}
			onDrop={(e) => {
				e.preventDefault();
				setOver(false);
				if (!disabled) handle(e.dataTransfer.files);
			}}
			className={cn(
				'flex flex-col items-center gap-3 rounded-box border-2 border-dashed border-line bg-surface px-5 py-8 text-center text-page-text transition-colors',
				over && 'border-brand bg-brand-bg',
				disabled && 'opacity-50',
				className,
			)}
		>
			<UploadIcon className="size-7 text-muted" />
			<p className="font-medium">{title}</p>
			<Button type="button" size="sm" disabled={disabled} onClick={() => inputRef.current?.click()} aria-describedby={hint ? hintId : undefined}>
				{buttonLabel}
			</Button>
			<input
				ref={inputRef}
				type="file"
				hidden
				accept={accept}
				multiple={multiple}
				disabled={disabled}
				onChange={(e) => {
					handle(e.target.files);
					e.target.value = ''; // allow choosing the same file again
				}}
			/>
			{hint && (
				<p id={hintId} className="text-xs text-muted">
					{hint}
				</p>
			)}
		</div>
	);
};
