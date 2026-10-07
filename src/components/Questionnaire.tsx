import React, { createContext, forwardRef, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from 'react';
import { cn } from '../lib/cn';
import { useControllableState } from '../lib/useControllableState';
import { CheckIcon } from '../lib/icons';
import { Button, type ButtonProps } from './Button';
import { Input, type InputProps } from './Input';
import { Kbd } from './Kbd';
import { Progress } from './Progress';

export type QuestionnaireAnswer = string | string[];
export type QuestionnaireAnswers = Record<string, QuestionnaireAnswer>;

export interface QuestionnaireChoiceConfig {
	value: string;
	label: React.ReactNode;
	/** Single key that selects this choice. Defaults to 1..9 by position. */
	shortcut?: string;
}

export interface QuestionnaireItemConfig {
	/** Name of the real form control(s) holding the answer. With `freeform` + `choices` the free text lives in `${name}_other`. */
	name: string;
	required?: boolean;
	prompt?: React.ReactNode;
	description?: React.ReactNode;
	/** Checkboxes instead of radios. */
	multiple?: boolean;
	choices?: QuestionnaireChoiceConfig[];
	/** A free text field: alone when there are no choices, otherwise an "other" field. */
	freeform?: boolean;
	skippable?: boolean;
	/** Return true to skip the item entirely (navigation, progress and FormData). `disabled` is an alias. */
	hidden?: (answers: QuestionnaireAnswers) => boolean;
	disabled?: (answers: QuestionnaireAnswers) => boolean;
}

export interface QuestionnaireMessages {
	required?: string | ((item: QuestionnaireItemConfig) => string);
}

const defaultMessages = { required: 'Please answer this question to continue.' };

export interface QuestionnaireContextValue {
	items: QuestionnaireItemConfig[];
	/** Active item index in `items` (absolute, also used by `goTo`, `step`, `defaultStep`, `onStepChange`). */
	step: number;
	/** 0-based position of the active item among the enabled items. */
	position: number;
	/** Number of enabled items (conditional items that are skipped are not counted). */
	count: number;
	isFirst: boolean;
	isLast: boolean;
	answers: QuestionnaireAnswers;
	error: { name: string; message: string } | null;
	setAnswer: (name: string, value: QuestionnaireAnswer) => void;
	/** Validates the active item, then moves forward. Returns false when blocked by validation. */
	next: () => boolean;
	previous: () => void;
	/** Clears the active item's answer and moves on (submits the form on the last step). */
	skip: () => void;
	goTo: (index: number) => void;
	isEnabled: (index: number) => boolean;
	errorId: string;
}

const QuestionnaireContext = createContext<QuestionnaireContextValue | null>(null);

export const useQuestionnaire = () => {
	const ctx = useContext(QuestionnaireContext);
	if (!ctx) throw new Error('useQuestionnaire must be used within Questionnaire');
	return ctx;
};

const isTextAnswered = (v: QuestionnaireAnswer | undefined) => (Array.isArray(v) ? v.length > 0 : !!v && v.trim() !== '');
const isAnswered = (item: QuestionnaireItemConfig, answers: QuestionnaireAnswers) =>
	item.choices?.length ? isTextAnswered(answers[item.name]) || (!!item.freeform && isTextAnswered(answers[`${item.name}_other`])) : isTextAnswered(answers[item.name]);
const shortcutOf = (item: QuestionnaireItemConfig, index: number) => item.choices?.[index]?.shortcut ?? (index < 9 ? String(index + 1) : undefined);

export interface QuestionnaireProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit' | 'children'> {
	items: QuestionnaireItemConfig[];
	/** Native submit event on the last step; `event.currentTarget` holds every answer (call `preventDefault()` yourself). */
	onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
	onAnswersChange?: (answers: QuestionnaireAnswers) => void;
	onStepChange?: (step: number) => void;
	step?: number;
	defaultStep?: number;
	/** Initial answers, e.g. to resume. Radio/checkbox values, or text for freeform / `${name}_other`. */
	defaultAnswers?: QuestionnaireAnswers;
	messages?: QuestionnaireMessages;
	/** Omit to render the default layout (progress, every item, error, actions) from `items`. */
	children?: React.ReactNode;
}

