import { RootType } from './ReactDOMRoot'
import { COMMENT_NODE } from './shared/HTMLNodeType'
export type Container = (Element & { _reactRootContainer?: RootType }) |
    (Document & { _reactRootContainer?: RootType })

// 在容器前插入节点
export function insertInContainerBefore (container: Container, child: any, beforeChild: any) {
  if (container.nodeType === COMMENT_NODE) {
    container.parentNode?.insertBefore(child, beforeChild)
  } else {
    container.insertBefore(child, beforeChild)
  }
}

// 往容器添加子节点
export function appendChildToContainer (container: Container, child: any) {
  let parentNode
  if (container.nodeType === COMMENT_NODE) {
    parentNode = container.parentNode
    parentNode.insertBefore(child, container)
  } else {
    parentNode = container
    parentNode.appendChild(child)
  }
}
