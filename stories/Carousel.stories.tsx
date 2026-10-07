import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Carousel, type CarouselApi, CarouselContent, CarouselDots, CarouselItem, CarouselNext, CarouselPrevious } from 'perkslab-ui';

const meta = {
	title: 'Display/Carousel',
	component: Carousel,
	argTypes: {
		orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
		loop: { control: 'boolean' },
		autoplay: { control: 'boolean' },
	},
	args: { orientation: 'horizontal', loop: false, autoplay: false },
} satisfies Meta<typeof Carousel>;
export default meta;
type Story = StoryObj<typeof meta>;

const Slide = ({ n }: { n: number }) => (
	<div className="flex aspect-square items-center justify-center ui-border border-line rounded-box bg-surface text-4xl font-bold text-page-text shadow-box">{n}</div>
);

export const Default: Story = {
	render: (args) => (
		<div className="mx-auto w-full max-w-xs px-12">
			<Carousel {...args}>
				<CarouselContent className="gap-4">
					{[1, 2, 3, 4, 5].map((n) => (
						<CarouselItem key={n}>
							<Slide n={n} />
						</CarouselItem>
					))}
				</CarouselContent>
				<CarouselPrevious />
				<CarouselNext />
			</Carousel>
		</div>
	),
};

export const MultipleWithDots: Story = {
	render: (args) => (
		<div className="mx-auto w-full max-w-xl px-12">
			<Carousel {...args} loop>
				<CarouselContent className="gap-4">
					{Array.from({ length: 8 }, (_, i) => (
						<CarouselItem key={i} className="basis-1/2 md:basis-1/3">
							<Slide n={i + 1} />
						</CarouselItem>
					))}
				</CarouselContent>
				<CarouselPrevious />
				<CarouselNext />
				<CarouselDots />
			</Carousel>
		</div>
	),
};

export const Vertical: Story = {
	args: { orientation: 'vertical' },
	render: (args) => (
		<div className="mx-auto w-full max-w-xs py-12">
			<Carousel {...args}>
				<CarouselContent className="h-64 gap-4">
					{[1, 2, 3, 4].map((n) => (
						<CarouselItem key={n} className="basis-full">
							<div className="flex h-full items-center justify-center ui-border border-line rounded-box bg-surface text-4xl font-bold text-page-text">{n}</div>
						</CarouselItem>
					))}
				</CarouselContent>
				<CarouselPrevious />
				<CarouselNext />
			</Carousel>
		</div>
	),
};

export const Autoplay: Story = {
	args: { autoplay: true, loop: true },
	render: (args) => (
		<div className="mx-auto w-full max-w-xs">
			<Carousel {...args}>
				<CarouselContent>
					{[1, 2, 3].map((n) => (
						<CarouselItem key={n}>
							<Slide n={n} />
						</CarouselItem>
					))}
				</CarouselContent>
				<CarouselDots />
			</Carousel>
		</div>
	),
};

export const WithApi: Story = {
	render: (args) => {
		const [api, setApi] = useState<CarouselApi>();
		const [state, setState] = useState({ index: 0, count: 0 });
		return (
			<div className="mx-auto w-full max-w-xs px-12">
				<Carousel {...args} setApi={setApi} onSelect={(index, count) => setState({ index, count })}>
					<CarouselContent className="gap-4">
						{[1, 2, 3, 4].map((n) => (
							<CarouselItem key={n}>
								<Slide n={n} />
							</CarouselItem>
						))}
					</CarouselContent>
					<CarouselPrevious />
					<CarouselNext />
				</Carousel>
				<p className="mt-3 text-center text-sm text-muted">
					Slide {state.index + 1} of {state.count}{' '}
					<button type="button" className="underline" onClick={() => api?.scrollTo(0)}>
						restart
					</button>
				</p>
			</div>
		);
	},
};
