const HtmlWebpackPlugin = require('html-webpack-plugin')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

const isRealReact = process.argv.find(i => i.includes('--port='))
const realReactPort = isRealReact && isRealReact.split('=')[1]
const port = realReactPort | 9000

const entrys = {
  //   basic: 'src/basic/index.tsx'
  hooks: 'src/hooks/index.tsx'
}

const target = Object.keys(entrys).map(key => `http://localhost:${port}/${key}.html`)

const entrysHtmlPlugin = Object.keys(entrys).map(key => {
  return new HtmlWebpackPlugin({
    filename: `${key}.html`,
    title: `${key}演示`,
    template: 'index.html'
  })
})

module.exports = {
  mode: 'development',
  entry: entrys,

  output: {
    filename: '[id].[contenthash].js'
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    plugins: [new TsconfigPathsPlugin({
      configFile: realReactPort ? 'tsconfig.base.json' : 'tsconfig.json'
    })]
  },

  devServer: {
    port,
    hot: true,
    open: {
      target
    }
  },

  plugins: [
    ...entrysHtmlPlugin
  ]
}
