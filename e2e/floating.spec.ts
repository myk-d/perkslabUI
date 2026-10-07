import { expect, test } from '@playwright/test';
import { expectInViewport, story } from './helpers';

test.describe('Popover', () => {
	test.beforeEach(({ page }) => story(page, 'overlays-overview--floating'));

	test('opens visible, closes on outside click and Escape', async ({ page }) => {
		const trigger = page.getByRole('button', { name: 'Popover' });
		const pop = page.getByRole('dialog');
		await trigger.click();
		await expect(pop).toContainText('Anything can live in here.');
		await expectInViewport(page, pop);
		await page.mouse.click(600, 400);
		await expect(pop).toBeHidden();
		await trigger.click();
		await expectInViewport(page, pop);
		await page.keyboard.press('Escape');
		await expect(pop).toBeHidden();
	});
});

test.describe('DropdownMenu', () => {
	test.beforeEach(({ page }) => story(page, 'overlays-overview--floating'));

	test('opens in viewport; closes on outside, Escape and item select', async ({ page }) => {
		const trigger = page.getByRole('button', { name: 'Menu' });
		const menu = page.getByRole('menu');
		await trigger.click();
		await expectInViewport(page, menu);
		await expect(page.getByRole('menuitem', { name: 'Profile' })).toBeVisible();
		await page.mouse.click(600, 400);
		await expect(menu).toBeHidden();
		await trigger.click();
		await expect(menu).toBeVisible();
		await page.keyboard.press('Escape');
		await expect(menu).toBeHidden();
		await trigger.click();
		await page.getByRole('menuitem', { name: 'Settings' }).click();
		await expect(menu).toBeHidden();
	});

	test('arrow keys move focus between items', async ({ page }) => {
		await page.getByRole('button', { name: 'Menu' }).click();
		await expect(page.getByRole('menu')).toBeVisible();
		await page.keyboard.press('ArrowDown');
		await page.keyboard.press('ArrowDown');
		const active = await page.evaluate(() => document.activeElement?.textContent);
		expect(active).toBeTruthy();
		await page.keyboard.press('Enter');
		await expect(page.getByRole('menu')).toBeHidden();
	});
});

test.describe('Tooltip', () => {
	test.beforeEach(({ page }) => story(page, 'overlays-overview--floating'));

	test('shows on hover and hides on leave', async ({ page }) => {
		const tip = page.getByRole('tooltip');
		await page.getByRole('button', { name: 'Hover me' }).hover();
		await expect(tip).toHaveText('I am a tooltip');
		await expectInViewport(page, tip);
		await page.mouse.move(700, 500);
		await expect(tip).toBeHidden();
	});

	test('shows on keyboard focus and hides on blur / Escape', async ({ page }) => {
		const tip = page.getByRole('tooltip');
		await page.getByRole('button', { name: 'Hover me' }).focus();
		await expect(tip).toBeVisible();
		await page.keyboard.press('Escape');
		await expect(tip).toBeHidden();
	});
});

test.describe('ContextMenu / HoverCard', () => {
	test.beforeEach(({ page }) => story(page, 'more-overview--overlays'));

	test('ContextMenu opens on right click, closes on Escape, outside, select', async ({ page }) => {
		const area = page.getByText('Right-click here');
		const item = page.getByRole('menuitem', { name: 'Reload' });
		await area.click({ button: 'right' });
		await expectInViewport(page, item);
		await page.keyboard.press('Escape');
		await expect(item).toBeHidden();
		await area.click({ button: 'right' });
		await expect(item).toBeVisible();
		await page.mouse.click(900, 600);
		await expect(item).toBeHidden();
		await area.click({ button: 'right' });
		await item.click();
		await expect(item).toBeHidden();
	});

	test('HoverCard opens on hover and stays open while pointer is on the card', async ({ page }) => {
		const card = page.getByText('Themable React UI kit.');
		await page.getByRole('link', { name: '@perkslab' }).hover();
		await expectInViewport(page, card);
		await card.hover();
		await page.waitForTimeout(500);
		await expect(card).toBeVisible();
		await page.mouse.move(900, 650);
		await expect(card).toBeHidden();
	});
});

