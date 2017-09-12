/**
 * Selection of DOM elements
 * Based on Firebug's non-canvas implementation
 *
 * A DIV is used for each edge.
 * To highlight an element, the width, height, left offset and top offset values of edge DIVs
 * are manipulated to surround the element.
 *
 * TODO: Canvas?
 *
 * Copyright (c) 2007, Parakey Inc.
 * Copyright (c) 2012, Ankit Ahuja
 * Licensed under GPL, MIT and BSD Licenses
 * 
 * scripts of this file mostly from chrome extension `Stylebot`
 * orginal file `path/to/extension/2.2_0/shared/SelectionBox.js`
 * here it's 'rewritten' using ES6
 * 
 * @export
 * @class SelectionBox
 */
export default class SelectionBox {

  /**
   * @constructor
   * @param {Integer} edgeSize Thickness of each edge. By default, 2
   * @param {String} edgeColor Hexcode for color of each edge. By default, #65f166
   * @param {Document} edgeContainer Element inside which the edges are inserted.
   *    By default, body
   */
  constructor(edgeSize = 1, edgeColor = '#65f166', edgeContainer) {

    this.edgeSize = edgeSize;
    this.edgeColor = edgeColor;
    this.edgeContainer = edgeContainer ? edgeContainer : $('body').get(0);
    this.edges = {};

    this.viewfinder = this.createViewfinder();
    this.viewfinder.appendTo(this.edgeContainer);

    this.edges.top = this.createEdge();
    this.edges.right = this.createEdge();
    this.edges.bottom = this.createEdge();
    this.edges.left = this.createEdge();

    for (let edge in this.edges) {
      this.edges[edge].appendTo(this.edgeContainer);
    }
  }

  /**
   * Create an edge
   * @returns {Document} DIV for the edge
   * @private
   */
  createEdge() {
    let css = {
      'background-color': this.edgeColor,
      'position': 'absolute',
      'z-index': '2147483644'
    };
    return $('<div>').css(css);
  }

  createViewfinder() {
    let css = {
      'background-color': 'rgba(50, 100, 255, 0.32)',
      'position': 'absolute',
      'z-index': '2147483644 !important',
      'opacity': 0.5,
      'pointer-events': 'none',
      'cursor': 'default !important'
    };
    return $('<div class="sl-viewfinder"></div>').css(css);
  }

  /**
   * Highlight an element. Removes highlight from previously highlighted element
   * @param {Document} el DOM element to highlight
   * @public
   */
  highlight(el) {
    if (!el) {
      this.hide();
      return;
    }

    if (el.nodeType != 1)
      el = el.parentNode;

    let scrollbarSize = 17;
    let windowSize = this.getWindowSize();
    let scrollSize = this.getWindowScrollSize();
    let scrollPosition = this.getWindowScrollPosition();
    let box = this.getElementBox(el);
    let top = box.top;
    let left = box.left;
    let height = box.height;
    let width = box.width;

    let freeHorizontalSpace = scrollPosition.left + windowSize.width - left - width -
      (scrollSize.height > windowSize.height ? // is *vertical* scrollbar visible
        scrollbarSize : 0);

    let freeVerticalSpace = scrollPosition.top + windowSize.height - top - height -
      (scrollSize.width > windowSize.width ? // is *horizontal* scrollbar visible
        scrollbarSize : 0);

    let numVerticalBorders = freeVerticalSpace > 0 ? 2 : 1;

    // top edge
    this.moveEdge('top', top - this.edgeSize, left);
    this.resizeEdge('top', this.edgeSize, width);

    // left edge
    this.moveEdge('left', top - this.edgeSize, left - this.edgeSize);
    this.resizeEdge('left', height + numVerticalBorders * this.edgeSize, this.edgeSize);

    // bottom edge
    if (freeVerticalSpace > 0) {
      this.moveEdge('bottom', top + height, left);
      this.resizeEdge('bottom', this.edgeSize, width);
    } else {
      this.moveEdge('bottom', -2 * this.edgeSize, -2 * this.edgeSize);
      this.resizeEdge('bottom', this.edgeSize, this.edgeSize);
    }

    // right edge
    if (freeHorizontalSpace > 0) {
      this.moveEdge('right', top - this.edgeSize, left + width);
      this.resizeEdge('right', height + numVerticalBorders * this.edgeSize, (freeHorizontalSpace < this.edgeSize ? freeHorizontalSpace : this.edgeSize));
    } else {
      this.moveEdge('right', -2 * this.edgeSize, -2 * this.edgeSize);
      this.resizeEdge('right', this.edgeSize, this.edgeSize);
    }

    this.viewfinder.css({
      left: left,
      top: top,
      width: width,
      height: height,
    });
  }

