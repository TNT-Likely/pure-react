import { Fiber } from 'src/react-reconciler/ReactInternalTypes'
import { DOMEventName } from '../DomEventNames'
import { registerSimpleEvents, topLevelEventsToReactNames } from '../DOMEventProperties'
import { IS_CAPTURE_PHASE } from '../EventSystemFlags'

function extractEvents (
  dispatchQueue: any[],
  domEventName: DOMEventName,
  targetInst: Fiber | null,
  nativeEvent: Event,
  nativeEventTarget: EventTarget |null,
  eventSystemFlags: number,
  targetContainer: EventTarget
) {
  const reactName = topLevelEventsToReactNames.get(domEventName)

  if (reactName === undefined) return

  const SyntheticEventCtor = SyntheticEvent
  const reactEventType:string = domEventName

  const inCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0

  const accumulateTargetOnly = !inCapturePhase && domEventName === 'scroll'

  const listeners = accumulateSinglePhaseListeners(targetInst, reactName, nativeEvent.type, inCapturePhase, accumulateTargetOnly)

  if (listeners.length > 0) {
    const event = new SyntheticEventCtor(reactName, reactEventType, null, nativeEvent, nativeEventTarget)
    dispatchQueue.push({ event, listeners })
  }
}

export { registerSimpleEvents as registerEvents, extractEvents }
