import React from 'react';

/**
 * Puts disclosure ARIA state (aria-expanded / aria-haspopup / aria-controls …) on the actual interactive child
 * (usually a <Button>) instead of on a wrapper span — ARIA attributes on a role-less span are invalid and
 * assistive tech never sees the state on the control the user focuses. Non-element children pass through.
 */
export function withTriggerAria(children: React.ReactNode, aria: Record<string, unknown>, fallbackId?: string): React.ReactNode {
	if (!React.isValidElement(children) || children.type === React.Fragment) return children;
	const child = children as React.ReactElement<Record<string, unknown>>;
	return React.cloneElement(child, { ...aria, id: (child.props.id as string | undefined) ?? fallbackId });
}
