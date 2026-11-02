// Cordis service getters may throw even inside optional chaining. Keep optional
// integrations and native EventEmitter callbacks from terminating the host.
export function getOptionalService(ctx, name) {
  try {
    const service = ctx?.get?.(name)
    if (service) return service
  } catch {}
  try { return ctx?.[name] ?? null } catch { return null }
}

export function guardCallback(callback, onError = () => {}) {
  const report = error => { try { onError(error) } catch {} }
  return function (...args) {
    try { return Promise.resolve(callback.apply(this, args)).catch(report) }
    catch (error) { report(error) }
  }
}

export function observeHeart(ctx, observation, onError) {
  return guardCallback(() => {
    const heart = getOptionalService(ctx, 'heart')
    if (typeof heart?.observe === 'function') return heart.observe(observation)
  }, onError)()
}
