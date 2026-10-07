import { expect, type Locator, type Page } from '@playwright/test';

export async function story(page: Page, id: string, globals: { ui?: string; theme?: string } = {}) {
	const g = Object.entries(globals).map(([k, v]) => `${k}:${v}`).join(';');
	await page.goto(`/iframe.html?id=${id}&viewMode=story${g ? `&globals=${g}` : ''}`);
	await page.locator('#storybook-root > *').first().waitFor();
}

/** Visible and fully inside the viewport. */
export async function expectInViewport(page: Page, loc: Locator) {
	await expect(loc).toBeVisible();
	await expect(async () => {
		const box = await loc.boundingBox();
		const vp = page.viewportSize()!;
		expect(box).not.toBeNull();
		expect(box!.width).toBeGreaterThan(0);
		expect(box!.height).toBeGreaterThan(0);
		expect(box!.x).toBeGreaterThanOrEqual(-1);
		expect(box!.y).toBeGreaterThanOrEqual(-1);
		expect(box!.x + box!.width).toBeLessThanOrEqual(vp.width + 1);
		expect(box!.y + box!.height).toBeLessThanOrEqual(vp.height + 1);
	}).toPass();
}
