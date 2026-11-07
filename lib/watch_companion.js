import { readFileSync, writeFileSync, renameSync, rmSync } from 'node:fs';
import { randomUUID } from 'node:crypto';

const actions = {
  watching: ['checkpoint', 'pause', 'stop'],
  paused: ['resume', 'stop'],
  stopped: ['resume'],
};

export class WatchCompanion {
  constructor(file) {
    this.file = file;
  }

  get(bvid) {
    try {
      return JSON.parse(readFileSync(this.file, 'utf8'))[bvid] ?? null;
    } catch (error) {
      if (error.code === 'ENOENT') return null;
      throw error;
    }
  }

  cutoff(bvid) {
    const state = this.get(bvid);
    return state?.seconds ?? null;
  }

  change({ bvid, action, revision, seconds }) {
    if (!/^BV[0-9A-Za-z]{10}$/.test(bvid)) return { ok: false, reason: 'invalid_bvid' };
    const current = this.get(bvid);
    if (action === 'status') return { ok: true, state: current };
    if (action === 'start' && current) return { ok: true, state: current };
    if (action !== 'start' && (!current || revision !== current.revision)) {
      return { ok: false, reason: 'stale_revision', state: current };
    }
    if (current && !actions[current.status].includes(action)) return { ok: false, reason: 'illegal_action', state: current };
    if (action === 'checkpoint' && (!Number.isFinite(seconds) || seconds < current.seconds)) {
      return { ok: false, reason: 'invalid_checkpoint', state: current };
    }
    const state = {
      bvid, seconds: action === 'checkpoint' ? seconds : current?.seconds ?? 0,
      status: { pause: 'paused', stop: 'stopped' }[action] ?? 'watching',
      revision: (current?.revision ?? 0) + 1, updatedAt: new Date().toISOString(),
    };
    let videos = {};
    try {
      videos = JSON.parse(readFileSync(this.file, 'utf8'));
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    videos[bvid] = state;
    const temporary = `${this.file}.${randomUUID()}.tmp`;
    try {
      writeFileSync(temporary, JSON.stringify(videos), { mode: 0o600, flag: 'wx' });
      renameSync(temporary, this.file);
    } finally {
      rmSync(temporary, { force: true });
    }
    return { ok: true, state };
  }
}

const riddle = {
  prompt: '停电那晚，管理员没开灯就看出了温室里哪一盆花被挪过。为什么？',
  clues: ['光线没有帮助他。', '他感知到的东西和花盆的位置有关。', '他听见了风铃。'],
  questions: {
    视觉: '否。', 听觉: '是。', 第三人: '无关。', 风铃: '是。', 温度: '否。',
  },
  solutions: ['花盆移动后碰到了风铃', '被挪过的花盆碰到了风铃', '花盆挪动后会碰到风铃'],
  reveal: '那盆花被挪到了风铃下面。管理员开门时，风吹动的风铃碰在了花盆上，他听出了位置变化。',
};

export class TextRiddle {
  #games = new Map();

  play(session, { action, revision, question, answer }) {
    let game = this.#games.get(session);
    if (action === 'start' && game?.status !== 'playing') {
      game = { status: 'playing', revision: (game?.revision ?? 0) + 1, clues: 0, guesses: 0 };
      this.#games.set(session, game);
      if (this.#games.size > 128) this.#games.delete(this.#games.keys().next().value);
    }
    if (!game) return { status: 'missing' };
    const view = () => ({
      ...game, prompt: riddle.prompt,
      legalActions: game.status === 'playing' ? ['ask', 'hint', 'guess', 'stop'] : ['start'],
      questionTopics: Object.keys(riddle.questions),
    });
    if (['status', 'start'].includes(action)) return view();
    if (revision !== game.revision) return { ...view(), reason: 'stale_revision' };
    if (game.status !== 'playing') return { ...view(), reason: 'closed' };
    if (!view().legalActions.includes(action)) return { ...view(), reason: 'illegal_action' };
    if (action === 'ask') return { ...view(), reply: Object.hasOwn(riddle.questions, question) ? riddle.questions[question] : '请选择一个题目中的关键词。' };
    if (action === 'hint' && game.clues === riddle.clues.length) return { ...view(), reason: 'no_more_hints' };
    if (action === 'guess' && !answer?.trim()) return { ...view(), reason: 'answer_required' };
    game.revision++;
    if (action === 'hint') {
      const hint = riddle.clues[game.clues++];
      return { ...view(), hint };
    }
    if (action === 'stop') game.status = 'stopped';
    if (action === 'guess') {
      game.guesses++;
      if (riddle.solutions.includes(answer.trim().replace(/[。！!]+$/u, ''))) game.status = 'won';
    }
    return { ...view(), ...(game.status === 'won' && { solution: riddle.reveal }) };
  }
}
