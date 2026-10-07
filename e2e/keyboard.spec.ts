import { expect, test } from '@playwright/test';
import { story } from './helpers';

test.describe('Tabs', () => {
	test('arrow keys change the selected tab and panel', async ({ page }) => {
		await story(page, 'display-overview--tabs-example');
		const books = page.getByRole('tab', { name: 'Books' });
		await expect(books).toHaveAttribute('aria-selected', 'true');
		await books.focus();
		await page.keyboard.press('ArrowRight');
		await expect(page.getByRole('tab', { name: 'Marks' })).toHaveAttribute('aria-selected', 'true');
		await expect(page.getByRole('tabpanel')).toContainText('Bookmarks.');
		await page.keyboard.press('ArrowRight');
		await expect(page.getByRole('tab', { name: 'Stats' })).toHaveAttribute('aria-selected', 'true');
		await page.keyboard.press('ArrowLeft');
		await expect(page.getByRole('tab', { name: 'Marks' })).toHaveAttribute('aria-selected', 'true');
		await page.getByRole('tab', { name: 'Books' }).click();
		await expect(page.getByRole('tabpanel')).toContainText('Your library.');
	});
});

test.describe('Accordion', () => {
	test('Enter toggles and aria-expanded follows', async ({ page }) => {
		await story(page, 'display-overview--accordion-example');
		const first = page.getByRole('button', { name: 'What is this?' });
		const second = page.getByRole('button', { name: 'Can I recolour it?' });
		await expect(first).toHaveAttribute('aria-expanded', 'true');
		await expect(second).toHaveAttribute('aria-expanded', 'false');
		await second.focus();
		await page.keyboard.press('Enter');
		await expect(second).toHaveAttribute('aria-expanded', 'true');
		await expect(page.getByText('Yes.', { exact: true })).toBeVisible();
		await first.focus();
		await page.keyboard.press('Enter');
		await expect(first).toHaveAttribute('aria-expanded', 'false');
		await expect(page.getByText('A themable React UI kit.')).toBeHidden();
	});
});

test.describe('Toggles: RadioGroup / Switch / Checkbox', () => {
	test.beforeEach(({ page }) => story(page, 'forms-overview--toggles'));

	test('Switch toggles with Space', async ({ page }) => {
		const sw = page.getByRole('switch', { name: 'Notifications' });
		await expect(sw).toBeChecked();
		await sw.focus();
		await page.keyboard.press('Space');
		await expect(sw).not.toBeChecked();
		await page.keyboard.press('Space');
		await expect(sw).toBeChecked();
	});

	test('Checkbox toggles with Space and click; disabled is inert', async ({ page }) => {
		const cb = page.getByRole('checkbox', { name: 'Accept terms' });
		await expect(cb).toBeChecked();
		await cb.focus();
		await page.keyboard.press('Space');
		await expect(cb).not.toBeChecked();
		await page.getByText('Accept terms').click();
		await expect(cb).toBeChecked();
		await expect(page.getByRole('checkbox', { name: 'Disabled' })).toBeDisabled();
	});

	test('RadioGroup: click and arrow keys change selection', async ({ page }) => {
		const pro = page.getByRole('radio', { name: 'Pro' });
		const free = page.getByRole('radio', { name: 'Free' });
		await expect(pro).toBeChecked();
		await free.click();
		await expect(free).toBeChecked();
		await page.keyboard.press('ArrowRight');
		await expect(pro).toBeChecked();
		await page.keyboard.press('ArrowLeft');
		await expect(free).toBeChecked();
	});
});

