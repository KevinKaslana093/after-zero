const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const output = path.resolve(root, '..', '..', '..', 'outputs');
const url = `file:///${path.join(root, 'index.html').replace(/\\/g, '/')}`;
const save = {
  version: 1,
  settings: { textSpeed: 5, autoDelay: 700, volume: 0, musicVolume: 84, sfxVolume: 88, muted: true, reducedMotion: true },
  endings: ['lincheng', 'tangsha', 'sumi', 'guwanqing', 'jiyao'], echoes: [], read: [], saves: [null,null,null,null,null,null],
  autoSave: { state: { player: '测试听众', hero: '江临', nodeId: 'v4_route_reentry', route: null, affinity: {lincheng:0,tangsha:0,sumi:0,guwanqing:0,jiyao:0}, flags: {}, history: [], startedAt: Date.now(), currentBg: 'v4_studio_signal', currentPortrait: null, currentExpression: 'default' }, time: Date.now() },
  zeroTitleSeen: true
};

async function solveDecoder(page, includeMistake = false) {
  await page.click('#zero-route-btn');
  await page.waitForSelector('#decoder-modal:not(.hidden)');
  const answers = ['右声道', '早 3 秒', 'CH 06', '系统之外', '测试听众'];
  for (let i = 0; i < answers.length; i++) {
    await page.locator('.decoder-evidence:not(.verified)').first().click();
    if (includeMistake && i === 0) {
      await page.locator('.decoder-options button').first().click();
      const integrity = await page.locator('#decoder-integrity-value').textContent();
      if (integrity === '100%') throw new Error('wrong decoder answer did not reduce integrity');
    }
    await page.getByRole('button', { name: new RegExp(answers[i]) }).click();
    await page.waitForSelector(`.decoder-evidence.verified:nth-child(${i + 1})`);
  }
  await page.click('.decoder-submit');
  await page.getByRole('button', { name: /测试听众/ }).click();
  await page.waitForSelector('.decoder-success');
}

async function waitForBoot(page) {
  await page.waitForFunction(() => {
    const boot = document.querySelector('#boot-screen');
    return boot?.classList.contains('complete') && getComputedStyle(boot).visibility === 'hidden';
  });
}

