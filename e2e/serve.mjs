// Serves ./storybook-static on :6007, building it first when missing.
import { existsSync, createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { spawnSync } from 'node:child_process';
import { extname, join, normalize } from 'node:path';

const root = join(process.cwd(), 'storybook-static');
if (!existsSync(join(root, 'iframe.html'))) {
	const r = spawnSync('npm', ['run', 'build-storybook'], { stdio: 'inherit' });
	if (r.status !== 0) process.exit(r.status ?? 1);
}
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png', '.ico': 'image/x-icon', '.map': 'application/json' };
createServer((req, res) => {
	const p = normalize(decodeURIComponent((req.url ?? '/').split('?')[0])).replace(/^(\.\.[/\\])+/, '');
	let f = join(root, p);
	if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
	if (!existsSync(f)) { res.writeHead(404).end('not found'); return; }
	res.writeHead(200, { 'content-type': types[extname(f)] ?? 'application/octet-stream' });
	createReadStream(f).pipe(res);
}).listen(6007, () => console.log('storybook-static on http://localhost:6007'));
