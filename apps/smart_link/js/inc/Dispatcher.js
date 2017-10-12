/**
 * 
 * @author Anxon
 * @export
 * @class Dispatcher
 */
export default class Dispatcher {

  constructor() {
    this.rulesToken = anxon.utils.guid();
    this.tabs = {};
    this.init();
  }

  init() {
    let methods = [
      'tabRemoved',
      'requestOpener',
      'requestRules',
      'bulkRequestRules',
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
        // console.log(res);
      });

      this.bulkRequestRules({
        tabId: activeInfo.tabId
      });
    });

    // this can make it no need to reload the page to make the new rules applied
    chrome.windows.onFocusChanged.addListener(windowId => {
      chrome.tabs.query({
        active: true
      }, (tabs) => {
        anxon.messaging.dispatchToTab(tabs[0].id, 'tabActivated', {
          rulesToken: this.rulesToken,
        }, (res) => {
          // console.log(res);
        });

        this.bulkRequestRules({
          tabId: tabs[0].id
        });
      });
    });

    this.onTabUpdated();
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

  onTabUpdated() {
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'loading') {
        this.tabs[tabId] = {
          rulesNum: 0,
        };
      } else if (changeInfo.status === 'complete') {
        this.bulkRequestRules({
          tabId: tabId,
          abortOnOnlyOneFrame: true,
        });
      }
    });
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
   * Compute the rules for the url
   * 
   * @param {String} url 
   * @param {Object} [options={}] 
   * @returns {Array}
   * @memberof Dispatcher
   */
  computeRules(url, options = {}) {
    let rules = [];
    let detections = anxon.const.Detections;
    _.each(anxon.options.rules, (rule, index) => {
      if (!rule.enabled && !options.includeDisabled) return;
      let matched = false;
      switch (rule.detection) {
        case detections.CONTAINS:
          matched = url.indexOf(rule.pattern) > -1;
          break;

        case detections.STARTS_WITH:
          matched = _.startsWith(url, rule.pattern);
          break;

        case detections.ENDS_WITH:
          matched = _.endsWith(url, rule.pattern);
          break;

        case detections.EXACT:
          matched = url === rule.pattern;
          break;

        case detections.REGEXP:
          try {
            let reg = new RegExp(rule.pattern);
            matched = reg.test(url);
          } catch (e) {
            console.log('Invalid regular expression string:', rule.pattern);
            console.warn(e.message);
          }
          break;
      }
      matched && rules.push(rule);
    });

    return rules;
  }

  /**
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
    let url = tab.url;

    let rules = this.computeRules(url, data);

    /*
      已知问题：badgeText可能会因为同一标签页里的frame的rule数量不同，而显示“错误”。
      原因：requestRules的发起者实际是页面的frame，当然一般是一个，也就是frame的url跟tab的url一致。
      但是嵌套frame的情况也有一些，就会出现如下所述的问题：
      比如，主frame，有两个rules，但是它里面的frame只有一个，如果后者的requestRules发生在前者之后，
      那最终badgeText是1，而不是2。
      怎么解决？
      思路1：撒手不管(๑*◡*๑) 好主意！！！
      思路2：以frame组为单位，来requestRules，到时候，badgeText就是这个frame组rules的总和。

      Known problem: badgeText may be 'incorrect' because of the number of frames in the same page.
      Reason: the originator of requestRules is actually the frame of the page, which is, of course, 
      typically one, which is the url of the frame that is consistent with the url of the TAB.

      But there are also some cases of nested frames, as follows:
      For example, the main frame, with two rules, but one of its frame, which just with one rule, 
      if the latter's requestRules occurs after the former,
      That eventually badgeText is 1, not 2.
      Thoughts?
      Idea 1: let it go (～￣▽￣)～ bravo!!!
      Idea 2: all frames requestRules in one time, badgeText is the sum of the frame group rules.
    */

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
   * 
   * 
   * @param {Object} data 
   * @param {Object} sender 
   * @param {Function} sendResponse 
   * @memberof Dispatcher
   */
  bulkRequestRules(data = {}, sender, sendResponse) {
    let res = {
      status: 0,
      message: 'No any custom rules for tab frames',
      data: {
        rulesToken: this.rulesToken,
      }
    };

    let tabId = data.tabId ? data.tabId : sender.tab.id;

    // https://developer.chrome.com/extensions/webNavigation#method-getAllFrames
    chrome.webNavigation.getAllFrames({
      tabId: tabId
    }, (details) => {
      if (data.abortOnOnlyOneFrame && details.length === 1) {
        return;
      }
      let rules = [];
      _.each(details, (detail) => {
        if (!detail.url || detail.url === 'about:blank') return;
        rules = rules.concat(this.computeRules(detail.url, data));
      });

      let badgeText = '';
      if (rules.length) {
        rules = _.uniq(rules);
        badgeText = rules.length > 99 ? '99+' : rules.length.toString();
        res.message = `${rules.length} custom rules fetched.`;
        res.status = 1;
        res.data.rules = rules;
      }
      chrome.browserAction.setBadgeText({
        text: badgeText,
        tabId: tabId,
      });

      if (details.length > 1) {
        chrome.browserAction.setBadgeBackgroundColor({
          color: '#f40',
          tabId: tabId,
        });
      }
  
      _.isFunction(sendResponse) && sendResponse(res);
    });
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
        // console.log(res);
      });
    }
  }

}