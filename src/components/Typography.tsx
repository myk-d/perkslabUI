import React from 'react';
import { cn } from '../lib/cn';

type P<T> = React.HTMLAttributes<T>;

export const TypographyH1 = ({ className, ...p }: P<HTMLHeadingElement>) => <h1 className={cn('ui-heading text-4xl leading-tight text-balance lg:text-5xl', className)} {...p} />;
export const TypographyH2 = ({ className, ...p }: P<HTMLHeadingElement>) => <h2 className={cn('ui-heading border-b border-line/30 pb-2 text-3xl leading-tight', className)} {...p} />;
export const TypographyH3 = ({ className, ...p }: P<HTMLHeadingElement>) => <h3 className={cn('ui-heading text-2xl leading-tight', className)} {...p} />;
export const TypographyH4 = ({ className, ...p }: P<HTMLHeadingElement>) => <h4 className={cn('ui-heading text-xl leading-tight', className)} {...p} />;
export const TypographyP = ({ className, ...p }: P<HTMLParagraphElement>) => <p className={cn('leading-7 text-page-text [&:not(:first-child)]:mt-5', className)} {...p} />;
export const TypographyLead = ({ className, ...p }: P<HTMLParagraphElement>) => <p className={cn('text-xl text-muted', className)} {...p} />;
export const TypographyLarge = ({ className, ...p }: P<HTMLDivElement>) => <div className={cn('text-lg font-semibold', className)} {...p} />;
export const TypographySmall = ({ className, ...p }: P<HTMLElement>) => <small className={cn('text-sm font-medium leading-none', className)} {...p} />;
export const TypographyMuted = ({ className, ...p }: P<HTMLParagraphElement>) => <p className={cn('text-sm text-muted', className)} {...p} />;
export const TypographyBlockquote = ({ className, ...p }: P<HTMLQuoteElement>) => <blockquote className={cn('mt-6 border-s-[length:var(--ui-border-w)] border-brand ps-6 italic text-page-text/80', className)} {...p} />;
export const TypographyInlineCode = ({ className, ...p }: P<HTMLElement>) => <code className={cn('rounded-item bg-hover px-1.5 py-0.5 font-mono text-sm font-semibold', className)} {...p} />;
export const TypographyList = ({ className, ...p }: React.HTMLAttributes<HTMLUListElement>) => <ul className={cn('my-5 ms-6 list-disc leading-7 [&>li]:mt-2', className)} {...p} />;
