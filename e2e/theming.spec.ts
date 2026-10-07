import { expect, test, type Page } from '@playwright/test';
import { story } from './helpers';

const radius = async (page: Page) => parseFloat(await page.getByRole('button', { name: 'Button', exact: true }).evaluate((el) => getComputedStyle(el).borderTopLeftRadius));
const bodyBg = (page: Page) => page.evaluate(() => getComputedStyle(document.body).backgroundColor);

test.describe('Theming', () => {
	test('ui:silk makes Button corners square', async ({ page }) => {
		await story(page, 'actions-button--default', { ui: 'silk' });
		await expect(page.locator('html')).toHaveAttribute('data-ui', 'silk');
		await expect.poll(() => radius(page)).toBe(0); // polls: borders animate when the theme attribute lands
	});

	test('ui:soft makes Button a pill', async ({ page }) => {
		await story(page, 'actions-button--default', { ui: 'soft' });
		await expect(page.locator('html')).toHaveAttribute('data-ui', 'soft');
		await expect.poll(() => radius(page)).toBeGreaterThanOrEqual(9999);
	});

	test('default ui:perks is neither square nor a pill', async ({ page }) => {
		await story(page, 'actions-button--default');
		await expect.poll(() => radius(page)).toBeGreaterThan(0);
		await expect.poll(() => radius(page)).toBeLessThan(9999);
	});

	test('theme:dark changes the page background', async ({ page }) => {
		await story(page, 'actions-button--default', { theme: 'light' });
		const light = await bodyBg(page);
		await story(page, 'actions-button--default', { theme: 'dark' });
		await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
		const dark = await bodyBg(page);
		expect(dark).not.toBe(light);
		const lum = (c: string) => c.match(/\d+(\.\d+)?/g)!.slice(0, 3).map(Number).reduce((a, b) => a + b, 0);
		expect(lum(dark)).toBeLessThan(lum(light));
	});

	test('nested [data-theme] scope re-resolves surface colours', async ({ page }) => {
		await story(page, 'theming-overview--all-themes', { theme: 'light' });
		const scopes = page.locator('#storybook-root [data-theme]');
		await expect(scopes.nth(1)).toBeVisible();
		const bg = (i: number) => scopes.nth(i).evaluate((el) => getComputedStyle(el).backgroundColor);
		const cardBg = (i: number) => scopes.nth(i).locator('> *').first().evaluate((el) => getComputedStyle(el).backgroundColor);
		expect(await bg(0)).not.toBe(await bg(1)); // light vs dark scope
		expect(await cardBg(0)).not.toBe(await cardBg(1));
	});

	test('brand colour change of a theme reaches a Button', async ({ page }) => {
		await story(page, 'actions-button--default', { theme: 'light' });
		const btn = page.getByRole('button', { name: 'Button', exact: true });
		const bg = (b: typeof btn) => b.evaluate((el) => getComputedStyle(el).backgroundColor);
		// colours transition for 200ms after the theme lands, so poll for the settled value instead of sampling once
		await expect.poll(() => bg(btn)).toBe('rgb(24, 24, 27)'); // light: brand #18181b
		await story(page, 'actions-button--default', { theme: 'green-dark' });
		const next = page.getByRole('button', { name: 'Button', exact: true });
		await expect.poll(() => bg(next)).toBe('rgb(74, 222, 128)'); // green-dark: brand #4ade80
	});
});
