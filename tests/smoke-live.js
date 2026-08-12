const { chromium } = require('playwright');

const url = `https://kevinkaslana093.github.io/after-zero/?release=${Date.now()}`;
const save = {
  version: 1,
  settings: { textSpeed: 5, autoDelay: 700, volume: 0, muted: true, reducedMotion: true },
  endings: ['lincheng', 'tangsha', 'sumi', 'guwanqing', 'jiyao'], echoes: [], read: [], saves: [null,null,null,null,null,null],
  autoSave: { state: { player: '线上听众', hero: '江临', nodeId: 'v4_route_reentry', route: null, affinity: {lincheng:0,tangsha:0,sumi:0,guwanqing:0,jiyao:0}, flags: {}, history: [], startedAt: Date.now(), currentBg: 'v4_studio_signal', currentPortrait: null, currentExpression: 'default' }, time: Date.now() },
  zeroTitleSeen: true
};

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  await page.addInitScript(value => localStorage.setItem('after-zero-save-v1', JSON.stringify(value)), save);
  await page.goto(url, { waitUntil: 'networkidle' });
  const version = await page.locator('.title-footer b').textContent();
  if (!version.includes('V4.1')) errors.push(`wrong live version: ${version}`);
  await page.click('#collection-btn');
  await page.waitForSelector('.evidence-decoder.complete');
  await page.locator('.archive-card:not(.locked)').first().click();
  await page.waitForSelector('.evidence-sheet');
  await page.click('.evidence-sheet + .glass-button');
  await page.click('[data-close-modal]');
  await page.click('#zero-route-btn');
  await page.waitForSelector('#game-screen.active');
  if (errors.length) throw new Error(errors.join('; '));
  await browser.close();
  console.log(`Live smoke valid: ${url}`);
})().catch(error => { console.error(error); process.exit(1); });
