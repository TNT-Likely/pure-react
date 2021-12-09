import { Container, insertInContainerBefore, appendChildToContainer, commitTextUpdate } from '../react-dom/ReactDOMHostConfig'
import { Placement } from './ReactFiberFlags'
import { Fiber } from './ReactInternalTypes'
import { DehydratedFragment, FundamentalComponent, HostComponent, HostPortal, HostRoot, HostText } from './ReactWorkTags'

// 获取父Fiber节点
function getHostParentFiber (fiber: Fiber) {
  let parent = fiber.return
  while (parent !== null) {
    if (isHostParent(parent)) {
      return parent
    }
    parent = parent.return
  }
}

function isHostParent (fiber: Fiber): boolean {
  return fiber.tag === HostComponent || fiber.tag === HostRoot || fiber.tag === HostPortal
}

// 获取相邻Fiber节点
function getHostSibling (fiber: Fiber) {
  let node: Fiber = fiber
  while (true) {
    while (node.sibling === null) {
      if (node.return === null || isHostParent(node.return)) {
        return null
      }
      node = node.return
    }

    node.sibling.return = node.return
    node = node.sibling

    while (node.tag !== HostComponent && node.tag !== HostText && node.tag !== DehydratedFragment) {
      if (node.flags & Placement) {
        continue
      }

      if (node.child === null || node.tag === HostPortal) {
        continue
      } else {
        node.child.return = node
        node = node.child
      }
    }

    if (!(node.flags & Placement)) {
      return node.stateNode
    }
  }
}

function commitPlacement (finishedWork: Fiber): void {
  const parentFiber = getHostParentFiber(finishedWork) as Fiber

  let parent
  let isContainer

  const parentStateNode = parentFiber.stateNode

  switch (parentFiber.tag) {
    case HostComponent:
      parent = parentStateNode
      isContainer = false
      break
    case HostRoot:
      parent = parentStateNode.containerInfo
      isContainer = true
      break
    case HostPortal:
      parent = parentStateNode.containerInfo
      isContainer = true
      break
  }

  const before = getHostSibling(finishedWork)
  if (isContainer) {
    insertOrAppendPlacementNodeIntoContainer(finishedWork, before, parent)
  } else {
    insertOrAppendPlacementNode(finishedWork, before, parent)
  }
}

function insertOrAppendPlacementNodeIntoContainer (node: Fiber, before: any, parent: Container):void {
  const { tag } = node
  const isHost = tag === HostComponent || tag === HostText
  if (isHost || tag === FundamentalComponent) {
    const stateNode = isHost ? node.stateNode : node.stateNode.instance
    if (before) {
      insertInContainerBefore(parent, stateNode, before)
    } else {
      appendChildToContainer(parent, stateNode)
    }
  } else if (tag === HostPortal) {

  } else {
    const child = node.child
    if (child !== null) {
      insertOrAppendPlacementNodeIntoContainer(child, before, parent)
      let sibling = child.sibling
      while (sibling !== null) {
        insertOrAppendPlacementNodeIntoContainer(sibling, before, parent)
        sibling = sibling.sibling
      }
    }
  }
}

function insertOrAppendPlacementNode (node: Fiber, before: any, parent: Container):void {

}

function commitWork (
  current: Fiber | null,
  finishedWork: Fiber
) {
  switch (finishedWork.tag) {
    case HostText: {
      const textInstance: Element = finishedWork.stateNode
      const newText: string = finishedWork.memoizedProps

      const oldText: string = current !== null ? current.memoizedProps : newText

      commitTextUpdate(textInstance, oldText, newText)
    }
  }
}

export {
  commitPlacement,
  commitWork
}
