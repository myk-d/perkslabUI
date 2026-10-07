import React from 'react';
import { cn } from './cn';

/** `asChild` support: merges props/className onto the single child element instead of rendering a wrapper (e.g. a router <Link> styled as a Button). */
export function Slot({ children, className, ...props }: React.HTMLAttributes<HTMLElement> & { children: React.ReactNode; ref?: React.Ref<HTMLElement> }) {
	const child = React.Children.only(children) as React.ReactElement<{ className?: string }>;
	return React.cloneElement(child, { ...props, ...child.props, className: cn(className, child.props.className) } as object);
}

const setRef = <T,>(ref: React.Ref<T> | undefined, value: T | null) => {
	if (typeof ref === 'function') ref(value);
	else if (ref) (ref as React.MutableRefObject<T | null>).current = value;
};

/**
 * `asChild` for triggers/closers: clones the single child with our props, COMPOSING event handlers (the child's runs first; ours is skipped
 * if it called preventDefault) and merging refs, instead of letting the child's props win like `Slot`.
 */
export const MergeSlot = React.forwardRef<HTMLElement, Record<string, unknown> & { children: React.ReactElement }>(function MergeSlot({ children, ...props }, ref) {
	const child = React.Children.only(children) as React.ReactElement<Record<string, unknown>>;
	const childProps = child.props;
	const merged: Record<string, unknown> = { ...props, ...childProps };
	for (const key of Object.keys(props)) {
		const mine = props[key];
		const theirs = childProps[key];
		if (/^on[A-Z]/.test(key) && typeof mine === 'function' && typeof theirs === 'function') {
			merged[key] = (e: { defaultPrevented?: boolean }) => {
				(theirs as (e: unknown) => void)(e);
				if (!e?.defaultPrevented) (mine as (e: unknown) => void)(e);
			};
		}
	}
	merged.className = cn(props.className as string | undefined, childProps.className as string | undefined);
	const childRef = parseInt(React.version, 10) >= 19 ? (childProps.ref as React.Ref<HTMLElement>) : (child as unknown as { ref?: React.Ref<HTMLElement> }).ref;
	merged.ref = (node: HTMLElement | null) => {
		setRef(ref, node);
		setRef(childRef, node);
	};
	return React.cloneElement(child, merged);
});
