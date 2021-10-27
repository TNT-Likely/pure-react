type TReactType = Symbol | number

export let REACT_ELEMENT_TYPE:TReactType = 0xeac7
export let REACT_FRAGMENT_TYPE:TReactType = 0xeacb;

if (typeof Symbol === 'function' && Symbol.for) {
    const symbolFor = Symbol.for
    REACT_ELEMENT_TYPE = symbolFor('react.element')
    REACT_FRAGMENT_TYPE = symbolFor('react.fragment')
}