const isTextField = (t: EventTarget | null) => {
	const el = t as HTMLElement | null;
	if (!el) return false;
	if (el.isContentEditable || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') return true;
	if (el.tagName !== 'INPUT') return false;
	return !['radio', 'checkbox', 'button', 'submit', 'reset'].includes((el as HTMLInputElement).type);
};

export const Questionnaire = forwardRef<HTMLFormElement, QuestionnaireProps>(
	({ items, onSubmit, onAnswersChange, onStepChange, step: stepProp, defaultStep, defaultAnswers, messages, className, children, onKeyDown, ...props }, ref) => {
		const [answers, setAnswersState] = useState<QuestionnaireAnswers>(() => defaultAnswers ?? {});
		const [error, setError] = useState<{ name: string; message: string } | null>(null);
		const formRef = useRef<HTMLFormElement | null>(null);
		const errorId = useId();
		const answersRef = useRef(answers);
		answersRef.current = answers;

		const enabledFlags = useMemo(() => items.map((it) => !(it.hidden?.(answers) || it.disabled?.(answers))), [items, answers]);
		const enabledIdx = useMemo(() => enabledFlags.flatMap((ok, i) => (ok ? [i] : [])), [enabledFlags]);
		const [rawStep, setRawStep] = useControllableState<number>(stepProp, defaultStep ?? 0, onStepChange);
		// Land on the nearest enabled item if the requested one is skipped.
		const step = enabledFlags[rawStep] ? rawStep : (enabledIdx.find((i) => i > rawStep) ?? enabledIdx[enabledIdx.length - 1] ?? 0);
		const position = Math.max(0, enabledIdx.indexOf(step));
		const count = enabledIdx.length;
		const isFirst = position === 0;
		const isLast = position >= count - 1;

		const msg = useCallback(
			(item: QuestionnaireItemConfig) => {
				const m = messages?.required ?? defaultMessages.required;
				return typeof m === 'function' ? m(item) : m;
			},
			[messages],
		);

		const setAnswer = useCallback(
			(name: string, value: QuestionnaireAnswer) => {
				const next = { ...answersRef.current, [name]: value };
				answersRef.current = next;
				setAnswersState(next);
				setError((e) => (e && (e.name === name || `${e.name}_other` === name) ? null : e));
				onAnswersChange?.(next);
			},
			[onAnswersChange],
		);

		const goTo = useCallback(
			(index: number) => {
				if (!enabledFlags[index]) return;
				setError(null);
				setRawStep(index);
			},
			[enabledFlags, setRawStep],
		);

		const validate = useCallback(
			(index: number) => {
				const item = items[index];
				if (item?.required && !isAnswered(item, answersRef.current)) {
					setError({ name: item.name, message: msg(item) });
					return false;
				}
				return true;
			},
			[items, msg],
		);

		const next = useCallback(() => {
			if (!validate(step)) return false;
			const target = enabledIdx.find((i) => i > step);
			if (target !== undefined) goTo(target);
			return true;
		}, [validate, step, enabledIdx, goTo]);

		const previous = useCallback(() => {
			const prev = [...enabledIdx].reverse().find((i) => i < step);
			if (prev !== undefined) goTo(prev);
		}, [enabledIdx, step, goTo]);

		const skip = useCallback(() => {
			const item = items[step];
			if (!item || item.required) return;
			const cleared = { ...answersRef.current };
			delete cleared[item.name];
			delete cleared[`${item.name}_other`];
			answersRef.current = cleared;
			setAnswersState(cleared);
			onAnswersChange?.(cleared);
			if (isLast) formRef.current?.requestSubmit();
			else {
				const target = enabledIdx.find((i) => i > step);
				if (target !== undefined) goTo(target);
			}
		}, [items, step, isLast, enabledIdx, goTo, onAnswersChange]);

		// Move focus into the new step (not on first render) so shortcuts and arrow keys work straight away.
		const mounted = useRef(false);
		useEffect(() => {
			if (!mounted.current) {
				mounted.current = true;
				return;
			}
			const name = items[step]?.name;
			if (!name || !formRef.current) return;
			const fs = Array.from(formRef.current.querySelectorAll<HTMLElement>('[data-questionnaire-item]')).find((el) => el.dataset.questionnaireItem === name);
			const target = fs?.querySelector<HTMLElement>('input:checked, input:not([disabled])');
			target?.focus({ preventScroll: true });
		}, [step, items]);

		const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
			if (!isLast) {
				e.preventDefault();
				next();
				return;
			}
			for (const i of enabledIdx) {
				if (!validate(i)) {
					e.preventDefault();
					if (i !== step) setRawStep(i);
					return;
				}
			}
			onSubmit?.(e);
		};

		const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
			onKeyDown?.(e);
			if (e.defaultPrevented) return;
			if (e.key === 'Enter' && isTextField(e.target) && (e.target as HTMLElement).tagName === 'INPUT') {
				e.preventDefault();
				if (isLast) formRef.current?.requestSubmit();
				else next();
				return;
			}
			if (e.ctrlKey || e.metaKey || e.altKey || isTextField(e.target) || e.key.length !== 1) return;
			const item = items[step];
			if (!item?.choices) return;
			const key = e.key.toLowerCase();
			const idx = item.choices.findIndex((c, i) => shortcutOf(item, i)?.toLowerCase() === key);
			if (idx < 0) return;
			e.preventDefault();
			const value = item.choices[idx].value;
			const current = answersRef.current[item.name];
			if (item.multiple) {
				const list = Array.isArray(current) ? current : [];
				setAnswer(item.name, list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
			} else {
				setAnswer(item.name, value);
				if (item.freeform) setAnswer(`${item.name}_other`, '');
			}
		};

		const ctx = useMemo<QuestionnaireContextValue>(
			() => ({
				items,
				step,
				position,
				count,
				isFirst,
				isLast,
				answers,
				error,
				setAnswer,
				next,
				previous,
				skip,
				goTo,
				isEnabled: (i) => !!enabledFlags[i],
				errorId,
			}),
			[items, step, position, count, isFirst, isLast, answers, error, setAnswer, next, previous, skip, goTo, enabledFlags, errorId],
		);

		return (
			<QuestionnaireContext.Provider value={ctx}>
				<form
					ref={(node) => {
						formRef.current = node;
						if (typeof ref === 'function') ref(node);
						else if (ref) (ref as React.MutableRefObject<HTMLFormElement | null>).current = node;
					}}
					noValidate
					className={cn('flex flex-col gap-5', className)}
					onSubmit={handleSubmit}
					onKeyDown={handleKeyDown}
					{...props}
				>
					{children ?? (
						<>
							<QuestionnaireProgress />
							{items.map((it) => (
								<QuestionnaireItem key={it.name} name={it.name} />
							))}
							<QuestionnaireError />
							<QuestionnaireActions />
						</>
					)}
				</form>
			</QuestionnaireContext.Provider>
		);
	},
);
Questionnaire.displayName = 'Questionnaire';

