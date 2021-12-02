import { FiberRoot } from './ReactInternalTypes'

export type Lane = number
export type Lanes = number

const TotalLanes = 31

export const NoLanes: Lane = /*                        */ 0b0000000000000000000000000000000
export const NoLane: Lane = /*                          */ 0b0000000000000000000000000000000

export const SyncLane: Lane = /*                        */ 0b0000000000000000000000000000001
export const SyncBatchedLane: Lane = /*                 */ 0b0000000000000000000000000000010

const NonIdleLanes = /*                                 */ 0b0000111111111111111111111111111

export const NoTimestamp = -1

function pickArbitraryLaneIndex (lanes: Lanes) {
  return 31 - Math.clz32(lanes)
}

function laneToIndex (lane: Lane) {
  return pickArbitraryLaneIndex(lane)
}

export function isSubsetOfLanes (set: Lanes, subset: Lanes | Lane) {
  return (set & subset) === subset
}

export function includesSomeLane (a: Lanes | Lane, b: Lanes | Lane) {
  return (a & b) !== NoLanes
}

export function mergeLanes (a: Lane, b: Lane) {
  return a | b
}

export function getNextLanes (root: FiberRoot, wipLanes: number):number {
  const pendingLanes = root.pendingLanes
  if (pendingLanes === NoLanes) {
    return NoLanes
  }

  return SyncLane

  // let nextLanes = NoLanes

  // const expiredLanes = root.expiredLanes
  // const suspendedLanes = root.suspendedLanes
  // const pingedLanes = root.pingedLanes

  // if (expiredLanes !== NoLanes) {
  //   nextLanes = expiredLanes
  // } else {
  //   const nonIdlePendingLanes = pendingLanes & NonIdleLanes
  //   if (nonIdlePendingLanes !== NoLanes) {
  //     const nonIdleUnblockedLanes = nonIdlePendingLanes & ~suspendedLanes;
  //     if (nonIdleUnblockedLanes !== NoLanes) {
  //       nextLanes =
  //     }
  //   }
  // }
}

export function markRootUpdated (
  root: FiberRoot,
  updateLane: number,
  eventTime: number
) {
  root.pendingLanes |= updateLane

  const higherPriorityLanes = updateLane - 1
  root.suspendedLanes &= higherPriorityLanes
  root.pingedLanes &= higherPriorityLanes

  const eventTimes = root.eventTimes || []
  const index = laneToIndex(updateLane)
  eventTimes[index] = eventTime
}

export function createLaneMap<T> (initial: T):T[] {
  const laneMap = []

  for (let i = 0; i < TotalLanes; i++) {
    laneMap.push(initial)
  }

  return laneMap
}
