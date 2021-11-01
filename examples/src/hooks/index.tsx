import React, { useState } from 'react'
import ReactDom from 'react-dom'

const App = function () {
  const [count, setCount] = useState(0)

  return <>
    <p>count:{count}</p>
    <button onClick={() => setCount(count + 1)}>累加</button>
  </>
}

ReactDom.render(<App />, document.querySelector('#root'))
