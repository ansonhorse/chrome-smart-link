const common = require('./common.js');

const utils = {
  /**
   * deep merge manifest
   * @param {Object} appManifestFile 
   * @param {Object} [basicManifestFile=null] 
   * @returns {Object}
   */
  mergeManifest: function (appManifestFile, basicManifestFile = null) {
    if (basicManifestFile === null) {
      basicManifestFile = common.ANXON_PATH + 'manifest.js';
    }
    let basicManifest = require(basicManifestFile);

    let appManifest = null;
    if (typeof appManifestFile === 'string')
      appManifest = require(appManifestFile);
    else
      appManifest = appManifestFile;

    // use deepmerge to merge, options 'arrayMerge' should be set 
    const merge = require('deepmerge');
    let mergedManifest = merge(basicManifest, appManifest, {
      arrayMerge: (destArray, srcArray) => {
        return destArray.concat(srcArray);
      }
    });
    // remove null field
    let ret = {};
    for (let i in mergedManifest) {
      if (mergedManifest[i] !== null) ret[i] = mergedManifest[i];
    }
    // mergedManifest = JSON.stringify(mergedManifest, null, 2);
    return ret;
  },

  /**
   * HtmlWebpackPlugin chunksSortMode function
   * @param {Object} chunk1 
   * @param {Object} chunk2 
   * @param {Array} orders 
   * @returns {Integer}
   */
  chunksSorter: function (chunk1, chunk2, orders) {
    let order1 = orders.indexOf(chunk1.names[0]);
    let order2 = orders.indexOf(chunk2.names[0]);
    return order1 > order2 ? 1 : (order1 < order2 ? -1 : 0);
  },

  /**
   * get release file name
   * @param {String} appName
   * @param {String} releaseName
   * @returns {String}
   */
  getReleaseFilename: function (appName, releaseName = '') {
    let fs = require('fs');
    let manifestPath = common.APPS_PATH + appName + '/manifest.js';
    let manifest = require(manifestPath);
    return releaseName || manifest.name + '_v' + manifest.version;
  },

  addCommonChunks: function (chunks) {
    if (!chunks) return;
    const util = require('util');
    if (global.__commonChunks === undefined) global.__commonChunks = [];
    let appended = [];
    if (typeof chunks === 'string') {
      global.__commonChunks.splice(0, 0, chunks);
    } else if (util.isArray(chunks)) {
      for (let i = 0; i < chunks.length; i++)
        global.__commonChunks.splice(0, 0, chunks[i]);
    }
  },

  arrayHas: function (srcArray, mixedVal) {
    let mixed = [];
    if (typeof mixedVal === 'string') {
      mixed = [mixedVal];
    } else {
      mixed = mixedVal;
    }
    for (let i = 0; i < mixed.length; i++) {
      if (srcArray.indexOf(mixed[i]) > -1) return true;
    }
    return false;
  }
};

module.exports = utils;