async function forceDecoderFailure(page) {
  await page.click('#zero-route-btn');
  await page.locator('.decoder-evidence').first().click();
  const wrong = page.locator('.decoder-options button').first();
  for (let i = 0; i < 7; i++) await wrong.click();
  await page.waitForSelector('.decoder-failure');
  await page.click('.decoder-failure .decoder-submit');
  await page.waitForSelector('.decoder-evidence-grid');
  await page.click('#decoder-abort');
}

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge', args: ['--disable-gpu'] });
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
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await waitForBoot(page);
    await page.screenshot({ path: path.join(output, `after-zero-title-${scenario.name}.png`), fullPage: true });
    const titleLayout = await page.evaluate(() => ({
      menu: document.querySelector('.title-menu')?.getBoundingClientRect().toJSON(),
      progress: document.querySelector('.title-progress')?.getBoundingClientRect().toJSON(),
      width: innerWidth,
      height: innerHeight
    }));
    if (!titleLayout.menu || titleLayout.menu.top < -1 || titleLayout.progress.bottom > titleLayout.height + 1) errors.push('title menu clipped');
    await page.click('#zero-route-btn');
    await page.waitForSelector('#decoder-modal:not(.hidden)');
    await page.screenshot({ path: path.join(output, `after-zero-${scenario.name}.png`), fullPage: true });
    const layout = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      width: document.documentElement.clientWidth,
      console: document.querySelector('.decoder-console')?.getBoundingClientRect().toJSON()
    }));
    if (layout.scrollWidth > layout.width + 1) errors.push(`horizontal overflow ${layout.scrollWidth} > ${layout.width}`);
    if (!layout.console || layout.console.width <= 0 || layout.console.height <= 0) errors.push('decoder console not visible');
    if (errors.length) throw new Error(`${scenario.name}: ${errors.join('; ')}`);
    await page.close();
  }

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(value => localStorage.setItem('after-zero-save-v1', JSON.stringify(value)), save);
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await waitForBoot(page);
  await solveDecoder(page, true);
  await page.screenshot({ path: path.join(output, 'after-zero-decoder-success.png'), fullPage: true });
  await page.click('.decoder-success .decoder-submit');
  await page.waitForSelector('#game-screen.active');
  const trueRoute = await page.evaluate(() => ({ chapter: document.querySelector('#chapter-title').textContent, text: document.querySelector('#dialogue-text').textContent }));
  if (!trueRoute.text) throw new Error('true route did not render');
  await page.close();

  const failurePage = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await failurePage.addInitScript(value => localStorage.setItem('after-zero-save-v1', JSON.stringify(value)), save);
  await failurePage.goto(url, { waitUntil: 'domcontentloaded' });
  await waitForBoot(failurePage);
  await forceDecoderFailure(failurePage);
  await failurePage.close();

  const archivePage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await archivePage.addInitScript(value => localStorage.setItem('after-zero-save-v1', JSON.stringify(value)), save);
  await archivePage.goto(url, { waitUntil: 'domcontentloaded' });
  await waitForBoot(archivePage);
  await archivePage.click('#collection-btn');
  await archivePage.click('.archive-decode-button');
  await archivePage.waitForSelector('#decoder-modal:not(.hidden)');
  await archivePage.close();

  const cuePage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const cueSave = JSON.parse(JSON.stringify(save));
  cueSave.autoSave.state.nodeId = 'v4_d1_howl_05';
  cueSave.autoSave.state.currentBg = 'v4_studio_signal';
  cueSave.endings = [];
  cueSave.zeroTitleSeen = false;
  await cuePage.addInitScript(value => localStorage.setItem('after-zero-save-v1', JSON.stringify(value)), cueSave);
  await cuePage.goto(url, { waitUntil: 'domcontentloaded' });
  await waitForBoot(cuePage);
  await cuePage.click('#continue-btn');
  await cuePage.waitForSelector('#signal-event.show');
  const cue = await cuePage.locator('#signal-event-label').textContent();
  if (cue !== 'SIGNAL DESYNC') throw new Error(`unexpected unstable zero cue: ${cue}`);
  if (!(await cuePage.locator('#game-screen').evaluate(element => element.classList.contains('signal-corrupt')))) throw new Error('unstable zero line did not trigger corruption');
  await cuePage.close();

  const stableZeroPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const stableZeroSave = JSON.parse(JSON.stringify(save));
  stableZeroSave.settings.muted = false;
  stableZeroSave.settings.volume = 42;
  stableZeroSave.autoSave.state.nodeId = 'v4_d2_call_06';
  stableZeroSave.autoSave.state.currentBg = 'v4_studio_signal';
  stableZeroSave.endings = [];
  stableZeroSave.zeroTitleSeen = false;
  await stableZeroPage.addInitScript(value => localStorage.setItem('after-zero-save-v1', JSON.stringify(value)), stableZeroSave);
  await stableZeroPage.goto(url, { waitUntil: 'domcontentloaded' });
  await waitForBoot(stableZeroPage);
  await stableZeroPage.click('#continue-btn');
  await stableZeroPage.waitForSelector('#signal-event.show');
  const stableZeroState = await stableZeroPage.evaluate(() => ({
    label: document.querySelector('#signal-event-label')?.textContent,
    danger: document.querySelector('#signal-event')?.classList.contains('danger'),
    corrupt: document.querySelector('#game-screen')?.classList.contains('signal-corrupt'),
    intensity: document.body.dataset.audioIntensity
  }));
  if (stableZeroState.label !== 'ZERO RELAY ONLINE' || stableZeroState.danger || stableZeroState.corrupt || stableZeroState.intensity !== 'calm') {
    throw new Error(`stable zero line was framed as hostile: ${JSON.stringify(stableZeroState)}`);
  }
  await stableZeroPage.close();

  const bootPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const bootSave = JSON.parse(JSON.stringify(save));
  bootSave.settings.reducedMotion = false;
  await bootPage.addInitScript(value => localStorage.setItem('after-zero-save-v1', JSON.stringify(value)), bootSave);
  await bootPage.goto(url, { waitUntil: 'domcontentloaded' });
  await bootPage.waitForSelector('#boot-screen:not(.complete)');
  await bootPage.click('#boot-skip');
  await bootPage.waitForFunction(() => document.querySelector('#boot-screen')?.classList.contains('audio-connected'));
  if ((await bootPage.locator('#boot-skip').textContent()).includes('点击接入声音')) throw new Error('boot audio did not acknowledge user gesture');
  await bootPage.waitForFunction(() => Number(document.querySelector('#boot-progress-value')?.textContent.replace('%', '')) >= 24);
  await bootPage.screenshot({ path: path.join(output, 'after-zero-boot.png'), fullPage: true });
  await bootPage.waitForSelector('#boot-screen.exiting');
  await bootPage.screenshot({ path: path.join(output, 'after-zero-boot-transition.png'), fullPage: true });
  await waitForBoot(bootPage);
  const version = await bootPage.locator('.title-footer b').textContent();
  if (!version.includes('V4.5')) throw new Error(`unexpected local version: ${version}`);
  await bootPage.click('#about-btn');
  await bootPage.waitForSelector('.about-sheet');
  if (!(await bootPage.locator('.about-copy').textContent()).includes('1712')) throw new Error('about screen did not show current story size');
  await bootPage.click('.close-button');
  await bootPage.click('#title-settings-btn');
  const settingLabels = await bootPage.locator('.setting-row label').allTextContents();
  for (const label of ['总音量', '背景音乐', '剧情音效', '静音']) {
    if (!settingLabels.includes(label)) throw new Error(`missing audio setting: ${label}`);
  }
  const reset = bootPage.locator('.danger-reset');
  await reset.click();
  if (!(await reset.textContent()).includes('再次点击')) throw new Error('progress reset did not require confirmation');
  if (!(await bootPage.evaluate(() => Boolean(localStorage.getItem('after-zero-save-v1'))))) throw new Error('first reset click cleared save');
  await bootPage.evaluate(() => {
    const original = Storage.prototype.removeItem;
    Storage.prototype.removeItem = function (key) {
      original.call(this, key);
      if (key === 'after-zero-save-v1') sessionStorage.setItem('after-zero-reset-confirmed', '1');
    };
  });
  await Promise.all([bootPage.waitForNavigation({ waitUntil: 'domcontentloaded' }), reset.click()]);
  if (!(await bootPage.evaluate(() => sessionStorage.getItem('after-zero-reset-confirmed') === '1'))) throw new Error('confirmed reset did not clear save before reload');
  await bootPage.close();

  const aftermathPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const aftermathSave = JSON.parse(JSON.stringify(save));
  aftermathSave.endings = [];
  aftermathSave.echoes = [];
  aftermathSave.autoSave.state.nodeId = 'v4_lc_choice1';
  aftermathSave.autoSave.state.currentBg = 'v4_studio_dusk';
  await aftermathPage.addInitScript(value => localStorage.setItem('after-zero-save-v1', JSON.stringify(value)), aftermathSave);
  await aftermathPage.goto(url, { waitUntil: 'domcontentloaded' });
  await waitForBoot(aftermathPage);
  await aftermathPage.click('#continue-btn');
  await aftermathPage.locator('.choice-button').first().click();
  await aftermathPage.waitForSelector('#choice-afterimage:not([hidden])');
  const aftermathText = await aftermathPage.locator('#choice-afterimage').textContent();
  if (!aftermathText.includes('停止')) throw new Error(`unexpected choice aftermath: ${aftermathText}`);
  await aftermathPage.screenshot({ path: path.join(output, 'after-zero-choice-afterimage.png'), fullPage: true });
  await aftermathPage.close();

  const silencePage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const silenceSave = JSON.parse(JSON.stringify(save));
  silenceSave.settings.reducedMotion = false;
  silenceSave.endings = [];
  silenceSave.autoSave.state.nodeId = 'v43_lincheng_dead_air';
  silenceSave.autoSave.state.currentBg = 'v4_studio_alert';
  await silencePage.addInitScript(value => localStorage.setItem('after-zero-save-v1', JSON.stringify(value)), silenceSave);
  await silencePage.goto(url, { waitUntil: 'domcontentloaded' });
  await silencePage.click('#boot-skip');
  await waitForBoot(silencePage);
  await silencePage.click('#continue-btn');
  await silencePage.waitForSelector('#game-screen.silence');
  await silencePage.waitForTimeout(700);
  await silencePage.screenshot({ path: path.join(output, 'after-zero-silence.png'), fullPage: true });
  await silencePage.keyboard.press('Escape');
  if (!(await silencePage.locator('#modal').evaluate(element => element.classList.contains('hidden')))) throw new Error('silence beat was interrupted by menu');
  await silencePage.waitForSelector('#choice-layer:not(.hidden)', { timeout: 4000 });
  await silencePage.close();

  const audioPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const audioSave = JSON.parse(JSON.stringify(save));
  audioSave.settings = { textSpeed: 5, autoDelay: 700, volume: 42, musicVolume: 84, sfxVolume: 88, muted: false, reducedMotion: true };
  audioSave.endings = [];
  audioSave.zeroTitleSeen = false;
  audioSave.autoSave.state.nodeId = 'v4_d1_supper_10';
  audioSave.autoSave.state.currentBg = 'v4_convenience';
  await audioPage.addInitScript(value => localStorage.setItem('after-zero-save-v1', JSON.stringify(value)), audioSave);
  await audioPage.goto(url, { waitUntil: 'domcontentloaded' });
  await waitForBoot(audioPage);
  await audioPage.click('#continue-btn');
  await audioPage.waitForFunction(() => document.body.dataset.lastSfx === 'shutter');
  const audioState = await audioPage.evaluate(() => ({
    state: document.body.dataset.audioState,
    scene: document.body.dataset.audioScene,
    intensity: document.body.dataset.audioIntensity,
    mix: document.body.dataset.audioMix,
    cue: document.body.dataset.lastSfx
  }));
  if (audioState.state !== 'active' || audioState.scene !== 'street' || audioState.cue !== 'shutter') {
    throw new Error(`audio scene graph did not activate: ${JSON.stringify(audioState)}`);
  }
  await audioPage.close();

  const sharePage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const shareSave = JSON.parse(JSON.stringify(save));
  shareSave.endings = [];
  shareSave.autoSave.state.nodeId = 'ending_lincheng';
  shareSave.autoSave.state.currentBg = 'cg_lincheng';
  await sharePage.addInitScript(value => localStorage.setItem('after-zero-save-v1', JSON.stringify(value)), shareSave);
  await sharePage.goto(url, { waitUntil: 'domcontentloaded' });
  await waitForBoot(sharePage);
  await sharePage.click('#continue-btn');
  await sharePage.waitForSelector('#ending-screen.active');
  await sharePage.click('#ending-share-btn');
  await sharePage.waitForSelector('.share-card-preview');
  const card = await sharePage.locator('.share-card-preview').evaluate(image => ({ src: image.src, width: image.naturalWidth, height: image.naturalHeight }));
  if (!card.src.startsWith('data:image/png') || card.width !== 1200 || card.height !== 630) throw new Error(`invalid share card: ${JSON.stringify(card)}`);
  await sharePage.screenshot({ path: path.join(output, 'after-zero-share-card.png'), fullPage: true });
  await sharePage.close();
  await browser.close();
  console.log(`Browser smoke valid: voiced boot transition, ${scenarios.length} responsive decoder views, stable/unstable zero semantics, dynamic audio scene and cue, aftermath, silence, share card, full puzzle flow, and TRUE SIGNAL entry.`);
})().catch(error => { console.error(error); process.exit(1); });
