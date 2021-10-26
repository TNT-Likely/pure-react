import { ReactElement } from "../shared/ReactElementType"
import { REACT_ELEMENT_TYPE, REACT_FRAGMENT_TYPE } from "../shared/ReactSymbols"
import { Placement } from "./ReactFiberFlags"
import { Lanes } from "./ReactFiberLane"
import { Fiber } from "./ReactInternalTypes"
import {createFiberFromElement} from './ReactFiber'

function ChildReconciler(shouldTrackSideEffects) {
    function placeSingleChild(newFiber: Fiber):Fiber {
        if (shouldTrackSideEffects && newFiber.alternate === null) {
            newFiber.flags = Placement
        }
        return newFiber
    }

    function reconcileSingleElement(
        returnFiber: Fiber, 
        currentFirstChild: Fiber | null,
        element: ReactElement,
        lanes: Lanes
    ):Fiber {
        const key = element.key
        let child = currentFirstChild

        while(child !== null) {
            if (child.key ===  key) {
                switch(child.tag) {
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

        if (element.type ===  REACT_FRAGMENT_TYPE) {

        } else {
            const created = createFiberFromElement(element, returnFiber.mode, lanes)
            // created.ref = coerceRef(returnFiber, currentFirstChild, element)
            created.return = returnFiber

            return created
        }
    }

    function reconcileChildFibers(
        returnFiber: Fiber,
        currentFirstChild: Fiber | null,
        newChild: any,
        lanes: Lanes
    ): Fiber | null {
        const isUnkeyedTopLevelFragment = typeof newChild === 'object' && newChild !== null && newChild.type === REACT_ELEMENT_TYPE &&
            newChild.key === null

        if (isUnkeyedTopLevelFragment) {
            newChild = newChild.props.children
        }

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



        return null
    }

    return reconcileChildFibers
}

export const reconcileChildFibers = ChildReconciler(true)