test.describe('Select', () => {
	test.beforeEach(({ page }) => story(page, 'forms-overview--select-basic'));

	test('opens, filters via search, selects with click and closes', async ({ page }) => {
		const trigger = page.getByRole('combobox').first();
		const list = page.getByRole('listbox');
		await trigger.click();
		await expectInViewport(page, list);
		await expect(page.getByRole('option')).toHaveCount(6);
		await page.keyboard.type('pol');
		await expect(page.getByRole('option')).toHaveCount(1);
		await page.getByRole('option', { name: 'Poland' }).click();
		await expect(list).toBeHidden();
		await expect(trigger).toContainText('Poland');
	});

	test('keyboard: arrows change aria-activedescendant, Enter selects, Escape closes', async ({ page }) => {
		const trigger = page.getByRole('combobox').first();
		await trigger.focus();
		await page.keyboard.press('Enter');
		await expect(page.getByRole('listbox')).toBeVisible();
		const holder = page.locator('[aria-activedescendant]').first();
		await expect(holder).toBeAttached();
		const before = await holder.getAttribute('aria-activedescendant');
		await page.keyboard.press('ArrowDown');
		await expect.poll(() => holder.getAttribute('aria-activedescendant')).not.toBe(before);
		const next = await holder.getAttribute('aria-activedescendant');
		await page.keyboard.press('ArrowDown');
		await expect.poll(() => holder.getAttribute('aria-activedescendant')).not.toBe(next);
		await page.keyboard.press('Enter');
		await expect(page.getByRole('listbox')).toBeHidden();
		await expect(trigger).not.toContainText('Select');
		await trigger.click();
		await expect(page.getByRole('listbox')).toBeVisible();
		await page.keyboard.press('Escape');
		await expect(page.getByRole('listbox')).toBeHidden();
	});

	test('closes on outside click', async ({ page }) => {
		await page.getByRole('combobox').first().click();
		await expect(page.getByRole('listbox')).toBeVisible();
		await page.mouse.click(900, 650);
		await expect(page.getByRole('listbox')).toBeHidden();
	});
});

test.describe('Combobox', () => {
	test.beforeEach(({ page }) => story(page, 'more-overview--form-extras'));

	test('filters, Enter selects, creates new option, closes outside', async ({ page }) => {
		const input = page.getByRole('combobox').last();
		await input.click();
		const list = page.getByRole('listbox');
		await expectInViewport(page, list);
		await page.keyboard.type('Lv');
		await expect(list.getByRole('option')).toHaveCount(2);
		await page.keyboard.press('Enter');
		await expect(list).toBeHidden();
		await expect(input).toHaveValue(/Lviv/);

		await input.click();
		await input.fill('Dnipro');
		await expect(list.getByRole('option', { name: /Dnipro/ })).toBeVisible();
		await list.getByRole('option', { name: /Dnipro/ }).click();
		await expect(list).toBeHidden();
		await input.click();
		await expect(list.getByRole('option', { name: 'Dnipro' })).toBeVisible();
		await page.mouse.click(900, 650);
		await expect(list).toBeHidden();
	});
});

test.describe('Menubar', () => {
	test.beforeEach(({ page }) => story(page, 'navigation-menubar--default'));

	test('opens, ArrowRight moves, hover switches, Escape closes', async ({ page }) => {
		const file = page.getByRole('menuitem', { name: 'File' }).or(page.getByRole('button', { name: 'File' })).first();
		await file.click();
		await expectInViewport(page, page.getByRole('menuitem', { name: /New tab/ }));
		await page.keyboard.press('ArrowRight');
		await expect(page.getByRole('menuitem', { name: /Undo/ })).toBeVisible();
		await expect(page.getByRole('menuitem', { name: /New tab/ })).toBeHidden();
		const view = page.getByText('View', { exact: true });
		await view.hover();
		await expect(page.getByRole('menuitemcheckbox', { name: /Show grid/ })).toBeVisible();
		await page.keyboard.press('Escape');
		await expect(page.getByRole('menuitemcheckbox', { name: /Show grid/ })).toBeHidden();
	});

	test('closes on outside click and on item select', async ({ page }) => {
		await page.getByText('File', { exact: true }).click();
		const item = page.getByRole('menuitem', { name: /Print/ });
		await expect(item).toBeVisible();
		await page.mouse.click(900, 650);
		await expect(item).toBeHidden();
		await page.getByText('File', { exact: true }).click();
		await item.click();
		await expect(item).toBeHidden();
	});
});

test.describe('NavigationMenu', () => {
	test('opens content on click, closes on Escape / outside', async ({ page }) => {
		await story(page, 'navigation-navigationmenu--default');
		await page.getByRole('button', { name: 'Getting started' }).click();
		const link = page.getByRole('link', { name: /Installation/ });
		await expectInViewport(page, link);
		await page.keyboard.press('Escape');
		await expect(link).toBeHidden();
		await page.getByRole('button', { name: 'Components' }).click();
		await expect(page.getByRole('link', { name: 'Dialog' })).toBeVisible();
		await page.mouse.click(900, 650);
		await expect(page.getByRole('link', { name: 'Dialog' })).toBeHidden();
	});
});

