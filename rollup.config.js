const typescript = require('@rollup/plugin-typescript')

const entrys = [
  { path: 'src/react/index.ts' },
  { path: 'src/react-dom/index.ts' }
]

const entrysConfig = entrys.map(({ path }) => {
  return {
    input: path,
    output: {
      file: `dist/${path.split('/')[1]}/index.js`,
      format: 'cjs'
    },
    plugins: [typescript()]
  }
})

export default entrysConfig
