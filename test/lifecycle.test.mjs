import { test } from 'node:test'
import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { getOptionalService, guardCallback, observeHeart } from '../lib/lifecycle.mjs'

const strictContext = service => new Proxy({ get: name => name === 'heart' ? service : null }, {
  get(target, name, receiver) {
    if (name === 'heart') throw new Error('cannot get property "heart" without inject')
    return Reflect.get(target, name, receiver)
  },
})

test('真实错误条件：未注入的直接属性读取抛错，受保护的服务读取可用', () => {
  const service = { observe() {} }
  const ctx = strictContext(service)
  assert.throws(() => ctx?.heart, /without inject/)
  assert.equal(getOptionalService(ctx, 'heart'), service)
  assert.equal(getOptionalService(strictContext(null), 'heart'), null)
  assert.equal(getOptionalService(new Proxy({}, { get() { throw Error('disposed') } }), 'heart'), null)
})

test('exit 事件在 Heart 缺失、同步/异步失败或返回 void 时都完成清理', async () => {
  for (const [observe, expectedErrors] of [[null, 0], [() => {}, 0], [() => { throw Error('sync') }, 1], [async () => { throw Error('async') }, 1]]) {
    const ctx = strictContext(observe && { observe })
    const child = new EventEmitter()
    const errors = []
    let cleaned = false
    child.on('exit', guardCallback(() => {
      cleaned = true
      return observeHeart(ctx, { type: 'bili_duty_done' }, error => errors.push(error.message))
    }, error => errors.push(error.message)))
    assert.doesNotThrow(() => child.emit('exit', 0))
    await new Promise(resolve => setImmediate(resolve))
    assert.equal(cleaned, true)
    assert.equal(errors.length, expectedErrors)
  }
})

test('原生回调本身和错误记录器抛错不向 EventEmitter 冒泡', async () => {
  const child = new EventEmitter()
  child.on('exit', guardCallback(() => { throw Error('cleanup') }, () => { throw Error('logger') }))
  child.on('error', guardCallback(async () => { throw Error('spawn') }, () => { throw Error('logger') }))
  assert.doesNotThrow(() => child.emit('exit', 1))
  assert.doesNotThrow(() => child.emit('error', Error('ENOENT')))
  await new Promise(resolve => setImmediate(resolve))
})

test('正常回流仍收到完整 payload', async () => {
  const received = []
  const payload = { type: 'bili_duty_done', source: 'bili-scroll', evidence: { code: 0, picked: 2 } }
  await observeHeart(strictContext({ observe(value) { received.push(value) } }), payload)
  assert.deepEqual(received, [payload])
})
