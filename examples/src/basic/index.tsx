import React from 'react'
import ReactDom from 'react-dom'

const App = () => {
    return <>
        <div>
            hello, world
        </div>
        <p>xiaoxiao</p>
    </>
}

ReactDom.render(<App />, document.querySelector("#root"))