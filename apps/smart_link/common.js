import Modes from './js/inc/Modes.js';
import Detections from './js/inc/Detections.js';

/**
 * This is the common/runtime options of your app
 */
const common = {
  options: {
    /**
     * current applied locale
     */
    locale: 'zh',
    
    rules: [],
  },
  runtimeOptions: {
    id: 'S1E0lokF-',
    storageEvents: true,
    externalMessaging: false,
    tabEvents: [
      'onRemoved',
    ],
    windowEvents: [

    ]
  },
  const: {
    Modes,
    Detections,
  },
  logLevel: 'all'
};

if (common.logLevel && common.logLevel !== 'all') {
  let allLevels = ['log', 'info', 'warning', 'error'];
  let diff = _.difference(allLevels, common.logLevel);
  if (diff) {
    for (let i in diff) console[diff[i]] = function() {};
  }
}

// export default common;
window._anxonCommon = common;