export interface QuestionnaireProgressProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
	/** Customise the text, e.g. for translation. Default: "Question 2 of 5". */
	label?: (state: { current: number; count: number }) => React.ReactNode;
	/** Accessible name of the bar. */
	barLabel?: string;
}

export const QuestionnaireProgress = ({ label, barLabel = 'Progress', className, ...props }: QuestionnaireProgressProps) => {
	const { position, count } = useQuestionnaire();
	const current = Math.min(position + 1, Math.max(count, 1));
	return (
		<div className={cn('flex flex-col gap-2', className)} {...props}>
			<p className="ui-label text-xs text-muted" aria-live="polite">
				{label ? label({ current, count }) : `Question ${current} of ${count}`}
			</p>
			<Progress value={current} max={Math.max(count, 1)} className="h-1" aria-label={barLabel} />
		</div>
	);
};

interface ItemContextValue {
	index: number;
	config: QuestionnaireItemConfig | undefined;
	name: string;
	active: boolean;
	required: boolean;
	titleId: string;
}
const ItemContext = createContext<ItemContextValue | null>(null);
const useItem = () => {
	const ctx = useContext(ItemContext);
	if (!ctx) throw new Error('Questionnaire parts must be used within QuestionnaireItem');
	return ctx;
};

export interface QuestionnaireItemProps extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, 'name'> {
	name: string;
	/** Display only (asterisk, aria-required) — validation uses `required` from `items`. */
	required?: boolean;
}

