const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const output = path.resolve(root, '..', '..', '..', 'outputs');
const url = `file:///${path.join(root, 'index.html').replace(/\\/g, '/')}`;
const save = {
  version: 1,
  settings: { textSpeed: 5, autoDelay: 700, volume: 0, muted: true, reducedMotion: true },
  endings: ['lincheng', 'tangsha', 'sumi', 'guwanqing', 'jiyao'], echoes: [], read: [], saves: [null,null,null,null,null,null],
  autoSave: { state: { player: '测试听众', hero: '江临', nodeId: 'v4_route_reentry', route: null, affinity: {lincheng:0,tangsha:0,sumi:0,guwanqing:0,jiyao:0}, flags: {}, history: [], startedAt: Date.now(), currentBg: 'v4_studio_signal', currentPortrait: null, currentExpression: 'default' }, time: Date.now() },
  zeroTitleSeen: true
};

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const scenarios = [
    { name: 'desktop', viewport: { width: 1440, height: 900 } },
    { name: 'phone-portrait', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
    { name: 'phone-landscape', viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true }
  ];
  for (const scenario of scenarios) {
    const page = await browser.newPage(scenario);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(value => localStorage.setItem('after-zero-save-v1', JSON.stringify(value)), save);
    await page.goto(url, { waitUntil: 'load' });
    await page.click('#collection-btn');
    await page.waitForSelector('.evidence-decoder.complete');
    await page.locator('.archive-card:not(.locked)').first().click();
    await page.waitForSelector('.evidence-sheet');
    await page.screenshot({ path: path.join(output, `after-zero-${scenario.name}.png`), fullPage: true });
    const layout = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      width: document.documentElement.clientWidth,
      sheet: document.querySelector('.evidence-sheet')?.getBoundingClientRect().toJSON()
    }));
    if (layout.scrollWidth > layout.width + 1) errors.push(`horizontal overflow ${layout.scrollWidth} > ${layout.width}`);
    if (!layout.sheet || layout.sheet.width <= 0 || layout.sheet.height <= 0) errors.push('evidence sheet not visible');
    if (errors.length) throw new Error(`${scenario.name}: ${errors.join('; ')}`);
  }

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(value => localStorage.setItem('after-zero-save-v1', JSON.stringify(value)), save);
  await page.goto(url, { waitUntil: 'load' });
  await page.click('#zero-route-btn');
  await page.waitForSelector('#game-screen.active');
  const trueRoute = await page.evaluate(() => ({ chapter: document.querySelector('#chapter-title').textContent, text: document.querySelector('#dialogue-text').textContent }));
  if (!trueRoute.text) throw new Error('true route did not render');

  const cuePage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const cueSave = JSON.parse(JSON.stringify(save));
  cueSave.autoSave.state.nodeId = 'v4_d1_howl_05';
  cueSave.autoSave.state.currentBg = 'v4_studio_signal';
  cueSave.endings = [];
  cueSave.zeroTitleSeen = false;
  await cuePage.addInitScript(value => localStorage.setItem('after-zero-save-v1', JSON.stringify(value)), cueSave);
  await cuePage.goto(url, { waitUntil: 'load' });
  await cuePage.click('#continue-btn');
  await cuePage.waitForSelector('#signal-event.show');
  const cue = await cuePage.locator('#signal-event-label').textContent();
  if (cue !== 'UNREGISTERED VOICE') throw new Error(`unexpected zero cue: ${cue}`);
  await browser.close();
  console.log(`Browser smoke valid: ${scenarios.length} responsive archive views, TRUE SIGNAL entry, and zero-channel cue.`);
})().catch(error => { console.error(error); process.exit(1); });
