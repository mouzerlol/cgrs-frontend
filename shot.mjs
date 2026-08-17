import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1600, height: 1100 } });
await p.goto('http://localhost:3000/blog/test-blog', { waitUntil: 'networkidle' });
await p.screenshot({ path: '/app/shot-top.png' });
await p.evaluate(() => window.scrollTo(0, 900));
await p.waitForTimeout(1200);
await p.screenshot({ path: '/app/shot-rail.png' });
await b.close();
