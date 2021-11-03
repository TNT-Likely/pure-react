import ReactSharedInternal from '../shared/ReactSharedInternal'
import { Lane, Lanes, NoLanes } from './ReactFiberLane'
import { scheduleUpdateOnFiber } from './ReactFiberWorkLoop'
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
    dispatch: ((A)=>any) | null,
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

let renderLanes:Lanes = NoLanes
let currentlyRenderingFiber:Fiber|null = null
let currentHook: Hook | null = null
let workInProgressHook: Hook | null = null

function moutnWorkInProgressHook ():Hook {
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

function basicStateReducer<T> (state: T, action: BaseStateAction<T>):T {
  return typeof action === 'function' ? (action as (T) => T)(state) : action
}

const HooksDispatcherOnMount: Dispatcher = {
  useState: mountState
}

const HooksDispatcherOnUpdate: Dispatcher = {
  useState: updateState
}

// 挂载state
function mountState<T> (initialState: (() => T | T)):[T, Dispatch<BaseStateAction<T>>] {
  const hook = moutnWorkInProgressHook()

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

  const dispatch = queue.dispatch = (dispatchAction as any).bind(null, currentlyRenderingFiber, queue)

  return [hook.memoizedState, dispatch]
}

function updateState<T> (initialState: (() => T | T)):[T, Dispatch<BaseStateAction<T>>] {
  return updateReducer(basicStateReducer, initialState)
}

// 派发action
function dispatchAction<S, A> (fiber: Fiber, queue: UpdateQueue<S, A>, action: A) {
  const lane = NoLanes
  const eventTime = 0

  const update:Update<S, A> = {
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
        const currentState: S = queue.lastRenderedReducer
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

function updateReducer<S, I, A> (reducer: (state: S, action: A) => S, initialArg: I, init?: (initialArg: I) => S) :[S, Dispatch<A>] {
  return []
}

export function renderWithHooks<Props, SecondArg> (
  current: Fiber|null,
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
  ReactCurrentDispatcher.current = (current === null || current.memoizedState === null ? HooksDispatcherOnMount : HooksDispatcherOnUpdate)

  const children = Component(props, secondArg)

  renderLanes = NoLanes
  currentlyRenderingFiber = null

  currentHook = null
  workInProgressHook = null

  return children
}
