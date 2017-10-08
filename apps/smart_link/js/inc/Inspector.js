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
    this.pageToken = anxon.utils.guid();

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

  /**
   * 
   * 
   * @memberof Inspector
   */
  handleRightClick() {
    let that = this;
    document.oncontextmenu = function (e) {
      if (e.button !== 2) return;
      that.el = e.target;
    };
  }

  /**
   * 
   * 
   * @memberof Inspector
   */
  initInspection() {
    this.status = 'on';
    this.setHelperListeners();

    if (this.el) {
      this.selectionBox.highlight(this.el);
    }

    anxon.toast.warning({
      title: anxon.t('app.tips'),
      message: anxon.t('app.inspector_selection_tips'),
      position: 'topCenter',
      timeout: 8000,
      transitionIn: 'bounceInUp',
    });
  }

  /**
   * 
   * 
   * @returns 
   * @memberof Inspector
   */
  setHelperListeners() {
    if (this.isEventListenersSet) return;
    this.isEventListenersSet = true;
    let that = this;

    document.addEventListener('mousemove', function (e) {
      return that.onElementHover(e);
    }, false);

    document.addEventListener('click', function (e) {
      return that.onElementClick(e);
    }, false);

    // Press button `Escape` to exit current selection
    document.addEventListener('keydown', function (e) {
      if (e.keyCode === 27) {
        that.selectionBox.hide();
        that.status = 'off';
        e.stopPropagation();
      }
    });
  }

  /**
   * 
   * 
   * @param {any} e 
   * @returns 
   * @memberof Inspector
   */
  onElementHover(e) {
    if (this.status === 'off') return;
    
    this.selectionBox.highlight(e.target);
  }

  /**
   * 
   * 
   * @param {any} e 
   * @returns 
   * @memberof Inspector
   */
  onElementClick(e) {
    if (e.target.tagName.toUpperCase() === 'BUTTON' && e.target.classList.contains('iziToast-close')) {
      return;
    }

    if (this.status === 'off') return;
    let selector = this.selectorGenerator.generate(e.target);
    console.log('[Inspector.onElementClick]', selector, e.target);

    // Init rule creation
    anxon.messaging.dispatchMessage('requestCreate', {
      pattern: window.location.href,
      memo: document.title,
      selectors: [selector],
    }, (res) => {

    });
    this.selectionBox.hide();
    this.status = 'off';

    e.stopPropagation();
    // if e.target is a link, this might be helpful
    return false;
  }
}