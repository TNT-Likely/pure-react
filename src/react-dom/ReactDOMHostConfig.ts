import { Props } from '../react-reconciler/ReactDomHostConfig'
import { RootType } from './ReactDOMRoot'
import { COMMENT_NODE, DOCUMENT_FRAGMENT_NODE, DOCUMENT_NODE } from './shared/HTMLNodeType'
import { Namespaces, getIntrinsicNamespace, getChildNamespace } from '../shared/DOMNamespaces'
import { getOwnerDocumentFromRootContainer, setInitialProperties } from './ReactDOMComponent'
import { updateFiberProps } from './ReactDOMComponentTree'

const { html: HTML_NAMESPACE } = Namespaces
export type Container = (Element & { _reactRootContainer?: RootType }) |
  (Document & { _reactRootContainer?: RootType })

// 在容器前插入节点
export function insertInContainerBefore (container: Container, child: any, beforeChild: any) {
  if (container.nodeType === COMMENT_NODE) {
    container.parentNode?.insertBefore(child, beforeChild)
  } else {
    container.insertBefore(child, beforeChild)
  }
}

// 往容器添加子节点
export function appendChildToContainer (container: Container, child: any) {
  let parentNode
  if (container.nodeType === COMMENT_NODE) {
    parentNode = container.parentNode
    parentNode.insertBefore(child, container)
  } else {
    parentNode = container
    parentNode.appendChild(child)
  }
}

// 创建实例
export function createInstance (
  type: string,
  props: Props,
  rootContainerInstance: Container,
  hostContext: string,
  internalInstanceHandle: Object
): Element {
  const parentNameSpace = hostContext

  const domElement: Element = createElement(type, props, rootContainerInstance, parentNameSpace)

  // precacheFiberNode(internalInstanceHandle, domElement)
  updateFiberProps(domElement, props)
  return domElement
}

// 创建html元素
export function createElement (type: string, props: object, rootContainerElement: Element | Document, parentNameSpace: string):Element {
  let isCustomComponentTag

  const ownerDocument: Document = getOwnerDocumentFromRootContainer(rootContainerElement)

  let domElement:Element

  let namespaceURI = parentNameSpace
  if (namespaceURI === HTML_NAMESPACE) {
    namespaceURI = getIntrinsicNamespace(type)
  }

  if (namespaceURI === HTML_NAMESPACE) {
    if (type === 'script') {
      const div = ownerDocument.createElement('div')
      div.innerHTML = '<script><' + '/script>'
      const firstChild = div.firstChild as HTMLScriptElement
      domElement = div.removeChild(firstChild)
    } else if (typeof props.is === 'string') {
      domElement = ownerDocument.createElement(type, { is: props.is })
    } else {
      domElement = ownerDocument.createElementNS(namespaceURI, type)
    }
  }

  return domElement
}

export function getRootHostContext (rootContainerInstance: Container):string {
  let type
  let namespace
  const nodeType = rootContainerInstance.nodeType
  switch (nodeType) {
    case DOCUMENT_NODE:
    case DOCUMENT_FRAGMENT_NODE: {
      type = nodeType === DOCUMENT_NODE ? '#document' : '#fragment'
      const root = (rootContainerInstance as any).documentElement
      namespace = root ? root.namespaceURI : getChildNamespace(null, '')
      break
    }
    default: {
      const container: any = nodeType === COMMENT_NODE ? rootContainerInstance.parentNode : rootContainerInstance
      const ownNamespace = container.namespaceURI || null
      type = container.tagName
      namespace = getChildNamespace(ownNamespace, type)
      break
    }
  }
  return namespace
}

export function finalizeInitialChildren (domElement: Element, type: string, props: Props, rootContainerInstance: Container, hostContext: string):boolean {
  setInitialProperties(domElement, type, props, rootContainerInstance)
  // return shouldAutoFocusHostComponent(type, props)
  return false
}
