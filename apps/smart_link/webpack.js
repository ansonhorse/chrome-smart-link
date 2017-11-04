/**
 * the webpack configuration of this app,
 * it will be merged with the basic webpack configuration
 */
const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');


const extractCss = new ExtractTextPlugin({
  filename: 'css/[name].css',
});

const extractVueMaterialCss = new ExtractTextPlugin({
  filename: 'css/vue-material.css',
});

const extractBootstrapCss = new ExtractTextPlugin({
  filename: 'css/bootstrap.css',
});

const extractIViewCss = new ExtractTextPlugin({
  filename: 'css/iview.css',
});

const ROOT_PATH = path.resolve(__dirname, '../../');
const common = require(ROOT_PATH + '/build/common.js');

const APP_NAME = global.commander.app;
const APP_PATH = common.APPS_PATH + APP_NAME;
const APP_DIST_PATH = common.DIST_PATH + APP_NAME;

const utils = require(common.ROOT_PATH + 'build/utils.js');

let config = {
  entry: {
    frontend: APP_PATH + '/js/frontend.js',
    i18n: [
      'anxonApp/locales/all.js',
    ],

    vue: [
      'vue',
      'vue-i18n',
      'vue-meta',
    ],

    'vue-material': ['vue-material', 'anxon/js/null.js'],
    backend: APP_PATH + '/js/backend.js',
    popup: APP_PATH + '/js/popup.js',
    options: APP_PATH + '/js/options.js',
    // ...some other entries
    // bs: APP_PATH + '/js/bs.js',
    // iview: APP_PATH + '/js/iview.js',
  },

  module: {
    rules: [

      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            stylus: extractCss.extract({
              use: ['css-loader', 'stylus-loader'],
              fallback: 'vue-style-loader'
            }),

            css: extractCss.extract({
              use: ['style-loader', 'css-loader'],
              fallback: 'vue-style-loader'
            })
          }
        }
      },

      {
        test: /(vue-material|md-icon)\.(\w+\.)?css$/,
        use: extractVueMaterialCss.extract({
          fallback: 'style-loader',
          use: 'css-loader',
        })
      },

      {
        test: /bootstrap\.(\w+\.)?css$/,
        use: extractBootstrapCss.extract({
          fallback: 'style-loader',
          use: 'css-loader',
        })
      },

      {
        test: /iview\.(\w+\.)?css$/,
        use: extractIViewCss.extract({
          fallback: 'style-loader',
          use: 'css-loader',
        })
      },

    ]
  },

  plugins: [

    // popup page
    new HtmlWebpackPlugin({
      template: APP_PATH + '/html/popup.html',
      filename: APP_DIST_PATH + '/html/popup.html',
      inject: 'body',
      chunks: [
        'vendor', 'anxon', 'i18n', 'vue', 'vue-material', 'popup',
      ],
      chunksSortMode: function(chunk1, chunk2) {
        return utils.chunksSorter(
          chunk1, chunk2, [
            'vendor', 'anxon', 'i18n', 'vue', 'vue-material', 'popup',
          ]
        );
      }
    }),

    // options page
    new HtmlWebpackPlugin({
      template: APP_PATH + '/html/options.html',
      filename: APP_DIST_PATH + '/html/options.html',
      inject: 'body',
      chunks: [
        'vendor', 'anxon', 'i18n', 'vue', 'vue-material', 'options',
      ],
      chunksSortMode: function(chunk1, chunk2) {
        return utils.chunksSorter(
          chunk1, chunk2, [
            'vendor', 'anxon', 'i18n', 'vue', 'vue-material', 'options',
          ]
        );
      }
    }),

    /* new HtmlWebpackPlugin({
      template: APP_PATH + '/html/bs.html',
      filename: APP_DIST_PATH + '/html/bs.html',
      inject: 'body',
      chunks: [
        'vendor', 'anxon', 'i18n', 'vue', 'bs',
      ],
      chunksSortMode: function(chunk1, chunk2) {
        return utils.chunksSorter(
          chunk1, chunk2, [
            'vendor', 'anxon', 'i18n', 'vue', 'bs',
          ]
        );
      }
    }),

    new HtmlWebpackPlugin({
      template: APP_PATH + '/html/iview.html',
      filename: APP_DIST_PATH + '/html/iview.html',
      inject: 'body',
      chunks: [
        'vendor', 'anxon', 'i18n', 'vue', 'iview',
      ],
      chunksSortMode: function(chunk1, chunk2) {
        return utils.chunksSorter(
          chunk1, chunk2, [
            'vendor', 'anxon', 'i18n', 'vue', 'iview',
          ]
        );
      }
    }), */

    extractCss,
    extractVueMaterialCss,
  ]
};


utils.addCommonChunks([
  'i18n', 'vue', 'vue-material',
]);


module.exports = config;