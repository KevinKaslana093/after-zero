(function () {
  'use strict';

  const STORY = window.AFTER_ZERO_STORY;
  const STORAGE_KEY = 'after-zero-save-v1';
  const HERO_NAME = '江临';
  const DEFAULT_PLAYER_NAME = '未署名听众';
  const RELEASE = 'V4.8.2';
  const SITE_URL = 'https://kevinkaslana093.github.io/after-zero/';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clone = value => JSON.parse(JSON.stringify(value));
  const escapeHTML = value => String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);

  const dom = {
    screens: $$('.screen'),
    boot: $('#boot-screen'), bootStatus: $('#boot-status'), bootTime: $('#boot-time'), bootProgressBar: $('#boot-progress-bar'),
    bootProgressValue: $('#boot-progress-value'), bootKicker: $('#boot-kicker'), bootSkip: $('#boot-skip'), bootTransition: $('.boot-transition'),
    title: $('#title-screen'), game: $('#game-screen'), ending: $('#ending-screen'),
    newGame: $('#new-game-btn'), continue: $('#continue-btn'), collection: $('#collection-btn'), titleSettings: $('#title-settings-btn'), about: $('#about-btn'),
    zeroRoute: $('#zero-route-btn'), zeroError: $('#zero-error'), zeroErrorConfirm: $('#zero-error-confirm'),
    endingPips: $('#ending-pips'), endingCount: $('#ending-count'),
    bgA: $('#bg-a'), bgB: $('#bg-b'), chapterNo: $('#chapter-number'), chapterTitle: $('#chapter-title'),
    portraitWrap: $('#portrait-wrap'), portrait: $('#portrait'), portraitGlow: $('#portrait-glow'), routeTag: $('#route-tag'),
    locationCard: $('#location-card'), locationName: $('#location-name'),
    signalEvent: $('#signal-event'), signalEventChannel: $('#signal-event-channel'), signalEventLabel: $('#signal-event-label'),
    choiceAfterimage: $('#choice-afterimage'), choiceAfterimageText: $('#choice-afterimage span'),
    dialogueBox: $('#dialogue-box'), speakerEn: $('#speaker-en'), speakerName: $('#speaker-name'), dialogueText: $('#dialogue-text'), advance: $('#advance-indicator'),
    choiceLayer: $('#choice-layer'), choicePrompt: $('#choice-prompt'), choices: $('#choices'),
    modal: $('#modal'), modalKicker: $('#modal-kicker'), modalTitle: $('#modal-title'), modalBody: $('#modal-body'),
    nameModal: $('#name-modal'), playerName: $('#player-name'), confirmName: $('#confirm-name-btn'),
    callPrelude: $('#call-prelude'), callState: $('#call-state'), answerCall: $('#answer-call'), callContinue: $('#call-continue'), callSkip: $('#call-skip'),
    producerConsole: $('#producer-console'), consoleBody: $('#console-body'), consoleProgress: $('#console-progress'),
    missionUpdate: $('#mission-update'), missionKicker: $('#mission-kicker'), missionTitle: $('#mission-title'),
    missionConfirmed: $('#mission-confirmed'), missionPending: $('#mission-pending'), missionObjective: $('#mission-objective'), missionContinue: $('#mission-continue'),
    storyMinigame: $('#story-minigame'),
    endingBg: $('#ending-bg'), endingIndex: $('#ending-index'), endingTitle: $('#ending-title'), endingSubtitle: $('#ending-subtitle'), endingQuote: $('#ending-quote'),
    endingEvidence: $('#ending-evidence'), endingEvidenceTitle: $('#ending-evidence-title'), endingEvidenceMeta: $('#ending-evidence-meta'),
    decoderModal: $('#decoder-modal'), decoderBody: $('#decoder-body'), decoderStage: $('#decoder-stage'),
    decoderIntegrityBar: $('#decoder-integrity-bar'), decoderIntegrityValue: $('#decoder-integrity-value'), decoderAbort: $('#decoder-abort'),
    endingTitleBtn: $('#ending-title-btn'), endingRestartBtn: $('#ending-restart-btn'), endingShareBtn: $('#ending-share-btn'), toast: $('#toast')
  };

  const defaults = {
    version: 1,
    settings: {
      textSpeed: 24, autoDelay: 1700, volume: 42,
      musicVolume: 84, sfxVolume: 88,
      muted: false, reducedMotion: false
    },
    endings: [], echoes: [], read: [], saves: [null, null, null, null, null, null], autoSave: null,
    zeroTitleSeen: false, decoder: { solved: false, verified: [], attempts: 0 }, minigames: [], zeroMessage: ''
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
        echoes: Array.isArray(raw.echoes) ? raw.echoes : [],
        read: Array.isArray(raw.read) ? raw.read : [],
        minigames: Array.isArray(raw.minigames) ? raw.minigames : [],
        zeroMessage: typeof raw.zeroMessage === 'string' ? raw.zeroMessage.slice(0, 40) : '',
        decoder: {
          solved: Boolean(raw.decoder?.solved || (Array.isArray(raw.endings) && raw.endings.includes('true'))),
          verified: Array.isArray(raw.decoder?.verified) ? raw.decoder.verified : [],
          attempts: Math.max(0, Number(raw.decoder?.attempts) || 0)
        }
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
  let currentEndingKey = null;
  let modalContext = null;
  let signalEventTimer = null;
  let lastSignalCueAt = 0;
  let decoderSession = null;
  let bootTimers = [];
  let bootComplete = false;
  let bootAudioStarted = false;
  let bootTransitioning = false;
  let silenceTimer = null;
  let pendingNewGame = null;
  let callRingTimer = null;
  let consoleSession = null;
  let missionNext = null;

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
      this.ctx = null;
      this.master = null; this.limiter = null;
      this.musicInput = null; this.musicFilter = null; this.musicEnergy = null;
      this.musicBus = null; this.ambienceBus = null; this.sfxBus = null;
      this.musicDuck = null; this.ambienceDuck = null; this.sfxDuck = null;
      this.ambientVoices = []; this.lfo = null; this.noiseLoopBuffer = null;
      this.musicTimer = null; this.duckTimer = null; this.silenceAudioTimer = null;
      this.motifIndex = 0; this.scene = null; this.profile = null; this.intensity = 'calm';
      this.lastCue = new Map(); this.lastPreviewAt = 0;
      this.sceneProfiles = {
        rooftop: {
          root: 46.25, step: 2320, pad: [1, 1.5, 2, 3],
          motif: [184.99, 220, 277.18, 329.63, 277.18, 220],
          noise: [
            { type: 'lowpass', frequency: 2800, q: .3, level: .052, pan: -.16 },
            { type: 'bandpass', frequency: 170, q: .55, level: .017, pan: .22 }
          ]
        },
        studio: {
          root: 55, step: 2060, pad: [1, 1.5, 2, 2.5],
          motif: [220, 261.63, 329.63, 392, 329.63, 261.63],
          noise: [
            { type: 'highpass', frequency: 1450, q: .35, level: .019, pan: -.2 },
            { type: 'bandpass', frequency: 108, q: 1.1, level: .014, pan: .18 }
          ]
        },
        street: {
          root: 61.74, step: 2180, pad: [1, 1.5, 2, 2.4],
          motif: [246.94, 311.13, 369.99, 415.3, 369.99, 311.13],
          noise: [
            { type: 'lowpass', frequency: 3400, q: .25, level: .047, pan: .18 },
            { type: 'bandpass', frequency: 310, q: .7, level: .014, pan: -.28 }
          ]
        },
        hospital: {
          root: 71.33, step: 2520, pad: [1, 1.333, 2, 2.667],
          motif: [213.99, 285.3, 320.24, 427.47, 320.24, 285.3],
          noise: [
            { type: 'bandpass', frequency: 760, q: .45, level: .021, pan: .12 },
            { type: 'highpass', frequency: 2300, q: .2, level: .011, pan: -.3 }
          ]
        },
        archive: {
          root: 41.2, step: 2670, pad: [1, 1.333, 2, 2.667],
          motif: [164.81, 220, 261.63, 329.63, 261.63, 220],
          noise: [
            { type: 'highpass', frequency: 1050, q: .3, level: .024, pan: -.22 },
            { type: 'bandpass', frequency: 92, q: 1.25, level: .015, pan: .26 }
          ]
        },
        relay: {
          root: 38.89, step: 1840, pad: [1, 1.414, 2, 2.828],
          motif: [155.56, 220, 233.08, 311.13, 233.08, 220],
          noise: [
            { type: 'bandpass', frequency: 620, q: 1.7, level: .029, pan: -.25 },
            { type: 'highpass', frequency: 1900, q: .8, level: .018, pan: .28 }
          ]
        }
      };
    }
    ensure() {
      if (this.ctx) {
        if (this.ctx.state === 'suspended') this.resume();
        return;
      }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      try {
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.limiter = this.ctx.createDynamicsCompressor();
        this.musicInput = this.ctx.createGain();
        this.musicFilter = this.ctx.createBiquadFilter();
        this.musicEnergy = this.ctx.createGain();
        this.musicBus = this.ctx.createGain();
        this.ambienceBus = this.ctx.createGain();
        this.sfxBus = this.ctx.createGain();
        this.musicDuck = this.ctx.createGain();
        this.ambienceDuck = this.ctx.createGain();
        this.sfxDuck = this.ctx.createGain();

        this.musicFilter.type = 'lowpass';
        this.musicFilter.frequency.value = 1900;
        this.musicFilter.Q.value = .42;
        this.musicEnergy.gain.value = .78;
        this.musicDuck.gain.value = 1;
        this.ambienceDuck.gain.value = 1;
        this.sfxDuck.gain.value = 1;
        this.master.gain.value = .0001;
        this.limiter.threshold.value = -16;
        this.limiter.knee.value = 18;
        this.limiter.ratio.value = 5;
        this.limiter.attack.value = .003;
        this.limiter.release.value = .28;

        this.musicInput.connect(this.musicFilter);
        this.musicFilter.connect(this.musicEnergy);
        this.musicEnergy.connect(this.musicBus);
        this.musicBus.connect(this.musicDuck);
        this.musicDuck.connect(this.master);
        this.ambienceBus.connect(this.ambienceDuck);
        this.ambienceDuck.connect(this.master);
        this.sfxBus.connect(this.sfxDuck);
        this.sfxDuck.connect(this.master);
        this.master.connect(this.limiter);
        this.limiter.connect(this.ctx.destination);

        this.applyVolume(true);
        document.body.classList.add('audio-active');
        document.body.dataset.audioState = 'active';
        this.setAmbience(currentBg || 'rooftop', true);
        this.setIntensity(this.intensity, true);
      } catch (_) {
        this.ctx = null;
        document.body.dataset.audioState = 'unavailable';
      }
    }
    clamp(value, fallback) {
      const number = Number(value);
      return Math.max(0, Math.min(100, Number.isFinite(number) ? number : fallback));
    }
    applyVolume(immediate = false) {
      if (!this.master || !this.ctx) return;
      const now = this.ctx.currentTime;
      const masterValue = this.clamp(persistent.settings.volume, defaults.settings.volume) / 100;
      const musicValue = this.clamp(persistent.settings.musicVolume, defaults.settings.musicVolume) / 100;
      const sfxValue = this.clamp(persistent.settings.sfxVolume, defaults.settings.sfxVolume) / 100;
      const output = persistent.settings.muted ? 0 : Math.pow(masterValue, .72) * .92;
      const write = (param, value, time = .055) => {
        param.cancelScheduledValues(now);
        if (immediate) param.setValueAtTime(value, now);
        else param.setTargetAtTime(value, now, time);
      };
      write(this.master.gain, output);
      write(this.musicBus.gain, musicValue * 1.04);
      write(this.ambienceBus.gain, musicValue * .82);
      write(this.sfxBus.gain, sfxValue);
      document.body.dataset.audioMix = `${Math.round(masterValue * 100)}-${Math.round(musicValue * 100)}-${Math.round(sfxValue * 100)}`;
    }
    route(bus) {
      if (bus === 'music') return this.musicInput;
      if (bus === 'ambience') return this.ambienceBus;
      return this.sfxBus;
    }
    voice(frequency, duration = .08, volume = .045, type = 'sine', bus = 'sfx', options = {}) {
      this.ensure();
      if (!this.ctx || !this.master || persistent.settings.muted || !Number.isFinite(frequency) || frequency <= 0) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const panner = this.ctx.createStereoPanner?.();
      const delay = Math.max(0, Number(options.delay) || 0);
      const now = this.ctx.currentTime + delay;
      const end = now + Math.max(.025, duration);
      const attack = Math.min(Math.max(.003, Number(options.attack) || .008), duration * .3);
      const release = Math.min(Math.max(.018, Number(options.release) || Math.min(.18, duration * .38)), duration * .72);
      const peak = Math.max(.0001, volume);
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, now);
      if (Number.isFinite(options.endFrequency) && options.endFrequency > 0) {
        osc.frequency.exponentialRampToValueAtTime(options.endFrequency, end);
      }
      if (Number.isFinite(options.detune)) osc.detune.value = options.detune;
      gain.gain.setValueAtTime(.0001, now);
      gain.gain.exponentialRampToValueAtTime(peak, now + attack);
      gain.gain.setValueAtTime(peak, Math.max(now + attack, end - release));
      gain.gain.exponentialRampToValueAtTime(.0001, end);
      osc.connect(gain);
      if (panner && Number.isFinite(options.pan)) {
        panner.pan.value = Math.max(-1, Math.min(1, options.pan));
        gain.connect(panner); panner.connect(this.route(bus));
      } else gain.connect(this.route(bus));
      osc.start(now); osc.stop(end + .03);
    }
    tone(frequency, duration = .08, volume = .045, type = 'sine', options = {}) {
      this.voice(frequency, duration, volume, type, 'sfx', options);
    }
    musicTone(frequency, duration = 1.1, volume = .03, type = 'sine', options = {}) {
      this.voice(frequency, duration, volume, type, 'music', options);
    }
    noise(duration = .32, volume = .024, pan = 0, options = {}) {
      this.ensure();
      if (!this.ctx || !this.master || persistent.settings.muted) return;
      const length = Math.max(1, Math.floor(this.ctx.sampleRate * Math.max(.03, duration)));
      const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
      const source = this.ctx.createBufferSource();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();
      const panner = this.ctx.createStereoPanner?.();
      const delay = Math.max(0, Number(options.delay) || 0);
      const now = this.ctx.currentTime + delay;
      const end = now + Math.max(.03, duration);
      const attack = Math.min(.04, Math.max(.003, Number(options.attack) || .006));
      source.buffer = buffer;
      filter.type = options.filterType || 'bandpass';
      filter.frequency.setValueAtTime(Math.max(30, Number(options.frequency) || 780), now);
      filter.Q.value = Math.max(.01, Number(options.q) || .7);
      if (Number.isFinite(options.endFrequency) && options.endFrequency > 0) {
        filter.frequency.exponentialRampToValueAtTime(options.endFrequency, end);
      }
      gain.gain.setValueAtTime(.0001, now);
      gain.gain.exponentialRampToValueAtTime(Math.max(.0001, volume), now + attack);
      gain.gain.exponentialRampToValueAtTime(.0001, end);
      source.connect(filter); filter.connect(gain);
      if (panner) {
        panner.pan.value = Math.max(-1, Math.min(1, pan));
        gain.connect(panner); panner.connect(this.route(options.bus || 'sfx'));
      } else gain.connect(this.route(options.bus || 'sfx'));
      source.start(now); source.stop(end + .03);
    }
    later(callback, delay) {
      return setTimeout(callback, delay);
    }
    click() { this.tone(620, .06, .028, 'triangle', { pan: .08 }); }
    prompt() {
      this.tone(392, .18, .024, 'sine', { pan: -.18 });
      this.tone(587.33, .24, .018, 'sine', { delay: .07, pan: .2 });
    }
    choice() {
      this.tone(740, .14, .058, 'sine', { pan: -.12 });
      this.tone(987.77, .2, .038, 'sine', { delay: .065, pan: .14 });
      this.noise(.08, .008, 0, { delay: .02, filterType: 'highpass', frequency: 2600 });
    }
    signal() {
      this.tone(110, .62, .06, 'triangle', { endFrequency: 220, pan: -.18 });
      this.tone(330, .72, .042, 'sine', { delay: .08, pan: .2 });
      this.noise(.42, .019, 0, { filterType: 'bandpass', frequency: 1180, q: 1.8 });
    }
    whisper() {
      this.noise(.78, .029, -.78, { filterType: 'bandpass', frequency: 980, q: 1.3 });
      this.tone(82, .52, .026, 'sawtooth', { delay: .09, endFrequency: 63, pan: 0 });
      this.noise(.64, .025, .82, { delay: .22, filterType: 'bandpass', frequency: 1460, q: 1.6 });
    }
    evidence(index = 0) {
      const root = 196 + index * 17;
      this.tone(root, .38, .05, 'sine', { pan: -.22 });
      this.tone(root * 1.5, .5, .036, 'triangle', { delay: .12, pan: .24 });
      this.noise(.18, .012, index % 2 ? .35 : -.35, { delay: .04, filterType: 'highpass', frequency: 2100 });
    }
    feedback() {
      this.duck(.58, .16);
      this.tone(1180, .58, .078, 'sawtooth', { endFrequency: 390 });
      this.noise(.48, .042, 0, { filterType: 'bandpass', frequency: 1540, q: 2.2 });
    }
    cut() {
      this.tone(270, .34, .055, 'sawtooth', { endFrequency: 42 });
      this.noise(.12, .025, .2, { delay: .2, filterType: 'highpass', frequency: 1700 });
    }
    disconnect() {
      this.tone(760, .09, .038, 'square', { pan: -.34 });
      this.tone(310, .2, .03, 'square', { delay: .1, endFrequency: 86, pan: .3 });
    }
    shutter() {
      this.tone(108, .055, .068, 'square');
      this.noise(.085, .044, .08, { filterType: 'highpass', frequency: 2500, q: .4 });
      this.tone(58, .12, .034, 'triangle', { delay: .055 });
    }
    deleteCue() {
      this.tone(690, .28, .046, 'square', { endFrequency: 92, pan: -.2 });
      this.noise(.2, .027, .35, { delay: .08, filterType: 'bandpass', frequency: 1350, q: 1.5 });
    }
    phone() {
      [0, .11, .44, .55].forEach((delay, index) => {
        this.tone(index % 2 ? 1046.5 : 784, .13, .043, 'sine', { delay, pan: index < 2 ? -.22 : .22 });
        this.tone(index % 2 ? 523.25 : 392, .13, .025, 'triangle', { delay });
      });
    }
    callMemory() {
      this.duck(.82, .06);
      this.noise(.72, .024, -.3, { filterType: 'bandpass', frequency: 1180, q: 1.7 });
      this.tone(146.83, .58, .027, 'triangle', { delay: .08, endFrequency: 138.59, pan: .24 });
      this.tone(73.42, .74, .022, 'sine', { delay: .18, endFrequency: 55, pan: -.12 });
    }
    consoleStep(index = 0) {
      this.tone(520 + index * 96, .12, .032, 'triangle', { pan: (index - 1) * .18 });
      this.tone(780 + index * 84, .18, .019, 'sine', { delay: .055, pan: (1 - index) * .14 });
    }
    consoleError() {
      this.tone(164, .17, .03, 'square', { endFrequency: 86, pan: -.18 });
      this.noise(.13, .016, .2, { filterType: 'highpass', frequency: 1600 });
    }
    paperLog(lines = 1) {
      this.noise(.18, .035, -.2, { filterType: 'bandpass', frequency: 520, q: .55 });
      this.tone(92, .11, .025, 'triangle', { endFrequency: 61, pan: .18 });
      for (let i = 0; i < Math.min(4, lines); i++) {
        this.noise(.2, .009, i % 2 ? .18 : -.16, { delay: .28 + i * .16, filterType: 'highpass', frequency: 2100 + i * 130 });
      }
    }
    vent() {
      this.noise(1.05, .052, -.1, { filterType: 'bandpass', frequency: 150, endFrequency: 960, q: .55 });
      this.tone(48, .9, .038, 'triangle', { endFrequency: 67, pan: .18 });
    }
    tape() {
      this.tone(86, .075, .046, 'square', { pan: -.18 });
      this.noise(.72, .025, .16, { delay: .035, filterType: 'highpass', frequency: 1280, q: .35 });
      this.tone(174, .38, .018, 'triangle', { delay: .09, endFrequency: 168 });
    }
    clock() {
      this.tone(1240, .12, .038, 'sine', { pan: -.15 });
      this.tone(620, .32, .025, 'sine', { delay: .04, pan: .16 });
    }
    heartbeat() {
      this.tone(58, .17, .07, 'sine', { endFrequency: 42, pan: -.08 });
      this.tone(51, .2, .058, 'sine', { delay: .24, endFrequency: 38, pan: .08 });
    }
    impact() {
      this.duck(.42, .3);
      this.tone(43, .62, .09, 'sine', { endFrequency: 31 });
      this.noise(.48, .058, 0, { filterType: 'lowpass', frequency: 260, q: .8 });
    }
    lock() {
      this.tone(154, .07, .052, 'square', { pan: -.2 });
      this.noise(.12, .03, .26, { filterType: 'bandpass', frequency: 1850, q: 1.4 });
      this.tone(94, .16, .032, 'triangle', { delay: .06 });
    }
    powerDown() {
      this.tone(360, .72, .055, 'sawtooth', { endFrequency: 38 });
      this.noise(.45, .023, 0, { delay: .15, filterType: 'bandpass', frequency: 760, endFrequency: 120 });
    }
    powerUp() {
      this.tone(42, .75, .052, 'triangle', { endFrequency: 336 });
      this.noise(.5, .021, 0, { filterType: 'bandpass', frequency: 120, endFrequency: 1250 });
    }
    water() {
      this.noise(1.2, .052, -.28, { filterType: 'lowpass', frequency: 2100, q: .25 });
      this.noise(.95, .032, .34, { delay: .12, filterType: 'bandpass', frequency: 420, q: .7 });
    }
    gate() {
      this.impact();
      this.noise(.36, .045, .24, { delay: .07, filterType: 'bandpass', frequency: 980, q: 1.2 });
    }
    monitor() {
      this.tone(1046.5, .13, .046, 'sine', { pan: .24 });
      this.tone(1046.5, .13, .038, 'sine', { delay: .46, pan: .24 });
      this.heartbeat();
    }
    flatline() {
      this.tone(930, .92, .043, 'sine', { pan: .25 });
      this.tone(190, .5, .024, 'triangle', { delay: .62, endFrequency: 45, pan: -.2 });
    }
    fire() {
      this.noise(1.1, .046, -.18, { filterType: 'bandpass', frequency: 680, q: .45 });
      [0, .2, .47, .76].forEach((delay, index) => this.noise(.1, .025, index % 2 ? .36 : -.32, { delay, filterType: 'highpass', frequency: 2100 + index * 260 }));
    }
    glass() {
      this.noise(.5, .05, .12, { filterType: 'highpass', frequency: 2550, q: .55 });
      this.tone(1720, .3, .04, 'triangle', { pan: -.38 });
      this.tone(2380, .23, .03, 'sine', { delay: .08, pan: .4 });
    }
    muteDrop() {
      this.duck(.72, .015);
      this.tone(176, .11, .034, 'square', { endFrequency: 74 });
    }
    thunder() {
      this.noise(1.2, .06, 0, { filterType: 'lowpass', frequency: 210, q: .65 });
      this.tone(36, 1.25, .052, 'sine', { endFrequency: 29 });
    }
    roomTone() {
      this.noise(.34, .016, -.22, { filterType: 'highpass', frequency: 1850, q: .28 });
      this.tone(96, .22, .013, 'triangle', { pan: .16 });
    }
    footsteps() {
      [0, .2, .43].forEach((delay, index) => {
        this.noise(.12, .026 - index * .003, index % 2 ? .2 : -.2, { delay, filterType: 'lowpass', frequency: 230, q: .65 });
        this.tone(74 - index * 4, .13, .018, 'sine', { delay, endFrequency: 48 });
      });
    }
    cup() {
      this.tone(1260, .14, .022, 'sine', { pan: -.15 });
      this.tone(860, .2, .016, 'triangle', { delay: .035, pan: .18 });
    }
    cameraTap() {
      this.tone(760, .045, .026, 'square', { pan: .18 });
      this.noise(.065, .017, -.12, { filterType: 'highpass', frequency: 2200 });
    }
    pageTurn() {
      this.noise(.32, .025, -.24, { filterType: 'bandpass', frequency: 1350, q: .6 });
      this.noise(.22, .017, .26, { delay: .12, filterType: 'highpass', frequency: 1950 });
    }
    keyboard() {
      [0, .07, .15, .24, .31].forEach((delay, index) => this.tone(index % 2 ? 720 : 590, .032, .017, 'square', { delay, pan: (index % 3 - 1) * .18 }));
    }
    door() {
      this.tone(118, .42, .036, 'triangle', { endFrequency: 73, pan: -.22 });
      this.noise(.26, .026, .24, { delay: .08, filterType: 'bandpass', frequency: 420, q: .8 });
    }
    radioChime() {
      this.tone(392, .26, .026, 'sine', { pan: -.22 });
      this.tone(587.33, .34, .021, 'sine', { delay: .11, pan: .2 });
      this.noise(.24, .011, 0, { filterType: 'highpass', frequency: 2200 });
    }
    rainClose() {
      this.noise(.75, .031, -.3, { filterType: 'lowpass', frequency: 2600, q: .22 });
      this.noise(.58, .022, .35, { delay: .1, filterType: 'bandpass', frequency: 480, q: .48 });
    }
    breath() {
      this.noise(.52, .014, .18, { filterType: 'bandpass', frequency: 620, q: .72, attack: .08 });
    }
    warmth() {
      this.tone(261.63, .46, .024, 'sine', { pan: -.18 });
      this.tone(329.63, .58, .018, 'sine', { delay: .09, pan: .2 });
    }
    zeroLink() {
      this.tone(174.61, .24, .026, 'triangle', { pan: -.2 });
      this.tone(261.63, .31, .017, 'sine', { delay: .055, pan: .24 });
      this.noise(.16, .009, 0, { filterType: 'bandpass', frequency: 920, q: 1.1 });
    }
    bootLock() {
      this.tone(110, .42, .043, 'triangle', { endFrequency: 220, pan: -.2 });
      this.tone(440, .48, .032, 'sine', { delay: .11, pan: .22 });
      this.tone(880, .22, .023, 'sine', { delay: .28 });
    }
    bootSweep() {
      this.noise(.62, .032, -.36, { filterType: 'bandpass', frequency: 180, endFrequency: 3100, q: 1.1 });
      this.tone(72, .58, .028, 'triangle', { endFrequency: 146, pan: .25 });
    }
    bootProbe() {
      this.tone(880, .075, .026, 'sine', { pan: -.32 });
      this.tone(1320, .095, .019, 'sine', { delay: .055, pan: .34 });
    }
    bootUnknown() {
      this.noise(.48, .026, .28, { filterType: 'bandpass', frequency: 1120, q: 2.4 });
      this.tone(127, .44, .026, 'triangle', { detune: -13, endFrequency: 119, pan: -.25 });
      this.tone(190.5, .48, .016, 'sine', { delay: .06, detune: 7, pan: .3 });
    }
    bootWindowCollapse() {
      const steps = [
        [0, .82, 2350, 184], [.16, .66, 1980, 161], [.33, .48, 1640, 139],
        [.52, .25, 1310, 117], [.73, 0, 980, 98], [.94, -.28, 720, 82],
        [1.16, -.54, 510, 67], [1.38, -.8, 330, 49]
      ];
      steps.forEach(([delay, pan, high, low], index) => {
        this.noise(.2 + index * .012, .032 + index * .002, pan, {
          delay, filterType: 'bandpass', frequency: high, endFrequency: Math.max(90, high * .38), q: 1.45
        });
        this.tone(low, .24, .027 + index * .0015, index < 4 ? 'square' : 'triangle', {
          delay: delay + .025, endFrequency: Math.max(34, low * .62), pan
        });
      });
      this.tone(43, .68, .045, 'sine', { delay: 1.42, endFrequency: 29, pan: -.74 });
    }
    success() {
      [220, 277.18, 329.63].forEach((note, index) => this.tone(note, .58, .034 - index * .004, 'sine', { delay: index * .09, pan: (index - 1) * .22 }));
    }
    failure() {
      [220, 164.81, 110].forEach((note, index) => this.tone(note, .48, .035, index === 2 ? 'triangle' : 'sine', { delay: index * .13, pan: (1 - index) * .2 }));
    }
    playCue(name) {
      const handlers = {
        feedback: () => this.feedback(), cut: () => this.cut(), disconnect: () => this.disconnect(),
        shutter: () => this.shutter(), delete: () => this.deleteCue(), phone: () => this.phone(),
        vent: () => this.vent(), tape: () => this.tape(), clock: () => this.clock(),
        heartbeat: () => this.heartbeat(), impact: () => this.impact(), lock: () => this.lock(),
        powerDown: () => this.powerDown(), powerUp: () => this.powerUp(), water: () => this.water(),
        gate: () => this.gate(), monitor: () => this.monitor(), flatline: () => this.flatline(),
        fire: () => this.fire(), glass: () => this.glass(), mute: () => this.muteDrop(),
        thunder: () => this.thunder(), room: () => this.roomTone(), footsteps: () => this.footsteps(),
        cup: () => this.cup(), cameraTap: () => this.cameraTap(), page: () => this.pageTurn(),
        keyboard: () => this.keyboard(), door: () => this.door(), radioChime: () => this.radioChime(),
        rainClose: () => this.rainClose(), breath: () => this.breath(), warmth: () => this.warmth(),
        zeroLink: () => this.zeroLink(), signal: () => this.signal(), success: () => this.success(), failure: () => this.failure()
      };
      if (!handlers[name]) return;
      const now = performance.now();
      if (now - (this.lastCue.get(name) || -Infinity) < 180) return;
      this.lastCue.set(name, now);
      document.body.dataset.lastSfx = name;
      handlers[name]();
    }
    resolveScene(bg = '') {
      const key = String(bg).toLowerCase();
      if (/hospital|guwanqing/.test(key)) return 'hospital';
      if (/archive|jiyao/.test(key)) return 'archive';
      if (/street|convenience|tangsha|tunnel/.test(key)) return 'street';
      if (/relay|seven_channels|sea/.test(key)) return 'relay';
      if (/studio|lounge|lobby|city|lincheng|sumi|six_rest|five_deleted/.test(key)) return 'studio';
      return 'rooftop';
    }
    getNoiseLoopBuffer() {
      if (this.noiseLoopBuffer || !this.ctx) return this.noiseLoopBuffer;
      const length = Math.floor(this.ctx.sampleRate * 4);
      const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let drift = 0;
      for (let i = 0; i < length; i++) {
        drift = drift * .985 + (Math.random() * 2 - 1) * .12;
        data[i] = Math.max(-1, Math.min(1, drift + (Math.random() * 2 - 1) * .24));
      }
      this.noiseLoopBuffer = buffer;
      return buffer;
    }
    stopScene() {
      clearTimeout(this.musicTimer); this.musicTimer = null;
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      this.ambientVoices.forEach(({ source, gain }) => {
        try {
          gain.gain.cancelScheduledValues(now);
          gain.gain.setTargetAtTime(.0001, now, .1);
          source.stop(now + .52);
        } catch (_) {}
      });
      this.ambientVoices = [];
      try { this.lfo?.stop(now + .55); } catch (_) {}
      this.lfo = null;
    }
    startNoiseLayer(layer) {
      const source = this.ctx.createBufferSource();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();
      const panner = this.ctx.createStereoPanner?.();
      const now = this.ctx.currentTime;
      source.buffer = this.getNoiseLoopBuffer(); source.loop = true;
      filter.type = layer.type; filter.frequency.value = layer.frequency; filter.Q.value = layer.q;
      gain.gain.setValueAtTime(.0001, now);
      gain.gain.exponentialRampToValueAtTime(layer.level, now + .85);
      source.connect(filter); filter.connect(gain);
      if (panner) { panner.pan.value = layer.pan || 0; gain.connect(panner); panner.connect(this.ambienceBus); }
      else gain.connect(this.ambienceBus);
      source.start(now);
      this.ambientVoices.push({ source, gain });
    }
    setAmbience(bg, force = false) {
      if (!this.ctx || !this.master) return;
      const scene = this.resolveScene(bg);
      if (!force && scene === this.scene && this.ambientVoices.length) {
        document.body.dataset.audioScene = scene;
        return;
      }
      this.stopScene();
      this.scene = scene;
      this.profile = this.sceneProfiles[scene] || this.sceneProfiles.rooftop;
      this.motifIndex = 0;
      document.body.dataset.audioScene = scene;
      const now = this.ctx.currentTime;
      const levels = [.029, .016, .0095, .005];
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.value = scene === 'relay' ? .13 : .07;
      lfoGain.gain.value = scene === 'relay' ? .0024 : .0015;
      this.profile.pad.forEach((ratio, index) => {
        const source = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        source.type = index === 0 && scene !== 'hospital' ? 'triangle' : 'sine';
        source.frequency.value = this.profile.root * ratio;
        gain.gain.setValueAtTime(.0001, now);
        gain.gain.exponentialRampToValueAtTime(levels[index], now + .95 + index * .12);
        if (index === 0) { lfo.connect(lfoGain); lfoGain.connect(gain.gain); }
        source.connect(gain); gain.connect(this.musicInput); source.start(now);
        this.ambientVoices.push({ source, gain });
      });
      lfo.start(now); this.lfo = lfo;
      this.profile.noise.forEach(layer => this.startNoiseLayer(layer));
      this.scheduleMusic(620);
    }
    playMusicBeat() {
      if (!this.profile || persistent.settings.muted || document.hidden) return;
      const index = this.motifIndex++;
      const note = this.profile.motif[index % this.profile.motif.length];
      const levels = { calm: .032, warm: .039, tension: .041, crisis: .045, zero: .026, ending: .038, loss: .02 };
      const durations = { calm: 1.5, warm: 1.85, tension: 1.15, crisis: .72, zero: 1.35, ending: 2.1, loss: 1.8 };
      const level = levels[this.intensity] || levels.calm;
      this.musicTone(note, durations[this.intensity] || durations.calm, level, this.intensity === 'zero' ? 'triangle' : 'sine', { pan: [-.26, .18, -.08, .28][index % 4] });
      if (index % 2 === 0) this.musicTone(this.profile.root * 2, .8, level * .62, 'triangle', { pan: -.12 });
      if (this.intensity === 'warm' && index % 2) this.musicTone(note * 1.25, 1.55, level * .48, 'sine', { delay: .08, pan: .24 });
      if (this.intensity === 'tension' || this.intensity === 'crisis') {
        this.musicTone(this.profile.root * (index % 4 === 3 ? 1.5 : 1), this.intensity === 'crisis' ? .42 : .65, level * .78, 'triangle', { pan: index % 2 ? .18 : -.18 });
      }
      if (this.intensity === 'zero' && index % 3 === 2) {
        this.musicTone(note / 2, .5, .018, 'sawtooth', { detune: -13, endFrequency: note / 2.18, pan: .32 });
      }
    }
    scheduleMusic(delay) {
      clearTimeout(this.musicTimer);
      if (!this.ctx || !this.profile || document.hidden) { this.musicTimer = null; return; }
      const factors = { calm: 1, warm: 1.08, tension: .76, crisis: .48, zero: .88, ending: 1.28, loss: 1.42 };
      const wait = Number.isFinite(delay) ? delay : this.profile.step * (factors[this.intensity] || 1);
      this.musicTimer = setTimeout(() => {
        this.playMusicBeat();
        this.scheduleMusic();
      }, Math.max(420, wait));
    }
    setIntensity(mode = 'calm', immediate = false) {
      const allowed = new Set(['calm', 'warm', 'tension', 'crisis', 'zero', 'ending', 'loss']);
      const next = allowed.has(mode) ? mode : 'calm';
      const changed = this.intensity !== next;
      this.intensity = next;
      document.body.dataset.audioIntensity = next;
      if (!this.ctx || !this.musicFilter || (!changed && !immediate)) return;
      const now = this.ctx.currentTime;
      const cutoffs = { calm: 1900, warm: 2800, tension: 3500, crisis: 5200, zero: 920, ending: 3200, loss: 1250 };
      const energy = { calm: .82, warm: .94, tension: 1, crisis: 1.1, zero: .7, ending: .96, loss: .58 };
      this.musicFilter.frequency.cancelScheduledValues(now);
      this.musicEnergy.gain.cancelScheduledValues(now);
      if (immediate) {
        this.musicFilter.frequency.setValueAtTime(cutoffs[next], now);
        this.musicEnergy.gain.setValueAtTime(energy[next], now);
      } else {
        this.musicFilter.frequency.setTargetAtTime(cutoffs[next], now, .22);
        this.musicEnergy.gain.setTargetAtTime(energy[next], now, .18);
      }
    }
    scoreNode(node = {}) {
      const text = token(node.text || node.prompt || '');
      const bg = String(node.bg || currentBg || '');
      let mode = /alert|city_signal/.test(bg) ? 'tension'
        : /signal|relay|seven_channels|missing|five_deleted|sea/.test(bg) ? 'zero'
          : /cg_|morning|day|lounge/.test(bg) ? 'warm' : 'calm';
      if (node.audioIntensity) mode = node.audioIntensity;
      else if ((node.speaker === '零号' || node.speaker === '陌生男声') && node.signalState === 'unstable') mode = 'zero';
      else if (node.speaker === '零号' || node.speaker === '陌生男声') {
        mode = node.signalState === 'conflict' ? 'tension' : (/alert|city_signal/.test(bg) ? 'tension' : 'calm');
      }
      else if (node.speaker === '音效' || ['impact', 'gate', 'feedback', 'powerDown', 'monitor', 'fire', 'glass'].includes(node.sfx)
        || /警报|倒计时|坍塌|爆炸|冲击|删除|死亡|燃烧|红区|断开|失控|水位/.test(text)) mode = 'crisis';
      else if (!/alert|signal|relay|missing|sea/.test(bg) && /早餐|热汤|笑|牵住|拥抱|靠在|陪你|留下来|愿意|温度|心跳/.test(text)) mode = 'warm';
      this.setIntensity(mode);
    }
    duck(duration = .82, depth = .08) {
      if (!this.ctx || !this.musicDuck || !this.ambienceDuck) return;
      clearTimeout(this.duckTimer);
      const now = this.ctx.currentTime;
      [this.musicDuck.gain, this.ambienceDuck.gain].forEach(param => {
        param.cancelScheduledValues(now);
        param.setTargetAtTime(Math.max(.0001, depth), now, .025);
      });
      this.duckTimer = setTimeout(() => {
        if (!this.ctx) return;
        const resumeAt = this.ctx.currentTime;
        [this.musicDuck.gain, this.ambienceDuck.gain].forEach(param => {
          param.cancelScheduledValues(resumeAt);
          param.setTargetAtTime(1, resumeAt, .16);
        });
      }, Math.max(80, duration * 1000));
    }
    silence(duration = 1.45) {
      if (!this.ctx) return;
      clearTimeout(this.duckTimer); clearTimeout(this.silenceAudioTimer);
      const now = this.ctx.currentTime;
      [this.musicDuck.gain, this.ambienceDuck.gain, this.sfxDuck.gain].forEach(param => {
        param.cancelScheduledValues(now);
        param.setTargetAtTime(.0001, now, .018);
      });
      this.silenceAudioTimer = setTimeout(() => {
        if (!this.ctx) return;
        const resumeAt = this.ctx.currentTime;
        [this.musicDuck.gain, this.ambienceDuck.gain, this.sfxDuck.gain].forEach(param => {
          param.cancelScheduledValues(resumeAt);
          param.setTargetAtTime(1, resumeAt, .1);
        });
      }, Math.max(80, duration * 1000 - 45));
    }
    ending(failure = false, index = 0) {
      this.setIntensity(failure ? 'loss' : 'ending');
      this.duck(.34, .12);
      if (failure) {
        [220, 164.81, 110].forEach((note, index) => this.tone(note, .48, .035, index === 2 ? 'triangle' : 'sine', { delay: .11 + index * .13, pan: (1 - index) * .2 }));
        return;
      }
      const root = 174.61 + (index % 5) * 11;
      [root, root * 1.25, root * 1.5].forEach((note, i) => this.tone(note, .85, .043 - i * .006, 'sine', { delay: .09 + i * .11, pan: (i - 1) * .24 }));
    }
    preview(bus) {
      const now = performance.now();
      if (now - this.lastPreviewAt < 120) return;
      this.lastPreviewAt = now;
      this.ensure(); this.applyVolume();
      if (bus === 'music') {
        this.musicTone(220, .72, .04, 'sine', { pan: -.18 });
        this.musicTone(277.18, .82, .03, 'triangle', { delay: .08, pan: .2 });
      } else this.choice();
    }
    pause() {
      clearTimeout(this.musicTimer); this.musicTimer = null;
      this.ctx?.suspend?.();
    }
    resume() {
      if (!this.ctx) return;
      Promise.resolve(this.ctx.resume?.()).then(() => {
        if (!this.musicTimer) this.scheduleMusic(260);
      }).catch(() => {});
    }
  }
  const audio = new AudioEngine();
  const minigames = window.AfterZeroMinigames && dom.storyMinigame
    ? new window.AfterZeroMinigames(dom.storyMinigame, audio)
    : null;

  function token(text = '') {
    return String(text)
      .replaceAll('{hero}', state?.hero || HERO_NAME)
      .replaceAll('{player}', state?.player || persistent.autoSave?.state?.player || DEFAULT_PLAYER_NAME);
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

  function clearBootTimers() {
    bootTimers.forEach(timer => clearTimeout(timer));
    bootTimers = [];
  }

  function finishBoot(immediate = false) {
    if (bootComplete || bootTransitioning) return;
    bootTransitioning = true;
    clearBootTimers();
    dom.bootProgressBar.style.width = '100%';
    dom.bootProgressValue.textContent = '100%';
    dom.bootStatus.textContent = 'SIGNAL LOCKED';
    dom.bootTime.textContent = '00:13';
    dom.boot.classList.add('locked', 'exiting');
    if (bootAudioStarted && !immediate) audio.bootWindowCollapse();
    const reduced = immediate || persistent.settings.reducedMotion || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    bootTimers.push(setTimeout(() => {
      dom.boot.classList.add('title-reveal');
    }, reduced ? 0 : 1580));
    bootTimers.push(setTimeout(() => {
      bootComplete = true;
      bootTransitioning = false;
      dom.boot.classList.add('complete');
      dom.newGame.focus();
      setTimeout(playZeroTitleUnlock, 180);
    }, reduced ? 60 : 1840));
  }

  function unlockFromBoot() {
    if (bootComplete || bootTransitioning) return;
    audio.ensure();
    if (!bootAudioStarted) {
      bootAudioStarted = true;
      dom.boot.classList.add('audio-connected');
      dom.bootSkip.querySelector('span').textContent = 'AUDIO ONLINE';
      dom.bootSkip.querySelector('b').textContent = '声音已接入 · 点击跳过';
      audio.bootSweep();
      playBoot(true);
      return;
    }
    audio.bootLock();
    finishBoot();
  }

  function playBoot(withAudio = false) {
    if (!dom.boot || bootComplete || bootTransitioning) return;
    clearBootTimers();
    const reduced = persistent.settings.reducedMotion || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { finishBoot(true); return; }
    const steps = [
      [180, 8, 'SCANNING 87.5 — 108.0 MHz', '--:--', 'probe'],
      [760, 24, 'NO CARRIER · RETRYING', '00:--', 'probe'],
      [1450, 43, 'UNREGISTERED BAND DETECTED', '00:1-', 'unknown'],
      [2220, 67, 'SYNCHRONIZING PHASE', '00:13', 'sweep'],
      [3000, 86, 'VOICEPRINT OUTSIDE SYSTEM', '00:13', 'unknown'],
      [3720, 100, 'SIGNAL LOCKED', '00:13', 'lock']
    ];
    steps.forEach(([delay, progress, status, time, cue], index) => {
      bootTimers.push(setTimeout(() => {
        dom.bootProgressBar.style.width = `${progress}%`;
        dom.bootProgressValue.textContent = `${String(progress).padStart(3, '0')}%`;
        dom.bootStatus.textContent = status;
        dom.bootTime.textContent = time;
        dom.boot.dataset.phase = cue;
        if (withAudio && bootAudioStarted) {
          if (cue === 'probe') audio.bootProbe();
          if (cue === 'unknown') audio.bootUnknown();
          if (cue === 'sweep') audio.bootSweep();
          if (cue === 'lock') audio.bootLock();
        }
        if (index === 3) dom.boot.classList.add('locked');
        if (index === steps.length - 1) finishBoot();
      }, delay));
    });
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

  function showSignalEvent(channel, label, danger = false) {
    if (!dom.signalEvent) return;
    clearTimeout(signalEventTimer);
    dom.signalEventChannel.textContent = channel;
    dom.signalEventLabel.textContent = label;
    dom.signalEvent.classList.toggle('danger', danger);
    dom.signalEvent.classList.add('show');
    signalEventTimer = setTimeout(() => dom.signalEvent.classList.remove('show'), danger ? 2100 : 1450);
  }

  function lineSignalCue(node) {
    const text = token(node.text || '');
    const zero = node.speaker === '零号' || node.speaker === '陌生男声';
    const impact = node.speaker === '音效' || /啸叫|冲击|敲门|爆出尖锐|线路随即断开/.test(text);
    if (node.sfx) audio.playCue(node.sfx);
    if (zero) {
      const state = node.signalState || 'stable';
      showSignalEvent('CH 00', state === 'unstable' ? 'SIGNAL DESYNC' : state === 'conflict' ? 'PRIORITY CONFLICT' : 'ZERO RELAY ONLINE', state === 'unstable');
      if (Date.now() - lastSignalCueAt < (state === 'unstable' ? 900 : 1500)) return;
      lastSignalCueAt = Date.now();
      if (state === 'unstable') {
        audio.duck();
        if (!node.sfx) audio.whisper();
        dom.game.classList.remove('signal-corrupt');
        void dom.game.offsetWidth;
        dom.game.classList.add('signal-corrupt');
        setTimeout(() => dom.game.classList.remove('signal-corrupt'), 620);
      } else if (!node.sfx) audio.playCue('zeroLink');
    } else if (impact) {
      showSignalEvent('SIGNAL', 'LEVEL EXCEEDED', true);
      if (node.sfx) return;
      if (Date.now() - lastSignalCueAt < 700) return;
      lastSignalCueAt = Date.now();
      audio.noise(.5, .03, 0);
    }
  }

  function showChoiceAfterimage(text) {
    if (!text || !dom.choiceAfterimage) return;
    dom.choiceAfterimageText.textContent = token(text);
    dom.choiceAfterimage.hidden = false;
    dom.game.classList.add('afterimage');
  }

  function clearChoiceAfterimage() {
    if (!dom.choiceAfterimage) return;
    dom.choiceAfterimage.hidden = true;
    dom.choiceAfterimageText.textContent = '';
    dom.game.classList.remove('afterimage');
  }

  function playSilence(node) {
    clearTimeout(silenceTimer);
    clearInterval(typingTimer); clearTimeout(autoTimer);
    dom.game.classList.add('silence');
    audio.silence(Math.max(.7, (node.duration || 1450) / 1000));
    const duration = persistent.settings.reducedMotion ? 80 : Math.max(450, Number(node.duration) || 1450);
    silenceTimer = setTimeout(() => {
      dom.game.classList.remove('silence');
      showNode(node.next);
    }, duration);
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
    const isHero = speaker === '我' || speaker === HERO_NAME;
    dom.speakerName.textContent = isHero ? HERO_NAME : speaker || '旁白';
    dom.speakerEn.textContent = isHero ? 'JIANG LIN' : entry ? entry.en : speaker === '旁白' ? 'NARRATION' : 'SIGNAL';
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
    if (node.type !== 'gate' && node.type !== 'routeGate') {
      const afterimage = node.afterimage || state.flags.choiceAfterimage;
      if (afterimage) {
        showChoiceAfterimage(afterimage);
        delete state.flags.choiceAfterimage;
      } else clearChoiceAfterimage();
    }
    dom.choiceLayer.classList.add('hidden');
    dom.dialogueBox.style.visibility = '';
    if (node.chapter) {
      dom.chapterNo.textContent = node.chapter.no;
      dom.chapterTitle.textContent = node.chapter.title;
    }
    const sceneChanged = Boolean(node.bg && node.bg !== currentBg);
    if (node.bg) setBackground(node.bg, options.immediate);
    audio.scoreNode(node);

    if (node.type === 'line') {
      if (Object.prototype.hasOwnProperty.call(node, 'char')) setPortrait(node.char, node.expression, sceneChanged);
      if (node.location) showLocation(node.bg || currentBg);
      setSpeaker(node.speaker || '旁白');
      lineSignalCue(node);
      addHistory(node);
      if (!persistent.read.includes(id)) persistent.read.push(id);
      if (persistent.read.length > 1000) persistent.read.shift();
      typeLine(node.text);
      autoSave();
    } else if (node.type === 'choice') {
      audio.prompt();
      showChoices(node);
      autoSave();
    } else if (node.type === 'gate') {
      const branch = (node.branches || []).find(item => requirementMet(item.requires));
      showNode(branch?.next || node.fallback, options);
    } else if (node.type === 'routeGate') {
      const trueRoute = node.trueRoute;
      const trueAvailable = trueRoute && state.flags.titleZeroAccess && requirementMet(trueRoute.requires)
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
    } else if (node.type === 'silence') {
      playSilence(node);
    } else if (node.type === 'console') {
      showProducerConsole(node);
    } else if (node.type === 'mission') {
      showMissionUpdate(node);
    } else if (node.type === 'minigame') {
      showStoryMinigame(node);
    } else if (node.type === 'ending') {
      receiveEnding(node.ending);
    }
  }

  function advance() {
    if (!state || !dom.modal.classList.contains('hidden') || !dom.nameModal.classList.contains('hidden')
      || (dom.storyMinigame && !dom.storyMinigame.classList.contains('hidden'))) return;
    const node = STORY.nodes[state.nodeId];
    if (!node || node.type !== 'line') return;
    audio.ensure();
    if (typing) { finishTyping(); return; }
    if (node.next) {
      audio.tone(430, .045, .012, 'triangle', { pan: .08 });
      showNode(node.next);
    }
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
    if (requires.echoes) {
      const keys = Array.isArray(requires.echoes) ? requires.echoes : [requires.echoes];
      if (!keys.every(key => persistent.echoes.includes(key))) return false;
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
    node.choices.filter(choice => !choice.hiddenUntilUnlocked || choiceUnlocked(choice)).forEach((choice, index) => {
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
    if (choice.afterimage) state.flags.choiceAfterimage = choice.afterimage;
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
    currentEndingKey = key;
    const echoKey = ending.echoKey || ending.char || key;
    const isNew = ending.failure ? !persistent.echoes.includes(echoKey) : !persistent.endings.includes(key);
    if (ending.failure) {
      if (isNew) persistent.echoes.push(echoKey);
    } else if (isNew) persistent.endings.push(key);
    const replayNode = ending.failure ? ending.rewindStart : (STORY.replayStart || STORY.routeSelect);
    const replayState = { ...snapshot(), nodeId: replayNode, route: ending.failure ? echoKey : null };
    if (ending.failure) {
      Object.keys(replayState.affinity).forEach(name => { replayState.affinity[name] = 0; });
      replayState.flags = { rewind: true };
    } else if (STORY.replayStart) {
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
    dom.endingIndex.textContent = ending.failure ? 'LOST SIGNAL' : `${String(ending.index).padStart(2, '0')} / ${String(ending.total || 5).padStart(2, '0')}`;
    dom.endingTitle.textContent = ending.title;
    dom.endingSubtitle.textContent = ending.subtitle;
    dom.endingQuote.textContent = token(ending.quote);
    if (ending.evidence) {
      dom.endingEvidence.hidden = false;
      dom.endingEvidenceTitle.textContent = ending.evidence.title;
      dom.endingEvidenceMeta.textContent = token(`${ending.evidence.code} · ${ending.evidence.channel} · ${ending.evidence.meta}`);
    } else dom.endingEvidence.hidden = true;
    dom.endingTitleBtn.textContent = '返回标题';
    dom.endingRestartBtn.textContent = ending.failure ? '回溯到信号分歧' : '选择其他信号';
    audio.ending(Boolean(ending.failure), ending.index || 0);
    setTimeout(() => toast(isNew && ending.evidence ? `已回收证物 · ${ending.evidence.code}` : isNew ? '新结局已记录至终夜档案' : '已读取结局记录'), 700);
  }

  function updateTitleProgress() {
    const heroineKeys = Object.entries(STORY.endings).filter(([, ending]) => ending.routeEnding !== false && ending.countsTowardRoute !== false).map(([key]) => key);
    const heroineCount = heroineKeys.filter(key => persistent.endings.includes(key)).length;
    const zeroReady = heroineCount >= 5 && !persistent.endings.includes('true');
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
    dom.zeroRoute.hidden = !zeroReady || !persistent.zeroTitleSeen;
    if (zeroReady) {
      dom.zeroRoute.querySelector('span').textContent = persistent.decoder.solved ? 'RECEIVE 00:13' : 'DECODE 00:13';
      dom.zeroRoute.querySelector('b').textContent = persistent.decoder.solved ? '接收不存在的频道' : '校验五份信号证物';
      dom.zeroRoute.classList.toggle('decoder-pending', !persistent.decoder.solved);
    }
    dom.title.classList.toggle('zero-unsealed', (zeroReady && persistent.zeroTitleSeen) || persistent.endings.includes('true'));
  }

  function playZeroTitleUnlock() {
    const heroineKeys = Object.entries(STORY.endings).filter(([, ending]) => ending.routeEnding !== false && ending.countsTowardRoute !== false).map(([key]) => key);
    const unlocked = heroineKeys.every(key => persistent.endings.includes(key)) && !persistent.endings.includes('true');
    if (!unlocked || persistent.zeroTitleSeen) return;
    persistent.zeroTitleSeen = true;
    savePersistent();
    dom.zeroRoute.hidden = true;
    dom.title.classList.add('zero-unsealed', 'zero-corrupting');
    audio.ensure();
    [0, 110, 260, 470, 760, 1080].forEach((delay, index) => setTimeout(() => audio.tone(index % 2 ? 83 : 47, .11, .025, 'sawtooth'), delay));
    setTimeout(() => {
      dom.title.classList.remove('zero-corrupting');
      dom.zeroError.hidden = false;
      dom.zeroErrorConfirm.focus();
    }, 2400);
  }

  function enterZeroRoute() {
    if (!persistent.decoder.solved && !persistent.endings.includes('true')) {
      openDecoder();
      return;
    }
    audio.signal();
    const player = persistent.autoSave?.state?.player || DEFAULT_PLAYER_NAME;
    const next = newState(player, 'v3_true_awaken_01');
    next.route = 'true';
    next.flags.trueSignal = true;
    startGame(next);
  }

  function decoderEvidenceEntries() {
    return Object.entries(STORY.endings)
      .filter(([key, ending]) => key !== 'true' && ending.evidence?.verify && persistent.endings.includes(key))
      .sort((a, b) => a[1].index - b[1].index);
  }

  function setDecoderIntegrity(value) {
    if (!decoderSession) return;
    decoderSession.integrity = Math.max(13, Math.min(100, value));
    dom.decoderIntegrityBar.style.width = `${decoderSession.integrity}%`;
    dom.decoderIntegrityValue.textContent = `${decoderSession.integrity}%`;
    dom.decoderModal.classList.toggle('unstable', decoderSession.integrity < 70);
  }

  function openDecoder() {
    const entries = decoderEvidenceEntries();
    if (entries.length < 5) {
      toast(`缺少 ${5 - entries.length} 份证物，无法建立解码矩阵`);
      return;
    }
    if (!persistent.zeroTitleSeen) {
      persistent.zeroTitleSeen = true;
      savePersistent();
    }
    if (!dom.modal.classList.contains('hidden')) closeModal();
    audio.ensure();
    decoderSession = {
      entries,
      verified: new Set(persistent.decoder.verified.filter(code => entries.some(([, ending]) => ending.evidence.code === code))),
      phase: 1,
      integrity: Math.max(55, 100 - persistent.decoder.attempts * 5),
      errors: 0,
      focusCode: null
    };
    dom.decoderModal.classList.remove('hidden', 'success', 'failure', 'unstable');
    renderDecoderMatrix();
    requestAnimationFrame(() => $('.decoder-evidence', dom.decoderBody)?.focus());
  }

  function closeDecoder() {
    dom.decoderModal.classList.add('hidden');
    decoderSession = null;
    updateTitleProgress();
  }

  function renderDecoderMatrix() {
    if (!decoderSession) return;
    dom.decoderStage.textContent = 'PHASE 01 / 02';
    setDecoderIntegrity(decoderSession.integrity);
    dom.decoderBody.innerHTML = '';
    const intro = document.createElement('div'); intro.className = 'decoder-copy';
    intro.innerHTML = `<small>EVIDENCE MATRIX</small><h3>逐一校验证物字段</h3><p>五份记录都被改写过一次。读取证物，将每条记录恢复到它真正留下的异常值。</p>`;
    const grid = document.createElement('div'); grid.className = 'decoder-evidence-grid';
    decoderSession.entries.forEach(([key, ending]) => {
      const evidence = ending.evidence;
      const verified = decoderSession.verified.has(evidence.code);
      const button = document.createElement('button');
      button.type = 'button'; button.className = `decoder-evidence${verified ? ' verified' : ''}`;
      button.innerHTML = `<span>${evidence.code}</span><b>${evidence.title}</b><small>${verified ? 'VERIFIED' : 'AWAITING CHECK'}</small><i></i>`;
      button.onclick = () => renderEvidenceQuestion(key, ending);
      grid.appendChild(button);
    });
    const continueButton = document.createElement('button');
    continueButton.type = 'button'; continueButton.className = 'decoder-submit';
    continueButton.disabled = decoderSession.verified.size < decoderSession.entries.length;
    continueButton.textContent = continueButton.disabled ? `等待校验 · ${decoderSession.verified.size} / 5` : '建立共同字段映射';
    continueButton.onclick = renderDecoderSynthesis;
    dom.decoderBody.append(intro, grid, continueButton);
  }

  function renderEvidenceQuestion(key, ending) {
    if (!decoderSession) return;
    const evidence = ending.evidence;
    decoderSession.focusCode = evidence.code;
    dom.decoderStage.textContent = `${evidence.code} · FIELD CHECK`;
    dom.decoderBody.innerHTML = '';
    const card = document.createElement('article'); card.className = 'decoder-question';
    const eyebrow = document.createElement('small'); eyebrow.textContent = `${evidence.channel} · ${token(evidence.meta)}`;
    const title = document.createElement('h3'); title.textContent = evidence.verify.prompt;
    const clue = document.createElement('p'); clue.textContent = token(evidence.clue);
    const options = document.createElement('div'); options.className = 'decoder-options';
    evidence.verify.choices.forEach(([value, label], index) => {
      const button = document.createElement('button'); button.type = 'button';
      button.innerHTML = `<span>0${index + 1}</span><b>${escapeHTML(token(label))}</b>`;
      button.onclick = () => checkEvidenceAnswer(evidence, value, button);
      options.appendChild(button);
    });
    const back = document.createElement('button'); back.type = 'button'; back.className = 'decoder-back'; back.textContent = '← 返回证物矩阵'; back.onclick = renderDecoderMatrix;
    card.append(eyebrow, title, clue, options, back); dom.decoderBody.appendChild(card);
    requestAnimationFrame(() => $('.decoder-options button', dom.decoderBody)?.focus());
  }

  function checkEvidenceAnswer(evidence, value, button) {
    if (!decoderSession) return;
    if (value === evidence.verify.answer) {
      decoderSession.verified.add(evidence.code);
      persistent.decoder.verified = [...decoderSession.verified];
      savePersistent();
      button.classList.add('correct');
      audio.evidence(Number(evidence.code.slice(-1)) || 1);
      setTimeout(renderDecoderMatrix, 520);
      return;
    }
    decoderSession.errors += 1;
    persistent.decoder.attempts += 1;
    savePersistent();
    setDecoderIntegrity(decoderSession.integrity - 13);
    button.classList.remove('wrong'); void button.offsetWidth; button.classList.add('wrong');
    audio.noise(.34, .03, decoderSession.errors % 2 ? -.6 : .6);
    const hint = $('.decoder-question > p');
    if (decoderSession.errors >= 2 && hint) hint.textContent = `校验提示：${token(evidence.meta)}`;
    if (decoderSession.integrity <= 13) setTimeout(renderDecoderFailure, 420);
  }

  function renderDecoderSynthesis() {
    if (!decoderSession) return;
    decoderSession.phase = 2;
    dom.decoderStage.textContent = 'PHASE 02 / 02';
    dom.decoderBody.innerHTML = '';
    const copy = document.createElement('div'); copy.className = 'decoder-copy synthesis-copy';
    copy.innerHTML = `<small>COMMON VARIABLE</small><h3>五个异常共同证明了谁的存在？</h3><p>它有声音却没有声源，在照片外注视，从不存在的端口接入，来自系统之外，并以你的署名成为作者。</p>`;
    const options = document.createElement('div'); options.className = 'decoder-final-options';
    [
      ['zero', '零号', '被系统承认的维护者'],
      ['jianglin', '江临', '五条时间线的共同变量'],
      ['player', state?.player || persistent.autoSave?.state?.player || DEFAULT_PLAYER_NAME, '屏幕之外的回答者']
    ].forEach(([value, label, hint]) => {
      const button = document.createElement('button'); button.type = 'button';
      button.innerHTML = `<b>${escapeHTML(label)}</b><span>${hint}</span>`;
      button.onclick = () => checkSynthesis(value, button);
      options.appendChild(button);
    });
    const back = document.createElement('button'); back.type = 'button'; back.className = 'decoder-back'; back.textContent = '← 重新检查五份证物'; back.onclick = renderDecoderMatrix;
    dom.decoderBody.append(copy, options, back);
    requestAnimationFrame(() => $('.decoder-final-options button', dom.decoderBody)?.focus());
  }

  function checkSynthesis(value, button) {
    if (!decoderSession) return;
    if (value !== 'player') {
      persistent.decoder.attempts += 1;
      savePersistent();
      setDecoderIntegrity(decoderSession.integrity - 21);
      button.classList.remove('wrong'); void button.offsetWidth; button.classList.add('wrong');
      audio.noise(.58, .04, 0);
      const copy = $('.synthesis-copy p');
      if (copy) copy.textContent = value === 'jianglin'
        ? '江临存在于五条时间线之内；证物记录的却是一个无法被任何时间线登记的人。'
        : '零号拥有物理位置与系统权限；证物指向的身份没有位置，也没有端口。';
      if (decoderSession.integrity <= 13) setTimeout(renderDecoderFailure, 420);
      return;
    }
    persistent.decoder.solved = true;
    persistent.decoder.verified = decoderSession.entries.map(([, ending]) => ending.evidence.code);
    savePersistent();
    button.classList.add('correct');
    audio.duck(1.4); audio.signal();
    dom.decoderModal.classList.add('success');
    dom.decoderStage.textContent = 'CHANNEL 06 · FOUND';
    dom.decoderBody.innerHTML = `<section class="decoder-success"><small>IDENTITY ACCEPTED</small><h3>${escapeHTML(token('{player}'))}，信号已确认</h3><p>五份证物不是在证明某个世界里的人。<br>它们在证明，一直有人从世界之外回答。</p><div><span>05 ARTIFACTS</span><i></i><b>CH 06 OPEN</b></div><button type="button" class="decoder-submit">接收不存在的频道</button></section>`;
    $('.decoder-submit', dom.decoderBody).onclick = () => {
      closeDecoder();
      enterZeroRoute();
    };
    requestAnimationFrame(() => $('.decoder-submit', dom.decoderBody)?.focus());
  }

  function renderDecoderFailure() {
    if (!decoderSession || persistent.decoder.solved) return;
    dom.decoderModal.classList.add('failure');
    dom.decoderStage.textContent = 'SIGNAL LOST · RETRY AVAILABLE';
    audio.duck(1.1); audio.noise(.8, .045, 0);
    dom.decoderBody.innerHTML = '<section class="decoder-failure"><small>CROSS-CHECK INTERRUPTED</small><h3>信号完整度低于安全阈值</h3><p>已确认的证物不会丢失。重新稳定频道后，可以从上一次进度继续。</p><div><span>00:13</span><i></i><b>NO CARRIER</b></div><button type="button" class="decoder-submit">重新稳定频道</button></section>';
    $('.decoder-submit', dom.decoderBody).onclick = () => {
      decoderSession.integrity = Math.max(65, 100 - persistent.decoder.attempts * 3);
      decoderSession.errors = 0;
      dom.decoderModal.classList.remove('failure', 'unstable');
      renderDecoderMatrix();
    };
    requestAnimationFrame(() => $('.decoder-submit', dom.decoderBody)?.focus());
  }

  function finishCallPrelude() {
    clearInterval(callRingTimer);
    callRingTimer = null;
    dom.callPrelude.classList.add('hidden');
    const next = pendingNewGame;
    pendingNewGame = null;
    if (!next) return;
    next.flags = { ...(next.flags || {}), heardJiangShuoCall: true };
    setTimeout(() => startGame(next), persistent.settings.reducedMotion ? 0 : 260);
  }

  function answerCallPrelude() {
    if (dom.callPrelude.classList.contains('answered')) return;
    clearInterval(callRingTimer);
    callRingTimer = null;
    dom.callState.textContent = '连接中断 · RECOVERING';
    dom.callPrelude.classList.add('answered');
    audio.callMemory();
    setTimeout(() => audio.disconnect(), 390);
    setTimeout(() => dom.callContinue.focus(), persistent.settings.reducedMotion ? 20 : 760);
  }

  function startCallPrelude(gameState) {
    pendingNewGame = clone(gameState);
    dom.callPrelude.classList.remove('hidden', 'answered');
    dom.callState.textContent = '正在呼入';
    audio.phone();
    clearInterval(callRingTimer);
    callRingTimer = setInterval(() => audio.phone(), 1700);
    requestAnimationFrame(() => dom.answerCall.focus());
  }

  function consoleMistake(button) {
    audio.consoleError();
    button?.classList.add('wrong');
    setTimeout(() => button?.classList.remove('wrong'), 620);
  }

  function updateConsoleProgress(value) {
    dom.consoleProgress.textContent = `${String(value).padStart(2, '0')} / 03`;
  }

  function renderProducerSetup() {
    const session = consoleSession;
    if (!session) return;
    const completed = Number(session.tuned) + Number(session.lineReady) + Number(session.tested);
    updateConsoleProgress(completed);
    dom.consoleBody.innerHTML = `
      <div class="console-intro"><small>NEW PRODUCER · ONBOARDING</small><h3>先把今晚的节目安全送上空气</h3><p>完成三项基础检查。每一次操作都会写入直播日志。</p></div>
      <div class="console-task-grid">
        <section class="console-task ${session.tuned ? 'done' : ''}"><small>CHECK 01 · CARRIER</small><h4>校准节目载波</h4><p>测试频率必须锁定在 87.5 MHz。</p><div class="console-readout">${session.frequency.toFixed(1)} MHz</div><div class="console-controls"><button data-console-action="freq-down">− 0.2</button><button data-console-action="freq-reset">RESET</button><button data-console-action="freq-up">＋ 0.2</button></div></section>
        <section class="console-task ${session.lineReady ? 'done' : ''}"><small>CHECK 02 · HOTLINE</small><h4>接通听众热线</h4><p>今晚的值班表指定热线接入 CH B。</p><div class="console-readout">${session.lineReady ? 'CH B · READY' : 'NO ROUTE'}</div><div class="console-controls"><button data-console-action="line" data-value="A">CH A</button><button data-console-action="line" data-value="B" class="${session.lineReady ? 'selected' : ''}">CH B</button><button data-console-action="line" data-value="C">CH C</button></div></section>
        <section class="console-task ${session.tested ? 'done' : ''}"><small>CHECK 03 · RETURN</small><h4>发送十秒试音</h4><p>确认主持人返听和主输出没有延迟。</p><div class="console-readout">${session.tested ? 'UNKNOWN INPUT' : session.tuned && session.lineReady ? 'READY' : 'STANDBY'}</div><button class="console-action" data-console-action="test" ${session.tuned && session.lineReady && !session.tested ? '' : 'disabled'}>${session.tested ? '异常信号已接管' : '发送试音'}</button></section>
      </div>`;
    $$('[data-console-action]', dom.consoleBody).forEach(button => {
      button.onclick = () => {
        const action = button.dataset.consoleAction;
        if (action === 'freq-down' || action === 'freq-up' || action === 'freq-reset') {
          if (session.tuned) return;
          if (action === 'freq-reset') session.frequency = 87.1;
          else session.frequency = Math.max(86.9, Math.min(87.7, session.frequency + (action === 'freq-up' ? .2 : -.2)));
          session.frequency = Math.round(session.frequency * 10) / 10;
          if (session.frequency === 87.5) { session.tuned = true; audio.consoleStep(0); }
          renderProducerSetup();
          return;
        }
        if (action === 'line') {
          if (button.dataset.value !== 'B') { consoleMistake(button); return; }
          if (!session.lineReady) audio.consoleStep(1);
          session.lineReady = true;
          renderProducerSetup();
          return;
        }
        if (action === 'test' && session.tuned && session.lineReady) {
          session.tested = true;
          updateConsoleProgress(3);
          dom.producerConsole.classList.add('unstable');
          audio.feedback();
          setTimeout(renderProducerAnomaly, persistent.settings.reducedMotion ? 40 : 620);
        }
      };
    });
  }

  function renderProducerAnomaly() {
    const session = consoleSession;
    if (!session) return;
    dom.consoleProgress.textContent = 'ERR / 13';
    dom.consoleBody.innerHTML = `
      <div class="console-anomaly"><small>UNREGISTERED RETURN · NO INPUT SOURCE</small><h3>00:13 SIGNAL OVERRIDE</h3><p>主输出已经归零，啸叫仍在。必须在玻璃共振超过安全值以前切断回路。</p>
        <div class="zero-hint"><small>UNKNOWN RELAY / ZERO</small><p>“别找输入源。第三路不是输入，是回路——把延迟往前推十三毫秒。”</p></div>
        <div class="console-emergency">
          <section><span>选择辅助发送</span><div class="console-controls"><button data-emergency="aux" data-value="1">AUX 1</button><button data-emergency="aux" data-value="2">AUX 2</button><button data-emergency="aux" data-value="3" class="${session.aux === 3 ? 'selected' : ''}">AUX 3</button></div></section>
          <section><span>设置延迟补偿</span><div class="console-controls"><button data-emergency="delay" data-value="-13" class="${session.delay === -13 ? 'selected' : ''}">−13 ms</button><button data-emergency="delay" data-value="0">0 ms</button><button data-emergency="delay" data-value="13">＋13 ms</button></div></section>
        </div>
      </div>`;
    $$('[data-emergency]', dom.consoleBody).forEach(button => {
      button.onclick = () => {
        const kind = button.dataset.emergency;
        const value = Number(button.dataset.value);
        const correct = (kind === 'aux' && value === 3) || (kind === 'delay' && value === -13);
        if (!correct) { consoleMistake(button); return; }
        session[kind] = value;
        audio.consoleStep(kind === 'aux' ? 0 : 1);
        if (session.aux === 3 && session.delay === -13) {
          audio.cut();
          dom.producerConsole.classList.remove('unstable');
          setTimeout(renderProducerResolved, persistent.settings.reducedMotion ? 40 : 480);
        } else renderProducerAnomaly();
      };
    });
  }

  function renderProducerResolved() {
    if (!consoleSession) return;
    dom.consoleProgress.textContent = 'LOCKED';
    dom.consoleBody.innerHTML = `
      <section class="console-resolved"><small>ABNORMAL RETURN CAPTURED</small><h3>你亲手留下了第一份证据</h3><p>异常线路已经切断。自动比对只能确认，两段信号都经过临海广播中心的旧中继。</p>
        <div class="signal-match"><div><span>SAMPLE A</span><b>00:13 异常波形</b></div><i></i><div><span>SAMPLE B</span><b>停用号码通话样本</b></div></div>
        <button class="console-complete" type="button">封存波形 · 返回直播间</button>
      </section>`;
    $('.console-complete', dom.consoleBody).onclick = () => {
      const next = consoleSession.node.next;
      state.flags.producerCheckComplete = true;
      state.flags.stationRelayMatched = true;
      consoleSession = null;
      dom.producerConsole.classList.add('hidden');
      autoSave();
      setTimeout(() => showNode(next), persistent.settings.reducedMotion ? 0 : 240);
    };
    requestAnimationFrame(() => $('.console-complete', dom.consoleBody)?.focus());
  }

  function showProducerConsole(node) {
    clearTimeout(autoTimer);
    setAuto(false); setSkip(false);
    consoleSession = { node, frequency: 87.1, tuned: false, lineReady: false, tested: false, aux: null, delay: null };
    dom.producerConsole.classList.remove('hidden', 'unstable');
    renderProducerSetup();
    autoSave();
  }

  function showMissionUpdate(node) {
    clearTimeout(autoTimer);
    setAuto(false); setSkip(false);
    missionNext = node.next;
    dom.missionKicker.textContent = node.kicker || 'SIGNAL LOG UPDATED';
    dom.missionTitle.textContent = node.title || '主线记录';
    dom.missionConfirmed.innerHTML = (node.confirmed || []).map(item => `<li>${escapeHTML(token(item))}</li>`).join('');
    dom.missionPending.innerHTML = (node.pending || []).map(item => `<li>${escapeHTML(token(item))}</li>`).join('');
    dom.missionObjective.textContent = token(node.objective || '继续监听00:13频道');
    const paper = $('.mission-paper', dom.missionUpdate);
    paper.style.animation = 'none';
    void paper.offsetHeight;
    paper.style.animation = '';
    dom.missionUpdate.classList.remove('hidden');
    state.flags.currentObjective = node.objective || '';
    const missionLog = Array.isArray(state.flags.missionLog) ? state.flags.missionLog : [];
    state.flags.missionLog = [...new Set([...missionLog, state.nodeId])];
    audio.paperLog((node.confirmed || []).length);
    autoSave();
    requestAnimationFrame(() => dom.missionContinue.focus());
  }

  function closeMissionUpdate() {
    if (!missionNext) return;
    const next = missionNext;
    missionNext = null;
    dom.missionUpdate.classList.add('hidden');
    audio.click();
    setTimeout(() => showNode(next), persistent.settings.reducedMotion ? 0 : 180);
  }

  function showStoryMinigame(node) {
    clearTimeout(autoTimer);
    setAuto(false); setSkip(false);
    if (!minigames) {
      console.warn('Minigame runtime unavailable:', node.game);
      showNode(node.next);
      return;
    }
    autoSave();
    minigames.start(node.game, {
      player: state.player,
      hero: state.hero,
      reducedMotion: persistent.settings.reducedMotion,
      onComplete: result => {
        state.flags.minigames = state.flags.minigames && typeof state.flags.minigames === 'object' ? state.flags.minigames : {};
        state.flags.minigames[node.game] = { completed: true, at: Date.now(), ...(result || {}) };
        persistent.minigames = Array.isArray(persistent.minigames) ? persistent.minigames : [];
        if (!persistent.minigames.includes(node.game)) persistent.minigames.push(node.game);
        if (node.game === 'finalsend' && typeof result?.message === 'string') persistent.zeroMessage = result.message.slice(0, 40);
        savePersistent();
        if (node.effect) applyEffect(node.effect);
        autoSave();
        setTimeout(() => showNode(node.next), persistent.settings.reducedMotion ? 0 : 180);
      }
    });
  }

  function startGame(gameState) {
    audio.ensure();
    clearTimeout(silenceTimer);
    dom.game.classList.remove('silence');
    state = clone(gameState);
    state.hero = HERO_NAME;
    state.flags = state.flags && typeof state.flags === 'object' ? state.flags : {};
    // Repair saves created before V4.8.1: a route could inherit LOG entries
    // from the previously completed heroine. Keep common-line dialogue and the
    // active route, but discard entries that clearly belong to another route.
    if (state.route && Array.isArray(state.history)) {
      const routePrefixes = {
        lincheng: ['v4_lc_', 'v43_lincheng_', 'v2_lock_lincheng_'],
        tangsha: ['v4_ts_', 'v43_tangsha_', 'v2_lock_tangsha_'],
        sumi: ['v4_sm_', 'v43_sumi_', 'v2_lock_sumi_'],
        guwanqing: ['v4_gw_', 'v43_guwanqing_', 'v2_lock_guwanqing_'],
        jiyao: ['v4_jy_', 'v43_jiyao_', 'v2_lock_jiyao_']
      };
      const foreignPrefixes = Object.entries(routePrefixes)
        .filter(([key]) => key !== state.route)
        .flatMap(([, prefixes]) => prefixes);
      state.history = state.history.filter(entry => !foreignPrefixes.some(prefix => String(entry.nodeId || '').startsWith(prefix)));
    }
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
    clearInterval(typingTimer); clearTimeout(autoTimer); clearTimeout(silenceTimer);
    dom.game.classList.remove('silence');
    setAuto(false); setSkip(false);
    closeModal();
    updateTitleProgress();
    setBackground('rooftop');
    setScreen(dom.title);
    setTimeout(playZeroTitleUnlock, 720);
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
        const b = document.createElement('b'); b.textContent = item.speaker === '我' ? HERO_NAME : item.speaker;
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
        settingRow('总音量', 0, 100, persistent.settings.volume, v => `${v}%`, v => { persistent.settings.volume = v; audio.applyVolume(); }),
        settingRow('背景音乐', 0, 100, persistent.settings.musicVolume, v => `${v}%`, v => { persistent.settings.musicVolume = v; audio.applyVolume(); audio.preview('music'); }),
        settingRow('剧情音效', 0, 100, persistent.settings.sfxVolume, v => `${v}%`, v => { persistent.settings.sfxVolume = v; audio.applyVolume(); audio.preview('sfx'); }),
        toggleRow('静音', persistent.settings.muted, v => { persistent.settings.muted = v; audio.applyVolume(); }),
        toggleRow('减少动态效果', persistent.settings.reducedMotion, v => { persistent.settings.reducedMotion = v; applySettings(); })
      );
      const reset = document.createElement('button');
      reset.className = 'danger-reset';
      reset.textContent = '重置全部进度';
      let armed = false;
      let disarmTimer = null;
      reset.onclick = () => {
        if (!armed) {
          armed = true;
          reset.classList.add('armed');
          reset.textContent = '再次点击，永久清除当前浏览器存档';
          disarmTimer = setTimeout(() => { armed = false; reset.classList.remove('armed'); reset.textContent = '重置全部进度'; }, 4500);
          return;
        }
        clearTimeout(disarmTimer);
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
      };
      list.appendChild(reset);
      body.appendChild(list);
    });
  }

  function openAbout() {
    openModal('ABOUT THE BROADCAST', '作品信息', body => {
      const sheet = document.createElement('section');
      sheet.className = 'about-sheet';
      const signal = document.createElement('div');
      signal.className = 'about-signal';
      signal.innerHTML = '<div><span>FM · NIGHT RECEIVER</span><b>00:13</b><small>CHANNEL 06 EXISTS</small></div>';
      const copy = document.createElement('div');
      copy.className = 'about-copy';
      copy.innerHTML = `<small>${RELEASE} · ZERO RELAY</small><h3>零点之后 · AFTER ZERO</h3><p>都市怪谈 × 深夜电台视觉小说。你不是江临，而是屏幕外替他回答的人。五条个人线会留下五份信号证物；只有亲手拼出共同变量，第六频道才会承认你的存在。</p><div class="about-facts"><div><b>05 + 01</b><span>个人信号与真结局</span></div><div><b>${Object.keys(STORY.nodes).length}</b><span>剧情节点</span></div><div><b>84 CUES</b><span>动态夜间声场</span></div></div>`;
      const links = document.createElement('div');
      links.className = 'about-links';
      const repo = document.createElement('a'); repo.href = 'https://github.com/KevinKaslana093/after-zero'; repo.target = '_blank'; repo.rel = 'noopener'; repo.textContent = 'GitHub · 源码与版本';
      const feedback = document.createElement('a'); feedback.href = 'https://github.com/KevinKaslana093/after-zero/issues'; feedback.target = '_blank'; feedback.rel = 'noopener'; feedback.textContent = '提交反馈';
      const replay = document.createElement('a'); replay.href = '#'; replay.textContent = '重播开屏动画';
      replay.onclick = event => { event.preventDefault(); closeModal(); replayBoot(); };
      links.append(repo, feedback, replay); copy.appendChild(links); sheet.append(signal, copy); body.appendChild(sheet);
    });
  }

  function replayBoot() {
    clearBootTimers();
    bootComplete = false;
    bootTransitioning = false;
    bootAudioStarted = Boolean(audio.ctx && !persistent.settings.muted);
    dom.boot.classList.remove('complete', 'locked', 'exiting', 'title-reveal', 'audio-connected');
    if (bootAudioStarted) dom.boot.classList.add('audio-connected');
    delete dom.boot.dataset.phase;
    dom.bootStatus.textContent = 'SEARCHING FOR SIGNAL';
    dom.bootTime.textContent = '--:--';
    dom.bootProgressBar.style.width = '0%';
    dom.bootProgressValue.textContent = '000%';
    dom.bootSkip.querySelector('span').textContent = bootAudioStarted ? 'AUDIO ONLINE' : 'CONNECT AUDIO';
    dom.bootSkip.querySelector('b').textContent = bootAudioStarted ? '声音已接入 · 点击跳过' : '点击接入声音';
    if (bootAudioStarted) audio.bootSweep();
    playBoot(bootAudioStarted);
  }

  function shareCardDataURL(endingKey) {
    const ending = STORY.endings[endingKey];
    if (!ending) return '';
    const canvas = document.createElement('canvas');
    canvas.width = 1200; canvas.height = 630;
    const ctx = canvas.getContext('2d');
    const char = STORY.characters[ending.char || endingKey] || STORY.characters.lincheng;
    const accent = endingKey === 'true' ? '#e34b68' : `rgb(${char.rgb})`;
    const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
    gradient.addColorStop(0, '#030711'); gradient.addColorStop(.58, '#091426'); gradient.addColorStop(1, '#02040b');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 1200, 630);
    ctx.strokeStyle = 'rgba(136,220,243,.07)'; ctx.lineWidth = 1;
    for (let x = 0; x <= 1200; x += 48) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 630); ctx.stroke(); }
    for (let y = 0; y <= 630; y += 48) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1200, y); ctx.stroke(); }
    const accentGlow = endingKey === 'true' ? 'rgba(227,75,104,.18)' : `rgba(${char.rgb},.18)`;
    const glow = ctx.createRadialGradient(850, 310, 20, 850, 310, 400);
    glow.addColorStop(0, accentGlow); glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, 1200, 630);
    ctx.strokeStyle = accent; ctx.globalAlpha = .6; ctx.strokeRect(42, 42, 1116, 546); ctx.globalAlpha = 1;
    ctx.fillStyle = '#88dcf3'; ctx.font = '600 18px monospace'; ctx.fillText('FM 00:13 · SIGNAL RECEIVED', 82, 105);
    ctx.fillStyle = 'rgba(236,245,249,.32)'; ctx.textAlign = 'right'; ctx.fillText(`${RELEASE} · AFTER ZERO`, 1118, 105); ctx.textAlign = 'left';
    ctx.fillStyle = '#ecf5f9'; ctx.font = '600 66px "Microsoft YaHei",sans-serif'; ctx.fillText('零点之后', 82, 235);
    ctx.fillStyle = accent; ctx.font = '300 24px monospace'; ctx.fillText('AFTER ZERO', 86, 280);
    const signalLabel = endingKey === 'true' ? 'TRUE SIGNAL' : ending.failure ? 'LOST SIGNAL' : `SIGNAL ${String(ending.index).padStart(2, '0')} / 05`;
    ctx.fillStyle = accent; ctx.font = '600 20px monospace'; ctx.fillText(signalLabel, 84, 385);
    ctx.fillStyle = '#d9e2e6'; ctx.font = '500 31px "Microsoft YaHei",sans-serif'; ctx.fillText(ending.failure ? '有一段声音没有抵达明天' : endingKey === 'true' ? '第六频道确认了世界之外的回答' : '我接收了一段不会被覆盖的信号', 84, 435);
    const finalCardLine = endingKey === 'true' && persistent.zeroMessage ? `“${persistent.zeroMessage.slice(0, 26)}”` : '有些来电，来自尚未发生的明天。';
    ctx.fillStyle = 'rgba(217,226,230,.56)'; ctx.font = '400 19px "Microsoft YaHei",sans-serif'; ctx.fillText(finalCardLine, 84, 485);
    ctx.strokeStyle = accent; ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 760; x <= 1090; x += 10) {
      const y = 355 + Math.sin(x * .09) * 22 * (1 - Math.abs(925 - x) / 200) + Math.sin(x * .031) * 10;
      if (x === 760) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.fillStyle = '#88dcf3'; ctx.font = '500 17px monospace'; ctx.fillText('kevinkaslana093.github.io/after-zero/', 82, 552);
    return canvas.toDataURL('image/png');
  }

  function openShareCard() {
    if (!currentEndingKey) return;
    const dataURL = shareCardDataURL(currentEndingKey);
    openModal('SHARE WITHOUT SPOILERS', '结局信号卡', body => {
      const wrap = document.createElement('section'); wrap.className = 'share-card-wrap';
      const preview = document.createElement('img'); preview.className = 'share-card-preview'; preview.src = dataURL; preview.alt = '无剧透结局分享卡';
      const copy = document.createElement('div'); copy.className = 'share-card-copy'; copy.innerHTML = '<h3>把这一段信号发给下一位听众</h3><p>卡片不会包含结局标题、关键台词或谜题答案，可以放心分享。</p>';
      const actions = document.createElement('div'); actions.className = 'share-actions';
      const download = document.createElement('button'); download.className = 'glass-button primary'; download.textContent = '保存图片';
      download.onclick = () => { const a = document.createElement('a'); a.href = dataURL; a.download = `after-zero-${currentEndingKey}-signal.png`; a.click(); };
      const copyLink = document.createElement('button'); copyLink.className = 'glass-button'; copyLink.textContent = '复制游戏链接';
      copyLink.onclick = async () => { try { await navigator.clipboard.writeText(SITE_URL); toast('游戏链接已复制'); } catch (_) { toast('浏览器未允许复制，请从地址栏复制'); } };
      actions.append(download, copyLink); copy.appendChild(actions); wrap.append(preview, copy); body.appendChild(wrap);
    });
  }

  function openArchive() {
    openModal('TERMINAL ARCHIVE', '终夜档案', body => {
      const grid = document.createElement('div'); grid.className = 'archive-grid';
      Object.entries(STORY.endings).filter(([, ending]) => ending.archive !== false).sort((a,b) => a[1].index - b[1].index).forEach(([key, ending]) => {
        const unlocked = ending.failure ? persistent.echoes.includes(ending.echoKey || ending.char || key) : persistent.endings.includes(key);
        const char = STORY.characters[ending.char || key] || STORY.characters.lincheng;
        const card = document.createElement('button'); card.type = 'button'; card.className = `archive-card${unlocked ? '' : ' locked'}`;
        card.innerHTML = `<img src="${ending.image || char.image}" alt=""><div class="archive-info"><small>${ending.failure ? 'LOST SIGNAL' : ending.routeEnding === false ? 'TRUE SIGNAL' : `SIGNAL ${String(ending.index).padStart(2,'0')}`}</small><h3>${unlocked ? ending.title : '未接收'}</h3>${unlocked && ending.evidence ? `<span>${ending.evidence.code} · 查看证物</span>` : ''}</div>`;
        card.disabled = !unlocked;
        if (unlocked) card.onclick = () => openEvidence(key, ending);
        grid.appendChild(card);
      });
      body.appendChild(grid);
      const evidenceKeys = Object.entries(STORY.endings)
        .filter(([key, ending]) => ending.evidence && persistent.endings.includes(key) && key !== 'true');
      const decoder = document.createElement('section');
      decoder.className = `evidence-decoder${evidenceKeys.length === 5 ? ' complete' : ''}`;
      decoder.innerHTML = `<header><span>00:13 CROSS-CHECK</span><b>信号交叉校验</b><em>${String(evidenceKeys.length).padStart(2, '0')} / 05</em></header><div class="decoder-track">${[1,2,3,4,5].map(index => `<i class="${evidenceKeys.some(([, ending]) => ending.index === index) ? 'on' : ''}"></i>`).join('')}</div><p>${evidenceKeys.length === 5 ? '五份证物的时间戳完全重合。系统登记五名接收者，却持续占用第六路输入。' : '每个被保留的结局都会留下一个无法由当前世界解释的字段。'}</p>`;
      if (evidenceKeys.length === 5 && !persistent.endings.includes('true')) {
        const decode = document.createElement('button');
        decode.type = 'button'; decode.className = 'archive-decode-button';
        decode.innerHTML = persistent.decoder.solved
          ? '<span>CHANNEL 06 READY</span><b>接收不存在的频道</b>'
          : '<span>MANUAL CROSS-CHECK</span><b>开始第六频道解码</b>';
        decode.onclick = persistent.decoder.solved ? () => { closeModal(); enterZeroRoute(); } : openDecoder;
        decoder.appendChild(decode);
      }
      body.appendChild(decoder);
      const gameNames = {
        city: '城市信号救援', crisis: '00:13紧急抢修', radio: '林澄 · 声音锚定', camera: '唐砂 · 不可能照片',
        code: '苏弥 · 逻辑补丁', medical: '顾晚晴 · 无名病历', folklore: '纪遥 · 第六卷',
        evidence: '五线证物交叉验证', finalsend: '零点之后'
      };
      const unlockedGames = (Array.isArray(persistent.minigames) ? persistent.minigames : []).filter(id => gameNames[id]);
      if (unlockedGames.length) {
        const replay = document.createElement('section');
        replay.className = 'minigame-replay';
        replay.innerHTML = '<header><span>SIGNAL REPRODUCTION</span><b>信号复现</b><em>不会改变剧情存档</em></header><div class="minigame-replay-grid"></div>';
        unlockedGames.forEach(id => {
          const button = document.createElement('button');
          button.type = 'button'; button.innerHTML = `<small>${id.toUpperCase()}</small><b>${gameNames[id]}</b>`;
          button.onclick = () => {
            closeModal();
            minigames?.start(id, { player: state?.player || persistent.autoSave?.state?.player || DEFAULT_PLAYER_NAME, hero: HERO_NAME, reducedMotion: persistent.settings.reducedMotion, onComplete: () => openArchive() });
          };
          $('.minigame-replay-grid', replay).appendChild(button);
        });
        body.appendChild(replay);
      }
      const note = document.createElement('p');
      note.style.cssText = 'margin:24px 0 0;text-align:center;color:#91a6b4;font:400 11px/1.8 "Noto Serif SC",serif;letter-spacing:.1em';
      const heroineKeys = Object.entries(STORY.endings).filter(([, ending]) => ending.routeEnding !== false && ending.countsTowardRoute !== false).map(([key]) => key);
      const heroineCount = heroineKeys.filter(key => persistent.endings.includes(key)).length;
      note.textContent = persistent.endings.includes('true')
        ? `TRUE SIGNAL 已完成：${state?.player || persistent.autoSave?.state?.player || DEFAULT_PLAYER_NAME} · 世界之外的回答者。${persistent.zeroMessage ? ` 留言：“${persistent.zeroMessage}”` : ''}`
        : heroineCount === 5
          ? persistent.decoder.solved
            ? '身份校验完成：第六频道正在等待你的接入。'
            : '五份证物已回收：完成手动交叉校验，才能定位第六频道。'
          : `再接收 ${5 - heroineCount} 段个人信号，即可拼合真正的时间线。`;
      body.appendChild(note);
    });
  }

  function openEvidence(key, ending) {
    const evidence = ending.evidence;
    if (!evidence) return;
    const index = ending.index || 0;
    const owner = key === 'true' ? '世界之外的回答者' : (STORY.characters[ending.char || key]?.name || '未登记');
    audio.evidence(index);
    openModal('RECOVERED ARTIFACT', evidence.title, body => {
      const panel = document.createElement('article');
      panel.className = 'evidence-sheet';
      panel.style.setProperty('--evidence-rgb', (STORY.characters[ending.char || key] || STORY.characters.lincheng).rgb);
      panel.innerHTML = '<div class="evidence-stamp"><span></span><i></i><b></b></div><dl><div><dt>TYPE</dt><dd data-field="type"></dd></div><div><dt>OWNER</dt><dd data-field="owner"></dd></div><div><dt>STATUS</dt><dd>RECOVERED / VERIFIED</dd></div></dl><p class="evidence-meta"></p><blockquote></blockquote>';
      $('.evidence-stamp span', panel).textContent = evidence.code;
      $('.evidence-stamp b', panel).textContent = `CH ${String(index).padStart(2, '0')}`;
      $('[data-field="type"]', panel).textContent = evidence.channel;
      $('[data-field="owner"]', panel).textContent = owner;
      $('.evidence-meta', panel).textContent = token(evidence.meta);
      $('blockquote', panel).textContent = token(evidence.clue);
      const back = document.createElement('button');
      back.className = 'glass-button'; back.textContent = '← 返回终夜档案'; back.onclick = openArchive;
      body.append(panel, back);
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
    const sources = STORY.preload || [
      STORY.backgrounds[STORY.nodes[STORY.start]?.bg]?.src,
      ...Object.values(STORY.characters).map(character => character.image)
    ];
    [...new Set(sources)].forEach(src => { const img = new Image(); img.src = src; });
  }

  function bindEvents() {
    dom.bootSkip.onclick = unlockFromBoot;
    dom.newGame.onclick = () => { audio.ensure(); dom.nameModal.classList.remove('hidden'); setTimeout(() => dom.playerName.select(), 50); };
    dom.confirmName.onclick = () => {
      const name = dom.playerName.value.trim().slice(0, 8) || DEFAULT_PLAYER_NAME;
      dom.nameModal.classList.add('hidden'); startCallPrelude(newState(name));
    };
    dom.answerCall.onclick = answerCallPrelude;
    dom.callContinue.onclick = finishCallPrelude;
    dom.callSkip.onclick = finishCallPrelude;
    dom.missionContinue.onclick = closeMissionUpdate;
    dom.playerName.addEventListener('keydown', e => { if (e.key === 'Enter') dom.confirmName.click(); });
    dom.continue.onclick = () => persistent.autoSave && startGame(persistent.autoSave.state);
    dom.collection.onclick = openArchive;
    dom.titleSettings.onclick = openSettings;
    dom.about.onclick = openAbout;
    dom.zeroRoute.onclick = enterZeroRoute;
    dom.decoderAbort.onclick = closeDecoder;
    dom.zeroErrorConfirm.onclick = () => {
      audio.click();
      dom.zeroError.hidden = true;
      dom.zeroRoute.hidden = false;
      dom.zeroRoute.classList.add('just-unsealed');
      setTimeout(() => dom.zeroRoute.classList.remove('just-unsealed'), 1800);
      dom.zeroRoute.focus();
    };
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
    dom.endingShareBtn.onclick = openShareCard;
    dom.endingRestartBtn.onclick = () => {
      if (STORY.endings[currentEndingKey]?.failure && persistent.autoSave?.state) {
        startGame(persistent.autoSave.state);
        return;
      }
      const heroineKeys = Object.entries(STORY.endings).filter(([, ending]) => ending.routeEnding !== false && ending.countsTowardRoute !== false).map(([key]) => key);
      if (!persistent.endings.includes('true') && heroineKeys.every(key => persistent.endings.includes(key))) {
        returnTitle();
        return;
      }
      const player = state?.player || persistent.autoSave?.state?.player || DEFAULT_PLAYER_NAME;
      const next = persistent.autoSave?.state ? clone(persistent.autoSave.state) : newState(player, STORY.routeSelect);
      next.player = player;
      next.hero = HERO_NAME;
      next.nodeId = STORY.replayStart || STORY.routeSelect;
      next.route = null;
      // A completed heroine route is a closed playback session. Carrying its
      // dialogue into the next route makes LOG show another heroine's scenes.
      next.history = STORY.replayStart ? [] : (state?.history?.slice(-40) || next.history || []);
      if (STORY.replayStart) {
        Object.keys(next.affinity).forEach(key => { next.affinity[key] = 0; });
        next.flags = {};
      } else {
        Object.keys(next.affinity).forEach(key => { next.affinity[key] = Math.max(1, next.affinity[key] || 0); });
      }
      startGame(next);
    };
    document.addEventListener('keydown', e => {
      if (dom.boot && getComputedStyle(dom.boot).visibility !== 'hidden') {
        if (e.key === 'Escape' || e.key === 'Enter' || e.code === 'Space') unlockFromBoot();
        e.preventDefault(); return;
      }
      if (state && STORY.nodes[state.nodeId]?.type === 'silence') {
        e.preventDefault(); return;
      }
      if (e.key === 'Escape') {
        if (dom.storyMinigame && !dom.storyMinigame.classList.contains('hidden')) {
          minigames?.togglePause(!minigames.paused); return;
        }
        if (!dom.callPrelude.classList.contains('hidden') || !dom.producerConsole.classList.contains('hidden') || !dom.missionUpdate.classList.contains('hidden')) return;
        if (!dom.decoderModal.classList.contains('hidden')) { closeDecoder(); return; }
        if (!dom.modal.classList.contains('hidden')) closeModal();
        else if (dom.game.classList.contains('active')) openGameMenu();
        return;
      }
      if (!dom.game.classList.contains('active') || !dom.modal.classList.contains('hidden') || !dom.producerConsole.classList.contains('hidden') || !dom.missionUpdate.classList.contains('hidden')
        || (dom.storyMinigame && !dom.storyMinigame.classList.contains('hidden'))) return;
      if (e.key === 'Enter' || e.code === 'Space') { e.preventDefault(); advance(); }
      if (e.key.toLowerCase() === 'a') setAuto(!autoMode);
      if (e.key.toLowerCase() === 'l') openLog();
      if (e.key.toLowerCase() === 'h') document.body.classList.toggle('hide-ui');
    });
    document.addEventListener('pointerdown', () => audio.ensure(), { once: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        clearTimeout(autoTimer);
        audio.pause();
      } else if (audio.ctx && !persistent.settings.muted) audio.resume();
    });
  }

  function init() {
    preload(); bindEvents(); applySettings(); updateTitleProgress();
    dom.bgA.style.backgroundImage = `url("${STORY.backgrounds.rooftop.src}")`;
    for (const [key, ending] of Object.entries(STORY.endings)) if (!STORY.characters[ending.char || key]) console.warn('Ending without character', key);
    playBoot();
  }

  init();
})();
