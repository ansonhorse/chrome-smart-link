import SelectorGenerator from 'anxonApp/js/inc/SelectorGenerator.js';
import SelectionBox from 'anxonApp/js/inc/SelectionBox.js';
/**
 * 
 * @author Anxon
 * @export
 * @class Inspector
 */
export default class Inspector {

  constructor() {
    this.status = 'off';

    this.selectorGenerator = null;
    this.selectionBox = null;

    this.isEventListenersSet = false;

    this.el = null;

    this.init();
  }

  init() {
    let methods = [
      'initInspection',
    ];
    _.each(methods, (method) => {
      anxon.messaging.addListener(method, this[method].bind(this));
    });

    $(() => {
      this.selectorGenerator = new SelectorGenerator();
      this.selectionBox = new SelectionBox();

      this.handleRightClick();
    });
  }

  handleRightClick() {
    let that = this;
    document.oncontextmenu = function (e) {
      if (e.button !== 2) return;
      that.el = e.target;
    };
  }

  initInspection() {
    this.status = 'on';
    this.setHelperListeners();

    if (this.el) {
      this.selectionBox.highlight(this.el);
    }
  }

  setHelperListeners() {
    if (this.isEventListenersSet) return;
    this.isEventListenersSet = true;
    let that = this;

    $('body *').hover(function (e) {
      return that.onElementHover(e);
    });

    $('body *').on('click', function (e) {
      return that.onElementClick(e);
    });
  }

  onElementHover(e) {
    if (this.status === 'off') return;

    this.selectionBox.highlight(e.target);
  }

  onElementClick(e) {
    if (this.status === 'off') return;
    let selector = this.selectorGenerator.generate(e.target);
    console.log('[Inspector.onElementClick]', selector, e.target);
    anxon.messaging.dispatchMessage('requestCreate', {
      selectors: [selector],
    }, (res) => {

    });
    this.selectionBox.hide(e.target);
    this.status = 'off';

    e.stopPropagation();
    // if e.target is a link, this might be helpful
    return false;
  }
}