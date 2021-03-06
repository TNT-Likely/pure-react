import { ROOT_ATTRIBUTE_NAME } from './shared/DOMProperty'
import { DOCUMENT_NODE, ELEMENT_NODE } from './shared/HTMLNodeType'
import { createLegacyRoot, RootType } from './ReactDOMRoot'
import { Container } from './ReactDOMHostConfig'
import { updateContainer, getPublicRootInstance } from '../react-reconciler/ReactFiberReconciler'
import { unbatchedUpdates } from 'src/react-reconciler/ReactFiberWorkLoop'

// 渲染主入口
export function render (
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

function legacyRenderSubtreeIntoContainer (
  parentComponent: any,
  children: any,
  container: Container,
  forceHydrate: boolean,
  callback?: Function
) {
  let root = container._reactRootContainer
  let fiberRoot
  if (!root) {
    // 创建fiber根节点
    root = container._reactRootContainer = legacyCreateRootFromDOMContainer(
      container,
      forceHydrate
    )

    fiberRoot = root?._internalRoot

    if (typeof callback === 'function') {
      const originCallback = callback
      callback = function () {
        const instance = getPublicRootInstance(fiberRoot)
        originCallback.call(instance)
      }
    }

    unbatchedUpdates(() => {
      updateContainer(children, fiberRoot, parentComponent, callback)
    })
  } else {
    fiberRoot = root._internalRoot
    if (typeof callback === 'function') {
      const originCallback = callback
      callback = function () {
        const instance = getPublicRootInstance(fiberRoot)
        originCallback.call(instance)
      }
    }

    updateContainer(children, fiberRoot, parentComponent, callback)
  }

  return getPublicRootInstance(fiberRoot)
}

function legacyCreateRootFromDOMContainer (
  container: Container,
  forceHydrate: boolean
): RootType {
  /**
   * 是否应该触发注水
   * 注水的概念 https://reactjs.org/docs/react-dom.html#hydrate
   * 简单来说就是客户端在应对由ReactDOMServer渲染出来的html内容判断下是否可以复用
   *
   */
  const shouldHydrate = forceHydrate || shouldHydrateDueToLegacyHeuristic(container)

  if (!shouldHydrate) {
    let rootSibling

    while ((rootSibling === container.lastChild)) {
      container.removeChild(rootSibling)
    }
  }

  return createLegacyRoot(
    container,
    shouldHydrate ? { hydrate: true } : undefined
  )
}

function shouldHydrateDueToLegacyHeuristic (container: any) {
  const rootElement = getReactRootElementInContainer(container)

  return !!(rootElement &&
        rootElement.nodeType === ELEMENT_NODE &&
        rootElement.hasAttribute(ROOT_ATTRIBUTE_NAME))
}

// 获取react根元素
function getReactRootElementInContainer (container: any) {
  if (!container) {
    return null
  }

  if (container.nodeType === DOCUMENT_NODE) {
    return container.documentElement
  } else {
    return container.firstChild
  }
}
