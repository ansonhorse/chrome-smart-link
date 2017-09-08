/**
 * 
 * Generate CSS Selector for an element
 *
 * Copyright (c) 2013 Ankit Ahuja
 * Dual licensed under GPL and MIT licenses.
 * 
 * 
 * scripts of this file mostly from chrome extension `Stylebot`
 * orginal file `path/to/extension/2.2_0/shared/selectorGenerator.js`
 * here it's 'rewritten' using ES6
 * 
 * @export
 * @class SelectorGenerator
 */
export default class SelectorGenerator {

  /**
   * Generator of CSS selectors for an element
   * @constructor
   * @param {String} [level] Specificity level at which to generate CSS selector.
        Valid values are low, high and medium. Default is medium
  */
  constructor(level = 'medium') {
    this.specificityLevel = level;
  }

  /**
   * Generate CSS selector for element
   * 
   * @public
   * @param {Document} el 
   * @returns {String} CSS selector
   * @memberof SelectorGenerator
   */
  generate(el) {
    if (!el) {
      return null;
    }
    let jqObj = $(el);
    if (this.specificityLevel === 'low') {
      return this.inspectAtLowSpecificity(jqObj);
    } else if (this.specificityLevel === 'high') {
      return this.inspectAtHighSpecificity(jqObj, 0);
    } else {
      return this.inspect(jqObj, 0);
    }
  }

  /**
   * If element has a class, return it as the CSS selector.
   *    Else, look for ID. Else, traverse upto 2 levels up
   * 
   * @private
   * @param {jQuery} jqObj
   * @param {Integer} level DOM Traversal Level. Root is at 0
   * @return {String} CSS Selector
   * @memberof SelectorGenerator
   */
  inspect(jqObj, level) {
    let elClass = jqObj.attr('class');
    if (elClass !== undefined) {
      elClass = $.trim(elClass).replace(/\s{2,}/g, ' ');
      if (elClass.length !== 0) {
        let classes = elClass.split(' ');
        let len = classes.length;
        let selector = jqObj.prop('tagName');
        selector = selector ? selector.toLowerCase() : '';
        for (let i = 0; i < len; i++) {
          selector += '.' + classes[i];
        }
        return selector;
      }
    }
    let elId = jqObj.attr('id');
    if (elId !== undefined) {
      return '#' + elId;
    }
    let elTag = jqObj.prop('tabName');
    elTag = elTag ? elTag.toLowerCase() : '';
    if (level < 2) {
      return this.inspect(jqObj.parent(), level + 1) + ' ' + elTag;
    } else {
      return elTag;
    }
  }

  /**
   * If element has an ID, return #ID.
   *    Else, check for classname (traverse upto 1 level up)
   * 
   * @param {jQuery} jqObj 
   * @param {Integer} level 
   * @returns CSS Selector
   * @memberof SelectorGenerator
   */
  inspectAtHighSpecificity(jqObj, level) {
    let elId = jqObj.attr('id');
    if (elId !== undefined) {
      return '#' + elId;
    }
    let elClass = jqObj.attr('class');
    if (elClass !== undefined) {
      elClass = $.trim(elClass);
    } else {
      elClass = '';
    }
    let elTag = jqObj.prop('tagName');
    elTag = elTag ? elTag.toLowerCase() : '';
    let selector;
    if (level < 1) {
      selector = this.inspectAtHighSpecificity(jqObj.parent(), level + 1) + ' ' + elTag;
      if (elClass.length !== 0) {
        selector += '.' + elClass;
      }
    } else {
      selector = elTag;
      if (elClass.length !== 0) {
        selector += '.' + elClass;
      }
    }
    return selector;
  }

  /**
   * Return element's tagName as CSS selector (Low Specificity Level)
   * 
   * @param {jQuery} jqObj 
   * @returns {String} CSS Selector
   * @memberof SelectorGenerator
   */
  inspectAtLowSpecificity(jqObj) {
    let elTag = jqObj.prop('tagName');
    return elTag ? elTag.toLowerCase() : '';
  }
}