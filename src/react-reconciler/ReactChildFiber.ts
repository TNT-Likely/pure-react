import { ReactElement } from '../shared/ReactElementType'
import { REACT_ELEMENT_TYPE, REACT_FRAGMENT_TYPE } from '../shared/ReactSymbols'
import { Deletion, Placement } from './ReactFiberFlags'
import { Lane, Lanes } from './ReactFiberLane'
import { Fiber } from './ReactInternalTypes'
import { createFiberFromElement, createFiberFromText, createWorkInProgress } from './ReactFiber'
import { Block, HostText } from './ReactWorkTags'

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

  function useFiber (fiber: Fiber, pendingProps: any):Fiber {
    const clone = createWorkInProgress(fiber, pendingProps)
    clone.index = 0
    clone.sibling = null
    return clone
  }

  function updateTextNode (
    returnFiber: Fiber,
    current: Fiber | null,
    textContent: string,
    lanes: Lanes
  ) {
    if (current === null || current.tag !== HostText) {
      const created = createFiberFromText(textContent, returnFiber.mode, lanes)
      created.return = returnFiber
      return created
    } else {
      const existing = useFiber(current, textContent)
      existing.return = returnFiber
      return existing
    }
  }

  function updateElement (
    returnFiber: Fiber,
    current: Fiber | null,
    element: ReactElement,
    lanes: Lanes
  ):Fiber {
    if (current !== null) {
      if (current.elementType === element.type) {
        const existing = useFiber(current, element.props)
        existing.ref = coerceRef(returnFiber, current, element)
        existing.return = returnFiber
        return existing
      } else if (current.tag === Block) {
        const type = element.type
        const existing = useFiber(current, element.props)
        existing.return = returnFiber
        existing.type = type

        return existing
      }
    }

    const created = createFiberFromElement(element, returnFiber.mode, lanes)
    created.ref = coerceRef(returnFiber, current, element)
    created.return = returnFiber
    return created
  }

  function updateSlot (
    returnFiber: Fiber,
    oldFiber: Fiber | null,
    newChild: any,
    lanes: number
  ):Fiber|null {
    const key = oldFiber !== null ? oldFiber.key : null

    if (typeof newChild === 'string' || typeof newChild === 'number') {
      if (key !== null) {
        return null
      }

      return updateTextNode(returnFiber, oldFiber, '' + newChild, lanes)
    }

    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE: {
          if (newChild.key === key) {
            // if (newChild.type === REACT_FRAGMENT_TYPE) {
            //   return
            // }
            return updateElement(returnFiber, oldFiber, newChild, lanes)
          } else {
            return null
          }
        }
      }
    }
  }

  function coerceRef (
    returnFiber: Fiber,
    current: Fiber | null,
    element: ReactElement
  ) {
    const mixedRef = element.ref
    if (mixedRef !== null &&
      typeof mixedRef !== 'function' &&
      typeof mixedRef !== 'object') {
      if (element._owner) {
        const owner = element._owner
        let inst
        if (owner) {
          const ownerFiber = owner
          inst = ownerFiber.stateNode
        }

        const stringRef = '' + mixedRef
        if (current !== null &&
            current.ref !== null &&
            typeof current.ref === 'function' &&
            current.ref._stringRef === stringRef) {
          return current.ref
        }

        const ref = function (value) {
          const refs = inst.refs
          // if (refs === emptyRefsObject) {
          //   refs = inst.refs = {}
          // }

          if (value === null) {
            delete refs[stringRef]
          } else {
            refs[stringRef] = stringRef
          }
        }
        ref._stringRef = stringRef
        return ref
      }
    }
    return mixedRef
  }

  function deleteChild (returnFiber: Fiber, childToDelete: Fiber):void {
    if (!shouldTrackSideEffects) {
      return
    }

    const deletions = returnFiber.deletions
    if (deletions === null) {
      returnFiber.deletions = [childToDelete]
      returnFiber.flags |= Deletion
    } else {
      deletions.push(childToDelete)
    }
  }

  function deleteRemainingChildren (
    returnFiber: Fiber,
    currentFirstChild: Fiber | null
  ) {
    if (!shouldTrackSideEffects) {
      return null
    }
    let childToDelete = currentFirstChild
    while (childToDelete !== null) {
      deleteChild(returnFiber, childToDelete)
      childToDelete = childToDelete.sibling
    }
    return null
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

    let oldFiber = currentFirstChild
    let lastPlacedIndex = 0
    let newIdx = 0
    let nextOldFiber = null

    for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
      if (oldFiber.index > newIdx) {
        nextOldFiber = oldFiber
        oldFiber = null
      } else {
        nextOldFiber = oldFiber.sibling
      }

      const newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIdx], lanes)
      if (newFiber === null) {
        if (oldFiber === null) {
          oldFiber = nextOldFiber
        }
        break
      }

      if (shouldTrackSideEffects) {
        if (oldFiber && newFiber.alternate === null) {
          deleteChild(returnFiber, oldFiber)
        }
      }

      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx)

      if (previousNewFiber === null) {
        resultingFirstChild = newFiber
      } else {
        previousNewFiber.sibling = newFiber
      }

      previousNewFiber = newFiber
      oldFiber = nextOldFiber
    }

    if (newIdx === newChildren.length) {
      deleteRemainingChildren(returnFiber, oldFiber)
      return resultingFirstChild
    }

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

/** 克隆子fiber节点 */
export function cloneChildFibers (
  current: Fiber | null,
  workInProgress: Fiber
) {
  if (workInProgress.child === null) return

  let currentChild = workInProgress.child
  let newChild = createWorkInProgress(currentChild, current.pendingProps)

  workInProgress.child = newChild
  newChild.return = workInProgress

  /** 克隆兄弟节点 */
  while (current.sibling !== null) {
    currentChild = currentChild.sibling
    newChild = newChild.sibling = createWorkInProgress(currentChild, currentChild.pendingProps)
    newChild.return = workInProgress
  }
  newChild.sibling = null
}
