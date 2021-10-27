import { createElement } from "./ReactElement"
import { REACT_FRAGMENT_TYPE } from "../shared/ReactSymbols"
const PureComponent = () => {
    console.log('pure-component')
}

const React = {
    PureComponent,
    createElement,
    Fragment: REACT_FRAGMENT_TYPE
}

export default React