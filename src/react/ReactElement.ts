
import ReactCurrentOwner from "./ReactCurrentOwner"
import { REACT_ELEMENT_TYPE } from "../shared/ReactSymbols"

const hasOwnProperty = Object.prototype.hasOwnProperty

// 关键字属性
const RESERVED_PROPS = {
    key: true,
    ref: true,
    __self: true,
    __source: true
}

function hasValidRef(config) {
    return config.ref !== undefined
}

function hasValidKey(config) {
    return config.key !== undefined
}

interface IProps { [key: string]: any }

// 创建元素
export function createElement(type: any, config: any, children: any) {
    let propName

    const props: IProps = {}

    let key: string | null = null
    let ref = null
    let self = null
    let source = null

    if (config != null) {
        if (hasValidRef(config)) {
            ref = config.ref
        }

        if (hasValidKey(config)) {
            key = '' + config.key
        }

        self = config.__self === undefined ? null : config.__self
        source = config.__source === undefined ? null : config.__source

        for (propName in config) {
            if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
                props[propName] = config[propName]
            }
        }
    }

    // 挂载子元素
    const childrenLength = arguments.length - 2

    if (childrenLength === 1) {
        props.children = children
    } else if (childrenLength > 1) {
        const childArray = Array(childrenLength)

        for (let i = 0; i < childrenLength; i++) {
            childArray[i] = arguments[i + 2]
        }

        props.children = childArray
    }

    // 查找默认属性
    if (type && type.defaultProps) {
        const defaultProps = type.defaultProps
        for (propName in defaultProps) {
            if (props[propName] === undefined) {
                props[propName] = defaultProps[propName]
            }
        }
    }

    return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props)
}

const ReactElement = function (type, key, ref, self, source, owner, props) {
    const element = {
        $$typeof: REACT_ELEMENT_TYPE,

        type,
        key,
        ref,
        props,

        _owner: owner
    }

    return element
}