test.describe('InputOTP', () => {
	test.beforeEach(({ page }) => story(page, 'more-overview--form-extras'));
	const digit = (page: import('@playwright/test').Page, n: number) => page.getByLabel(`Digit ${n}`);

	test('typing advances focus', async ({ page }) => {
		await digit(page, 1).focus();
		await page.keyboard.type('123');
		await expect(digit(page, 1)).toHaveValue('1');
		await expect(digit(page, 2)).toHaveValue('2');
		await expect(digit(page, 3)).toHaveValue('3');
		await expect(digit(page, 4)).toBeFocused();
	});

	test('Backspace goes back', async ({ page }) => {
		await digit(page, 1).focus();
		await page.keyboard.type('12');
		await expect(digit(page, 3)).toBeFocused();
		await page.keyboard.press('Backspace');
		await expect(digit(page, 2)).toBeFocused();
		await page.keyboard.press('Backspace');
		await expect(digit(page, 2)).toHaveValue('');
	});

	test('paste fills all digits and completes', async ({ page }) => {
		await digit(page, 1).focus();
		await page.evaluate(() => {
			const dt = new DataTransfer();
			dt.setData('text/plain', '654321');
			document.activeElement!.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
		});
		for (let i = 1; i <= 6; i++) await expect(digit(page, i)).toHaveValue(String(7 - i));
		await expect(page.getByText('Code 654321')).toBeVisible();
	});
});

test('Slider: ArrowRight/ArrowLeft/Home change the value', async ({ page }) => {
	await story(page, 'more-overview--form-extras');
	const slider = page.getByRole('slider');
	await expect(slider).toHaveValue('40');
	await slider.focus();
	await page.keyboard.press('ArrowRight');
	await expect(slider).toHaveValue('41');
	await page.keyboard.press('ArrowLeft');
	await page.keyboard.press('ArrowLeft');
	await expect(slider).toHaveValue('39');
	await page.keyboard.press('End');
	await expect(slider).toHaveValue('100');
});

test.describe('Pagination', () => {
	test.beforeEach(({ page }) => story(page, 'more-overview--navigation'));

	test('next / prev / number buttons move aria-current', async ({ page }) => {
		const nav = page.getByRole('navigation', { name: 'Pagination' });
		await expect(nav.locator('[aria-current=page]')).toHaveText('6');
		await nav.getByRole('button', { name: 'Next page' }).click();
		await expect(nav.locator('[aria-current=page]')).toHaveText('7');
		await nav.getByRole('button', { name: 'Previous page' }).click();
		await nav.getByRole('button', { name: 'Previous page' }).click();
		await expect(nav.locator('[aria-current=page]')).toHaveText('5');
		await nav.getByRole('button', { name: '20', exact: true }).click();
		await expect(nav.locator('[aria-current=page]')).toHaveText('20');
		await expect(nav.getByRole('button', { name: 'Next page' })).toBeDisabled();
	});
});

test.describe('DataTable', () => {
	test.beforeEach(({ page }) => story(page, 'more-overview--data-table-example'));
	const table = (page: import('@playwright/test').Page) => page.locator('#storybook-root table');
	const firstCell = (page: import('@playwright/test').Page) => table(page).locator('tbody tr').first().locator('td').nth(1);

	test('sort click toggles aria-sort', async ({ page }) => {
		const th = table(page).getByRole('columnheader', { name: 'Title' });
		await th.getByRole('button').click();
		await expect(th).toHaveAttribute('aria-sort', 'ascending');
		await expect(firstCell(page)).toHaveText('Anathem');
		await th.getByRole('button').click();
		await expect(th).toHaveAttribute('aria-sort', 'descending');
		await expect(firstCell(page)).toHaveText('Ubik');
	});

	test('select-all checks every visible row', async ({ page }) => {
		await table(page).getByLabel('Select all').check();
		const rows = table(page).getByLabel('Select row');
		await expect(rows).toHaveCount(5);
		for (const r of await rows.all()) await expect(r).toBeChecked();
		await table(page).getByLabel('Select all').uncheck();
		for (const r of await rows.all()) await expect(r).not.toBeChecked();
	});

	test('search filters rows', async ({ page }) => {
		await page.getByLabel('Filter…').fill('hyperion');
		await expect(table(page).locator('tbody tr')).toHaveCount(1);
		await expect(firstCell(page)).toHaveText('Hyperion');
	});

	test('pagination moves between pages', async ({ page }) => {
		await expect(firstCell(page)).toHaveText('Dune');
		await page.locator('#storybook-root').getByRole('button', { name: /next/i }).click();
		await expect(firstCell(page)).toHaveText('Ubik');
	});
});

