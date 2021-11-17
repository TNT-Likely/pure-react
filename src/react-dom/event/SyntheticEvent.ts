import { Fiber } from 'src/react-reconciler/ReactInternalTypes'

function functionThatReturnsTrue () {
  return true
}

function functionThatReturnsFalse () {
  return false
}

function createSyntheticEvent (Interface: any) {
  function SyntheticBaseEvent (
    reactName: string | null,
    reactEventType: string,
    targetInst: Fiber,
    nativeEvent: any,
    nativeEventTarget: any
  ) {
    this._reactName = reactName
    this._targetInst = targetInst
    this.type = reactEventType
    this.nativeEvent = nativeEvent
    this.target = nativeEventTarget
    this.currentTarget = null

    for (const propName in Interface) {
      if (!Interface.hasOwnProperty(propName)) {
        continue
      }

      const normalize = Interface[propName]

      if (normalize) {
        this[propName] = normalize(nativeEvent)
      } else {
        this[propName] = nativeEvent[propName]
      }
    }

    return this
  }

  Object.assign(SyntheticBaseEvent.prototype, {
    preventDefault: function () {

    },

    stopPropagation: function () {
      if (event?.stopPropagation) {
        event.stopPropagation()
      }

      this.isPropagationStopped = functionThatReturnsTrue
    },

    isPropagationStopped: functionThatReturnsFalse

  })

  return SyntheticBaseEvent
}

const EventInterface = {
  eventPhase: 0,
  bubbles: 0,
  cancelable: 0,
  timeStamp: function (event) {
    return event.timeStamp || Date.now()
  },
  defaultPrevented: 0,
  isTrusted: 0
}

export const SyntheticEvent = createSyntheticEvent(EventInterface)
