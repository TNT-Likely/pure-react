import { ReactElement } from '../shared/ReactElementType'
import { REACT_ELEMENT_TYPE, REACT_FRAGMENT_TYPE } from '../shared/ReactSymbols'
import { Placement } from './ReactFiberFlags'
import { Lanes } from './ReactFiberLane'
import { Fiber } from './ReactInternalTypes'
import { createFiberFromElement, createFiberFromText } from './ReactFiber'

function ChildReconciler (shouldTrackSideEffects) {
  function placeSingleChild (newFiber: Fiber): Fiber {
    if (shouldTrackSideEffects && newFiber.alternate === null) {
      newFiber.flags = Placement
    }
    return newFiber
  }

  // 单元素节点
  function reconcileSingleElement (
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    element: ReactElement,
    lanes: Lanes
  ): Fiber {
    const key = element.key
    const child = currentFirstChild

    while (child !== null) {
      if (child.key === key) {
        switch (child.tag) {
          default: {
            // deleteRemainingChildren(returnFiber, child.sibling)
            // const existing = useFiber(child, element.props)
            // existing.ref =  coerceRef(returnFiber, child, element)
            // existing.return = returnFiber

            // return existing
          }
        }
      }
    }

    // 如果元素是fragment类型
    if (element.type === REACT_FRAGMENT_TYPE) {
      return {} as Fiber
    } else {
      const created = createFiberFromElement(element, returnFiber.mode, lanes)
      // created.ref = coerceRef(returnFiber, currentFirstChild, element)

      // 挂载父节点
      created.return = returnFiber

      return created
    }
  }

  // 创建子节点
  function createChild (
    returnFiber: Fiber,
    newChild: any,
    lanes: Lanes
  ): Fiber | null {
    if (typeof newChild === 'string' || typeof newChild === 'number') {
      const created = createFiberFromText('' + newChild, returnFiber.mode, lanes)
      created.return = returnFiber
      return created
    }

    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE: {
          const created = createFiberFromElement(newChild, returnFiber.mode, lanes)
          // created.ref = coerceRef(returnFiber, null, newChild)
          created.return = returnFiber
          return created
        }
      }
    }
  }

  // 放置子节点
  function placeChild (
    newFiber: Fiber,
    lastPlacedIndex: number,
    newIndex: number
  ): number {
    newFiber.index = newIndex
    // if (!shouldTrackSideEffects) {
    //     return lastPlacedIndex
    // }
    return lastPlacedIndex
  }

  // 调和数组子节点
  function reconcileChildrenArray (
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    newChildren: Array<any>,
    lanes: Lanes
  ): Fiber | null {
    // 返回的第一个子节点
    let resultingFirstChild: Fiber | null = null

    let previousNewFiber: Fiber | null = null

    const oldFiber = currentFirstChild
    let lastPlacedIndex = 0
    let newIdx = 0

    const newOldFiber = null

    if (oldFiber === null) {
      for (; newIdx < newChildren.length; newIdx++) {
        const newFiber = createChild(returnFiber, newChildren[newIdx], lanes)

        if (newFiber === null) {
          continue
        }

        lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx)

        if (previousNewFiber === null) {
          resultingFirstChild = newFiber
        } else {
          // 挂载兄弟节点
          previousNewFiber.sibling = newFiber
        }

        previousNewFiber = newFiber
      }

      return resultingFirstChild
    }

    return resultingFirstChild
  }

  function reconcileSingleTextNode (
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    textContent: string,
    lanes: Lanes
  ): Fiber {
    const created = createFiberFromText(textContent, returnFiber.mode, lanes)
    created.return = returnFiber
    return created
  }

  // 计算子fiber节点
  function reconcileChildFibers (
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    newChild: any,
    lanes: Lanes
  ): Fiber | null {
    const isUnkeyedTopLevelFragment = typeof newChild === 'object' && newChild !== null && newChild.type === REACT_FRAGMENT_TYPE &&
      newChild.key === null

    if (isUnkeyedTopLevelFragment) {
      newChild = newChild.props.children
    }

    // 如果子节点是对象
    const isObject = typeof newChild === 'object' && newChild !== null

    if (isObject) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          return placeSingleChild(
            reconcileSingleElement(
              returnFiber,
              currentFirstChild,
              newChild,
              lanes
            )
          )
      }
    }

    // 如果子节点是字符串或数字
    if (typeof newChild === 'string' || typeof newChild === 'number') {
      return placeSingleChild(reconcileSingleTextNode(returnFiber, currentFirstChild, '' + newChild, lanes))
    }

    // 如果子节点是数组
    if (Array.isArray(newChild)) {
      return reconcileChildrenArray(returnFiber, currentFirstChild, newChild, lanes)
    }

    return null
  }

  return reconcileChildFibers
}

export const reconcileChildFibers = ChildReconciler(true)
export const mountChildFibers = ChildReconciler(false)
