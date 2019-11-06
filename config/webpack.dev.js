const merge = require('webpack-merge')
const common = require('./webpack.common.js')
const paths = require('./paths')

module.exports = merge(common, {
  mode: 'development',

  devtool: 'inline-source-map',

  devServer: {
    contentBase: paths.dist,
  },

  output: {
    filename: '[name].bundle.js',
    path: paths.dist,
  },
})
