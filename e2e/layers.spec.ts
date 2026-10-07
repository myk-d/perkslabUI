import { expect, test, type Page } from '@playwright/test';
import { story } from './helpers';

const layers = [
	{ name: 'Modal', id: 'overlays-overview--modal-dialog', trigger: 'Open modal', role: 'dialog', backdropCloses: true },
	{ name: 'AlertDialog', id: 'more-overview--overlays', trigger: 'Delete account', role: 'alertdialog', backdropCloses: false },
	{ name: 'Sheet', id: 'overlays-overview--sheet-panel', trigger: 'right', role: 'dialog', backdropCloses: true },
	{ name: 'Drawer', id: 'more-overview--overlays', trigger: 'Open drawer', role: 'dialog', backdropCloses: true },
] as const;

const bodyOverflow = (page: Page) => page.evaluate(() => document.body.style.overflow);

for (const l of layers) {
	test.describe(l.name, () => {
		test.beforeEach(({ page }) => story(page, l.id));

		test('opens, moves focus inside, traps Tab, locks scroll', async ({ page }) => {
			const trigger = page.getByRole('button', { name: l.trigger, exact: true });
			const dlg = page.getByRole(l.role);
			await trigger.click();
			await expect(dlg).toBeVisible();
			await expect(dlg).toContainText(/\w/);
			await expect.poll(() => dlg.evaluate((d) => d.contains(document.activeElement))).toBe(true);
			for (let i = 0; i < 8; i++) {
				await page.keyboard.press('Tab');
				expect(await dlg.evaluate((d) => d.contains(document.activeElement))).toBe(true);
			}
			for (let i = 0; i < 4; i++) {
				await page.keyboard.press('Shift+Tab');
				expect(await dlg.evaluate((d) => d.contains(document.activeElement))).toBe(true);
			}
			await expect.poll(() => bodyOverflow(page)).toBe('hidden');
		});

		test('Escape closes, focus returns to trigger, scroll lock restored', async ({ page }) => {
			const trigger = page.getByRole('button', { name: l.trigger, exact: true });
			const dlg = page.getByRole(l.role);
			const before = await bodyOverflow(page);
			await trigger.click();
			await expect(dlg).toBeVisible();
			await page.keyboard.press('Escape');
			await expect(dlg).toBeHidden();
			await expect(trigger).toBeFocused();
			await expect.poll(() => bodyOverflow(page)).toBe(before);
		});

		test(`backdrop click ${l.backdropCloses ? 'closes' : 'does NOT close'}`, async ({ page }) => {
			const dlg = page.getByRole(l.role);
			await page.getByRole('button', { name: l.trigger, exact: true }).click();
			await expect(dlg).toBeVisible();
			await page.mouse.click(4, 4);
			if (l.backdropCloses) await expect(dlg).toBeHidden();
			else {
				await page.waitForTimeout(500);
				await expect(dlg).toBeVisible();
				await page.keyboard.press('Escape');
				await expect(dlg).toBeHidden();
			}
		});
	});
}

test('Modal close button (X) closes it', async ({ page }) => {
	await story(page, 'overlays-overview--modal-dialog');
	await page.getByRole('button', { name: 'Open modal' }).click();
	await expect(page.getByRole('dialog')).toBeVisible();
	await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();
	await expect(page.getByRole('dialog')).toBeHidden();
});

test.describe('Confirm', () => {
	test.beforeEach(({ page }) => story(page, 'overlays-overview--confirm'));

	test('confirm button resolves true', async ({ page }) => {
		await page.getByRole('button', { name: 'useConfirm()' }).click();
		const dlg = page.getByRole('alertdialog');
		await expect(dlg).toContainText('Really delete?');
		await dlg.getByRole('button', { name: 'Delete' }).click();
		await expect(dlg).toBeHidden();
		await expect(page.getByText('Confirmed', { exact: true })).toBeVisible();
	});

	test('cancel button resolves false', async ({ page }) => {
		await page.getByRole('button', { name: 'useConfirm()' }).click();
		const dlg = page.getByRole('alertdialog');
		await dlg.getByRole('button', { name: 'Cancel' }).click();
		await expect(dlg).toBeHidden();
		await expect(page.getByText('Cancelled', { exact: true })).toBeVisible();
	});

	test('Escape cancels; ConfirmService resolves Yes', async ({ page }) => {
		await page.getByRole('button', { name: 'useConfirm()' }).click();
		await page.keyboard.press('Escape');
		await expect(page.getByText('Cancelled', { exact: true })).toBeVisible();
		await page.getByRole('button', { name: 'ConfirmService' }).click();
		const dlg = page.getByRole('alertdialog');
		await expect(dlg).toContainText('Continue?');
		await dlg.getByRole('button', { name: /confirm|ok|yes/i }).click();
		await expect(page.getByText('Yes', { exact: true })).toBeVisible();
	});
});

test.describe('Toasts', () => {
	test.beforeEach(({ page }) => story(page, 'overlays-overview--toasts'));

	test('success / error / warning appear with correct aria roles', async ({ page }) => {
		await page.getByRole('button', { name: 'Success' }).click();
		await expect(page.getByRole('status').filter({ hasText: 'Saved' })).toBeVisible();
		await page.getByRole('button', { name: 'Error', exact: true }).click();
		await expect(page.getByRole('alert').filter({ hasText: 'Something broke' })).toBeVisible();
		await page.getByRole('button', { name: 'Warning' }).click();
		await expect(page.getByRole('status').filter({ hasText: 'Careful' })).toBeVisible();
	});

	test('close button dismisses a toast', async ({ page }) => {
		await page.getByRole('button', { name: 'Error', exact: true }).click();
		const toast = page.getByRole('alert').filter({ hasText: 'Something broke' });
		await expect(toast).toBeVisible();
		await toast.getByRole('button', { name: 'Close notification' }).click();
		await expect(toast).toBeHidden();
	});

	test('duration:0 toast stays; timed toast auto-dismisses', async ({ page }) => {
		await page.getByRole('button', { name: 'Sticky info' }).click();
		const sticky = page.getByRole('status').filter({ hasText: 'FYI' });
		await expect(sticky).toBeVisible();
		await page.getByRole('button', { name: 'Success' }).click();
		const timed = page.getByRole('status').filter({ hasText: 'Saved' });
		await expect(timed).toBeVisible();
		await expect(timed).toBeHidden({ timeout: 15_000 });
		await expect(sticky).toBeVisible();
	});
});