test.describe('DatePicker / DateTimePicker', () => {
	test.beforeEach(({ page }) => story(page, 'forms-overview--dates'));

	test('DatePicker opens in viewport, picking a day updates value and closes', async ({ page }) => {
		const trigger = page.locator('button[aria-haspopup]').first();
		const before = await trigger.textContent();
		await trigger.click();
		const dlg = page.getByRole('dialog');
		await expectInViewport(page, dlg);
		const day = dlg.getByRole('button', { name: /^(1[0-9]|2[0-7])$/ }).first();
		await day.click();
		await expect(dlg).toBeHidden();
		await expect.poll(() => trigger.textContent()).not.toBe(before);
	});

	test('closes on Escape and outside click', async ({ page }) => {
		const trigger = page.locator('button[aria-haspopup]').first();
		await trigger.click();
		await expect(page.getByRole('dialog')).toBeVisible();
		await page.keyboard.press('Escape');
		await expect(page.getByRole('dialog')).toBeHidden();
		await trigger.click();
		await page.mouse.click(5, 5);
		await expect(page.getByRole('dialog')).toBeHidden();
	});

	test('DateTimePicker opens in viewport and closes on Escape', async ({ page }) => {
		const trigger = page.locator('button[aria-haspopup]').nth(1);
		await trigger.click();
		await expectInViewport(page, page.getByRole('dialog'));
		await page.keyboard.press('Escape');
		await expect(page.getByRole('dialog')).toBeHidden();
	});

	for (const idx of [0, 1]) {
		test(`popup flips above trigger #${idx} near viewport bottom`, async ({ page }) => {
			await page.setViewportSize({ width: 900, height: 420 });
			await page.addStyleTag({ content: '#storybook-root{padding-top:700px;padding-bottom:700px}' });
			const trigger = page.locator('button[aria-haspopup]').nth(idx);
			await trigger.evaluate((el) => { const r = el.getBoundingClientRect(); window.scrollTo(0, window.scrollY + r.bottom - window.innerHeight + 20); });
			await trigger.click();
			const dlg = page.getByRole('dialog');
			await expectInViewport(page, dlg);
			const [t, d] = [await trigger.boundingBox(), await dlg.boundingBox()];
			expect(d!.y + d!.height / 2).toBeLessThan(t!.y); // opened above the trigger
			expect(d!.y).toBeGreaterThanOrEqual(0);
		});

		test(`flipped popup does not overlap trigger #${idx}`, async ({ page }) => {
			await page.setViewportSize({ width: 900, height: 420 });
			await page.addStyleTag({ content: '#storybook-root{padding-top:700px;padding-bottom:700px}' });
			const trigger = page.locator('button[aria-haspopup]').nth(idx);
			await trigger.evaluate((el) => { const r = el.getBoundingClientRect(); window.scrollTo(0, window.scrollY + r.bottom - window.innerHeight + 20); });
			await trigger.click();
			const dlg = page.getByRole('dialog');
			await expect(dlg).toBeVisible();
			await page.waitForTimeout(600);
			const [t, d] = [await trigger.boundingBox(), await dlg.boundingBox()];
			expect(d!.y + d!.height).toBeLessThanOrEqual(t!.y + 1);
		});
	}
});

test.describe('Nested layers', () => {
	test('DatePicker inside Popover: clicking in the date popup keeps parent popover open', async ({ page }) => {
		await story(page, 'planner-pickers--recurrence');
		await page.locator('#storybook-root button').first().click();
		const parent = page.getByRole('dialog').first();
		await expect(parent).toBeVisible();
		await parent.getByRole('button', { name: 'Daily' }).click();
		await parent.getByLabel('On date').check();
		const dpTrigger = parent.locator('button[aria-haspopup]').first();
		await expect(dpTrigger).toBeVisible();
		await dpTrigger.click();
		const inner = page.getByRole('dialog').last();
		await expect(page.getByRole('dialog')).toHaveCount(2);
		await expectInViewport(page, inner);
		// clicking on non-closing chrome inside the date popup must not dismiss the parent
		await inner.click({ position: { x: 8, y: 8 } });
		await expect(parent).toBeVisible();
		await inner.locator('button:enabled').filter({ hasText: /^2[0-7]$/ }).first().click();
		await expect(page.getByRole('dialog')).toHaveCount(1);
		await expect(parent).toBeVisible();
	});
});

test.describe('DatePicker month/year dropdowns', () => {
	test('jump to another month and year, then pick a day', async ({ page }) => {
		await story(page, 'forms-overview--dates');
		const trigger = page.locator('button[aria-haspopup="dialog"]').first();
		await trigger.click();
		const dialog = page.getByRole('dialog');
		await expect(dialog).toBeVisible();
		await dialog.getByLabel('Year', { exact: true }).selectOption('2030');
		await dialog.getByLabel('Month', { exact: true }).selectOption('2'); // March
		await expect(dialog.getByLabel('Month', { exact: true })).toHaveValue('2');
		await dialog.getByRole('button', { name: '15', exact: true }).click();
		await expect(dialog).toBeHidden();
		await expect(trigger).toContainText('15.03.2030');
	});
});