/** One question. Only the active step is visible; others stay mounted (hidden) so FormData keeps every answer. Skipped items are `disabled` and therefore excluded from FormData. */
export const QuestionnaireItem = forwardRef<HTMLFieldSetElement, QuestionnaireItemProps>(({ name, required, className, children, ...props }, ref) => {
	const q = useQuestionnaire();
	const titleId = useId();
	const index = q.items.findIndex((i) => i.name === name);
	const config = q.items[index];
	const active = index === q.step;
	const enabled = index >= 0 && q.isEnabled(index);
	const isRequired = required ?? config?.required ?? false;
	const hasError = q.error?.name === name;

	return (
		<ItemContext.Provider value={{ index, config, name, active, required: isRequired, titleId }}>
			<fieldset
				ref={ref}
				hidden={!active}
				disabled={!enabled}
				data-questionnaire-item={name}
				data-active={active || undefined}
				aria-describedby={hasError ? q.errorId : undefined}
				aria-required={isRequired || undefined}
				className={cn('m-0 flex min-w-0 flex-col gap-3 border-0 p-0', active && 'animate-pk-fade-in', className)}
				{...props}
			>
				{children ?? (
					<>
						<QuestionnaireTitle />
						<QuestionnaireDescription />
						{config?.choices?.length ? (
							<QuestionnaireChoices>
								{config.choices.map((c) => (
									<QuestionnaireChoice key={c.value} value={c.value} shortcut={c.shortcut}>
										{c.label}
									</QuestionnaireChoice>
								))}
							</QuestionnaireChoices>
						) : null}
						{config?.freeform && <QuestionnaireInput />}
					</>
				)}
			</fieldset>
		</ItemContext.Provider>
	);
});
QuestionnaireItem.displayName = 'QuestionnaireItem';

export const QuestionnaireTitle = forwardRef<HTMLLegendElement, React.HTMLAttributes<HTMLLegendElement>>(({ className, children, ...props }, ref) => {
	const item = useItem();
	const content = children ?? item.config?.prompt;
	if (content == null) return null;
	return (
		<legend ref={ref} id={item.titleId} className={cn('ui-heading mb-0 w-full p-0 text-xl text-page-text', className)} {...props}>
			{content}
			{item.required && (
				<span className="ms-1 text-danger" aria-hidden="true">
					*
				</span>
			)}
		</legend>
	);
});
QuestionnaireTitle.displayName = 'QuestionnaireTitle';

export const QuestionnaireDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, children, ...props }, ref) => {
	const item = useItem();
	const content = children ?? item.config?.description;
	if (content == null) return null;
	return (
		<p ref={ref} className={cn('text-sm text-muted', className)} {...props}>
			{content}
		</p>
	);
});
QuestionnaireDescription.displayName = 'QuestionnaireDescription';

export const QuestionnaireChoices = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
	const item = useItem();
	return <div ref={ref} role={item.config?.multiple ? 'group' : 'radiogroup'} aria-labelledby={item.titleId} className={cn('flex flex-col gap-2', className)} {...props} />;
});
QuestionnaireChoices.displayName = 'QuestionnaireChoices';

export interface QuestionnaireChoiceProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'checked' | 'name' | 'children'> {
	value: string;
	/** Hint key shown as a badge. Defaults to the key resolved from `items` (1..9 or `choices[].shortcut`). */
	shortcut?: string;
	children?: React.ReactNode;
}

/** Radio (single) or checkbox (`multiple`) styled as a selectable card row. */
export const QuestionnaireChoice = forwardRef<HTMLInputElement, QuestionnaireChoiceProps>(({ value, shortcut, className, disabled, children, ...props }, ref) => {
	const q = useQuestionnaire();
	const item = useItem();
	const multiple = !!item.config?.multiple;
	const current = q.answers[item.name];
	const checked = multiple ? Array.isArray(current) && current.includes(value) : current === value;
	const cfgIndex = item.config?.choices?.findIndex((c) => c.value === value) ?? -1;
	const hint = shortcut ?? (item.config && cfgIndex >= 0 ? shortcutOf(item.config, cfgIndex) : undefined);

	const onChange = () => {
		if (multiple) {
			const list = Array.isArray(current) ? current : [];
			q.setAnswer(item.name, checked ? list.filter((v) => v !== value) : [...list, value]);
		} else {
			q.setAnswer(item.name, value);
			if (item.config?.freeform) q.setAnswer(`${item.name}_other`, '');
		}
	};

	return (
		<label
			className={cn(
				'group flex items-center gap-3 ui-border border-line rounded-field bg-surface px-4 py-3 shadow-box transition-colors duration-200',
				disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-hover',
				'has-checked:border-brand has-checked:bg-brand-bg has-focus-visible:ring-2 has-focus-visible:ring-brand has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-page-bg',
			)}
		>
			<input
				ref={ref}
				type={multiple ? 'checkbox' : 'radio'}
				name={item.name}
				value={value}
				checked={checked}
				disabled={disabled}
				onChange={onChange}
				className={cn('peer sr-only', className)}
				{...props}
			/>
			<span
				aria-hidden="true"
				className={cn(
					'flex size-5 shrink-0 items-center justify-center ui-border border-line bg-control transition-colors duration-200',
					multiple ? 'rounded-item' : 'rounded-full',
					'group-has-checked:border-brand group-has-checked:bg-brand',
				)}
			>
				<CheckIcon className="size-3.5 text-brand-fg opacity-0 transition-opacity duration-150 group-has-checked:opacity-100" />
			</span>
			<span className="flex-1 text-start text-sm font-medium text-page-text">{children ?? value}</span>
			{hint && <Kbd aria-hidden="true">{hint.toUpperCase()}</Kbd>}
		</label>
	);
});
QuestionnaireChoice.displayName = 'QuestionnaireChoice';

