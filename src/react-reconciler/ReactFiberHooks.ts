import { Lane, Lanes, NoLanes } from './ReactFiberLane'
import { Fiber } from './ReactInternalTypes'

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

  const children = Component(props, secondArg)

  renderLanes = NoLanes
  currentlyRenderingFiber = null

  currentHook = null
  workInProgressHook = null

  return children
}
