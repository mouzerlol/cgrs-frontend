import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1600, height: 1100 } });
await p.goto('http://localhost:3000/blog/test-blog', { waitUntil: 'networkidle' });
const btn = p.getByRole('button', { name: /View the hero photograph full size/ });
console.log('rail hero cursor:', await btn.evaluate(el => getComputedStyle(el).cursor));
await b.close();