export type QuestionnaireInputProps = Omit<InputProps, 'name' | 'value' | 'defaultValue' | 'type'> & { type?: 'text' | 'email' | 'number' | 'tel' | 'url' };

/** Freeform text. Named `${name}_other` when the item has choices, otherwise the item `name`. */
export const QuestionnaireInput = forwardRef<HTMLInputElement, QuestionnaireInputProps>(({ onChange, type = 'text', placeholder, 'aria-label': ariaLabel, ...props }, ref) => {
	const q = useQuestionnaire();
	const item = useItem();
	const hasChoices = !!item.config?.choices?.length;
	const field = hasChoices ? `${item.name}_other` : item.name;
	const value = q.answers[field];
	return (
		<Input
			ref={ref}
			type={type}
			name={field}
			value={typeof value === 'string' ? value : ''}
			placeholder={placeholder ?? (hasChoices ? 'Other…' : undefined)}
			aria-label={ariaLabel ?? (hasChoices ? 'Other' : undefined)}
			aria-labelledby={!hasChoices && !ariaLabel ? item.titleId : undefined}
			invalid={q.error?.name === item.name || undefined}
			onChange={(e) => {
				onChange?.(e);
				q.setAnswer(field, e.target.value);
				// A typed "other" replaces a single choice.
				if (hasChoices && !item.config?.multiple && e.target.value) q.setAnswer(item.name, '');
			}}
			{...props}
		/>
	);
});
QuestionnaireInput.displayName = 'QuestionnaireInput';

/** Live region for the active item's validation error. Always mounted so screen readers announce changes. */
export const QuestionnaireError = ({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => {
	const q = useQuestionnaire();
	const active = q.items[q.step]?.name;
	const text = q.error && q.error.name === active ? q.error.message : null;
	return (
		<p id={q.errorId} role="alert" className={cn('text-sm font-medium text-danger empty:hidden', className)} {...props}>
			{text ? (children ?? text) : null}
		</p>
	);
};

export const QuestionnaireActions = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div className={cn('flex flex-wrap items-center justify-end gap-2', className)} {...props}>
		{children ?? (
			<>
				<QuestionnairePrevious />
				<QuestionnaireSkip />
				<QuestionnaireNext />
				<QuestionnaireSubmit />
			</>
		)}
	</div>
);

type ActionProps = Omit<ButtonProps, 'type'>;

export const QuestionnairePrevious = ({ children, onClick, className, disabled, variant = 'ghost', ...props }: ActionProps) => {
	const q = useQuestionnaire();
	return (
		<Button
			type="button"
			variant={variant}
			disabled={disabled ?? q.isFirst}
			className={cn('me-auto', className)}
			onClick={(e) => {
				onClick?.(e);
				if (!e.defaultPrevented) q.previous();
			}}
			{...props}
		>
			{children ?? 'Back'}
		</Button>
	);
};

/** Only rendered for non-required items. */
export const QuestionnaireSkip = ({ children, onClick, variant = 'outline', ...props }: ActionProps) => {
	const q = useQuestionnaire();
	if (q.items[q.step]?.required) return null;
	return (
		<Button
			type="button"
			variant={variant}
			onClick={(e) => {
				onClick?.(e);
				if (!e.defaultPrevented) q.skip();
			}}
			{...props}
		>
			{children ?? 'Skip'}
		</Button>
	);
};

/** Hidden on the last step. */
export const QuestionnaireNext = ({ children, onClick, ...props }: ActionProps) => {
	const q = useQuestionnaire();
	if (q.isLast) return null;
	return (
		<Button
			type="button"
			onClick={(e) => {
				onClick?.(e);
				if (!e.defaultPrevented) q.next();
			}}
			{...props}
		>
			{children ?? 'Next'}
		</Button>
	);
};

/** Only rendered on the last step; a real submit button. */
export const QuestionnaireSubmit = ({ children, ...props }: ActionProps) => {
	const q = useQuestionnaire();
	if (!q.isLast) return null;
	return (
		<Button type="submit" {...props}>
			{children ?? 'Submit'}
		</Button>
	);
};
