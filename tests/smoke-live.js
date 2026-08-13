const { chromium } = require('playwright');

const url = `https://kevinkaslana093.github.io/after-zero/?release=${Date.now()}`;
const save = {
  version: 1,
  settings: { textSpeed: 5, autoDelay: 700, volume: 0, musicVolume: 84, sfxVolume: 88, muted: true, reducedMotion: true },
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
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForFunction(() => {
    const boot = document.querySelector('#boot-screen');
    return boot?.classList.contains('complete') && getComputedStyle(boot).visibility === 'hidden';
  }, null, { timeout: 30000 });
  await page.waitForSelector('.title-content', { timeout: 30000 });
  const version = await page.locator('.title-footer b').textContent();
  if (!version.includes('V4.6')) errors.push(`wrong live version: ${version}`);
  await page.click('#collection-btn');
  await page.waitForSelector('.evidence-decoder.complete');
  await page.locator('.archive-card:not(.locked)').first().click();
  await page.waitForSelector('.evidence-sheet');
  await page.click('.evidence-sheet + .glass-button');
  await page.click('.close-button');
  await page.click('#zero-route-btn');
  await page.waitForSelector('#decoder-modal:not(.hidden)');
  const answers = ['右声道', '早 3 秒', 'CH 06', '系统之外', '线上听众'];
  for (const answer of answers) {
    await page.locator('.decoder-evidence:not(.verified)').first().click();
    await page.getByRole('button', { name: new RegExp(answer) }).click();
    await page.waitForTimeout(600);
  }
  await page.click('.decoder-submit');
  await page.getByRole('button', { name: /线上听众/ }).click();
  await page.waitForSelector('.decoder-success');
  await page.click('.decoder-success .decoder-submit');
  await page.waitForSelector('#game-screen.active');
  const audioSave = {
    ...save,
    settings: { ...save.settings, volume: 42, musicVolume: 84, sfxVolume: 88, muted: false },
    endings: [], zeroTitleSeen: false,
    autoSave: { ...save.autoSave, state: { ...save.autoSave.state, nodeId: 'v4_d1_supper_10', currentBg: 'v4_convenience' } }
  };
  const audioPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  audioPage.on('pageerror', error => errors.push(error.message));
  audioPage.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  await audioPage.addInitScript(value => localStorage.setItem('after-zero-save-v1', JSON.stringify(value)), audioSave);
  await audioPage.goto(`${url}&audio=1`, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await audioPage.waitForFunction(() => {
    const boot = document.querySelector('#boot-screen');
    return boot?.classList.contains('complete') && getComputedStyle(boot).visibility === 'hidden';
  });
  await audioPage.click('#continue-btn');
  await audioPage.waitForFunction(() => document.body.dataset.lastSfx === 'shutter');
  const audioState = await audioPage.evaluate(() => ({ state: document.body.dataset.audioState, scene: document.body.dataset.audioScene, cue: document.body.dataset.lastSfx }));
  if (audioState.state !== 'active' || audioState.scene !== 'street' || audioState.cue !== 'shutter') errors.push(`wrong live audio state: ${JSON.stringify(audioState)}`);
  await audioPage.close();

  const zeroPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const zeroSave = {
    ...save,
    settings: { ...save.settings, volume: 42, musicVolume: 84, sfxVolume: 88, muted: false },
    endings: [], zeroTitleSeen: false,
    autoSave: { ...save.autoSave, state: { ...save.autoSave.state, nodeId: 'v4_d2_call_06', currentBg: 'v4_studio_signal' } }
  };
  await zeroPage.addInitScript(value => localStorage.setItem('after-zero-save-v1', JSON.stringify(value)), zeroSave);
  await zeroPage.goto(`${url}&zero=stable`, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await zeroPage.waitForFunction(() => document.querySelector('#boot-screen')?.classList.contains('complete'));
  await zeroPage.click('#continue-btn');
  await zeroPage.waitForSelector('#signal-event.show');
  const zeroState = await zeroPage.evaluate(() => ({
    label: document.querySelector('#signal-event-label')?.textContent,
    danger: document.querySelector('#signal-event')?.classList.contains('danger'),
    corrupt: document.querySelector('#game-screen')?.classList.contains('signal-corrupt'),
    intensity: document.body.dataset.audioIntensity
  }));
  if (zeroState.label !== 'ZERO RELAY ONLINE' || zeroState.danger || zeroState.corrupt || zeroState.intensity !== 'calm') errors.push(`stable Zero framed as hostile: ${JSON.stringify(zeroState)}`);
  await zeroPage.close();
  if (errors.length) throw new Error(errors.join('; '));
  await browser.close();
  console.log(`Live smoke valid: ${url}`);
})().catch(error => { console.error(error); process.exit(1); });
