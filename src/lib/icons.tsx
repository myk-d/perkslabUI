import React from 'react';

type IconProps = React.SVGProps<SVGSVGElement>;

const Icon = ({ children, ...props }: IconProps) => (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={2}
		strokeLinecap="round"
		strokeLinejoin="round"
		width="1em"
		height="1em"
		aria-hidden="true"
		{...props}
	>
		{children}
	</svg>
);

export const CheckIcon = (p: IconProps) => (
	<Icon strokeWidth={3} {...p}>
		<path d="M5 13l4 4L19 7" />
	</Icon>
);
export const MinusIcon = (p: IconProps) => (
	<Icon strokeWidth={3} {...p}>
		<path d="M6 12h12" />
	</Icon>
);
export const CloseIcon = (p: IconProps) => (
	<Icon {...p}>
		<path d="M18 6L6 18M6 6l12 12" />
	</Icon>
);
export const ChevronDownIcon = (p: IconProps) => (
	<Icon {...p}>
		<path d="M19 9l-7 7-7-7" />
	</Icon>
);
export const ChevronLeftIcon = (p: IconProps) => (
	<Icon {...p}>
		<path d="M15 19l-7-7 7-7" />
	</Icon>
);
export const ChevronRightIcon = (p: IconProps) => (
	<Icon {...p}>
		<path d="M9 5l7 7-7 7" />
	</Icon>
);
export const CalendarIcon = (p: IconProps) => (
	<Icon strokeWidth={1.5} {...p}>
		<path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
	</Icon>
);
export const EyeIcon = (p: IconProps) => (
	<Icon strokeWidth={1.5} {...p}>
		<path d="M2.04 12.32a1.01 1.01 0 010-.64C3.3 7.7 7.24 4.5 12 4.5c4.76 0 8.77 3.16 10.07 7.5a1.01 1.01 0 010 .64C20.7 16.3 16.76 19.5 12 19.5c-4.76 0-8.77-3.16-10.07-7.5z" />
		<path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
	</Icon>
);
export const EyeOffIcon = (p: IconProps) => (
	<Icon strokeWidth={1.5} {...p}>
		<path d="M3.98 8.22A10.48 10.48 0 001.93 12C3.23 16.34 7.24 19.5 12 19.5c.99 0 1.95-.14 2.86-.4M6.23 6.23A10.45 10.45 0 0112 4.5c4.76 0 8.77 3.16 10.07 7.5a10.52 10.52 0 01-4.29 5.77M6.23 6.23L3 3m3.23 3.23l3.65 3.65m7.89 7.89L21 21m-3.23-3.23l-3.65-3.65m0 0a3 3 0 10-4.24-4.24m4.24 4.24L9.88 9.88" />
	</Icon>
);
export const InfoIcon = (p: IconProps) => (
	<Icon {...p}>
		<circle cx="12" cy="12" r="10" />
		<path d="M12 16v-4m0-4h.01" />
	</Icon>
);
export const AlertIcon = (p: IconProps) => (
	<Icon {...p}>
		<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4m0 4h.01" />
	</Icon>
);
export const SuccessIcon = (p: IconProps) => (
	<Icon {...p}>
		<circle cx="12" cy="12" r="10" />
		<path d="M8 12l3 3 5-6" />
	</Icon>
);
export const UploadIcon = (p: IconProps) => (
	<Icon {...p}>
		<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
	</Icon>
);

export const SpinnerIcon = ({ className, ...p }: IconProps) => (
	<svg className={className} fill="none" viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" {...p}>
		<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
		<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4zm2 5.29A7.96 7.96 0 014 12H0c0 3.04 1.14 5.82 3 7.94l3-2.65z" />
	</svg>
);

export const SearchIcon = (p: IconProps) => (
	<Icon {...p}>
		<circle cx="11" cy="11" r="8" />
		<path d="M21 21l-4.3-4.3" />
	</Icon>
);
export const TrashIcon = (p: IconProps) => (
	<Icon {...p}>
		<path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
	</Icon>
);
export const TagIcon = (p: IconProps) => (
	<Icon {...p}>
		<path d="M20.6 13.4l-7.2 7.2a2 2 0 01-2.8 0L3 13V3h10l7.6 7.6a2 2 0 010 2.8zM7.5 7.5h.01" />
	</Icon>
);
export const RepeatIcon = (p: IconProps) => (
	<Icon {...p}>
		<path d="M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3" />
	</Icon>
);
export const FlagIcon = ({ filled, ...p }: IconProps & { filled?: boolean }) => (
	<Icon fill={filled ? 'currentColor' : 'none'} {...p}>
		<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7" />
	</Icon>
);
export const FileIcon = (p: IconProps) => (
	<Icon {...p}>
		<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6" />
	</Icon>
);
export const ImageIcon = (p: IconProps) => (
	<Icon {...p}>
		<rect x="3" y="3" width="18" height="18" rx="2" />
		<circle cx="9" cy="9" r="2" />
		<path d="M21 15l-3.1-3.1a2 2 0 00-2.8 0L6 21" />
	</Icon>
);
export const PaperclipIcon = (p: IconProps) => (
	<Icon {...p}>
		<path d="M21.4 11.1l-9.2 9.2a6 6 0 01-8.5-8.5l9.2-9.2a4 4 0 015.7 5.7l-9.2 9.2a2 2 0 01-2.8-2.8l8.5-8.5" />
	</Icon>
);
export const SendIcon = (p: IconProps) => (
	<Icon {...p}>
		<path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" />
	</Icon>
);
