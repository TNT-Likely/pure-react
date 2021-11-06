/** 添加冒泡事件 */
export function addEventBubbleListener (target: EventTarget, eventType: string, listener: (e) => void): Function {
  target.addEventListener(eventType, listener, false)
  return listener
}

/** 添加捕获事件 */
export function addEventCaptureListener (target: EventTarget, eventType: string, listener: (e) => void): Function {
  target.addEventListener(eventType, listener, true)
  return listener
}

export function addEventBubbleListenerWithPassiveFlag (target: EventTarget, eventType: string, listener: (e) => void, passive: boolean): Function {
  target.addEventListener(eventType, listener, {
    capture: false,
    passive
  })
  return listener
}

export function addEventCaptureListenerWithPassiveFlag (target: EventTarget, eventType: string, listener: (e) => void, passive: boolean): Function {
  target.addEventListener(eventType, listener, {
    capture: true,
    passive
  })
  return listener
}

/** 移除事件监听器 */
export function removeEventListener (target: EventTarget, eventType: string, listener: (e) => void, capture: boolean) {
  target.removeEventListener(eventType, listener, capture)
}