test.describe('Collapsible / ToggleGroup / Toggle', () => {
	test('Collapsible toggles content', async ({ page }) => {
		await story(page, 'more-overview--layout');
		const t = page.getByRole('button', { name: 'Toggle details' });
		await expect(page.getByText('Hidden until you ask.')).toBeHidden();
		await t.click();
		await expect(page.getByText('Hidden until you ask.')).toBeVisible();
		await t.focus();
		await page.keyboard.press('Enter');
		await expect(page.getByText('Hidden until you ask.')).toBeHidden();
	});

	test('Collapsible trigger exposes aria-expanded', async ({ page }) => {
		await story(page, 'more-overview--layout');
		const t = page.getByRole('button', { name: 'Toggle details' });
		await expect(t).toHaveAttribute('aria-expanded', 'false');
		await t.click();
		await expect(t).toHaveAttribute('aria-expanded', 'true');
	});

	test('ToggleGroup single selection', async ({ page }) => {
		await story(page, 'more-overview--grouping');
		const left = page.getByRole('radio', { name: 'Left' }).or(page.getByRole('button', { name: 'Left' })).first();
		const center = page.getByRole('radio', { name: 'Center' }).or(page.getByRole('button', { name: 'Center' })).first();
		const pressed = async (l: typeof left) => (await l.getAttribute('aria-pressed')) === 'true' || (await l.getAttribute('aria-checked')) === 'true' || (await l.getAttribute('data-state')) === 'on';
		await expect.poll(() => pressed(center)).toBe(true);
		await left.click();
		await expect.poll(() => pressed(left)).toBe(true);
		await expect.poll(() => pressed(center)).toBe(false);
	});

	test('Toggle aria-pressed flips', async ({ page }) => {
		await story(page, 'more-overview--grouping');
		const bold = page.getByRole('button', { name: 'Bold' });
		await expect(bold).toHaveAttribute('aria-pressed', 'false');
		await bold.click();
		await expect(bold).toHaveAttribute('aria-pressed', 'true');
	});
});

test.describe('Command palette', () => {
	test.beforeEach(({ page }) => story(page, 'more-overview--command-palette'));

	test.describe('CommandDialog', () => {

		test('Ctrl+K opens, typing filters, Enter runs action, dialog closes', async ({ page }) => {
			await page.keyboard.press('Control+k');
			const dlg = page.getByRole('dialog');
			await expect(dlg).toBeVisible();
			const input = dlg.getByRole('combobox');
			await expect(input).toBeFocused();
			await page.keyboard.type('prefer');
			await expect(dlg.getByRole('option')).toHaveCount(1);
			await expect(dlg.getByRole('option')).toContainText('Settings');
			await input.fill('cal');
			await expect(dlg.getByRole('option')).toHaveCount(1);
			await page.keyboard.press('Enter');
			await expect(page.getByText('Calendar', { exact: true }).last()).toBeVisible();
			await expect(dlg).toBeHidden();
		});

		test('Escape closes the palette and focus returns', async ({ page }) => {
			const opener = page.getByRole('button', { name: /Open palette/ });
			await opener.click();
			await expect(page.getByRole('dialog')).toBeVisible();
			await page.keyboard.press('Escape');
			await expect(page.getByRole('dialog')).toBeHidden();
			await expect(opener).toBeFocused();
		});
	});

	test('inline Command: typing filters, ArrowDown moves, Enter runs the action', async ({ page }) => {
		const input = page.getByRole('combobox');
		await input.click();
		await expect(page.getByRole('option')).toHaveCount(4);
		const a0 = await input.getAttribute('aria-activedescendant');
		await page.keyboard.press('ArrowDown');
		await expect.poll(() => input.getAttribute('aria-activedescendant')).not.toBe(a0);
		await page.keyboard.press('ArrowUp');
		await expect.poll(() => input.getAttribute('aria-activedescendant')).toBe(a0);
		await page.keyboard.type('prefer');
		await expect(page.getByRole('option')).toHaveCount(1);
		await input.fill('cal');
		await expect(page.getByRole('option')).toHaveCount(1);
		await page.keyboard.press('Enter');
		await expect(page.getByText('Calendar', { exact: true }).last()).toBeVisible();
		await expect(page.getByRole('status').filter({ hasText: 'Calendar' })).toBeVisible();
	});
});

