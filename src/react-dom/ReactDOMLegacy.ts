import { ROOT_ATTRIBUTE_NAME } from "./shared/DOMProperty"
import { DOCUMENT_NODE, ELEMENT_NODE } from "./shared/HTMLNodeType"
import {createLegacyRoot} from './ReactDOMRoot'
import { Container } from "./ReactDOMHostConfig"

// 渲染主入口
export function render(
    element: any,
    container: Container,
    callback?: Function
) {
    return legacyRenderSubtreeIntoContainer(
        null,
        element,
        container,
        false,
        callback
    )
}

function legacyRenderSubtreeIntoContainer(
    parentComponent: any,
    children: any,
    container: Container,
    forceHydrate: boolean,
    callback?: Function,
) {
    let root = container._reactRootContainer
    let fiberRoot
    if (!root) {
        root = container._reactRootContainer = legacyCreateRootFromDOMContainer(
            container,
            forceHydrate
        )
    }
}

function legacyCreateRootFromDOMContainer(
    container: any,
    forceHydrate: boolean
) {
    const shouldHydrate = forceHydrate || shouldHydrateDueToLegacyHeuristic(container)

    if (!shouldHydrate) {
        let rootSibling

        while ((rootSibling === container.lastChild)) {
            container.removeChild(rootSibling)
        }
    }

    return createLegacyRoot(
        container,
        shouldHydrate?{hydrate: true}: undefined
    )
}

function shouldHydrateDueToLegacyHeuristic(container: any) {
    const rootElement = getReactRootElementInContainer(container)

    return !!(rootElement &&
        rootElement.nodeType === ELEMENT_NODE &&
        rootElement.hasAttribute(ROOT_ATTRIBUTE_NAME))
}

// 获取react根元素
function getReactRootElementInContainer(container: any) {
    if (!container) {
        return null
    }

    if (container.nodeType === DOCUMENT_NODE) {
        return container.documentElement
    } else {
        return container.firstChild
    }
}