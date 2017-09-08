const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const deepMerge = require('deepmerge');
const colors = require('colors');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const common = require('./common.js');

const APP_NAME = global.commander.app;
const APP_PATH = common.APPS_PATH + APP_NAME;
const APP_DIST_PATH = common.DIST_PATH + APP_NAME;

const extractAppCss = new ExtractTextPlugin({
  filename: 'css/[name].css'
});

let commonChunks = [
  'anxon',
  'vendor',
];
if (global.__commonChunks) {
  commonChunks = deepMerge(global.__commonChunks, commonChunks);
}

let config = {
  entry: {
    vendor: [
      'jquery',
      'lodash',
      'thenjs',
    ],

    anxon: [
      'anxonApp/common.js',
      'anxon/dist/anxon.js',
    ],
  },

  output: {
    path: APP_DIST_PATH,
    filename: 'js/[name].js',
    sourceMapFilename: 'sourcemap/[chunkhash].map',
  },

  devServer: {
    hot: true,
    contentBase: APP_DIST_PATH,
    // publicPath: '/'
    port: 8877,
  },

  module: {
    rules: [{
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /(node_modules)|(anxon\/dist)/,
      },

      {
        test: require.resolve('jquery'),
        loader: 'expose-loader?$!expose-loader?jQuery',
      },

      /*{
        test: /\.css$/,
        use: extractAppCss.extract({
          fallback: 'style-loader',
          use: 'css-loader',
        }),
      },*/

      {
        test: /\.styl$/,
        use: extractAppCss.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'stylus-loader'],
        })
      },

      {
        test: /\.(jpg|png|gif)$/,
        use: 'url-loader?limit=10000&name=img/[name].[ext]'
      },

      {
        test: /\.(woff2?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
        query: {
          name: 'fonts/[name].[ext]',
          publicPath: '../'
        }
      }
    ]
  },

  plugins: [
    // new ProgressBarPlugin(),
    
    /* new BundleAnalyzerPlugin({
      analyzerPort: 8325
    }), */

    new CleanWebpackPlugin([
      'dist/' + APP_NAME + '',
    ], {
      root: common.ROOT_PATH,
      exclude: [
        'manifest.json',
        'js/lib/vendor.js',
      ],
    }),

    new webpack.ProvidePlugin({
      jQuery: 'jquery',
      $: 'jquery',
      _: 'lodash',
      Thenjs: 'thenjs',
      // Vue: 'vue',
    }),

    new webpack.optimize.CommonsChunkPlugin({
      names: commonChunks,
      filename: 'js/lib/[name].js'
    }),

    extractAppCss,

    new CopyWebpackPlugin([{
      context: APP_PATH,
      from: 'img/*',
    }])

  ],

  resolve: {
    alias: {
      // the root directory of anxon
      anxon: common.ANXON_PATH,
      // the root directory of current app
      anxonApp: common.APPS_PATH + APP_NAME,
    }
  }
};

module.exports = config;