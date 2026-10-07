import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { defineConfig, devices } from '@playwright/test';

// Browsers are pre-installed (never downloaded here). If the build Playwright expects is missing,
// fall back to an installed headless shell / system Chrome.
const cache = `${homedir()}/.cache/ms-playwright`;
const fallback = [`${cache}/chromium_headless_shell-1234/chrome-headless-shell-linux64/chrome-headless-shell`, '/usr/bin/google-chrome'].find(existsSync);
const launchOptions = process.env.PW_CHROMIUM_PATH || fallback ? { executablePath: process.env.PW_CHROMIUM_PATH || fallback } : {};

export default defineConfig({
	testDir: 'e2e',
	fullyParallel: true,
	workers: process.env.CI ? 2 : 4,
	retries: 1,
	timeout: 30_000,
	expect: { timeout: 5_000 },
	reporter: [['list'], ['html', { open: 'never' }]],
	use: { baseURL: 'http://localhost:6007', trace: 'retain-on-failure', ...devices['Desktop Chrome'] },
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], launchOptions } }],
	webServer: {
		command: 'node e2e/serve.mjs',
		port: 6007,
		reuseExistingServer: true,
		timeout: 300_000,
	},
});
