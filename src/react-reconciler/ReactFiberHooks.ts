import ReactSharedInternal from '../shared/ReactSharedInternal'
import { isSubsetOfLanes, Lane, Lanes, mergeLanes, NoLane, NoLanes, SyncLane } from './ReactFiberLane'
import { requestUpdateLane, scheduleUpdateOnFiber } from './ReactFiberWorkLoop'
import { BaseStateAction, Dispatch, Dispatcher, Fiber } from './ReactInternalTypes'

const { ReactCurrentDispatcher } = ReactSharedInternal

type Update<S, A> = {
  lane: Lane,
  action: A,
  eagerReducer: ((S, A) => S) | null,
  eagerState: S | null,
  next: Update<S, A>,
  priority?: any
}

type UpdateQueue<S, A> = {
  pending: Update<S, A> | null,
  dispatch: ((A) => any) | null,
  lastRenderedReducer: ((S, A) => A) | null,
  lastRenderedState: S | null
}

export type Hook = {
  memoizedState: any,
  baseState: any,
  baseQueue: Update<any, any> | null,
  queue: UpdateQueue<any, any> | null,
  next: Hook | null
}

let renderLanes: Lanes = NoLanes
let currentlyRenderingFiber: Fiber | null = null
let currentHook: Hook | null = null
let workInProgressHook: Hook | null = null

function mountWorkInProgressHook (): Hook {
  const hook: Hook = {
    memoizedState: null,
    baseState: null,
    baseQueue: null,
    queue: null,
    next: null
  }

  if (workInProgressHook === null) {
    (currentlyRenderingFiber as Fiber).memoizedState = workInProgressHook = hook
  } else {
    workInProgressHook = workInProgressHook.next = hook
  }

  return workInProgressHook
}

function basicStateReducer<T> (state: T, action: BaseStateAction<T>): T {
  return typeof action === 'function' ? (action as (T) => T)(state) : action
}

const HooksDispatcherOnMount: Dispatcher = {
  useState: mountState
}

const HooksDispatcherOnUpdate: Dispatcher = {
  useState: updateState
}

export const ContextOnlyDispatcher: Dispatcher = {
  useState: throwInvalidHookError
}

function throwInvalidHookError () {
  console.error('错误的时机')
}

// 挂载state
function mountState<T> (initialState: (() => T | T)): [T, Dispatch<BaseStateAction<T>>] {
  const hook = mountWorkInProgressHook()

  if (typeof initialState === 'function') {
    initialState = initialState()
  }

  hook.memoizedState = hook.baseState = initialState

  const queue = hook.queue = {
    pending: null,
    dispatch: null,
    lastRenderedReducer: basicStateReducer,
    lastRenderedState: (initialState as any)
  }

  const dispatch = queue.dispatch = dispatchAction.bind(null, currentlyRenderingFiber, queue)

  return [hook.memoizedState, dispatch]
}

function updateState<T> (initialState: (() => T | T)): [T, Dispatch<BaseStateAction<T>>] {
  return updateReducer(basicStateReducer, initialState)
}

// 派发action
function dispatchAction<S, A> (fiber: Fiber, queue: UpdateQueue<S, A>, action: A) {
  const lane = requestUpdateLane(fiber)
  const eventTime = 0

  const update: Update<S, A> = {
    lane,
    action,
    eagerReducer: null,
    eagerState: null,
    next: null as any
  }

  const pending = queue.pending
  if (pending === null) {
    update.next = update
  } else {
    update.next = pending.next
    pending.next = update
  }
  queue.pending = update

  const alternate = fiber.alternate

  if (fiber === currentlyRenderingFiber || (alternate !== null && alternate === currentlyRenderingFiber)) {

  } else {
    const lastRenderedReducer = queue.lastRenderedReducer
    if (lastRenderedReducer !== null) {
      let prevDispatcher

      try {
        const currentState: S = queue.lastRenderedState
        const eagerState = lastRenderedReducer(currentState, action)

        update.eagerReducer = lastRenderedReducer
        update.eagerState = eagerState

        if (Object.is(eagerState, currentState)) {
          return
        }
      } catch (error) {
        console.error(error)
      }
    }

    scheduleUpdateOnFiber(fiber, lane, eventTime)
  }
}

