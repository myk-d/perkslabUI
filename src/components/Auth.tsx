import React, { createContext, useContext, useEffect } from 'react';
import { PageLoader } from './PageLoader';

/**
 * Router-agnostic route guards. They only decide *whether* to redirect; how the redirect happens is plugged in,
 * so the same components work with react-router, TanStack Router, Next, or plain `window.location`:
 *
 *   <AuthGuardProvider loginPath="/login" homePath="/" redirect={(to) => <Navigate to={to} replace />}>
 *     <RequiredAuth isAuthenticated={!!user} isLoading={isInitializing}><App /></RequiredAuth>
 *   </AuthGuardProvider>
 *
 * Every default set on the provider can also be passed straight to a guard as a prop.
 */
export interface AuthGuardConfig {
	/** Renders a redirect to `to` — e.g. `(to) => <Navigate to={to} replace />`. Default: `window.location.replace(to)`. */
	redirect?: (to: string) => React.ReactNode;
	/** Where RequiredAuth sends signed-out users. Default '/login'. */
	loginPath?: string;
	/** Where GuestOnly / RequireAccess send users by default. Default '/'. */
	homePath?: string;
	/** Query parameter that carries the originally requested URL through the login page. Default 'callbackPath'. */
	callbackParam?: string;
	/** Shown while `isLoading`. Default: a centered <PageLoader />. */
	loader?: React.ReactNode;
	/** Current location. Default: read from `window.location` at render time (fine for BrowserRouter-style routing). */
	getLocation?: () => { pathname: string; search: string };
}

const AuthGuardContext = createContext<AuthGuardConfig>({});

export const AuthGuardProvider = ({ children, ...config }: AuthGuardConfig & { children: React.ReactNode }) => (
	<AuthGuardContext.Provider value={config}>{children}</AuthGuardContext.Provider>
);

function useConfig(overrides: AuthGuardConfig) {
	const ctx = useContext(AuthGuardContext);
	return {
		redirect: overrides.redirect ?? ctx.redirect,
		loginPath: overrides.loginPath ?? ctx.loginPath ?? '/login',
		homePath: overrides.homePath ?? ctx.homePath ?? '/',
		callbackParam: overrides.callbackParam ?? ctx.callbackParam ?? 'callbackPath',
		loader: overrides.loader ?? ctx.loader ?? <PageLoader fullScreen />,
		getLocation: overrides.getLocation ?? ctx.getLocation ?? (() => ({ pathname: window.location.pathname, search: window.location.search })),
	};
}

function HardRedirect({ to }: { to: string }) {
	useEffect(() => {
		window.location.replace(to);
	}, [to]);
	return null;
}

const renderRedirect = (redirect: AuthGuardConfig['redirect'], to: string) => (redirect ? <>{redirect(to)}</> : <HardRedirect to={to} />);

/** Only same-site relative paths are allowed as a post-login target — blocks `?callbackPath=https://evil.com` open redirects. */
export function safeCallbackPath(value: string | null | undefined): string | null {
	if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return null;
	return value;
}

interface GuardProps extends AuthGuardConfig {
	children: React.ReactNode;
	/** Whether a user is signed in. */
	isAuthenticated: boolean;
	/** Auth state still resolving (e.g. Firebase `onAuthStateChanged` has not fired) — shows `loader` instead of redirecting. */
	isLoading?: boolean;
}

/** Signed-out users are sent to the login page with `?callbackPath=<where they were going>`. */
export const RequiredAuth = ({ children, isAuthenticated, isLoading, ...overrides }: GuardProps) => {
	const cfg = useConfig(overrides);
	if (isLoading) return <>{cfg.loader}</>;
	if (isAuthenticated) return <>{children}</>;
	const { pathname, search } = cfg.getLocation();
	return renderRedirect(cfg.redirect, `${cfg.loginPath}?${cfg.callbackParam}=${encodeURIComponent(pathname + search)}`);
};

/** The reverse guard for /login & co.: signed-in users are sent on to `callbackPath` (if safe) or `homePath`. */
export const GuestOnly = ({ children, isAuthenticated, isLoading, ...overrides }: GuardProps) => {
	const cfg = useConfig(overrides);
	if (isLoading) return <>{cfg.loader}</>;
	if (!isAuthenticated) return <>{children}</>;
	const callback = safeCallbackPath(new URLSearchParams(cfg.getLocation().search).get(cfg.callbackParam));
	return renderRedirect(cfg.redirect, callback ?? cfg.homePath);
};

/** Same component under the names the apps used. */
export const ThrowAuth = GuestOnly;
export const RedirectIfAuthed = GuestOnly;

interface AccessProps extends AuthGuardConfig {
	children: React.ReactNode;
	/** Your own permission check — roles, account status, e-mail allowlist, feature flags… */
	allowed: boolean;
	isLoading?: boolean;
	/** Where to send users without access. Default `homePath`. */
	redirectTo?: string;
	/** Render this instead of redirecting (e.g. a "no access" page). */
	fallback?: React.ReactNode;
}

/** Role / permission gate: `<RequireAccess allowed={hasAnyRole(user, ['admin'])}>`. Use inside RequiredAuth. */
export const RequireAccess = ({ children, allowed, isLoading, redirectTo, fallback, ...overrides }: AccessProps) => {
	const cfg = useConfig(overrides);
	if (isLoading) return <>{cfg.loader}</>;
	if (allowed) return <>{children}</>;
	if (fallback !== undefined) return <>{fallback}</>;
	return renderRedirect(cfg.redirect, redirectTo ?? cfg.homePath);
};
export const RoleRequired = RequireAccess;
