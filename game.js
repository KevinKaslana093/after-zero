(function () {
  'use strict';

  const STORY = window.AFTER_ZERO_STORY;
  const STORAGE_KEY = 'after-zero-save-v1';
  const HERO_NAME = '江临';
  const DEFAULT_PLAYER_NAME = '未署名听众';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clone = value => JSON.parse(JSON.stringify(value));

  const dom = {
    screens: $$('.screen'),
    title: $('#title-screen'), game: $('#game-screen'), ending: $('#ending-screen'),
    newGame: $('#new-game-btn'), continue: $('#continue-btn'), collection: $('#collection-btn'), titleSettings: $('#title-settings-btn'),
    endingPips: $('#ending-pips'), endingCount: $('#ending-count'),
    bgA: $('#bg-a'), bgB: $('#bg-b'), chapterNo: $('#chapter-number'), chapterTitle: $('#chapter-title'),
    portraitWrap: $('#portrait-wrap'), portrait: $('#portrait'), portraitGlow: $('#portrait-glow'), routeTag: $('#route-tag'),
    locationCard: $('#location-card'), locationName: $('#location-name'),
    dialogueBox: $('#dialogue-box'), speakerEn: $('#speaker-en'), speakerName: $('#speaker-name'), dialogueText: $('#dialogue-text'), advance: $('#advance-indicator'),
    choiceLayer: $('#choice-layer'), choicePrompt: $('#choice-prompt'), choices: $('#choices'),
    modal: $('#modal'), modalKicker: $('#modal-kicker'), modalTitle: $('#modal-title'), modalBody: $('#modal-body'),
    nameModal: $('#name-modal'), playerName: $('#player-name'), confirmName: $('#confirm-name-btn'),
    endingBg: $('#ending-bg'), endingIndex: $('#ending-index'), endingTitle: $('#ending-title'), endingSubtitle: $('#ending-subtitle'), endingQuote: $('#ending-quote'),
    endingTitleBtn: $('#ending-title-btn'), endingRestartBtn: $('#ending-restart-btn'), toast: $('#toast')
  };

  const defaults = {
    version: 1,
    settings: { textSpeed: 24, autoDelay: 1700, volume: 32, muted: false, reducedMotion: false },
    endings: [], read: [], saves: [null, null, null, null, null, null], autoSave: null
  };

  function loadPersistent() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (!raw || raw.version !== 1) return clone(defaults);
      return {
        ...clone(defaults), ...raw,
        settings: { ...defaults.settings, ...(raw.settings || {}) },
        saves: Array.from({ length: 6 }, (_, i) => raw.saves?.[i] || null),
        endings: Array.isArray(raw.endings) ? raw.endings : [],
        read: Array.isArray(raw.read) ? raw.read : []
      };
    } catch (_) { return clone(defaults); }
  }

  let persistent = loadPersistent();
  let state = null;
  let typingTimer = null;
  let autoTimer = null;
  let toastTimer = null;
  let fullText = '';
  let typing = false;
  let autoMode = false;
  let skipMode = false;
  let activeBg = 'a';
  let currentBg = null;
  let currentPortrait = null;
  let currentExpression = 'default';
  let modalContext = null;

  function savePersistent() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(persistent)); } catch (_) {}
  }

  function newState(player = DEFAULT_PLAYER_NAME, start = STORY.start) {
    return {
      player, hero: HERO_NAME, nodeId: start, route: null,
      affinity: Object.fromEntries(Object.keys(STORY.characters).map(k => [k, 0])),
      flags: {}, history: [], startedAt: Date.now(), currentBg: 'rooftop', currentPortrait: null, currentExpression: 'default'
    };
  }

  class AudioEngine {
    constructor() {
      this.ctx = null; this.master = null; this.ambientVoices = []; this.lfo = null;
      this.musicTimer = null; this.motifIndex = 0;
    }
    ensure() {
      if (this.ctx) {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        return;
      }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.connect(this.ctx.destination);
      this.applyVolume();
      this.setAmbience(currentBg || 'rooftop');
    }
    applyVolume() {
      if (!this.master || !this.ctx) return;
      const volume = persistent.settings.muted ? 0 : persistent.settings.volume / 100;
      this.master.gain.setTargetAtTime(volume, this.ctx.currentTime, .04);
    }
    tone(frequency, duration = .08, volume = .045, type = 'sine') {
      this.ensure();
      if (!this.ctx || !this.master || persistent.settings.muted) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type; osc.frequency.value = frequency;
      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(.0001, this.ctx.currentTime + duration);
      osc.connect(gain); gain.connect(this.master); osc.start(); osc.stop(this.ctx.currentTime + duration);
    }
    click() { this.tone(520, .055, .03, 'triangle'); }
    choice() { this.tone(740, .12, .055, 'sine'); setTimeout(() => this.tone(980, .16, .035, 'sine'), 60); }
    signal() { this.tone(220, .45, .05, 'sine'); setTimeout(() => this.tone(330, .55, .035, 'sine'), 90); }
    setAmbience(bg) {
      if (!this.ctx || !this.master) return;
      this.ambientVoices.forEach(({ osc }) => { try { osc.stop(); } catch (_) {} });
      this.ambientVoices = [];
      try { this.lfo?.stop(); } catch (_) {}
      clearInterval(this.musicTimer);
      const cgMap = { cg_lincheng: 'studio', cg_tangsha: 'street', cg_sumi: 'studio', cg_guwanqing: 'hospital', cg_jiyao: 'archive', cg_true: 'rooftop' };
      const scene = cgMap[bg] || bg;
      const frequencies = { rooftop: 46, studio: 55, street: 62, hospital: 71, archive: 41 };
      const root = frequencies[scene] || 50;
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.value = .08;
      lfoGain.gain.value = .002;
      [
        [1, .008, scene === 'hospital' ? 'sine' : 'triangle'],
        [1.5, .0045, 'sine'],
        [2, .0025, 'sine']
      ].forEach(([ratio, level, type], index) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type; osc.frequency.value = root * ratio; gain.gain.value = level;
        if (index === 0) { lfo.connect(lfoGain); lfoGain.connect(gain.gain); }
        osc.connect(gain); gain.connect(this.master); osc.start();
        this.ambientVoices.push({ osc, gain });
      });
      lfo.start(); this.lfo = lfo;

      const motifs = {
        rooftop: [184, 220, 277, 220], studio: [220, 330, 392, 330],
        street: [247, 311, 370, 311], hospital: [213, 284, 320, 284], archive: [165, 220, 262, 220]
      };
      const notes = motifs[scene] || motifs.rooftop;
      this.motifIndex = 0;
      this.musicTimer = setInterval(() => {
        if (!persistent.settings.muted) this.tone(notes[this.motifIndex++ % notes.length], 1.35, .011, 'sine');
      }, 2600);
    }
  }
  const audio = new AudioEngine();

  function token(text = '') {
    return String(text)
      .replaceAll('{hero}', state?.hero || HERO_NAME)
      .replaceAll('{player}', state?.player || DEFAULT_PLAYER_NAME);
  }

  function setScreen(target) {
    dom.screens.forEach(screen => screen.classList.toggle('active', screen === target));
  }

  function toast(message) {
    clearTimeout(toastTimer);
    dom.toast.textContent = message;
    dom.toast.classList.add('show');
    toastTimer = setTimeout(() => dom.toast.classList.remove('show'), 2100);
  }

  function formatTime(ts) {
    return new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(ts));
  }

  function setBackground(key, immediate = false) {
    if (!key || (currentBg === key && !immediate)) return;
    const info = STORY.backgrounds[key];
    if (!info) return;
    const incoming = activeBg === 'a' ? dom.bgB : dom.bgA;
    const outgoing = activeBg === 'a' ? dom.bgA : dom.bgB;
    incoming.style.backgroundImage = `url("${info.src}")`;
    if (immediate) {
      outgoing.classList.remove('active'); incoming.classList.add('active');
    } else {
      requestAnimationFrame(() => { outgoing.classList.remove('active'); incoming.classList.add('active'); });
    }
    activeBg = activeBg === 'a' ? 'b' : 'a';
    currentBg = key;
    if (state) state.currentBg = key;
    audio.setAmbience(key);
  }

  function showLocation(key) {
    const info = STORY.backgrounds[key];
    if (!info) return;
    dom.locationName.textContent = info.name;
    dom.locationCard.classList.remove('hidden');
    setTimeout(() => dom.locationCard.classList.add('hidden'), 2600);
  }

  function setPortrait(key, expression, resetExpression = false) {
    if (key === undefined) return;
    if (key === null || !STORY.characters[key]) {
      currentPortrait = null;
      currentExpression = 'default';
      if (state) { state.currentPortrait = null; state.currentExpression = 'default'; }
      dom.portraitWrap.classList.add('hidden');
      dom.portraitWrap.setAttribute('aria-hidden', 'true');
      return;
    }
    const char = STORY.characters[key];
    const characterChanged = currentPortrait !== key;
    const requestedExpression = expression || ((characterChanged || resetExpression) ? 'default' : currentExpression);
    const resolvedExpression = requestedExpression !== 'default' && char.expressions?.[requestedExpression] ? requestedExpression : 'default';
    const source = resolvedExpression === 'default' ? char.image : char.expressions[resolvedExpression];
    if (characterChanged || currentExpression !== resolvedExpression) {
      dom.portrait.src = source;
      dom.portrait.alt = `${char.name}，${char.age}岁，${char.role}`;
      dom.portraitWrap.style.setProperty('--hero-color', char.rgb);
      dom.routeTag.textContent = `${char.en} · ${char.role}`;
      dom.portraitWrap.classList.remove('entering');
      void dom.portraitWrap.offsetWidth;
      dom.portraitWrap.classList.add('entering');
    }
    currentPortrait = key;
    currentExpression = resolvedExpression;
    if (state) { state.currentPortrait = key; state.currentExpression = resolvedExpression; }
    dom.portraitWrap.classList.remove('hidden');
    dom.portraitWrap.setAttribute('aria-hidden', 'false');
  }

  function setSpeaker(speaker) {
    const entry = Object.values(STORY.characters).find(c => c.name === speaker);
    dom.speakerName.textContent = speaker || '旁白';
    dom.speakerEn.textContent = entry ? entry.en : speaker === '我' ? 'YOU' : speaker === '旁白' ? 'NARRATION' : 'SIGNAL';
  }

  function typeLine(text) {
    clearInterval(typingTimer); clearTimeout(autoTimer);
    fullText = token(text);
    dom.dialogueText.textContent = '';
    dom.advance.classList.add('hidden');
    typing = true;
    const chars = Array.from(fullText);
    let index = 0;
    const interval = persistent.settings.reducedMotion ? 1 : Math.max(5, persistent.settings.textSpeed);
    typingTimer = setInterval(() => {
      const burst = persistent.settings.textSpeed <= 8 ? 3 : 1;
      index = Math.min(chars.length, index + burst);
      dom.dialogueText.textContent = chars.slice(0, index).join('');
      if (index >= chars.length) finishTyping();
    }, interval);
  }

  function finishTyping() {
    clearInterval(typingTimer);
    typing = false;
    dom.dialogueText.textContent = fullText;
    dom.advance.classList.remove('hidden');
    if (autoMode) scheduleAuto();
    if (skipMode) scheduleSkip();
  }

  function scheduleAuto() {
    clearTimeout(autoTimer);
    autoTimer = setTimeout(() => advance(), persistent.settings.autoDelay);
  }

  function scheduleSkip() {
    clearTimeout(autoTimer);
    const current = state?.nodeId;
    if (!persistent.read.includes(current)) {
      setSkip(false);
      toast('遇到未读文本，已停止跳过');
      return;
    }
    autoTimer = setTimeout(() => advance(), 90);
  }

  function addHistory(node) {
    const item = { speaker: node.speaker || '旁白', text: token(node.text), nodeId: state.nodeId };
    const last = state.history[state.history.length - 1];
    if (!last || last.nodeId !== item.nodeId) state.history.push(item);
    if (state.history.length > 180) state.history.shift();
  }

  function snapshot() {
    return clone({ ...state, history: state.history.slice(-120) });
  }

  function autoSave() {
    if (!state) return;
    persistent.autoSave = { state: snapshot(), time: Date.now() };
    savePersistent();
    updateTitleProgress();
  }

  function showNode(id, options = {}) {
    clearInterval(typingTimer); clearTimeout(autoTimer);
    const node = STORY.nodes[id];
    if (!node) { toast(`找不到剧情节点：${id}`); return; }
    state.nodeId = id;
    dom.choiceLayer.classList.add('hidden');
    dom.dialogueBox.style.visibility = '';
    if (node.chapter) {
      dom.chapterNo.textContent = node.chapter.no;
      dom.chapterTitle.textContent = node.chapter.title;
    }
    const sceneChanged = Boolean(node.bg && node.bg !== currentBg);
    if (node.bg) setBackground(node.bg, options.immediate);

    if (node.type === 'line') {
      if (Object.prototype.hasOwnProperty.call(node, 'char')) setPortrait(node.char, node.expression, sceneChanged);
      if (node.location) showLocation(node.bg || currentBg);
      setSpeaker(node.speaker || '旁白');
      addHistory(node);
      if (!persistent.read.includes(id)) persistent.read.push(id);
      if (persistent.read.length > 1000) persistent.read.shift();
      typeLine(node.text);
      autoSave();
    } else if (node.type === 'choice') {
      showChoices(node);
      autoSave();
    } else if (node.type === 'gate') {
      const branch = (node.branches || []).find(item => requirementMet(item.requires));
      showNode(branch?.next || node.fallback, options);
    } else if (node.type === 'routeGate') {
      const trueRoute = node.trueRoute;
      const trueAvailable = trueRoute && requirementMet(trueRoute.requires)
        && (!trueRoute.onceEnding || !persistent.endings.includes(trueRoute.onceEnding));
      if (trueAvailable) {
        applyEffect(trueRoute.effect);
        showNode(trueRoute.next, options);
        return;
      }
      const routeKeys = Object.keys(node.routes || {});
      const highest = Math.max(...routeKeys.map(key => state.affinity[key] || 0));
      const candidates = routeKeys.filter(key => (state.affinity[key] || 0) === highest);
      const bias = state.flags.routeBias;
      const selected = candidates.includes(bias) ? bias : candidates[0];
      const route = node.routes[selected];
      if (!route) { toast('无法锁定个人信号'); return; }
      applyEffect(route.effect);
      setTimeout(() => toast(`SIGNAL LOCK · ${STORY.characters[selected].name}`), 180);
      showNode(route.next, options);
    } else if (node.type === 'ending') {
      receiveEnding(node.ending);
    }
  }

  function advance() {
    if (!state || !dom.modal.classList.contains('hidden') || !dom.nameModal.classList.contains('hidden')) return;
    const node = STORY.nodes[state.nodeId];
    if (!node || node.type !== 'line') return;
    audio.ensure();
    if (typing) { finishTyping(); return; }
    if (node.next) showNode(node.next);
  }

  function requirementMet(requires) {
    if (!requires) return true;
    if (requires.affinity && !Object.entries(requires.affinity)
      .every(([key, minimum]) => (state.affinity[key] || 0) >= minimum)) return false;
    if (requires.flags && !Object.entries(requires.flags)
      .every(([key, value]) => state.flags[key] === value)) return false;
    if (requires.endings) {
      const keys = Array.isArray(requires.endings) ? requires.endings : [];
      if (!keys.every(key => persistent.endings.includes(key))) return false;
    }
    return true;
  }

  function choiceUnlocked(choice) {
    return requirementMet(choice.requires);
  }

  function showChoices(node) {
    finishTyping();
    dom.dialogueBox.style.visibility = 'hidden';
    dom.choicePrompt.textContent = node.prompt || '你的选择是——';
    dom.choices.innerHTML = '';
    const unlockedChoices = node.choices.filter(choiceUnlocked);
    const legacyFallback = node.routeChoice && unlockedChoices.length === 0 && node.choices.some(choice => choice.char);
    const strongestSignal = node.routeChoice
      ? Math.max(...node.choices.map(choice => state.affinity[choice.char] || 0))
      : 0;
    node.choices.forEach((choice, index) => {
      const button = document.createElement('button');
      const unlocked = legacyFallback ? Boolean(choice.char) : choiceUnlocked(choice);
      const recommended = node.routeChoice && unlocked && strongestSignal > 0
        && (state.affinity[choice.char] || 0) === strongestSignal;
      button.className = `choice-button${node.routeChoice ? ' route-choice' : ''}${node.routeChoice && !choice.char ? ' true-choice' : ''}${unlocked ? '' : ' locked'}${recommended ? ' recommended' : ''}`;
      button.disabled = !unlocked;
      if (node.routeChoice && choice.char) {
        const char = STORY.characters[choice.char];
        const signal = !unlocked ? '信号尚未建立' : recommended ? 'SIGNAL STRONG' : '路线已解锁';
        button.innerHTML = `<img class="choice-avatar" src="${char.image}" alt=""><span class="choice-label">${choice.label}</span><span class="choice-hint">${choice.hint || ''} · ${signal}</span>`;
      } else if (node.routeChoice && !choice.char) {
        const signal = unlocked ? 'TRUE SIGNAL · 已解锁' : '接收五段个人信号后解锁';
        button.innerHTML = `<span class="choice-number">∞</span><span class="choice-label">${choice.label}</span><span class="choice-hint">${choice.hint || ''} · ${signal}</span>`;
      } else {
        button.innerHTML = `<span class="choice-number">0${index + 1}</span><span class="choice-label">${choice.label}</span><span class="choice-hint">${choice.hint || ''}</span>`;
      }
      button.addEventListener('click', () => unlocked && choose(choice));
      dom.choices.appendChild(button);
    });
    dom.choiceLayer.classList.remove('hidden');
  }

  function applyEffect(effect = {}) {
    if (effect.route) state.route = effect.route;
    if (effect.affinity) Object.entries(effect.affinity).forEach(([key, value]) => state.affinity[key] = (state.affinity[key] || 0) + value);
    if (effect.flags) Object.assign(state.flags, effect.flags);
  }

  function choose(choice) {
    if (!choiceUnlocked(choice) && !(STORY.nodes[state.nodeId]?.routeChoice
      && STORY.nodes[state.nodeId].choices.every(item => !choiceUnlocked(item)))) return;
    audio.choice();
    applyEffect(choice.effect);
    dom.choiceLayer.classList.add('hidden');
    dom.dialogueBox.style.visibility = '';
    state.history.push({ speaker: '选择', text: choice.label, nodeId: `${state.nodeId}:choice` });
    const strengthened = Object.entries(choice.effect?.affinity || {}).filter(([, value]) => value > 0).map(([key]) => STORY.characters[key]?.name).filter(Boolean);
    if (strengthened.length) setTimeout(() => toast(`SIGNAL + · ${strengthened.join(' / ')}`), 120);
    showNode(choice.next);
  }

  function receiveEnding(key) {
    const ending = STORY.endings[key];
    if (!ending) return;
    const isNew = !persistent.endings.includes(key);
    if (isNew) persistent.endings.push(key);
    const replayState = { ...snapshot(), nodeId: STORY.replayStart || STORY.routeSelect, route: null };
    if (STORY.replayStart) {
      Object.keys(replayState.affinity).forEach(name => { replayState.affinity[name] = 0; });
      replayState.flags = {};
    }
    persistent.autoSave = { state: replayState, time: Date.now() };
    savePersistent();
    updateTitleProgress();
    setScreen(dom.ending);
    const bg = STORY.backgrounds[ending.bg];
    const char = STORY.characters[ending.char || key] || STORY.characters.lincheng;
    dom.endingBg.style.backgroundImage = `linear-gradient(90deg, rgba(${char.rgb},.1), transparent), url("${bg.src}")`;
    dom.endingIndex.textContent = `${String(ending.index).padStart(2, '0')} / ${String(ending.total || 5).padStart(2, '0')}`;
    dom.endingTitle.textContent = ending.title;
    dom.endingSubtitle.textContent = ending.subtitle;
    dom.endingQuote.textContent = token(ending.quote);
    audio.signal();
    setTimeout(() => toast(isNew ? '新结局已记录至终夜档案' : '已读取结局记录'), 700);
  }

  function updateTitleProgress() {
    const heroineKeys = Object.entries(STORY.endings).filter(([, ending]) => ending.routeEnding !== false).map(([key]) => key);
    const heroineCount = heroineKeys.filter(key => persistent.endings.includes(key)).length;
    dom.endingPips.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
      const pip = document.createElement('i');
      if (persistent.endings.some(key => STORY.endings[key]?.index === i)) pip.className = 'on';
      dom.endingPips.appendChild(pip);
    }
    dom.endingCount.textContent = `${heroineCount} / 5${persistent.endings.includes('true') ? ' · TRUE' : ''}`;
    dom.continue.disabled = !persistent.autoSave;
    dom.newGame.querySelector('span').textContent = persistent.endings.includes('true') ? 'ANSWER AGAIN' : 'NEW SIGNAL';
    dom.newGame.querySelector('b').textContent = persistent.endings.includes('true') ? '再次回答' : '开始新故事';
  }

  function startGame(gameState) {
    audio.ensure();
    state = clone(gameState);
    state.hero = HERO_NAME;
    // V2 true-route saves used the old reveal structure. Resume them at the
    // beginning of the rebuilt finale so no player is stranded in legacy nodes.
    if (String(state.nodeId || '').startsWith('v2_true_')) state.nodeId = 'v3_true_awaken_01';
    currentBg = null; currentPortrait = null; currentExpression = 'default';
    activeBg = 'a'; dom.bgA.classList.add('active'); dom.bgB.classList.remove('active');
    setScreen(dom.game);
    setBackground(state.currentBg || 'rooftop', true);
    setPortrait(state.currentPortrait ?? null, state.currentExpression || 'default');
    showNode(state.nodeId, { immediate: true });
  }

  function returnTitle() {
    clearInterval(typingTimer); clearTimeout(autoTimer);
    setAuto(false); setSkip(false);
    closeModal();
    updateTitleProgress();
    setBackground('rooftop');
    setScreen(dom.title);
  }

  function openModal(kicker, title, render, context = null) {
    audio.click();
    clearTimeout(autoTimer);
    modalContext = context;
    dom.modalKicker.textContent = kicker;
    dom.modalTitle.textContent = title;
    dom.modalBody.innerHTML = '';
    render(dom.modalBody);
    dom.modal.classList.remove('hidden');
  }

  function closeModal() {
    dom.modal.classList.add('hidden');
    modalContext = null;
    if (autoMode && state && STORY.nodes[state.nodeId]?.type === 'line' && !typing) scheduleAuto();
  }

  function menuTile(en, zh, action) {
    const button = document.createElement('button');
    button.className = 'menu-tile';
    button.innerHTML = `<span>${en}</span><b>${zh}</b>`;
    button.addEventListener('click', action);
    return button;
  }

  function openGameMenu() {
    if (!state) return;
    openModal('PAUSE SIGNAL', '系统菜单', body => {
      const grid = document.createElement('div'); grid.className = 'menu-grid';
      grid.append(
        menuTile('SAVE', '保存进度', () => openSlots('save')),
        menuTile('LOAD', '读取进度', () => openSlots('load')),
        menuTile('BACKLOG', '对话回看', openLog),
        menuTile('CONFIG', '系统设置', openSettings),
        menuTile('FULLSCREEN', '切换全屏', toggleFullscreen),
        menuTile('TITLE', '返回标题', returnTitle)
      );
      body.appendChild(grid);
      const route = state.route && STORY.characters[state.route];
      const info = document.createElement('p');
      info.style.cssText = 'margin:24px 0 0;color:#91a6b4;font-size:10px;letter-spacing:.08em;text-align:center';
      info.textContent = state.route === 'true'
        ? 'TRUE SIGNAL · 第六频道 / 共通终章'
        : route ? `CURRENT SIGNAL · ${route.name} / 好感 ${state.affinity[state.route]}` : `CURRENT SIGNAL · 公共线 / ${state.player}`;
      body.appendChild(info);
    });
  }

  function openSlots(mode) {
    openModal(mode === 'save' ? 'MEMORY WRITE' : 'MEMORY READ', mode === 'save' ? '保存进度' : '读取进度', body => {
      const tabs = document.createElement('div'); tabs.className = 'system-tabs';
      const back = document.createElement('button'); back.className = 'tab-button'; back.textContent = '← 返回菜单'; back.onclick = openGameMenu;
      tabs.appendChild(back); body.appendChild(tabs);
      const grid = document.createElement('div'); grid.className = 'slot-grid';
      persistent.saves.forEach((slot, i) => {
        const button = document.createElement('button');
        button.className = `save-slot${slot ? '' : ' empty'}`;
        if (!slot) button.innerHTML = `<span>EMPTY · SLOT ${String(i + 1).padStart(2, '0')}</span>`;
        else {
          const node = STORY.nodes[slot.state.nodeId];
          const route = slot.state.route && STORY.characters[slot.state.route];
          button.innerHTML = `<span class="slot-no">SLOT ${String(i + 1).padStart(2, '0')}</span><time>${formatTime(slot.time)}</time><h3>${node?.chapter?.title || '零点之后'}${route ? ` · ${route.name}` : ''}</h3><p>${slot.excerpt || '信号记录'}</p>`;
        }
        button.onclick = () => {
          if (mode === 'save') {
            const currentNode = STORY.nodes[state.nodeId];
            persistent.saves[i] = { state: snapshot(), time: Date.now(), excerpt: token(currentNode?.text || currentNode?.prompt || '剧情选择') };
            savePersistent(); toast(`已保存至档位 ${i + 1}`); openSlots('save');
          } else if (slot) { closeModal(); startGame(slot.state); toast(`已读取档位 ${i + 1}`); }
          else toast('这个档位没有记录');
        };
        grid.appendChild(button);
      });
      body.appendChild(grid);
    }, mode);
  }

  function openLog() {
    if (!state) return;
    openModal('BACKLOG', '对话回看', body => {
      const list = document.createElement('div'); list.className = 'log-list';
      if (!state.history.length) list.innerHTML = '<p style="color:#91a6b4">还没有可回看的内容。</p>';
      state.history.slice().reverse().forEach(item => {
        const el = document.createElement('article'); el.className = 'log-item';
        const b = document.createElement('b'); b.textContent = item.speaker;
        const p = document.createElement('p'); p.textContent = item.text;
        el.append(b, p); list.appendChild(el);
      });
      body.appendChild(list);
    });
  }

  function settingRow(label, min, max, value, format, onInput) {
    const row = document.createElement('div'); row.className = 'setting-row';
    const lab = document.createElement('label'); lab.textContent = label;
    const input = document.createElement('input'); input.type = 'range'; input.min = min; input.max = max; input.value = value;
    const output = document.createElement('output'); output.textContent = format(value);
    input.oninput = () => { output.textContent = format(input.value); onInput(Number(input.value)); savePersistent(); };
    row.append(lab, input, output); return row;
  }

  function toggleRow(label, value, onToggle) {
    const row = document.createElement('div'); row.className = 'setting-row toggle';
    const lab = document.createElement('label'); lab.textContent = label;
    const button = document.createElement('button'); button.className = value ? 'on' : ''; button.setAttribute('aria-label', label);
    button.onclick = () => { const next = !button.classList.contains('on'); button.classList.toggle('on', next); onToggle(next); savePersistent(); };
    row.append(lab, button); return row;
  }

  function openSettings() {
    openModal('CONFIGURATION', '系统设置', body => {
      const list = document.createElement('div'); list.className = 'setting-list';
      list.append(
        settingRow('文字速度', 5, 60, persistent.settings.textSpeed, v => v <= 12 ? '很快' : v <= 28 ? '标准' : '慢', v => persistent.settings.textSpeed = v),
        settingRow('自动等待', 700, 3600, persistent.settings.autoDelay, v => `${(v / 1000).toFixed(1)}s`, v => persistent.settings.autoDelay = v),
        settingRow('音量', 0, 100, persistent.settings.volume, v => `${v}%`, v => { persistent.settings.volume = v; audio.applyVolume(); }),
        toggleRow('静音', persistent.settings.muted, v => { persistent.settings.muted = v; audio.applyVolume(); }),
        toggleRow('减少动态效果', persistent.settings.reducedMotion, v => { persistent.settings.reducedMotion = v; applySettings(); })
      );
      body.appendChild(list);
    });
  }

  function openArchive() {
    openModal('TERMINAL ARCHIVE', '终夜档案', body => {
      const grid = document.createElement('div'); grid.className = 'archive-grid';
      Object.entries(STORY.endings).sort((a,b) => a[1].index - b[1].index).forEach(([key, ending]) => {
        const unlocked = persistent.endings.includes(key);
        const char = STORY.characters[ending.char || key] || STORY.characters.lincheng;
        const card = document.createElement('article'); card.className = `archive-card${unlocked ? '' : ' locked'}`;
        card.innerHTML = `<img src="${ending.image || char.image}" alt=""><div class="archive-info"><small>${ending.routeEnding === false ? 'TRUE SIGNAL' : `SIGNAL ${String(ending.index).padStart(2,'0')}`}</small><h3>${unlocked ? ending.title : '未接收'}</h3></div>`;
        grid.appendChild(card);
      });
      body.appendChild(grid);
      const note = document.createElement('p');
      note.style.cssText = 'margin:24px 0 0;text-align:center;color:#91a6b4;font:400 11px/1.8 "Noto Serif SC",serif;letter-spacing:.1em';
      const heroineKeys = Object.entries(STORY.endings).filter(([, ending]) => ending.routeEnding !== false).map(([key]) => key);
      const heroineCount = heroineKeys.filter(key => persistent.endings.includes(key)).length;
      note.textContent = persistent.endings.includes('true')
        ? `TRUE SIGNAL 已完成：${state?.player || persistent.autoSave?.state?.player || DEFAULT_PLAYER_NAME} · 世界之外的回答者。`
        : heroineCount === 5
          ? 'TRUE SIGNAL 已建立：回到路线选择，接入“第六频道”。'
          : `再接收 ${5 - heroineCount} 段个人信号，即可拼合真正的时间线。`;
      body.appendChild(note);
    });
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  }

  function setAuto(value) {
    autoMode = value;
    $('[data-action="auto"]')?.classList.toggle('active', value);
    if (!value) clearTimeout(autoTimer);
    else if (!typing) scheduleAuto();
  }

  function setSkip(value) {
    skipMode = value;
    $('[data-action="skip"]')?.classList.toggle('active', value);
    if (!value) clearTimeout(autoTimer);
    else if (!typing) scheduleSkip();
  }

  function applySettings() {
    document.body.classList.toggle('reduced-motion', persistent.settings.reducedMotion);
    audio.applyVolume();
  }

  function preload() {
    [...Object.values(STORY.backgrounds).map(x => x.src), ...Object.values(STORY.characters).map(x => x.image)].forEach(src => { const img = new Image(); img.src = src; });
  }

  function bindEvents() {
    dom.newGame.onclick = () => { audio.ensure(); dom.nameModal.classList.remove('hidden'); setTimeout(() => dom.playerName.select(), 50); };
    dom.confirmName.onclick = () => {
      const name = dom.playerName.value.trim().slice(0, 8) || DEFAULT_PLAYER_NAME;
      dom.nameModal.classList.add('hidden'); startGame(newState(name));
    };
    dom.playerName.addEventListener('keydown', e => { if (e.key === 'Enter') dom.confirmName.click(); });
    dom.continue.onclick = () => persistent.autoSave && startGame(persistent.autoSave.state);
    dom.collection.onclick = openArchive;
    dom.titleSettings.onclick = openSettings;
    dom.dialogueBox.addEventListener('click', e => { if (!e.target.closest('.quick-menu')) advance(); });
    dom.advance.onclick = e => { e.stopPropagation(); advance(); };
    $$('.quick-menu button').forEach(button => button.onclick = e => {
      e.stopPropagation(); audio.click();
      const action = button.dataset.action;
      if (action === 'auto') setAuto(!autoMode);
      if (action === 'skip') setSkip(!skipMode);
      if (action === 'log') openLog();
      if (action === 'menu') openGameMenu();
    });
    $$('[data-close-modal]').forEach(el => el.onclick = closeModal);
    dom.endingTitleBtn.onclick = returnTitle;
    dom.endingRestartBtn.onclick = () => {
      const player = state?.player || persistent.autoSave?.state?.player || DEFAULT_PLAYER_NAME;
      const next = persistent.autoSave?.state ? clone(persistent.autoSave.state) : newState(player, STORY.routeSelect);
      next.player = player;
      next.hero = HERO_NAME;
      next.nodeId = STORY.replayStart || STORY.routeSelect;
      next.route = null;
      next.history = state?.history?.slice(-40) || next.history || [];
      if (STORY.replayStart) {
        Object.keys(next.affinity).forEach(key => { next.affinity[key] = 0; });
        next.flags = {};
      } else {
        Object.keys(next.affinity).forEach(key => { next.affinity[key] = Math.max(1, next.affinity[key] || 0); });
      }
      startGame(next);
    };
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        if (!dom.modal.classList.contains('hidden')) closeModal();
        else if (dom.game.classList.contains('active')) openGameMenu();
        return;
      }
      if (!dom.game.classList.contains('active') || !dom.modal.classList.contains('hidden')) return;
      if (e.key === 'Enter' || e.code === 'Space') { e.preventDefault(); advance(); }
      if (e.key.toLowerCase() === 'a') setAuto(!autoMode);
      if (e.key.toLowerCase() === 'l') openLog();
      if (e.key.toLowerCase() === 'h') document.body.classList.toggle('hide-ui');
    });
    document.addEventListener('pointerdown', () => audio.ensure(), { once: true });
  }

  function init() {
    preload(); bindEvents(); applySettings(); updateTitleProgress();
    dom.bgA.style.backgroundImage = `url("${STORY.backgrounds.rooftop.src}")`;
    for (const [key, ending] of Object.entries(STORY.endings)) if (!STORY.characters[ending.char || key]) console.warn('Ending without character', key);
  }

  init();
})();
