import { allNativeEvents } from './EventRegistry'
import { DOMEventName } from './DomEventNames'
import { getEventListenerSet, getClosestInstanceFromNode } from '../ReactDOMComponentTree'
import * as SimpleEventPlugin from './plugins/SimpleEventPlugin'
import { createEventListenerWrapperWithPriority } from './ReactDOMEventListener'
import { removeEventListener, addEventBubbleListener, addEventBubbleListenerWithPassiveFlag, addEventCaptureListener, addEventCaptureListenerWithPassiveFlag } from './EventListener'
import { Fiber } from 'src/react-reconciler/ReactInternalTypes'
import { HostComponent, HostPortal, HostRoot, HostText } from 'src/react-reconciler/ReactWorkTags'
import { COMMENT_NODE } from '../shared/HTMLNodeType'
import getEventTarget from './getEventTarget'
import { IS_CAPTURE_PHASE } from './EventSystemFlags'

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
    if (!nonDelegatedEvents.has(domEventName)) {
      listenToNativeEvent(
        domEventName,
        false,
        rootContainerElement,
        null
      )
    }

    listenToNativeEvent(
      domEventName,
      true,
      rootContainerElement,
      null
    )
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
    if (isCapturePhaseListener) {
      eventSystemFlags |= IS_CAPTURE_PHASE
    }

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

function isMatchingRootContainer (
  grandContainer: Element,
  targetContainer: EventTarget
): boolean {
  return (
    grandContainer === targetContainer ||
    (grandContainer.nodeType === COMMENT_NODE &&
      grandContainer.parentNode === targetContainer)
  )
}

/** 向事件插件系统派发事件 */
export function dispatchEventForPluginEventSystem (
  domEventName: DOMEventName,
  eventSystemFlags: number,
  nativeEvent: Event,
  targetInst: null | Fiber,
  targetContainer: EventTarget
) {
  /** 原始实例 */
  let ancestorInst = targetInst

  const targetContainerNode = targetContainer as Node

  if (targetInst !== null) {
    let node = targetInst
    while (true) {
      if (node === null) {
        return
      }

      const nodeTag = node.tag

      if (nodeTag === HostRoot || nodeTag === HostPortal) {
        let container = node.stateNode.containerInfo

        if (isMatchingRootContainer(container, targetContainerNode)) {
          break
        }

        if (nodeTag === HostPortal) {
          let grandNode = node.return
          while (grandNode !== null) {
            const grandTag = grandNode.tag
            if (grandTag === HostRoot || grandTag === HostPortal) {
              const grandContainer = grandNode.stateNode.containerInfo
              if (isMatchingRootContainer(grandContainer, targetContainerNode)) {
                return
              }
            }
            grandNode = grandNode.return
          }
        }

        while (container !== null) {
          const parentNode = getClosestInstanceFromNode(container)
          if (parentNode === null) {
            return
          }

          const parentTag = parentNode.tag
          if (parentTag === HostComponent || parentTag === HostText) {
            node = ancestorInst = parentNode
            continue
          }

          container = container.parentNode
        }
      }

      node = node.return as Fiber
    }
  }

  dispatchEventsForPlugins(
    domEventName,
    eventSystemFlags,
    nativeEvent,
    ancestorInst,
    targetContainer
  )
}

/** 向插件派发事件 */
function dispatchEventsForPlugins (
  domEventName: DOMEventName,
  eventSystemFlags: number,
  nativeEvent: Event,
  tagrgetInst: Fiber | null,
  targetContainer: EventTarget
) {
  const nativeEventTarget = getEventTarget(nativeEvent)

  const dispatchQueue:any[] = []

  extractEvents(dispatchQueue, domEventName, tagrgetInst, nativeEvent, nativeEventTarget, eventSystemFlags, targetContainer)
}

/** 提取事件 */
function extractEvents (
  dispatchQueue: any[],
  domEventName: DOMEventName,
  targetInst: Fiber | null,
  nativeEvent: Event,
  nativeEventTarget: EventTarget |null,
  eventSystemFlags: number,
  targetContainer: EventTarget
) {
  SimpleEventPlugin.extractEvents(
    dispatchQueue,
    domEventName,
    targetInst,
    nativeEvent,
    nativeEventTarget,
    eventSystemFlags,
    targetContainer
  )
}

/** 收集单个阶段事件监听 */
export function accumulateSinglePhaseListeners (
  targetFiber: Fiber | null,
  reactName: string | null,
  nativeEventType: string,
  inCapturePhase: boolean,
  accumulateTargetOnly: boolean
) {
  const captureName = reactName !== null ? reactName + 'Capture' : null
}
