import { Fiber } from 'src/react-reconciler/ReactInternalTypes'
import { getFiberCurrentPropsFromStateNode } from '../ReactDOMComponentTree'

export default function getListener (
  inst: Fiber,
  registrationName: string
) {
  const stateNode = inst.stateNode

  if (stateNode === null) {
    return null
  }

  const props = getFiberCurrentPropsFromStateNode(stateNode)

  if (props === null) {
    return null
  }

  const listener = props[registrationName]

  return listener
}