function updateWorkInProgressHook (): Hook {
  let nextCurrentHook: null | Hook
  if (currentHook === null) {
    const current = currentlyRenderingFiber.alternate
    if (current !== null) {
      nextCurrentHook = current.memoizedState
    } else {
      nextCurrentHook = null
    }
  } else {
    nextCurrentHook = currentHook.next
  }

  let nextWorkInProgressHook: null | Hook
  if (workInProgressHook === null) {
    nextWorkInProgressHook = currentlyRenderingFiber.memoizedState
  } else {
    nextWorkInProgressHook = workInProgressHook.next
  }

  if (nextWorkInProgressHook !== null) {
    workInProgressHook = nextWorkInProgressHook
    nextWorkInProgressHook = workInProgressHook.next

    currentHook = nextCurrentHook
  } else {
    currentHook = nextCurrentHook

    const newHook: Hook = {
      memoizedState: currentHook.memoizedState,
      baseState: currentHook.baseState,
      baseQueue: currentHook.baseQueue,
      queue: currentHook.queue,
      next: null
    }

    if (workInProgressHook == null) {
      currentlyRenderingFiber.memoizedState = workInProgressHook = newHook
    } else {
      workInProgressHook = workInProgressHook.next = newHook
    }
  }

  return workInProgressHook
}

function updateReducer<S, I, A> (
  reducer: (state: S, action: A) => S,
  initialArg: I,
  init?: (initialArg: I) => S
): [S, Dispatch<A>] {
  const hook = updateWorkInProgressHook()
  const queue = hook.queue

  queue.lastRenderedReducer = reducer

  const current: Hook = currentHook

  let baseQueue = current.baseQueue

  const pendingQueue = queue.pending
  if (pendingQueue !== null) {
    if (baseQueue !== null) {
      const baseFirst = baseQueue.next
      const pendingFirst = pendingQueue.next
      baseQueue.next = pendingFirst
      pendingQueue.next = baseFirst
    }

    current.baseQueue = baseQueue = pendingQueue
    queue.pending = null
  }

  if (baseQueue !== null) {
    const first = baseQueue.next
    let newState = current.baseState

    let newBaseState = null
    let newBaseQueueFirst = null
    let newBaseQueueLast = null
    let update = first

    do {
      const updateLane = update.lane
      if (!isSubsetOfLanes(renderLanes, updateLane)) {
        const clone: Update<S, A> = {
          lane: updateLane,
          action: update.action,
          eagerReducer: update.eagerReducer,
          eagerState: update.eagerState,
          next: null
        }

        if (newBaseQueueLast === null) {
          newBaseQueueFirst = newBaseQueueLast = clone
          newBaseState = newState
        } else {
          newBaseQueueLast = newBaseQueueLast.next = clone
        }
        currentlyRenderingFiber.lanes = mergeLanes(currentlyRenderingFiber.lanes, updateLane)
      } else {
        if (newBaseQueueLast !== null) {
          const clone: Update<S, A> = {
            lane: NoLane,
            action: update.action,
            eagerReducer: update.eagerReducer,
            eagerState: update.eagerState,
            next: null
          }
          newBaseQueueLast = newBaseQueueLast.next = clone
        }

        if (update.eagerReducer === reducer) {
          newState = update.eagerState
        } else {
          const action = update.action
          newState = reducer(newState, action)
        }
      }
      update = update.next
    } while (update !== null && update !== first)

    if (newBaseQueueLast === null) {
      newBaseState = newState
    } else {
      newBaseQueueLast.next = newBaseQueueFirst
    }

    // if (!Object.is(newState, hook.memoizedState)) {
    //   markWorkInProgressReceivedUpdate()
    // }

    hook.memoizedState = newState
    hook.baseState = newBaseState
    hook.baseQueue = newBaseQueueLast

    queue.lastRenderedState = newState
  }

  const dispatch: Dispatch<A> = queue.dispatch

  return [hook.memoizedState, dispatch]
}

export function renderWithHooks<Props, SecondArg> (
  current: Fiber | null,
  workInProgress: Fiber,
  Component: (p: Props, arg: SecondArg) => any,
  props: Props,
  secondArg: SecondArg,
  nextRenderLanes: Lanes
) {
  renderLanes = nextRenderLanes
  currentlyRenderingFiber = workInProgress

  workInProgress.memoizedState = null
  workInProgress.updateQueue = null
  workInProgress.lanes = NoLanes

  // hooks执行者注册
  ReactCurrentDispatcher.current = current === null ||
    current.memoizedState === null
    ? HooksDispatcherOnMount
    : HooksDispatcherOnUpdate

  const children = Component(props, secondArg)

  ReactCurrentDispatcher.current = ContextOnlyDispatcher

  renderLanes = NoLanes
  currentlyRenderingFiber = null

  currentHook = null
  workInProgressHook = null

  return children
}
