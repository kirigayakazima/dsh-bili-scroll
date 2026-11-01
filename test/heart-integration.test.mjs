import { test } from 'node:test'
import assert from 'node:assert/strict'
import { name, inject } from '../index.js'

test('bili-scroll 基础插件元数据完整', () => {
  assert.equal(name, 'bili-scroll')
  assert.ok(Array.isArray(inject))
  assert.ok(inject.includes('webServer'))
  assert.ok(inject.includes('tools'))
  assert.ok(inject.includes('settings'))
})

test('Heart Protocol v1 评估与上报契约字段校验', () => {
  const evaluatePayload = {
    intent: 'browse_daily_updates',
    category: 'bilibili',
    estimatedDurationMinutes: 15,
  }
  assert.equal(evaluatePayload.intent, 'browse_daily_updates')
  assert.equal(evaluatePayload.category, 'bilibili')

  const observePayload = {
    type: 'bili_duty_done',
    source: 'bili-scroll',
    confidence: 1.0,
    evidence: {
      why: 'window',
      code: 0,
      picked: 3,
      day: '2026-10-31',
    },
    summary: '完成了 B站 日报巡检（挑中 3 条，退出码 0）',
  }
  assert.equal(observePayload.type, 'bili_duty_done')
  assert.equal(observePayload.source, 'bili-scroll')
  assert.equal(observePayload.evidence.picked, 3)
})
