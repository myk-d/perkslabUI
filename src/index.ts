// Components
export { Accordion, AccordionContent, AccordionItem, AccordionTrigger, type AccordionProps } from './components/Accordion';
export { Alert, type AlertProps, type AlertVariant } from './components/Alert';
export {
	AuthGuardProvider,
	GuestOnly,
	RedirectIfAuthed,
	RequireAccess,
	RequiredAuth,
	RoleRequired,
	safeCallbackPath,
	ThrowAuth,
	type AuthGuardConfig,
} from './components/Auth';
export { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './components/AlertDialog';
export { AspectRatio } from './components/AspectRatio';
export { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from './components/Breadcrumb';
export { ButtonGroup } from './components/ButtonGroup';
export { Collapsible, CollapsibleContent, CollapsibleTrigger, type CollapsibleProps } from './components/Collapsible';
export { Combobox, type ComboboxProps } from './components/Combobox';
export { Command, CommandDialog, type CommandDialogProps, type CommandGroupDef, type CommandItemDef, type CommandProps } from './components/Command';
export { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuTrigger } from './components/ContextMenu';
export { DataTable, type DataTableColumn, type DataTableProps } from './components/DataTable';
export {
	Drawer, DrawerBody, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerPortal, DrawerSwipeHandle, DrawerTitle, DrawerTrigger,
	type DrawerContentProps, type DrawerModal, type DrawerProps, type DrawerSnapPoint, type DrawerSwipeDirection,
} from './components/Drawer';
export {
	Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger,
	type DialogContentProps, type DialogProps,
} from './components/Dialog';
export {
	ResponsiveDialog, ResponsiveDialogClose, ResponsiveDialogContent, ResponsiveDialogDescription, ResponsiveDialogFooter, ResponsiveDialogHeader, ResponsiveDialogTitle, ResponsiveDialogTrigger, useMediaQuery,
	type ResponsiveDialogContentProps, type ResponsiveDialogProps,
} from './components/ResponsiveDialog';
export { HoverCard, type HoverCardProps } from './components/HoverCard';
export { InputGroup, InputGroupAddon, InputGroupInput } from './components/InputGroup';
export { InputOTP, type InputOTPProps } from './components/InputOTP';
export { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from './components/Item';
export { Kbd, KbdGroup } from './components/Kbd';
export { NativeSelect } from './components/NativeSelect';
export { getPageRange, Pagination, type PaginationProps } from './components/Pagination';
export { Slider, type SliderProps } from './components/Slider';
export { Toggle, ToggleGroup, ToggleGroupItem, type ToggleGroupProps, type ToggleProps } from './components/Toggle';
export { TypographyBlockquote, TypographyH1, TypographyH2, TypographyH3, TypographyH4, TypographyInlineCode, TypographyLarge, TypographyLead, TypographyList, TypographyMuted, TypographyP, TypographySmall } from './components/Typography';
export * from './components/Carousel';
export * from './components/Chart';
export * from './components/Direction';
export * from './components/Menubar';
export * from './components/NavigationMenu';
export { ResizableHandle, ResizablePanel, ResizablePanelGroup, type ResizablePanelGroupProps, type ResizablePanelHandle as ResizablePanelApi, type ResizablePanelProps } from './components/Resizable';
export { ScrollArea, type ScrollAreaProps } from './components/ScrollArea';
export * from './components/Sidebar';
export * from './components/Attachment';
export * from './components/Bubble';
export * from './components/Marker';
export * from './components/Message';
export * from './components/MessageScroller';
export * from './components/Questionnaire';
export { Avatar, type AvatarProps } from './components/Avatar';
export { Badge, type BadgeProps, type BadgeVariant } from './components/Badge';
export { Button, buttonVariants, type ButtonProps, type ButtonSize, type ButtonVariant } from './components/Button';
export { Calendar, type CalendarProps } from './components/Calendar';
export {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardImage,
	CardImageContainer,
	CardImagePlaceholder,
	CardTitle,
	type CardProps,
} from './components/Card';
export { Checkbox, type CheckboxProps } from './components/Checkbox';
export { ConfirmProvider, useConfirm } from './components/Confirm/ConfirmContext';
export { DatePicker, type DatePickerProps } from './components/DatePicker';
export { DateTimePicker, type DateTimePickerProps } from './components/DateTimePicker';
export {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	type DropdownMenuItemProps,
} from './components/DropdownMenu';
export { EmptyState, type EmptyStateProps } from './components/EmptyState';
export { ErrorBoundary, type ErrorBoundaryProps } from './components/ErrorBoundary';
export { FileDropzone, type FileDropzoneProps } from './components/FileDropzone';
export { Input, type InputProps } from './components/Input';
export { Field, Label, type FieldProps } from './components/Label';
export {
	Modal,
	ModalActionButton,
	ModalBody,
	ModalClose,
	ModalCloseButton,
	ModalContent,
	ModalDescription,
	ModalFooter,
	ModalHeader,
	ModalTitle,
	ModalTrigger,
	type ModalContentProps,
} from './components/Modal';
export { PageLoader } from './components/PageLoader';
export { PeriodNavigator, type PeriodNavigatorProps } from './components/PeriodNavigator';
export { PriorityPicker, type Priority, type PriorityPickerProps } from './components/PriorityPicker';
export { RecurrencePicker, type RecurrenceFreq, type RecurrenceLabels, type RecurrencePickerProps, type RecurrenceRule } from './components/RecurrencePicker';
export { nextTagColor, TagPicker, tagColors, type Tag, type TagColor, type TagPickerLabels, type TagPickerProps } from './components/TagPicker';
export { Popover, PopoverContent, PopoverTrigger, type PopoverContentProps, type PopoverProps } from './components/Popover';
export { Progress, type ProgressProps } from './components/Progress';
export { Radio, RadioGroup, type RadioGroupProps, type RadioProps } from './components/RadioGroup';
export { Select, type SelectOption, type SelectProps } from './components/Select';
export { Separator } from './components/Separator';
export {
	Sheet,
	SheetActionButton,
	SheetClose,
	SheetCloseButton,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
	type SheetContentProps,
} from './components/Sheet';
export { Skeleton } from './components/Skeleton';
export { Spinner } from './components/Spinner';
export { Stat, StatGroup, type StatProps } from './components/Stat';
export { SupportButton, type SupportButtonProps } from './components/SupportButton';
export { Switch, type SwitchProps } from './components/Switch';
export { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './components/Table';
export { Tabs, TabsContent, TabsList, TabsTrigger, type TabsProps } from './components/Tabs';
export { Textarea, type TextareaProps } from './components/Textarea';
export { BrandColorPicker, ThemeSwitcher, UiStyleSwitcher } from './components/Theme/ThemeSwitcher';
export { ToastProvider, useToast, type ToastProviderProps } from './components/Toasts/ToastContext';
export { Tooltip, type TooltipProps } from './components/Tooltip';

// Theming
export { themeHexColors, ThemeProvider, themeInitScript, useAppTheme, type ThemeProviderProps } from './components/Theme/ThemeContext';
export {
	builtInThemes,
	colorsToDeclarations,
	getThemeBrandHex,
	themeCssVars,
	themeToCss,
	uiStyles,
	type BuiltInTheme,
	type Theme,
	type ThemeColors,
	type ThemeDefinition,
	type UiStyle,
} from './theme/themes';

// Services (imperative, usable outside React)
export { ConfirmService } from './helpers/services/ConfirmService';
export { ToastService } from './helpers/services/ToastService';
export type { ConfirmOptions } from './helpers/types/confirm';
export type { ToastOptions, ToastPosition, ToastType } from './helpers/types/toast';

// Utilities
export { cn } from './lib/cn';
export { useControllableState } from './lib/useControllableState';
