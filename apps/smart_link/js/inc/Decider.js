/**
 * 
 * @author Anxon
 * @export
 * @class Decider
 */
export default class Decider {

  constructor() {
    /**
     * rules will be applied to the page
     */
    this.rules = [];

    this.rulesToken = null;

    /**
     * all rule selectors
     */
    this.selectors = [];

    this.clickListenerSet = false;

    this.init();
  }

  init() {
    this.runSteps();

    anxon.messaging.addListener('tabActivated', this.onTabActivated.bind(this));
  }

  runSteps() {
    Thenjs(cont => {
        this.requestRules(cont);
      })
      .then(cont => {
        this.setOnClickListener(cont);
      })
      .then(cont => {
        this.initRules(cont);
      })
      .then(cont => {
        console.log('[Decider.runSteps] run successfullly');
        cont();
      })
      .fin((cont, message) => {
        console.log('fin...', message);
      })
      .fail((cont, err) => {
        console.error(err);
      });
  }

  onTabActivated(data, sender, sendResponse) {
    console.log('[Decider.onTabActivated]');
    if (this.rulesToken !== data.rulesToken) {
      this.refresh();
    }
  }

  refresh() {
    console.log('[Decider.refresh]');
    // clean last rules and selectors
    this.rules = [];
    this.selectors = [];

    // clean link rule cache
    $('a').removeAttr('anxon-rule');

    // TODO let's see if it's neccessary to remove the attribute anxon-href in the future

    this.runSteps();
  }

  /**
   * request rules for current page
   * 
   * @param {Function} mainCont 
   * @memberof Decider
   */
  requestRules(mainCont) {
    anxon.messaging.dispatchMessage('requestRules', null, (res) => {
      this.rulesToken = res.data.rulesToken;
      if (res.status) {
        this.rules = res.data.rules;       
        mainCont();
      } else {
        console.error('No rules!!!');
      }
    });
  }

