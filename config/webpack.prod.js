const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const merge = require('webpack-merge')
const common = require('./webpack.common.js')
const paths = require('./paths')

module.exports = merge(common, {
  mode: 'production',

  plugins: [
    new CleanWebpackPlugin(),
  ],

  output: {
    filename: '[name].[hash].js',
    chunkFilename: '[name].[chunkhash].js',
    path: paths.dist,
  },
})
