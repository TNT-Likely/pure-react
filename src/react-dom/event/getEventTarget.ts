import { TEXT_NODE } from '../shared/HTMLNodeType'

export default (nativeEvent: any) => {
  const target = nativeEvent.target || nativeEvent.srcElement || window

  return target.nodeType === TEXT_NODE ? target.parentNode : target
}
