import ReactCurrentOwner from '../react/ReactCurrentOwner'
import { Lane, Lanes, NoLanes, SyncLane } from './ReactFiberLane'
import { Fiber, FiberRoot } from './ReactInternalTypes'
import { HostRoot } from './ReactWorkTags'
import { beginWork } from './ReactFiberBeginWork'
import { createWorkInProgress } from './ReactFiber'
import { Hydrating, Incomplete, NoFlags, Placement, Update } from './ReactFiberFlags'
import { commitPlacement } from './ReactFiberCommitWork'
import { completeWork } from './ReactFiberCompleteWork'

type RootExitStatus = 0 | 1 | 2 | 3 | 4 | 5;
const RootIncomplete = 0
const RootFatalErrored = 1
const RootErrored = 2
const RootSuspended = 3
const RootSuspendedWithDelay = 4
const RootCompleted = 5

let workInProgressRoot: any | null = null
let workInProgress: any = null
let mostRecentlyUpdatedRoot: any = null
let workInProgressRootRenderLanes: Lane = NoLanes
let workInProgressRootExitStatus: RootExitStatus = RootIncomplete
export const subtreeRenderLanes = NoLanes

// 请求更新优先级
export function requestUpdateLane (fiber: any): Lane {
  return 0
}

// 请求事件事件
export function requestEventTime () {
  return 0
}

// 调度更新
export function scheduleUpdateOnFiber (fiber: Fiber, lane: Lane, eventTime: number) {
  const root = markUpdateLaneFromFiberToRoot(fiber, lane)

  if (root === workInProgressRoot) {

  }

  // if (lane === SyncLane) {
  // 开始根节点的同步工作
  performSyncWorkOnRoot(root)
  // } else {

  // }

  mostRecentlyUpdatedRoot = root
}

function markUpdateLaneFromFiberToRoot (sourceFiber: Fiber, lane: Lane) {
  let node = sourceFiber
  let parent = sourceFiber.return

  while (parent !== null) {
    node = parent
    parent = parent.return
  }

  if (node.tag === HostRoot) {
    const root = node.stateNode
    return root
  } else {
    return null
  }
}

function performSyncWorkOnRoot (root) {
  let lanes
  let exitStatus

  if (root === workInProgressRoot) {
    lanes = workInProgressRootRenderLanes
    exitStatus = renderRootSync(root, lanes)
  } else {
    lanes = workInProgressRootRenderLanes
    exitStatus = renderRootSync(root, lanes)
  }

  const finishedWork = root.current.alternate
  root.finishedWork = finishedWork
  root.finishedLanes = lanes
  commitRoot(root)
  // ensureRootIsScheduled(root, 0)
  return null
}

function commitRoot (root:FiberRoot) {
  // const renderPriorityLevel =
  // 先省略下优先级
  commitRootImpl(root, 97)
}

// 提交更新
function commitRootImpl (root: FiberRoot, renderPriorityLevel: number) {
  const finishedWork = root.finishedWork as Fiber
  const lanes = root.finishedLanes

  // if (finishedWork === null) {
  //   markCommitStopped()
  //   return null
  // }

  root.finishedWork = null
  root.finishedLanes = NoLanes

  root.callbackNode = null

  if (root === workInProgressRoot) {
    workInProgressRoot = null
    workInProgress = null
    workInProgressRootRenderLanes = NoLanes
  }

  // const subtreeHasEffects = (finishedWork?.subtreeFlags & ())
  ReactCurrentOwner.current = null
  commitBeforeMutationEffects(finishedWork)
  commitMutationEffects(finishedWork, root, renderPriorityLevel)
  root.current = finishedWork as Fiber
}

function commitBeforeMutationEffects (firstChild: Fiber) {
  let fiber: Fiber | null = firstChild
  while (fiber !== null) {
    if (fiber.child !== null) {
      commitBeforeMutationEffects(fiber.child)
    }

    try {
      commitBeforeMutationEffectsImpl(fiber)
    } catch (error) {
      console.error(error)
    }

    fiber = fiber.sibling
  }
}

