/**
 * 
 * @author Anxon
 * @export
 * @class Dispatcher
 */
export default class Dispatcher {

  constructor() {
    this.rulesToken = anxon.utils.guid();
    this.init();
  }

  init() {
    let methods = [
      'tabRemoved',
      'requestOpener',
      'requestRules',
      'rulesModified',
      'requestCreate',
    ];
    _.each(methods, (method) => {
      anxon.messaging.addListener(method, this[method].bind(this));
    });

    this.setHelperListeners();
  }

  setHelperListeners() {
    chrome.tabs.onActivated.addListener(activeInfo => {
      anxon.messaging.dispatchToTab(activeInfo.tabId, 'tabActivated', {
        rulesToken: this.rulesToken,
      }, (res) => {
        console.log(res);
      });
    });

    chrome.windows.onFocusChanged.addListener(windowId => {
      chrome.tabs.query({
        active: true
      }, (tabs) => {
        anxon.messaging.dispatchToTab(tabs[0].id, 'tabActivated', {
          rulesToken: this.rulesToken,
        }, (res) => {
          console.log(res);
        });
      });
    });

    this.setContextMenus();
    this.onExtensionInstalled();
  }

  /**
   * when a tab removed,
   * 
   * @param {Object} data 
   * @param {Object} sender 
   * @param {Function} sendResponse 
   * @memberof Dispatcher
   */
  tabRemoved(data, sender, sendResponse) {

  }

  /**
   * update rulesToken on rules modified
   * 
   * @param {any} data 
   * @param {any} sender 
   * @param {any} sendResponse 
   * @memberof Dispatcher
   */
  rulesModified(data, sender, sendResponse) {
    this.rulesToken = anxon.utils.guid();
  }

  requestCreate(data, sender, sendResponse) {
    let tab = data.tab || sender.tab;
    this.initCreate(tab, data, (res) => {
      sendResponse(res);
    });
  }