  /**
   * Hide selection edges
   * @public
   */
  hide() {
    for (let edge in this.edges)
      this.edges[edge].width(0).height(0);

    this.viewfinder.width(0).height(0);
  }

  /**
   * Remove the selection box from DOM
   * @public
   */
  destroy() {
    for (let edge in this.edges)
      this.edges[edge].remove();

    this.viewfinder.remove();
  }

  /**
   * Move an edge
   * @private
   * @param {Document} edge DIV
   * @param {number} t Top offset
   * @param {number} l Left offset
   */
  moveEdge(edge, t, l) {
    this.edges[edge].css('top', t + 'px');
    this.edges[edge].css('left', l + 'px');
  }

  /**
   * Resize an edge
   * @private
   * @param {Document} edge DIV
   * @param {number} h Height of edge to set
   * @param {number} w Width of edge to set
   */
  resizeEdge(edge, h, w) {
    this.edges[edge].height(h);
    this.edges[edge].width(w);
  }

  /**
   * Get an element's offset and dimensions
   * @private
   * @param {Document} el Element
   * @returns {Object} Offset and dimensions of element.
   *    Example: {top:1, left: 2, height: 3, width: 4}
   */
  getElementBox(el) {
    let result = {};

    if (el.getBoundingClientRect) {
      let rect = el.getBoundingClientRect();
      let scroll = this.getWindowScrollPosition();
      result.top = Math.round(rect.top + scroll.top);
      result.left = Math.round(rect.left + scroll.left);
      result.height = Math.round(rect.bottom - rect.top);
      result.width = Math.round(rect.right - rect.left);
    } else {
      let position = this.getElementPosition(el);
      result.top = position.top;
      result.left = position.left;
      result.height = el.offsetHeight;
      result.width = el.offsetWidth;
    }
    return result;
  }

  /**
   * Get a window's scroll width and height
   * @private
   * @returns {Object} Scroll width and height. {width: 12, height: 12}
   */
  getWindowScrollSize() {
    let width = 0,
      height = 0,
      el;

    // first try the document.documentElement scroll size
    if ((el = document.documentElement) &&
      (el.scrollHeight || el.scrollWidth)) {
      width = el.scrollWidth;
      height = el.scrollHeight;
    }

    // then we need to check if document.body has a bigger scroll size value
    // because sometimes depending on the browser and the page, the document.body
    // scroll size returns a smaller (and wrong) measure
    if ((el = document.body) && (el.scrollHeight || el.scrollWidth) &&
      (el.scrollWidth > width || el.scrollHeight > height)) {
      width = el.scrollWidth;
      height = el.scrollHeight;
    }

    return {
      width,
      height
    };
  }

  /**
   * Get an element's left and top offset
   * @private
   * @param {Document} el Element
   * @returns {Object} Object containing left and top offset values for element.
   */
  getElementPosition(el) {
    let left = 0;
    let top = 0;

    do {
      left += el.offsetLeft;
      top += el.offsetTop;
    }
    while (el = el.offsetParent);

    return {
      left,
      top
    };
  }

  /**
   * Get the DOM window's width and height
   * @private
   * @returns {Object} Example: {width: 600, height: 600}
   */
  getWindowSize() {
    let width = 0,
      height = 0,
      el;

    if (typeof window.innerWidth == 'number') {
      width = window.innerWidth;
      height = window.innerHeight;
    } else if ((el = document.documentElement) &&
      (el.clientHeight || el.clientWidth)) {
      width = el.clientWidth;
      height = el.clientHeight;
    } else if ((el = document.body) && (el.clientHeight || el.clientWidth)) {
      width = el.clientWidth;
      height = el.clientHeight;
    }

    return {
      width,
      height
    };
  }

  /**
   * Get DOM window's scroll position
   * @private
   * @returns {Object} With top and left properties
   */
  getWindowScrollPosition() {
    let top = 0,
      left = 0,
      el;

    if (typeof window.pageYOffset === 'number') {
      top = window.pageYOffset;
      left = window.pageXOffset;
    } else if ((el = document.body) && (el.scrollTop || el.scrollLeft)) {
      top = el.scrollTop;
      left = el.scrollLeft;
    } else if ((el = document.documentElement) && (el.scrollTop || el.scrollLeft)) {
      top = el.scrollTop;
      left = el.scrollLeft;
    }

    return {
      top,
      left
    };
  }
}