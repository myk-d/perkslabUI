import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { story } from './helpers';

/**
 * axe smoke: fails on critical/serious violations.
 * Allow-list (rule -> reason). Every entry is also attached to the test report as an annotation.
 */
const ALLOW: Record<string, string[]> = {};

type Case = { name: string; id: string; setup?: (page: Page) => Promise<void> };

const cases: Case[] = [
	{ name: 'Button variants', id: 'actions-button--variants' },
	{ name: 'Forms / InputStates', id: 'forms-overview--input-states' },
	{ name: 'Display / Alerts', id: 'display-overview--alerts' },
	{
		name: 'Modal (open)',
		id: 'overlays-overview--modal-dialog',
		setup: async (page) => { await page.getByRole('button', { name: 'Open modal' }).click(); await expect(page.getByRole('dialog')).toBeVisible(); await page.waitForTimeout(350); },
	},
	{
		name: 'Popover (open)',
		id: 'overlays-overview--floating',
		setup: async (page) => { await page.getByRole('button', { name: 'Popover' }).click(); await expect(page.getByRole('dialog')).toBeVisible(); await page.waitForTimeout(350); },
	},
	{
		name: 'DropdownMenu (open)',
		id: 'overlays-overview--floating',
		setup: async (page) => { await page.getByRole('button', { name: 'Menu' }).click(); await expect(page.getByRole('menu')).toBeVisible(); await page.waitForTimeout(350); },
	},
	{
		name: 'Select (open)',
		id: 'forms-overview--select-basic',
		setup: async (page) => { await page.getByRole('combobox').first().click(); await expect(page.getByRole('listbox')).toBeVisible(); await page.waitForTimeout(350); },
	},
];

for (const theme of ['light', 'dark'] as const) {
	for (const c of cases) {
		test(`axe: ${c.name} [${theme}]`, async ({ page }) => {
			await story(page, c.id, { theme });
			await c.setup?.(page);
			const allowed = ALLOW[c.name] ?? [];
			const results = await new AxeBuilder({ page }).disableRules(allowed).analyze();
			for (const rule of allowed) test.info().annotations.push({ type: 'a11y-allow-listed', description: `${c.name} [${theme}]: ${rule}` });
			const bad = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
			for (const v of results.violations) test.info().annotations.push({ type: `axe-${v.impact}`, description: `${v.id}: ${v.nodes.length} node(s) e.g. ${v.nodes[0]?.target.join(' ')}` });
			expect(bad.map((v) => `${v.id} (${v.impact}): ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
		});
	}
}

// Known, unfixed violations: kept visible as fixme so they are re-enabled the moment someone removes them from ALLOW.
for (const [name, rules] of Object.entries(ALLOW)) {
	const c = cases.find((x) => x.name === name)!;
	for (const rule of rules) {
		test(`axe: ${name} has no "${rule}" violation`, async ({ page }) => {
			await story(page, c.id);
			await c.setup?.(page);
			const r = await new AxeBuilder({ page }).withRules([rule]).analyze();
			expect(r.violations.map((v) => v.id)).toEqual([]);
		});
	}
}
