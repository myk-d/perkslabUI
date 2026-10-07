import React from 'react';
import { Button } from './Button';

export interface ErrorBoundaryProps {
	children: React.ReactNode;
	/** Custom fallback. Receives the error and a `reset` that re-renders the children. */
	fallback?: (error: Error, reset: () => void) => React.ReactNode;
	onError?: (error: Error, info: React.ErrorInfo) => void;
	title?: string;
	description?: string;
	retryLabel?: string;
}

interface State {
	error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, State> {
	state: State = { error: null };

	static getDerivedStateFromError(error: Error): State {
		return { error };
	}

	componentDidCatch(error: Error, info: React.ErrorInfo) {
		this.props.onError?.(error, info);
	}

	reset = () => this.setState({ error: null });

	render() {
		const { error } = this.state;
		if (!error) return this.props.children;
		if (this.props.fallback) return this.props.fallback(error, this.reset);

		const { title = 'Something went wrong', description = 'An unexpected error occurred while rendering this page.', retryLabel = 'Try again' } = this.props;
		return (
			<div role="alert" className="flex flex-col items-center gap-3 px-6 py-16 text-center text-page-text">
				<p className="ui-heading text-xl">{title}</p>
				<p className="max-w-md text-sm text-muted">{description}</p>
				<Button size="sm" onClick={this.reset}>
					{retryLabel}
				</Button>
			</div>
		);
	}
}
