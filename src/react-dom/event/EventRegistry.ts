
import { DOMEventName } from './DomEventNames'

/** 需要注册的所有原生事件集合 */
export const allNativeEvents: Set<DOMEventName> = new Set()

/** 注册事件名称和原生事件名称之间的映射 */
export const registrationNameDependencies = {}

/** 注册冒泡和捕获事件 */
export function registerTwoPhaseEvent (registrationName: string, dependencies: Array<DOMEventName>) {
  registerDirectEvent(registrationName, dependencies)
  registerDirectEvent(registerDirectEvent + 'Capture', dependencies)
}

/** 注册离散事件 */
export function registerDirectEvent (registrationName: string, dependencies: Array<DOMEventName>) {
  registrationNameDependencies[registrationName] = dependencies

  for (let i = 0; i < dependencies.length; i++) {
    allNativeEvents.add(dependencies[i])
  }
}
