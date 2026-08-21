const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const output = path.resolve(root, '..', '..', '..', 'outputs');
const url = `file:///${path.join(root, 'index.html').replace(/\\/g, '/')}`;

async function waitForBoot(page) {
  await page.waitForFunction(() => {
    const boot = document.querySelector('#boot-screen');
    return boot?.classList.contains('complete') && getComputedStyle(boot).visibility === 'hidden';
  });
}

async function assertFitsViewport(page, selector, label) {
  const layout = await page.locator(selector).evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      width: innerWidth,
      height: innerHeight,
      scrollWidth: document.documentElement.scrollWidth
    };
  });
  if (layout.left < -1 || layout.top < -1 || layout.right > layout.width + 1 || layout.bottom > layout.height + 1) {
    throw new Error(`${label} clipped: ${JSON.stringify(layout)}`);
  }
  if (layout.scrollWidth > layout.width + 1) throw new Error(`${label} caused horizontal overflow`);
}

async function reachConsole(page) {
  for (let i = 0; i < 80; i += 1) {
    if (await page.locator('#producer-console:not(.hidden)').count()) return;
    await page.evaluate(() => {
      const choice = [...document.querySelectorAll('.choice-button')].find(button => button.getClientRects().length);
      (choice || document.querySelector('#advance-indicator'))?.click();
    });
    await page.waitForTimeout(25);
  }
  throw new Error('opening did not reach producer console');
}

async function solveConsole(page) {
  await page.locator('[data-console-action="freq-up"]').click();
  await page.locator('[data-console-action="freq-up"]').click();
  await page.locator('[data-console-action="line"][data-value="B"]').click();
  await page.locator('[data-console-action="test"]').click();
  await page.waitForSelector('.console-anomaly');
  await page.locator('[data-emergency="aux"][data-value="3"]').click();
  await page.locator('[data-emergency="delay"][data-value="-13"]').click();
  await page.waitForSelector('.console-resolved');
}

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge', args: ['--disable-gpu'] });
  const scenarios = [
    { name: 'phone-portrait', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
    { name: 'phone-landscape', viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true }
  ];

  for (const scenario of scenarios) {
    const page = await browser.newPage(scenario);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => localStorage.clear());
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.click('#boot-skip');
    await waitForBoot(page);
    await page.click('#new-game-btn');
    await page.fill('#player-name', '测试听众');
    await page.click('#confirm-name-btn');
    await page.waitForSelector('#call-prelude:not(.hidden)');
    await page.waitForTimeout(480);
    await assertFitsViewport(page, '.phone-shell', `${scenario.name} phone`);
    await page.screenshot({ path: path.join(output, `v47-call-${scenario.name}.png`), fullPage: true });
    await page.click('#answer-call');
    await page.waitForSelector('#call-prelude.answered');
    await page.click('#call-continue');
    await reachConsole(page);
    await page.waitForTimeout(360);
    await assertFitsViewport(page, '.console-shell', `${scenario.name} console`);
    await page.screenshot({ path: path.join(output, `v47-console-${scenario.name}.png`), fullPage: true });
    await solveConsole(page);
    await page.locator('.console-complete').click();
    for (let i = 0; i < 60 && !(await page.locator('#mission-update:not(.hidden)').count()); i += 1) {
      await page.evaluate(() => document.querySelector('#advance-indicator')?.click());
      await page.waitForTimeout(25);
    }
    await page.waitForSelector('#mission-update:not(.hidden)');
    await page.waitForTimeout(120);
    await assertFitsViewport(page, '.mission-paper', `${scenario.name} mission`);
    await page.screenshot({ path: path.join(output, `v47-mission-${scenario.name}.png`), fullPage: true });
    const record = await page.locator('.mission-paper').textContent();
    for (const phrase of ['停用号码在通讯录中备注为江朔', '来电与00:13异常都经过临海广播中心', '电话另一端是否真是江朔：未确认', '完成首夜直播']) {
      if (!record.includes(phrase)) throw new Error(`${scenario.name} mission missing: ${phrase}`);
    }
    if (errors.length) throw new Error(`${scenario.name} page errors: ${errors.join('; ')}`);
    await page.close();
  }

  await browser.close();
  console.log('V4.8 opening flow valid on portrait and landscape phones.');
})().catch(error => {
  console.error(error);
  process.exit(1);
});