function commitBeforeMutationEffectsImpl (fiber: Fiber) {
  const current = fiber.alternate
  const flags = fiber.flags
}

function commitMutationEffects (
  firstChild:Fiber,
  root:FiberRoot,
  renderPriorityLevel: number
) {
  let fiber: Fiber | null = firstChild
  while (fiber !== null) {
    const deletions = fiber.deletions

    if (deletions !== null) {

    }

    if (fiber.child !== null) {
      commitMutationEffects(fiber.child, root, renderPriorityLevel)
    }

    try {
      commitMutationEffectsImpl(fiber, root, renderPriorityLevel)
    } catch (error) {
      captureCommitPhaseError(fiber, fiber.return, error)
    }

    fiber = fiber.sibling
  }
}

function commitMutationEffectsImpl (fiber: Fiber, root: FiberRoot, renderPriorityLevel: number) {
  const flags = fiber.flags
  // if (flags & ContentReset) {

  // }

  const primaryFlags = flags & (Placement | Update | Hydrating)

  switch (primaryFlags) {
    case Placement: {
      commitPlacement(fiber)
      fiber.flags &= ~Placement
      break
    }
  }
}

function captureCommitPhaseError (sourceFiber: Fiber, nearestMountedAncestor: Fiber | null, error: any) {

}

function renderRootSync (root: any, lanes: Lanes) {
  // 如果工作根节点与当前节点不一样或者优先级不一样, 需要准备下
  if (workInProgressRoot !== root || workInProgressRootRenderLanes !== lanes) {
    prepareFreshStack(root, lanes)
  }

  do {
    try {
      workLoopSync()
      break
    } catch (e) {
      handleError(root, e)
    }
  } while (true)

  workInProgressRoot = null
  workInProgressRootRenderLanes = NoLanes
}

function prepareFreshStack (root: any, lanes: Lanes) {
  root.finishedWork = null
  root.finishedLanes = NoLanes

  // const timeoutHandle = root.timeoutHandle
  // if (timeoutHandle !== noTimeout) {
  //     root.timeoutHandle = noTimeout

  //     cancelTimeout(timeoutHandle)
  // }

  workInProgressRoot = root

  // 创建工作进程
  workInProgress = createWorkInProgress(root.current, null)
}

function workLoopSync () {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress)
  }
}

function performUnitOfWork (unitOfWork: Fiber): void {
  const current = unitOfWork.alternate

  // 开始beginwork阶段，实质是找寻子节点
  const next = beginWork(current, unitOfWork, subtreeRenderLanes)

  unitOfWork.memoizedProps = unitOfWork.pendingProps

  // 找不到子节点去进行compleWork阶段
  if (next === null) {
    completeUnitOfWork(unitOfWork)
  } else {
    workInProgress = next
  }

  ReactCurrentOwner.current = null
}

function completeUnitOfWork (unitOfWork: Fiber): void {
  let completedWork = unitOfWork
  do {
    const current = completedWork.alternate
    const returnFiber = completedWork.return

    // 检查下是否有暂时抛出的
    if ((completedWork.flags & Incomplete) === NoFlags) {
      const next = completeWork(current, completedWork, subtreeRenderLanes)
      if (next !== null) {
        workInProgress = next
        return
      }
    } else {

    }

    // 检查兄弟节点
    const siblingFiber = completedWork.sibling
    if (siblingFiber !== null) {
      workInProgress = siblingFiber
      return
    }

    completedWork = returnFiber as Fiber
    workInProgress = completedWork
  } while (completedWork !== null)

  if (workInProgressRootExitStatus === RootIncomplete) {
    workInProgressRootExitStatus = RootCompleted
  }
}

function handleError (root, thrownValue): void {
  workInProgress = null
  console.error(root, thrownValue)
}