  /**
   * open options and init a dialog for new rule creation
   * 
   * @param {Object} frontendTab
   * @param {Object} extraInfo
   * @memberof Dispatcher
   */
  initCreate(frontendTab, extraInfo = {}, callback) {
    chrome.tabs.create({
      active: true,
      url: chrome.runtime.getURL('html/options.html'),
    }, (optionsTab) => {
      // send create message when options tab complete
      let sent = false;
      chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (changeInfo.status !== 'complete' || sent) return;
        sent = true;
        anxon.messaging.dispatchToTab(optionsTab.id, 'create', {
          tab: frontendTab,
          info: extraInfo,
          closeAfterSaved: true,
        }, (res) => {
          _.isFunction(callback) && callback(res);
        });
      });
    });
  }

  /**
   * handle how the link will be opened
   * 
   * @param {Object} data 
   * @param {Object} sender 
   * @param {Function} sendResponse 
   * @returns 
   * @memberof Dispatcher
   */
  requestOpener(data, sender, sendResponse) {
    let modes = anxon.const.Modes;
    let tab = sender.tab;
    let createData = {};
    let noReaction = false;
    switch (data.mode) {
      case modes.DEFAULT:
      case modes.NO_REACTION:
        noReaction = true;
        break;

      case modes.NEW_TAB:
        createData.active = true;
        break;

      case modes.BACKGROUND_TAB:
        createData.active = false;
        break;

      case modes.WINDOW:
        break;

      case modes.INCOGNITO_WINDOW:
        createData.incognito = true;
        break;

      default:
        break;
    }

    if (noReaction) {
      sendResponse({
        status: 1,
        message: 'There is nothing I can do.',
        data: {
          tab: tab
        }
      });
    } else {
      createData.url = data.url;
      let method = 'createTab';
      if ([modes.WINDOW, modes.INCOGNITO_WINDOW].indexOf(data.mode) > -1) {
        method = 'createWindow';
      }
      this[method](createData, (tab) => {
        sendResponse({
          status: 1,
          message: `${anxon.manifest.name} had opened the link as you wish`,
          data: {
            tab: tab
          }
        });
      });
    }
    return true;
  }

  /**
   * create a new tab
   * 
   * @param {any} createData 
   * @returns 
   * @memberof Dispatcher
   */
  createTab(createData, callback) {
    chrome.tabs.create(createData, (tab) => {
      callback(tab);
    });
  }

  /**
   * crate a new window
   * 
   * @param {any} createData 
   * @returns 
   * @memberof Dispatcher
   */
  createWindow(createData, callback) {
    chrome.windows.create(createData, (win) => {
      // P.s. when create an incognito window, win will be null!
      if (createData.incognito) {
        callback(null);
      } else {
        callback(win.tabs[0]);
      }
    });
  }

  /**
   * 
   * get all the rules for the tab
   * 
   * @param {Object} data 
   * @param {Object} sender 
   * @param {Function} sendResponse 
   * @memberof Dispatcher
   */
  requestRules(data, sender, sendResponse) {
    let res = {
      status: 0,
      message: 'No any custom rules',
      data: {
        rulesToken: this.rulesToken,
      }
    };
    data = data || {};
    let tab = null;
    if (data.tab) {
      tab = data.tab;
    } else {
      tab = sender.tab;
      if (sender.frameId) tab.url = sender.url;
    }
    let rules = [];
    
    let detections = anxon.const.Detections;
    _.each(anxon.options.rules, (rule, index) => {
      if (!rule.enabled && !data.includeDisabled) return;
      let matched = false;
      switch (rule.detection) {
        case detections.CONTAINS:
          matched = tab.url.indexOf(rule.pattern) > -1;
          break;

        case detections.STARTS_WITH:
          matched = _.startsWith(tab.url, rule.pattern);
          break;

        case detections.ENDS_WITH:
          matched = _.endsWith(tab.url, rule.pattern);
          break;

        case detections.EXACT:
          matched = tab.url === rule.pattern;
          break;

        case detections.REGEXP:
          try {
            let reg = new RegExp(rule.pattern);
            matched = reg.test(tab.url);
          } catch (e) {
            console.log('Invalid regular expression string:', rule.pattern);
            console.warn(e.message);
          }
          break;
      }
      matched && rules.push(rule);
    });

    let badgeText = '';
    if (rules.length) {
      badgeText = rules.length > 99 ? '99+' : rules.length.toString();
      res.message = `${rules.length} custom rules will be applied.`;
      res.status = 1;
      res.data.rules = rules;
    }
    chrome.browserAction.setBadgeText({
      text: badgeText,
      tabId: tab.id,
    });
    sendResponse(res);
  }

  /**
   * initialize locale on extension installed
   * 
   * @memberof Dispatcher
   */
  onExtensionInstalled() {
    chrome.runtime.onInstalled.addListener((details) => {
      console.log('onInstalled:', details);
      // set locale depends on ui language
      if (details.reason === 'install') {
        let locale = chrome.i18n.getUILanguage();
        if (!(/zh|cn/i).test(locale)) {
          anxon.options.locale = 'en';
        } else {
          anxon.options.locale = 'zh';
        }
        anxon.updateOptions();
      }
    });
  }

  /**
   * add context menus
   * 
   * @memberof Dispatcher
   */
  setContextMenus() {
    chrome.contextMenus.create({
      id: 'createRule',
      type: 'normal',
      contexts: ['page'],
      title: anxon.t('app.create_rule'),
      onclick: (info, frontendTab) => {
        console.log(info, frontendTab);
        let extraInfo = {};
        if (info.frameId) {
          extraInfo.pattern = info.frameUrl;
          extraInfo.frameId = info.frameId;
        }
        this.initCreate(frontendTab, extraInfo);
      }
    });

    chrome.contextMenus.create({
      id: 'inspect',
      type: 'normal',
      contexts: ['all'],
      title: anxon.t('app.create_rule_for_elements'),
      onclick: (info, frontendTab) => {
        console.log(info, frontendTab);
        this.initInspection(frontendTab, info);
      }
    });
  }

  initInspection(frontendTab, extraInfo = {}) {
    if (extraInfo.frameId) {
      chrome.tabs.sendMessage(frontendTab.id, {
        tag: 'initInspection',
        data: null,
      }, {
        frameId: extraInfo.frameId
      }, (res) => {
        console.log(res);
      });
    } else {
      anxon.messaging.dispatchToTab(frontendTab.id, 'initInspection', null, (res) => {
        console.log(res);
      });
    }
  }

}