  /**
   * verify the link url
   * 
   * @param {String} url 
   * @returns {Boolean}
   * @memberof Decider
   */
  verifyUrl(url) {
    if (url === null || url === undefined) {
      return false;
    }
    if (url.match(/^(#|javascript:|magnet:\/\/|ed2k:\/\/|ftp:\/\/|thunder:\/\/)/)) {
      return false;
    }
    return true;
  }

  /**
   * init rules
   * 
   * @param {Function} mainCont
   * @memberof Decider
   */
  initRules(mainCont) {
    this.initSelectors();
    mainCont();
  }

  /**
   * check selectors(remove invalid ones)
   * init the selectors list
   * 
   * @memberof Decider
   */
  initSelectors() {
    this.checkSelectors();

    let selectorPriority = 1;
    let isBodySelectorOccupied = false;

    this.rules.forEach((rule, index) => {
      // when without selectors, it's body selector actually
      if (!rule.selectors.length && !isBodySelectorOccupied) {
        this.selectors.push({
          priority: 0, // obviously, priority of body selector is 0, its rules will applied at first
          ruleIndex: index,
          selector: 'body',
          jqObj: this.getSelectorObj('body'),
        });
        isBodySelectorOccupied = true;
        return;
      }

      let hasValidSelector = false;
      rule.selectors.forEach((selector) => {
        let item = {
          priority: selectorPriority++,
          ruleIndex: index,
          selector: selector,
          jqObj: this.getSelectorObj(selector),
        };
        if (item.jqObj !== false) {
          hasValidSelector = true;
          this.selectors.push(item);
        }
      });
      if (!hasValidSelector) {
        rule.skip = true;
      }
    });

    // sort selectors by priority
    if (this.selectors.length) {
      this.selectors.sort((a, b) => {
        return a.priority - b.priority;
      });
    }
  }

  /**
   * check rules's selectors
   * 
   * @memberof Decider
   */
  checkSelectors() {
    this.rules.forEach((rule, index) => {
      if (rule.selectors.length) {
        let selectors = [];
        let hasValidSelector = false;
        rule.selectors.forEach((selector) => {
          selector = _.trim(selector);
          if (selector !== '' && selectors.indexOf(selector) < 0) {
            selectors.push(selector);
            hasValidSelector = true;
          }
        });
        // if this rule has selectors, but none of the selectors are valid, skip this rule
        if (!hasValidSelector) {
          rule.skip = true;
        } else {
          rule.selectors = selectors;
        }
      }
    });
  }

  /**
   * get jQuery by selector string
   * 
   * @param {String} selector 
   * @returns {jQuery|null|false}
   * @memberof Decider
   */
  getSelectorObj(selector) {
    let jqObj = null;
    try {
      jqObj = $(selector);
    } catch (err) {
      console.warn('[Decider.getSelectorObj] invalid selector:', selector, err);
      jqObj = false;
    }
    return jqObj;
  }

  /**
   * set link click listener
   * 
   * @param {Function} mainCont
   * @memberof Decider
   */
  setOnClickListener(mainCont) {
    console.log('[Decider.setOnClickListener]');
    anxon.utils.onElementsLoaded('body', {
      interval: 30,
      expire: 10 * 60 * 1000,
    })
    .then(() => {
      if (this.clickListenerSet) {
        mainCont();
      } else {
        this.clickListenerSet = true;
        let that = this;
        $('body').on('click', 'a', function () {
          let rule = that.computeFinalRule(this);
          return that.requestOpener(this, rule);
        });
        mainCont();
      }
    })
    .catch(err => {
      console.warn('[onElementsLoaded]', err);
      Thenjs().fin(err);
    });
  }

  /**
   * compute the final rule for the link
   * 
   * @param {Document} link
   * @returns {Object}
   * @memberof Decider
   */
  computeFinalRule(link) {
    let rule = this.requestLinkRuleCache(link);
    if (rule) return rule;

    let finalSelectorIndex = null;

    this.selectors.forEach((item, index) => {
      if (!item.jqObj) item.jqObj = this.getSelectorObj(item.selector);
      // if it's body selector, there's no need to use jQuery.has to check
      if (item.selector === 'body') {
        finalSelectorIndex = index;
      }
      /*
       * P.s. jQuery.has isn't used for check if one element contains other element!
       * Fortunately, the Web API provides a perfect way to do this:
       * https://developer.mozilla.org/en-US/docs/Web/API/Node/contains
       */
      else if (item.jqObj && item.jqObj[0].contains(link)) {
        finalSelectorIndex = index;
      }
    });

    if (finalSelectorIndex !== null) {
      let ruleIndex = this.selectors[finalSelectorIndex].ruleIndex;
      link.setAttribute('anxon-rule', ruleIndex);
      return this.rules[ruleIndex];
    }
    return false;
  }

  /**
   * get rule for the link by anxon-rule
   * 
   * @param {Document} link 
   * @returns {Object|false}
   * @memberof Decider
   */
  requestLinkRuleCache(link) {
    let ruleIndex = link.getAttribute('anxon-rule');
    if (ruleIndex !== null) {
      return this.rules[ruleIndex];
    }
    return false;
  }

  /**
   * request opener
   * 
   * @param {Document} link
   * @param {Object} rule
   * @memberof Decider
   */
  requestOpener(link, rule) {
    console.log('[Decider.requestOpener]');
    if (!rule) {
      return;
    }
    let mode = rule.mode;

    if (!link.href.match(/^[A-Za-z\d]+:\/\//)) {
      link.href = `${window.location.origin}/${link.href}`;
      link.setAttribute('anxon-href', link.href);
    }

    let url = link.getAttribute('anxon-href') || link.href;

    if (!this.verifyUrl(url)) {
      return;
    }

    let modes = anxon.const.Modes;
    let modesValues = _.toArray(modes);

    if (modesValues.indexOf(mode) > -1) {
      switch (mode) {
        case modes.CURRENT_TAB:
          window.location.href = url;
          break;

        case modes.NEW_TAB:
          window.open(url);
          break;

        case modes.BACKGROUND_TAB:
        case modes.WINDOW:
        case modes.INCOGNITO_WINDOW:
          anxon.messaging.dispatchMessage('requestOpener', {
            mode: mode,
            url: url,
          }, (res) => {
            console.log('requestOpener response:', res);
          });
          break;
      }
      return false;
    }
  }

}