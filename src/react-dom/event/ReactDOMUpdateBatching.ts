
/** 离散事件更新模板 */
const discreteUpdatesImpl = function (fn, a, b, c, d) {
  return fn(a, b, c, d)
}

let isInsideEventHandler = false
// const isBatchingEventUpdates = false

/** 离散事件更新 */
export function discreteUpdates (fn, a, b, c, d) {
  const preIsInsideEventHandle = isInsideEventHandler
  isInsideEventHandler = true

  try {
    discreteUpdatesImpl(fn, a, b, c, d)
  } finally {
    isInsideEventHandler = preIsInsideEventHandle
  }
}
