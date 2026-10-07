import { useCallback, useRef, useState } from 'react';

/** Works as controlled (`value` + `onChange`) or uncontrolled (`defaultValue`) — the same contract as native inputs. */
export function useControllableState<T>(value: T | undefined, defaultValue: T, onChange?: (value: T) => void) {
	const [internal, setInternal] = useState<T>(defaultValue);
	const isControlled = value !== undefined;
	const current = isControlled ? (value as T) : internal;
	const currentRef = useRef(current);
	currentRef.current = current;

	const set = useCallback(
		(next: T | ((prev: T) => T)) => {
			const resolved = typeof next === 'function' ? (next as (prev: T) => T)(currentRef.current) : next;
			if (resolved === currentRef.current) return;
			if (!isControlled) setInternal(resolved);
			onChange?.(resolved);
		},
		[isControlled, onChange],
	);

	return [current, set] as const;
}
