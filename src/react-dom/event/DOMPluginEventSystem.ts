import { allNativeEvents } from './EventRegistry'
import { DOMEventName } from './DomEventNames'
import { getEventListenerSet } from '../ReactDOMComponentTree'
import * as SimpleEventPlugin from './plugins/SimpleEventPlugin'
import { createEventListenerWrapperWithPriority } from './ReactDOMEventListener'
import { removeEventListener, addEventBubbleListener, addEventBubbleListenerWithPassiveFlag, addEventCaptureListener, addEventCaptureListenerWithPassiveFlag } from './EventListener'

// 注册下支持的事件
SimpleEventPlugin.registerEvents()

const listeningMarker = '_reactLisening' + Math.random().toString(36).slice(2)

// 媒体事件
export const mediaEventTypes: Array<DOMEventName> = [
  'abort',
  'canplay',
  'canplaythrough',
  'durationchange',
  'emptied',
  'encrypted',
  'ended',
  'error',
  'loadeddata',
  'loadedmetadata',
  'loadstart',
  'pause',
  'play',
  'playing',
  'progress',
  'ratechange',
  'seeked',
  'seeking',
  'stalled',
  'suspend',
  'timeupdate',
  'volumechange',
  'waiting'
]

// 不支持委托的事件
export const nonDelegatedEvents: Set<DOMEventName> = new Set([
  'cancel',
  'close',
  'invalid',
  'load',
  'scroll',
  'toggle',

  ...mediaEventTypes
])

/** 监听所有支持的事件 */
export function listenToAllSupportedEvents (rootContainerElement: EventTarget) {
  if (rootContainerElement[listeningMarker]) return

  rootContainerElement[listeningMarker] = true

  allNativeEvents.forEach(domEventName => {
    if (nonDelegatedEvents.has(domEventName)) {
      listenToNativeEvent(
        domEventName,
        false,
        rootContainerElement,
        null
      )
    } else {
      listenToNativeEvent(
        domEventName,
        true,
        rootContainerElement,
        null
      )
    }
  })
}

/** 监听原生事件 */
export function listenToNativeEvent (
  domEventName: DOMEventName,
  isCapturePhaseListener: boolean,
  rootContainerElement: EventTarget,
  targetElement: Element | null,
  eventSystemFlags: number = 0
) {
  const target = rootContainerElement

  const listenerSet = getEventListenerSet(target)
  const listenerSetKey = getListenerSetKey(domEventName, isCapturePhaseListener)

  if (!listenerSet.has(listenerSetKey)) {
    addTrappedEventListener(target, domEventName, eventSystemFlags, isCapturePhaseListener)
    listenerSet.add(listenerSetKey)
  }
}

/** 添加受限的事件监听 */
function addTrappedEventListener (
  targetContainer: EventTarget,
  domEventName: DOMEventName,
  eventSystemFlags: number,
  isCapturePhaseListener: boolean,
  isDeferredListenerLegacyFBSupport?: boolean
) {
  // 创建监听事件
  let listener = createEventListenerWrapperWithPriority(targetContainer, domEventName, eventSystemFlags)

  const isPassiveListener = undefined
  targetContainer = isDeferredListenerLegacyFBSupport ? (targetContainer as any).ownerDocument : targetContainer

  let unsubscribeListener

  if (isDeferredListenerLegacyFBSupport) {
    const originalListener = listener
    listener = function () {
      removeEventListener(targetContainer, domEventName, unsubscribeListener, isCapturePhaseListener)
    }
    return originalListener.apply(this, arguments)
  }

  if (isCapturePhaseListener) {
    if (isPassiveListener !== undefined) {
      unsubscribeListener = addEventCaptureListenerWithPassiveFlag(targetContainer, domEventName, listener, isPassiveListener)
    } else {
      unsubscribeListener = addEventCaptureListener(targetContainer, domEventName, listener)
    }
  } else {
    if (isPassiveListener !== undefined) {
      unsubscribeListener = addEventBubbleListenerWithPassiveFlag(targetContainer, domEventName, listener, isPassiveListener)
    } else {
      unsubscribeListener = addEventBubbleListener(targetContainer, domEventName, listener)
    }
  }
}

export function getListenerSetKey (domEventName: DOMEventName, capture: boolean) {
  return `${domEventName}__${capture ? 'capture' : 'bubble'}`
}
