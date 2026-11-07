import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { WatchCompanion, TextRiddle } from '../lib/watch_companion.js';
import { dayKey } from '../lib/state.mjs';

test('replay, pause and resume a checkpoint with revision protection', t => {
  const dir = mkdtempSync(join(tmpdir(), 'bili-watch-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const file = join(dir, 'watch.json');
  const bvid = 'BV1uNk1YxEJQ';
  const watch = new WatchCompanion(file);
  assert.equal(watch.change({ bvid, action: 'start' }).state.seconds, 0);
  assert.equal(watch.change({ bvid, action: 'checkpoint', seconds: 83, revision: 1 }).state.seconds, 83);
  assert.equal(watch.change({ bvid, action: 'pause', revision: 1 }).reason, 'stale_revision');
  assert.equal(watch.change({ bvid, action: 'pause', revision: 2 }).state.status, 'paused');
  const recovered = new WatchCompanion(file);
  assert.equal(recovered.cutoff(bvid), 83);
  assert.equal(recovered.change({ bvid, action: 'checkpoint', seconds: 110, revision: 3 }).reason, 'illegal_action');
  assert.equal(recovered.change({ bvid, action: 'resume', revision: 3 }).state.status, 'watching');
  assert.equal(recovered.change({ bvid, action: 'checkpoint', seconds: 0, revision: 4 }).reason, 'invalid_checkpoint');
  assert.equal(dayKey(new Date('2026-11-07T16:00:00Z')), '2026-11-08');
});

test('riddle reveals clues and solution only through legal play', () => {
  const game = new TextRiddle();
  const first = game.play('a', { action: 'start' });
  assert.equal(first.solution, undefined);
  assert.equal(game.play('b', { action: 'status' }).status, 'missing');
  assert.equal(game.play('a', { action: 'ask', revision: 1, question: '听觉' }).reply, '是。');
  const hint = game.play('a', { action: 'hint', revision: 1 });
  assert.equal(hint.clues, 1);
  assert.match(hint.hint, /光线/);
  assert.equal(game.play('a', { action: 'guess', revision: 1, answer: '花盆移动后碰到了风铃' }).reason, 'stale_revision');
  const solved = game.play('a', { action: 'guess', revision: 2, answer: '花盆移动后碰到了风铃。' });
  assert.equal(solved.status, 'won');
  assert.match(solved.solution, /风铃/);
});
