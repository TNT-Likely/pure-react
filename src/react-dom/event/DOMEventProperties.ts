import { DOMEventName } from './DomEventNames'
import { ContinuousEvent, DiscreteEvent, EventPriority } from '../../shared/ReactTypes'
import { registerTwoPhaseEvent } from './EventRegistry'

/** 顶级事件到react事件名称映射 */
export const topLevelEventsToReactNames: Map<DOMEventName, string | null> = new Map()

/** 事件属性集合 */
const eventPriorities = new Map()

const discreteEventPairsForSimpleEventPlugin = [
    // 'cancel' as DOMEventName, 'cancel',
    'click' as DOMEventName, 'click'
]

export function getEventPriorityForPluginSystem (type: DOMEventName):number {
  const priority = eventPriorities.get(type)

  if (priority !== undefined) {
    return priority
  }

  return ContinuousEvent
}

/** 注册简单事件并且设置他们的优先级 */
function registerSimplePluginEventsAndSetTheirPriorities (
  eventTypes: Array<DOMEventName | string>,
  priority: EventPriority
) {
  for (let i = 0; i < eventTypes.length; i += 2) {
    /** 顶级事件名称 */
    const topEvent = eventTypes[i] as DOMEventName
    const event = eventTypes[i + 1] as string

    const capitalizedEvent = event[0].toUpperCase() + event.slice(1)

    /** react 事件名称 */
    const reactName = 'on' + capitalizedEvent

    /** 事件属性基和塞入优先级 */
    eventPriorities.set(topEvent, priority)
    topLevelEventsToReactNames.set(topEvent, reactName)
    registerTwoPhaseEvent(reactName, [topEvent])
  }
}

/** 注册简单事件 */
export function registerSimpleEvents () {
  registerSimplePluginEventsAndSetTheirPriorities(discreteEventPairsForSimpleEventPlugin, DiscreteEvent)
}
