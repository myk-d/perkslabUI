# perkslab-ui

Themable React components for Tailwind CSS v4 — shadcn-style API, with swappable **colour themes** and **UI styles**.

```
npm i perkslab-ui
```

## Setup

```css
/* index.css */
@import 'tailwindcss';
@import 'perkslab-ui/styles.css';
```

```tsx
import { ThemeProvider, ToastProvider, ConfirmProvider } from 'perkslab-ui';

<ThemeProvider defaultTheme="light" defaultUi="panel">
	<ToastProvider>
		<ConfirmProvider>
			<App />
		</ConfirmProvider>
	</ToastProvider>
</ThemeProvider>;
```

Optional: avoid a flash of the wrong theme by inlining `themeInitScript()` in `<head>`.

## Two independent axes

| Axis | Attribute | Values |
| --- | --- | --- |
| Colours | `data-theme` | `light`, `dark`, `blue-*`, `green-*`, `purple-*`, `red-*`, `yellow-*`, `indigo-*`, `orange-*`, `paper-*`, `neutral-*` (`-light` / `-dark`), `system`, or your own |
| Structure | `data-ui` | `perks` (original), `panel` (flat/dense), `soft` (pills), `silk` (editorial, square, serif), `shadcn` (neutral, compact — pairs with `neutral-light` / `neutral-dark`) |

Any combination works: `ui="silk"` + `theme="paper-light"` reproduces the e-reader look, `ui="panel"` + `indigo-light` the dashboards, `ui="soft"` + `orange-light` the todo app.

## Custom colours

```tsx
// 1. Your own themes — only brand/background/foreground are required, the rest is derived.
<ThemeProvider
	themes={[{ id: 'teal-light', name: 'Teal', mode: 'light', colors: { brand: '#0d9488', background: '#f0fdfa', foreground: '#134e4a' } }]}
	colors={{ brand: '#e11d48' }} // optional: force a colour on every theme
/>;

// 2. Let users pick at runtime (persisted in localStorage)
const { setColors, setTheme, setUi } = useAppTheme();
setColors({ brand: '#7c3aed' });
// or drop in <BrandColorPicker />, <ThemeSwitcher showUiStyles />, <UiStyleSwitcher />
```

Colour tokens (Tailwind utilities): `brand`, `brand-hover`, `brand-bg`, `brand-fg`, `page-bg`, `page-text`, `panel`, `panel-border`, `muted`, `danger`, `ok`, `warning`, `info`. Structure tokens: `surface`, `control`, `line`, `hover`, `rounded-control|field|box|item`, `shadow-box|pop`, `font-heading`, plus `ui-border`, `ui-heading`, `ui-label`. Use them in your own markup so it re-skins with the theme.

## Components

- **Actions:** Button (`asChild`, `buttonVariants`), ButtonGroup, Toggle, ToggleGroup
- **Forms:** Input, InputGroup, InputOTP, Textarea, Field/Label, Checkbox, Switch, RadioGroup, Slider, Select (searchable), NativeSelect, Combobox, DatePicker, DateTimePicker, Calendar, FileDropzone
- **Overlays:** Modal, AlertDialog, Sheet, Drawer, Popover, HoverCard, Tooltip, DropdownMenu, ContextMenu, Command / CommandDialog, Toasts (`ToastService`), Confirm (`useConfirm` / `ConfirmService`)
- **Navigation:** Sidebar, Menubar, NavigationMenu, Tabs, Breadcrumb, Pagination, PeriodNavigator
- **Charts:** BarChart, LineChart (area), DonutChart, Sparkline — pure SVG, 8-colour `chart-1..8` palette that follows the theme
- **Layout:** ScrollArea, Resizable, Carousel (scroll-snap, no deps), DirectionProvider (RTL)
- **Display:** Accordion, Collapsible, Card, Item, Badge, Alert, Avatar, Progress, Skeleton, Spinner, Separator, Kbd, AspectRatio, Table, DataTable, Stat, EmptyState, Typography*, ErrorBoundary
- **Chat:** Message, Bubble, Marker, Attachment, MessageScroller (streaming-aware autoscroll, prepend-without-jump, jump-to-message), Questionnaire (multi-step, validation, skip, conditional items)
- **Planner pieces:** PriorityPicker, TagPicker, RecurrencePicker
- **App shell:** SupportButton, Auth guards (below), PageLoader

Storybook: `npm run storybook` (toolbar switches colour theme, UI style and brand colour; stories live in `stories/`). Static build: `npm run build-storybook`.

Run the plain gallery locally: `npm run demo` (supports `?ui=silk&theme=paper-dark`).

## Overlays & toasts (shadcn API)

```tsx
<Dialog>                                {/* Modal* names are aliases */}
	<DialogTrigger asChild><Button>Edit</Button></DialogTrigger>
	<DialogContent>                       {/* X button by default; showCloseButton={false} hides it */}
		<DialogHeader><DialogTitle>Edit profile</DialogTitle><DialogDescription>…</DialogDescription></DialogHeader>
		<DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose></DialogFooter>
	</DialogContent>
</Dialog>

<Drawer snapPoints={['148px', 0.5, 1]}>  {/* drag-to-dismiss, snap points, nested, swipeDirection up|down|left|right */}
<ResponsiveDialog>                      {/* Dialog ≥ 768px, Drawer below */}

ToastService.success('Saved', { description: 'Live now', action: { label: 'Undo', onClick } });
const id = ToastService.loading('Uploading…');  ToastService.success('Done', { id });   // update in place
ToastService.promise(save(), { loading: 'Saving…', success: 'Saved', error: 'Failed' });
ToastService.dismiss();                  // toasts can also be swiped away
```

## Tests

`npm run test:e2e` — Playwright suite (88 tests, ~45 s) that drives Storybook in a real browser: every popup is opened and checked for visibility/position/keyboard/focus/close behaviour, plus theming and axe accessibility checks. Run it after touching any overlay.

## Route guards (router-agnostic)

```tsx
import { Navigate } from 'react-router-dom';
import { AuthGuardProvider, RequiredAuth, GuestOnly, RequireAccess } from 'perkslab-ui';

<AuthGuardProvider loginPath="/login" homePath="/calendar" redirect={(to) => <Navigate to={to} replace />}>
	<Routes>
		<Route path="/login" element={<GuestOnly isAuthenticated={!!user} isLoading={isInitializing}><Login /></GuestOnly>} />
		<Route path="/admin" element={<RequiredAuth isAuthenticated={!!user} isLoading={isInitializing}><RequireAccess allowed={isAdmin}><Admin /></RequireAccess></RequiredAuth>} />
	</Routes>
</AuthGuardProvider>
```

`RequiredAuth` forwards the requested URL as `?callbackPath=…`; `GuestOnly` (a.k.a. `ThrowAuth` / `RedirectIfAuthed`) returns there, accepting same-site paths only. Without `redirect`, a hard `window.location.replace` is used.

## Migrating from 1.x

- Add `@import 'perkslab-ui/styles.css'` and delete your own `@theme` / `[data-theme]` blocks (the same variable names are used, so overrides keep working).
- `@config "perkslab-ui/tailwind.config"` is no longer needed. Tailwind ≥ 4 and React ≥ 18 are required; the package is ESM and meant for bundlers (Vite, etc.).
- `Button` is a named export (`import { Button }`); `AccordionItem` is exported; `useToast` throws outside a provider; `Card`/`Input` no longer force a min width.
- `ToastProvider` accepts `position`, `timeout`, `max`. `Modal`/`Sheet` accept `open`/`onOpenChange`, handle Escape, focus and scroll lock, and render in a portal.