test.describe('Carousel', () => {
	test.beforeEach(({ page }) => story(page, 'display-carousel--default'));

	test('next / prev buttons enable and disable at the ends', async ({ page }) => {
		const prev = page.getByRole('button', { name: 'Previous slide' });
		const next = page.getByRole('button', { name: 'Next slide' });
		await expect(prev).toBeDisabled();
		await next.click();
		await expect(prev).toBeEnabled();
		await expect(async () => {
			if (await next.isEnabled()) await next.click();
			await expect(next).toBeDisabled({ timeout: 300 });
		}).toPass({ timeout: 10_000 });
	});

	test('keyboard ArrowRight/ArrowLeft scrolls the carousel', async ({ page }) => {
		const prev = page.getByRole('button', { name: 'Previous slide' });
		await page.getByRole('button', { name: 'Next slide' }).focus();
		await page.keyboard.press('ArrowRight');
		await expect(prev).toBeEnabled();
		await page.waitForTimeout(700); // let the smooth scroll settle
		await page.keyboard.press('ArrowLeft');
		await expect(prev).toBeDisabled();
	});
});

test.describe('Resizable', () => {
	test('arrow keys change aria-valuenow', async ({ page }) => {
		await story(page, 'layout-resizable--default');
		const handle = page.getByRole('separator');
		await handle.focus();
		await expect(handle).toHaveAttribute('aria-valuenow', /\d+/);
		const before = Number(await handle.getAttribute('aria-valuenow'));
		await page.keyboard.press('ArrowRight');
		await expect.poll(async () => Number(await handle.getAttribute('aria-valuenow'))).toBeGreaterThan(before);
		const mid = Number(await handle.getAttribute('aria-valuenow'));
		await page.keyboard.press('ArrowLeft');
		await page.keyboard.press('ArrowLeft');
		await expect.poll(async () => Number(await handle.getAttribute('aria-valuenow'))).toBeLessThan(mid);
	});
});

test.describe('Sidebar', () => {
	test('Ctrl+B toggles collapsed state', async ({ page }) => {
		await story(page, 'navigation-sidebar--default');
		const sb = page.locator('[data-slot=sidebar]');
		await expect(sb).toHaveAttribute('data-state', 'expanded');
		await page.keyboard.press('Control+b');
		await expect(sb).toHaveAttribute('data-state', 'collapsed');
		await page.keyboard.press('Control+b');
		await expect(sb).toHaveAttribute('data-state', 'expanded');
	});
});

test.describe('Questionnaire', () => {
	const form = (page: import('@playwright/test').Page) => page.locator('#storybook-root form');

	test('required validation, number shortcut, Next/Back, submit FormData', async ({ page }) => {
		await story(page, 'forms-questionnaire--single');
		await expect(page.getByText('What best describes you?')).toBeVisible();
		await page.getByRole('button', { name: /next/i }).click();
		await expect(page.getByRole('alert')).toBeVisible();
		await expect(page.getByText('What best describes you?')).toBeVisible();
		await page.getByRole('radio', { name: 'Designer' }).focus();
		await page.keyboard.press('1');
		await expect(page.getByRole('radio', { name: 'Developer' })).toBeChecked();
		await page.getByRole('button', { name: /next/i }).click();
		await expect(page.getByText('How big is your team?')).toBeVisible();
		await page.getByRole('button', { name: /^(back|previous)/i }).click();
		await expect(page.getByText('What best describes you?')).toBeVisible();
		await expect(page.getByRole('radio', { name: 'Developer' })).toBeChecked();
		await page.getByRole('button', { name: /next/i }).click();
		await page.getByText('2 to 10').click();
		await page.getByRole('button', { name: /submit|finish|done/i }).click();
		await expect(page.getByText('{"role":"dev","team":"2-10"}')).toBeVisible();
	});

	test('multiple: custom shortcut keys toggle choices', async ({ page }) => {
		await story(page, 'forms-questionnaire--multiple');
		await page.getByRole('checkbox', { name: /Accessibility/ }).focus();
		await page.keyboard.press('u');
		await page.keyboard.press('p');
		await expect(page.getByRole('checkbox', { name: /Interfaces/ })).toBeChecked();
		await expect(page.getByRole('checkbox', { name: /Performance/ })).toBeChecked();
		await expect(page.getByRole('checkbox', { name: /Accessibility/ })).not.toBeChecked();
	});
});
