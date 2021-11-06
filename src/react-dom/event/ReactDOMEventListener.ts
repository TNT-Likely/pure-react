import { UserBlockingEvent, ContinuousEvent, DiscreteEvent } from '../../shared/ReactTypes'
import { DOMEventName } from './DomEventNames'
import { getEventPriorityForPluginSystem } from './DOMEventProperties'
import { discreteUpdates } from './ReactDOMUpdateBatching'

/** 创建带优先级的事件监听包装器 */
export function createEventListenerWrapperWithPriority (
  targetContainer: EventTarget,
  domEventName: DOMEventName,
  eventSystemFlags: number
): Function {
  const eventPriority = getEventPriorityForPluginSystem(domEventName)
  let listenerWrapper

  switch (eventPriority) {
    case DiscreteEvent:
      listenerWrapper = dispatchDiscreteEvent
      break
    case UserBlockingEvent:
      listenerWrapper = dispatchUserBlockingEvent
      break
    case ContinuousEvent:
    default:
      listenerWrapper = dispatchEvent
      break
  }

  return listenerWrapper.bind(null, domEventName, eventSystemFlags, targetContainer)
}

/** 派发离散事件 */
function dispatchDiscreteEvent (
  domEventName,
  eventSystemFlags,
  container,
  nativeEvent
) {
  discreteUpdates(dispatchEvent, domEventName, eventSystemFlags, container, nativeEvent)
}

/** 派发用户阻塞事件 */
function dispatchUserBlockingEvent (
  domeventName,
  eventSystemFlags,
  container,
  nativeEvent
) {

}

/** 派发事件-- 这里是事件真正执行的地方 */
function dispatchEvent (
  domeventName,
  eventSystemFlags,
  container,
  nativeEvent
) {

}
