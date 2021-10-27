export type Lane = number
export type Lanes = number

export const NoLanes: Lane = /*                        */ 0b0000000000000000000000000000000
export const NoLane: Lane = /*                          */ 0b0000000000000000000000000000000

export const SyncLane: Lane = /*                        */ 0b0000000000000000000000000000001
export const SyncBatchedLane: Lane = /*                 */ 0b0000000000000000000000000000010

export function isSubsetOfLanes (set: Lanes, subset: Lanes | Lane) {
  return (set & subset) === subset
}

export function mergeLanes (a: Lane, b: Lane) {
  return a | b
}
