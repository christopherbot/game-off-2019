const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const paths = require('./paths')

module.exports = {
  entry: {
    app: paths.app.entry,
  },

  resolve: {
    extensions: ['.js'],
    modules: [paths.src, 'node_modules'],
  },

  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          name: 'vendor',
          chunks: 'initial',
          test: /node_modules/,
          enforce: true,
        },
      },
    },
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        loaders: ['babel-loader'],
        include: paths.src,
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            },
          },
        ],
      },
    ],
  },

  plugins: [
    new CopyWebpackPlugin([
      {
        from: paths.assets,
        to: paths.dist,
      },
    ]),

    new HtmlWebpackPlugin({
      title: 'GitHub Game Off 2019',
      template: paths.app.template,
      chunks: [
        'vendor',
        'app',
      ],
      chunksSortMode: 'manual',
      filename: paths.app.htmlOutput,
    }),

    new webpack.DefinePlugin({
      'typeof SHADER_REQUIRE': JSON.stringify(false),
      'typeof CANVAS_RENDERER': JSON.stringify(true),
      'typeof WEBGL_RENDERER': JSON.stringify(true),
    }),
  ],
}
