import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1600, height: 1100 } });
await p.goto('http://localhost:3000/blog/test-blog', { waitUntil: 'networkidle' });
const btn = p.getByRole('button', { name: /View the hero photograph full size/ });
await btn.hover();
await p.waitForTimeout(800);
await p.screenshot({ path: '/app/shot-hover.png', clip: { x: 940, y: 380, width: 520, height: 420 } });
await b.close();
