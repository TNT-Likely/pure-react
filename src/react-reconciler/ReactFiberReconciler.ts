import { Container } from "../react-dom/ReactDOMHostConfig"
import { Lane } from "./ReactFiberLane"
import { requestUpdateLane, requestEventTime, scheduleUpdateOnFiber } from "./ReactFiberWorkLoop"
import { RootTag } from "./ReactRootTags"
import { createUpdate, enqueueUpdate } from "./ReactUpdateQueue"
import {SuspenseHydrationCallbacks} from './ReactInternalTypes'
import { createFiberRoot } from "./ReactFiberRoot"
import { HostComponent } from "./ReactWorkTags"

// 更新视图
export function updateContainer(
    element: any,
    container: any,
    parentComponent: any,
    callback?: Function
): Lane {
    const current = container.current

    const eventTime = requestEventTime()

    const lane = requestUpdateLane(current)

    const update = createUpdate(eventTime, lane)
    update.payload = { element }

    enqueueUpdate(current, update)
    scheduleUpdateOnFiber(current, lane, eventTime)

    return lane
}

export function createContainer(
    containerInfo: Container,
    tag: RootTag,
    hydrate: boolean,
    hydrateCallbacks: null | SuspenseHydrationCallbacks
) {
    return createFiberRoot(containerInfo, tag, hydrate, hydrateCallbacks)
}

export function getPublicRootInstance(container: any) {
    const containerFiber = container.current

    if (!containerFiber.child) {
        return null
    }

    switch(containerFiber.child.tag) {
        case HostComponent:
            return getPublicInstance(containerFiber.child.stateNode)
        default:
            return containerFiber.child.stateNode
    }
}