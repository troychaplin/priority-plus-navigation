/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/core/PriorityNav.js"
/*!*********************************!*\
  !*** ./src/core/PriorityNav.js ***!
  \*********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/constants.js */ "./src/utils/constants.js");
/* harmony import */ var _utils_dom_utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/dom-utils.js */ "./src/utils/dom-utils.js");
/* harmony import */ var _events_event_handlers_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../events/event-handlers.js */ "./src/events/event-handlers.js");
/* harmony import */ var _dom_dom_builder_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../dom/dom-builder.js */ "./src/dom/dom-builder.js");
/* harmony import */ var _events_accordion_handler_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../events/accordion-handler.js */ "./src/events/accordion-handler.js");
/* harmony import */ var _layout_width_calculator_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../layout/width-calculator.js */ "./src/layout/width-calculator.js");
/* global ResizeObserver, requestAnimationFrame, MutationObserver */

/**
 * Internal dependencies
 */






class PriorityNav {
  // Static counter for generating unique instance IDs
  static instanceCounter = 0;
  constructor(element) {
    // Prevent double initialization
    if (element.dataset.priorityNavInitialized === 'true') {
      return;
    }

    // Generate unique instance ID for this PriorityNav instance
    this.instanceId = `priority-nav-${PriorityNav.instanceCounter++}`;

    // Element should be .wp-block-navigation.is-style-priority-nav
    if (!element.classList.contains('wp-block-navigation') || !element.classList.contains('is-style-priority-nav')) {
      return;
    }

    // Mark as initialized to prevent double initialization
    element.dataset.priorityNavInitialized = 'true';
    this.nav = element;

    // Get list container
    this.list = this.nav.querySelector('.wp-block-navigation__container');
    if (!this.list) {
      return;
    }

    // Get attributes from nav element
    this.moreLabel = this.nav.getAttribute('data-more-label') || _utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.DEFAULT_MORE_LABEL;
    this.moreIcon = this.nav.getAttribute('data-more-icon') || _utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.DEFAULT_MORE_ICON;

    // Detect if navigation has openSubmenusOnClick setting
    this.openSubmenusOnClick = this.detectOpenSubmenusOnClick();

    // Create More button and dropdown
    const {
      moreContainer,
      moreButton,
      dropdown
    } = (0,_dom_dom_builder_js__WEBPACK_IMPORTED_MODULE_3__.createMoreButton)(this.list, this.moreLabel, this.moreIcon);
    this.moreContainer = moreContainer;
    this.moreButton = moreButton;
    this.dropdown = dropdown;

    // Initialize state
    this.items = Array.from(this.list.children);
    this.itemWidths = [];
    this.isOpen = false;
    this.isCalculating = false;
    this.openAccordions = [];
    this.submenuCounter = {
      value: 0
    }; // For generating unique IDs (object for mutation)

    // Track responsive container for hamburger mode detection
    this.responsiveContainer = this.nav.querySelector('.wp-block-navigation__responsive-container');
    this.mutationObserver = null;
    this.retryTimeout = null;
    this.isEnabled = true; // Track if Priority Nav should be active
    this.moreButtonWidth = null; // Cache more button width

    // Store event handlers for cleanup
    this.eventHandlers = null;
    this.init();
  }

  /**
   * Detect if navigation has openSubmenusOnClick setting
   * Checks attributes and classes on nav element and list items
   * @return {boolean} True if submenus should open on click
   */
  detectOpenSubmenusOnClick() {
    // Check data attributes on nav element
    const dataAttr = this.nav.getAttribute('data-opensubmenusonclick') || this.nav.getAttribute('data-open-submenus-on-click');
    if (dataAttr) {
      return dataAttr === 'true' || dataAttr === '1' || dataAttr === '';
    }

    // Check for generic data attributes containing the keywords
    if (this.nav.attributes) {
      for (let i = 0; i < this.nav.attributes.length; i++) {
        const attr = this.nav.attributes[i];
        const name = attr.name.toLowerCase();
        // WordPress may use various formats
        if (name.includes('open') && name.includes('submenu') && name.includes('click')) {
          const value = attr.value;
          return value === 'true' || value === '1' || value === '';
        }
      }
    }

    // Check for class-based indicators on nav element
    if (this.nav.classList.contains('open-on-click') || this.nav.classList.contains('open-submenus-on-click') || this.nav.classList.contains('has-open-submenus-on-click')) {
      return true;
    }

    // Check list items for the class (WordPress might set it on individual items)
    if (this.list) {
      const firstItem = this.list.querySelector('li.has-child, li.open-on-click');
      if (firstItem && (firstItem.classList.contains('open-on-click') || firstItem.classList.contains('open-submenus-on-click'))) {
        return true;
      }
    }

    // Default to false if not found
    return false;
  }
  init() {
    // Guard against missing elements
    if (!this.nav || !document.body.contains(this.nav)) {
      return;
    }

    // Set up event listeners
    this.eventHandlers = (0,_events_event_handlers_js__WEBPACK_IMPORTED_MODULE_2__.setupEventListeners)({
      moreButton: this.moreButton,
      moreContainer: this.moreContainer,
      dropdown: this.dropdown
    }, this, {
      toggleDropdown: () => this.toggleDropdown(),
      closeDropdown: () => this.closeDropdown(),
      closeAllAccordions: () => this.closeAllAccordions(),
      toggleAccordionItem: (button, submenu) => this.toggleAccordionItem(button, submenu)
    });
    this.setupResponsiveObserver();

    // Check if we should enable Priority Nav
    if (this.isInHamburgerMode()) {
      this.disablePriorityNav();
    } else {
      this.enablePriorityNav();
    }

    // Set up resize observer with error handling
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        // Guard against detached elements
        if (!document.body.contains(this.nav)) {
          return;
        }
        if (!this.isCalculating) {
          // Check if we've transitioned between hamburger and desktop mode
          const wasEnabled = this.isEnabled;
          const inHamburger = this.isInHamburgerMode();
          if (inHamburger && wasEnabled) {
            this.disablePriorityNav();
          } else if (!inHamburger && !wasEnabled) {
            this.enablePriorityNav();
          } else if (!inHamburger && wasEnabled) {
            // Still in desktop mode, just recalculate
            requestAnimationFrame(() => this.checkOverflow());
          }
        }
      });
      this.resizeObserver.observe(this.nav);
    }
  }

  /**
   * Check if navigation is in hamburger/responsive mode
   * @return {boolean} True if in hamburger mode
   */
  isInHamburgerMode() {
    return (0,_utils_dom_utils_js__WEBPACK_IMPORTED_MODULE_1__.isInHamburgerMode)(this.responsiveContainer, this.list);
  }

  /**
   * Disable Priority Nav when in hamburger mode
   */
  disablePriorityNav() {
    if (!this.items || !Array.isArray(this.items)) {
      return;
    }
    this.isEnabled = false;

    // Show all items
    this.items.forEach(item => {
      if (item && item.style) {
        item.style.display = '';
      }
    });

    // Hide the More button
    if (this.moreContainer && this.moreContainer.style) {
      this.moreContainer.style.display = 'none';
    }

    // Close dropdown if open
    this.closeDropdown();
  }

  /**
   * Enable Priority Nav and recalculate
   */
  enablePriorityNav() {
    this.isEnabled = true;

    // Only proceed if measurable
    if (!(0,_utils_dom_utils_js__WEBPACK_IMPORTED_MODULE_1__.isMeasurable)(this.list)) {
      // Schedule retry
      this.scheduleRetry();
      return;
    }

    // Cache widths if needed (or if they contain zeros from previous hidden state)
    const needsRecache = this.itemWidths.length === 0 || this.itemWidths.some(width => width === 0);
    if (needsRecache) {
      this.itemWidths = (0,_layout_width_calculator_js__WEBPACK_IMPORTED_MODULE_5__.cacheItemWidths)(this.list, this.items, () => this.scheduleRetry());
    }

    // Recalculate overflow
    requestAnimationFrame(() => {
      this.checkOverflow();
    });
  }

  /**
   * Schedule a retry when menu becomes visible
   * @param {number} maxAttempts - Maximum number of retry attempts
   */
  scheduleRetry(maxAttempts = 20) {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
    let attempts = 0;
    const tryEnable = () => {
      attempts++;
      if ((0,_utils_dom_utils_js__WEBPACK_IMPORTED_MODULE_1__.isMeasurable)(this.list) && !this.isInHamburgerMode()) {
        this.enablePriorityNav();
        this.retryTimeout = null;
      } else if (attempts < maxAttempts) {
        this.retryTimeout = setTimeout(tryEnable, 100);
      } else {
        // Give up after max attempts
        this.retryTimeout = null;
      }
    };
    this.retryTimeout = setTimeout(tryEnable, 100);
  }

  /**
   * Set up observer for responsive container changes
   */
  setupResponsiveObserver() {
    if (typeof MutationObserver === 'undefined') {
      return;
    }
    if (!this.responsiveContainer) {
      return;
    }

    // Watch for attribute and class changes on responsive container
    this.mutationObserver = new MutationObserver(mutations => {
      // Guard against detached elements
      if (!document.body.contains(this.nav)) {
        return;
      }
      let shouldCheck = false;
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes' && (mutation.attributeName === 'aria-hidden' || mutation.attributeName === 'class')) {
          shouldCheck = true;
        }
      });
      if (shouldCheck) {
        const inHamburger = this.isInHamburgerMode();
        if (inHamburger && this.isEnabled) {
          this.disablePriorityNav();
        } else if (!inHamburger && !this.isEnabled) {
          this.enablePriorityNav();
        }
      }
    });
    this.mutationObserver.observe(this.responsiveContainer, {
      attributes: true,
      attributeFilter: ['aria-hidden', 'class']
    });

    // Also observe the list container for visibility changes
    if (this.list && document.body.contains(this.list)) {
      this.mutationObserver.observe(this.list, {
        attributes: true,
        attributeFilter: ['style', 'class'],
        attributeOldValue: false
      });
    }
  }

  /**
   * Check overflow and update display
   */
  checkOverflow() {
    // Don't run if disabled (hamburger mode) or not measurable
    if (!this.isEnabled || !(0,_utils_dom_utils_js__WEBPACK_IMPORTED_MODULE_1__.isMeasurable)(this.list)) {
      this.isCalculating = false;
      return;
    }

    // Guard against detached DOM elements
    if (!document.body.contains(this.nav)) {
      this.isCalculating = false;
      return;
    }
    this.isCalculating = true;

    // Ensure we have valid item widths
    if (!(0,_layout_width_calculator_js__WEBPACK_IMPORTED_MODULE_5__.hasValidWidthCache)(this.itemWidths, this.items.length)) {
      this.itemWidths = (0,_layout_width_calculator_js__WEBPACK_IMPORTED_MODULE_5__.cacheItemWidths)(this.list, this.items, () => this.scheduleRetry());
      // If still invalid, abort
      if (!(0,_layout_width_calculator_js__WEBPACK_IMPORTED_MODULE_5__.hasValidWidthCache)(this.itemWidths, this.items.length)) {
        this.isCalculating = false;
        return;
      }
    }

    // Get measurements
    const availableWidth = this.calculateAvailableWidth();
    this.moreButtonWidth = (0,_layout_width_calculator_js__WEBPACK_IMPORTED_MODULE_5__.cacheMoreButtonWidth)(this.moreButton, this.moreContainer, this.moreButtonWidth);

    // Handle edge case where more button is larger than available width
    if (this.moreButtonWidth >= availableWidth) {
      this.items.forEach(item => item.style.display = 'none');
      this.moreContainer.style.display = '';
      this.isCalculating = false;
      return;
    }

    // Get gap after early return check
    const gap = (0,_layout_width_calculator_js__WEBPACK_IMPORTED_MODULE_5__.getGap)(this.list, this.nav);

    // Calculate visible items
    const visibleCount = this.calculateVisibleItems(availableWidth, this.moreButtonWidth, gap);

    // Update display
    if (visibleCount === this.items.length) {
      // All items fit
      this.items.forEach(item => item.style.display = '');
      this.moreContainer.style.display = 'none';
      this.closeDropdown();
    } else {
      // Ensure more button is hidden during DOM manipulation
      this.moreContainer.style.display = 'none';

      // Hide overflow items FIRST to prevent button from wrapping
      for (let i = visibleCount; i < this.items.length; i++) {
        this.items[i].style.display = 'none';
      }

      // Show visible items
      for (let i = 0; i < visibleCount; i++) {
        this.items[i].style.display = '';
      }

      // Force a reflow to ensure layout updates before showing button
      // Reading offsetHeight forces the browser to recalculate layout
      void this.list.offsetHeight;

      // Build dropdown from overflow (items already hidden and layout updated)
      (0,_dom_dom_builder_js__WEBPACK_IMPORTED_MODULE_3__.buildDropdownFromOverflow)(this.dropdown, this.items, visibleCount, this.instanceId, this.submenuCounter, this.openSubmenusOnClick);

      // Show more button AFTER items are hidden and layout has reflowed
      this.moreContainer.style.display = '';
    }
    this.isCalculating = false;
  }

  /**
   * Calculate available width for navigation items
   * @return {number} Available width in pixels
   */
  calculateAvailableWidth() {
    // Get actual visible container width - prefer the nav element itself
    const navRect = this.nav.getBoundingClientRect();
    const navStyles = window.getComputedStyle(this.nav);
    const padding = parseFloat(navStyles.paddingLeft) + parseFloat(navStyles.paddingRight);

    // Use nav width
    const containerWidth = navRect.width > 0 ? navRect.width : 0;
    return containerWidth > 0 ? containerWidth - padding : 0;
  }

  /**
   * Calculate how many items can fit in available width
   * @param {number} availableWidth  - Available width in pixels
   * @param {number} moreButtonWidth - Width of more button in pixels
   * @param {number} gap             - Gap between items in pixels
   * @return {number} Number of visible items
   */
  calculateVisibleItems(availableWidth, moreButtonWidth, gap) {
    // Calculate total width needed for all items
    let totalWidth = 0;
    for (let i = 0; i < this.items.length; i++) {
      const itemWidth = this.itemWidths[i];
      const gapWidth = i > 0 ? gap : 0;
      totalWidth += gapWidth + itemWidth;
    }

    // If everything fits, show all items
    if (totalWidth <= availableWidth) {
      return this.items.length;
    }

    // Calculate how many items fit with the More button visible
    let usedWidth = 0;
    let visibleCount = 0;
    for (let i = 0; i < this.items.length; i++) {
      const itemWidth = this.itemWidths[i];
      const gapWidth = i > 0 ? gap : 0;
      const moreButtonGap = gap;
      const itemTotalWidth = gapWidth + itemWidth;

      // Check if this item + more button would fit
      const wouldFit = usedWidth + itemTotalWidth + moreButtonGap + moreButtonWidth <= availableWidth;

      // Always show at least one item
      if (wouldFit || i === 0) {
        usedWidth += itemTotalWidth;
        visibleCount++;
      } else {
        break;
      }
    }
    return visibleCount;
  }
  toggleDropdown() {
    if (this.isOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }
  openDropdown() {
    if (!this.dropdown || !this.moreButton) {
      return;
    }
    this.isOpen = true;
    this.dropdown.classList.add('is-open');
    this.moreButton.setAttribute('aria-expanded', 'true');
  }
  closeDropdown() {
    if (!this.dropdown || !this.moreButton) {
      return;
    }
    this.isOpen = false;
    this.dropdown.classList.remove('is-open');
    this.moreButton.setAttribute('aria-expanded', 'false');
    // Close all open accordions
    this.closeAllAccordions();
  }

  /**
   * Toggle an accordion item
   * @param {HTMLElement} button  - Accordion toggle button
   * @param {HTMLElement} submenu - Submenu element
   */
  toggleAccordionItem(button, submenu) {
    (0,_events_accordion_handler_js__WEBPACK_IMPORTED_MODULE_4__.toggleAccordionItem)(button, submenu, this, this.dropdown);
  }

  /**
   * Close all open accordions
   */
  closeAllAccordions() {
    (0,_events_accordion_handler_js__WEBPACK_IMPORTED_MODULE_4__.closeAllAccordions)(this);
  }

  /**
   * Cleanup observers, timeouts, and event listeners
   */
  destroy() {
    // Cleanup resize observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    // Cleanup mutation observer
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }

    // Cleanup retry timeout
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }

    // Cleanup event listeners
    if (this.eventHandlers) {
      const {
        moreButtonClickHandler,
        documentClickHandler,
        documentKeydownHandler,
        dropdownClickHandler
      } = this.eventHandlers;
      if (this.moreButton && moreButtonClickHandler) {
        this.moreButton.removeEventListener('click', moreButtonClickHandler);
      }
      if (documentClickHandler) {
        document.removeEventListener('click', documentClickHandler, true);
      }
      if (documentKeydownHandler) {
        document.removeEventListener('keydown', documentKeydownHandler);
      }
      if (this.dropdown && dropdownClickHandler) {
        this.dropdown.removeEventListener('click', dropdownClickHandler);
      }
    }
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (PriorityNav);

/***/ },

/***/ "./src/dom/dom-builder.js"
/*!********************************!*\
  !*** ./src/dom/dom-builder.js ***!
  \********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   buildAccordionHTML: () => (/* binding */ buildAccordionHTML),
/* harmony export */   buildDropdownFromOverflow: () => (/* binding */ buildDropdownFromOverflow),
/* harmony export */   createMoreButton: () => (/* binding */ createMoreButton)
/* harmony export */ });
/* harmony import */ var _utils_constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/constants.js */ "./src/utils/constants.js");
/* harmony import */ var _utils_html_utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/html-utils.js */ "./src/utils/html-utils.js");
/* harmony import */ var _dom_extractor_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./dom-extractor.js */ "./src/dom/dom-extractor.js");
/**
 * DOM building utilities for PriorityNav
 */




/**
 * Create the More button and dropdown container
 * @param {HTMLElement} list      - Navigation list container
 * @param {string}      moreLabel - Label for the More button
 * @param {string}      moreIcon  - Icon type for the More button
 * @return {Object} Object containing moreContainer, moreButton, and dropdown elements
 */
function createMoreButton(list, moreLabel = _utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.DEFAULT_MORE_LABEL, moreIcon = _utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.DEFAULT_MORE_ICON) {
  // Create the more container
  const moreContainer = document.createElement('div');
  moreContainer.className = 'priority-nav-more';

  // Create button
  const moreButton = document.createElement('button');
  moreButton.type = 'button';
  moreButton.className = 'priority-nav-more-button wp-block-navigation-item';
  moreButton.setAttribute('aria-expanded', 'false');
  moreButton.setAttribute('aria-haspopup', 'true');
  moreButton.setAttribute('aria-label', moreLabel);
  const iconMap = {
    chevron: '▼',
    plus: '+',
    menu: '≡'
  };

  // Build icon HTML only if icon exists in map
  const iconHTML = iconMap[moreIcon] ? `<span class="priority-nav-icon">${iconMap[moreIcon]}</span>` : '';
  moreButton.innerHTML = `
		<span class="wp-block-navigation-item__label">${moreLabel}</span>
		${iconHTML}
	`;

  // Create dropdown
  const dropdown = document.createElement('ul');
  dropdown.className = 'priority-nav-dropdown wp-block-navigation__submenu-container';
  dropdown.setAttribute('role', 'menu');
  moreContainer.appendChild(moreButton);
  moreContainer.appendChild(dropdown);

  // Insert after the navigation list
  list.parentNode.appendChild(moreContainer);
  moreContainer.style.display = 'none';
  return {
    moreContainer,
    moreButton,
    dropdown
  };
}

/**
 * Build accordion HTML for a navigation item
 * @param {Object}  data                - Navigation item data
 * @param {number}  level               - Nesting level
 * @param {string}  instanceId          - Unique instance ID
 * @param {number}  submenuCounter      - Counter for generating unique IDs (will be mutated)
 * @param {boolean} openSubmenusOnClick - Whether submenus open on click
 * @return {string} HTML string for the accordion item
 */
function buildAccordionHTML(data, level, instanceId, submenuCounter, openSubmenusOnClick) {
  const submenuId = `${instanceId}-submenu-${submenuCounter.value++}`;
  let html = '';
  if (data.hasSubmenu) {
    // Item has children - build accordion
    if (openSubmenusOnClick) {
      // Click mode: entire item is clickable
      html = `
				<button type="button" class="priority-nav-accordion-toggle priority-nav-accordion-toggle-full" 
				        aria-expanded="false" aria-controls="${submenuId}">
					<span class="priority-nav-accordion-text">${(0,_utils_html_utils_js__WEBPACK_IMPORTED_MODULE_1__.escapeHtml)(data.text)}</span>
					<span class="priority-nav-accordion-arrow" aria-hidden="true">›</span>
				</button>
				<ul class="priority-nav-accordion-content" id="${submenuId}" aria-hidden="true">
			`;
    } else {
      // Arrow mode: link stays functional, separate arrow button
      html = `
				<span class="priority-nav-accordion-wrapper">
					<a href="${(0,_utils_html_utils_js__WEBPACK_IMPORTED_MODULE_1__.escapeHtml)(data.url)}" class="priority-nav-accordion-link">${(0,_utils_html_utils_js__WEBPACK_IMPORTED_MODULE_1__.escapeHtml)(data.text)}</a>
					<button type="button" class="priority-nav-accordion-toggle priority-nav-accordion-toggle-arrow" 
					        aria-expanded="false" aria-controls="${submenuId}" aria-label="Toggle submenu">
						<span class="priority-nav-accordion-arrow" aria-hidden="true">›</span>
					</button>
				</span>
				<ul class="priority-nav-accordion-content" id="${submenuId}" aria-hidden="true">
			`;
    }

    // Build children
    data.children.forEach(child => {
      html += `<li>${buildAccordionHTML(child, level + 1, instanceId, submenuCounter, openSubmenusOnClick)}</li>`;
    });
    html += '</ul>';
  } else {
    // No submenu - just a link
    html = `<a href="${(0,_utils_html_utils_js__WEBPACK_IMPORTED_MODULE_1__.escapeHtml)(data.url)}">${(0,_utils_html_utils_js__WEBPACK_IMPORTED_MODULE_1__.escapeHtml)(data.text)}</a>`;
  }
  return html;
}

/**
 * Build dropdown from overflow items
 * @param {HTMLElement}        dropdown            - Dropdown container element
 * @param {Array<HTMLElement>} items               - All navigation items
 * @param {number}             visibleCount        - Number of visible items
 * @param {string}             instanceId          - Unique instance ID
 * @param {Object}             submenuCounter      - Counter object for generating unique IDs (will be mutated)
 * @param {boolean}            openSubmenusOnClick - Whether submenus open on click
 */
function buildDropdownFromOverflow(dropdown, items, visibleCount, instanceId, submenuCounter, openSubmenusOnClick) {
  dropdown.innerHTML = '';
  submenuCounter.value = 0; // Reset counter

  for (let i = visibleCount; i < items.length; i++) {
    // Extract data from the item
    const itemData = (0,_dom_extractor_js__WEBPACK_IMPORTED_MODULE_2__.extractNavItemData)(items[i]);

    // Build fresh accordion HTML
    const accordionHTML = buildAccordionHTML(itemData, 0, instanceId, submenuCounter, openSubmenusOnClick);

    // Create container and insert HTML
    const container = document.createElement('li');
    container.innerHTML = accordionHTML;
    dropdown.appendChild(container);
  }
}

/***/ },

/***/ "./src/dom/dom-extractor.js"
/*!**********************************!*\
  !*** ./src/dom/dom-extractor.js ***!
  \**********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   extractNavItemData: () => (/* binding */ extractNavItemData)
/* harmony export */ });
/* harmony import */ var _utils_html_utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/html-utils.js */ "./src/utils/html-utils.js");
/**
 * DOM extraction utilities for PriorityNav
 */


/**
 * Extract data from a navigation list item
 * @param {HTMLElement} item - Navigation list item element
 * @return {Object} Extracted navigation item data
 */
function extractNavItemData(item) {
  const data = {
    text: '',
    url: '#',
    hasSubmenu: false,
    children: []
  };

  // Check for submenu FIRST - if it exists, we need to get text differently
  const submenuContainer = item.querySelector(':scope > .wp-block-navigation__submenu-container');

  // Find the link element
  let linkElement = item.querySelector(':scope > a');
  if (!linkElement) {
    linkElement = item.querySelector(':scope > .wp-block-navigation-item__content a');
  }
  if (!linkElement) {
    // Fallback: try to get text from item directly, but exclude submenu text
    if (submenuContainer) {
      // Clone item, remove submenu, then get text
      const clone = item.cloneNode(true);
      const cloneSubmenu = clone.querySelector('.wp-block-navigation__submenu-container');
      if (cloneSubmenu) {
        cloneSubmenu.remove();
      }
      data.text = clone.textContent.trim();
    } else {
      data.text = item.textContent.trim();
    }
    if (submenuContainer) {
      data.hasSubmenu = true;
      const childItems = submenuContainer.querySelectorAll(':scope > li');
      childItems.forEach(childItem => {
        data.children.push(extractNavItemData(childItem));
      });
    }
    return data;
  }

  // Extract text from link
  data.text = (0,_utils_html_utils_js__WEBPACK_IMPORTED_MODULE_0__.extractLinkText)(linkElement);

  // Ensure we don't have submenu text mixed in (safety check)
  if (submenuContainer && data.text) {
    data.text = (0,_utils_html_utils_js__WEBPACK_IMPORTED_MODULE_0__.removeChildTextFromParent)(data.text, submenuContainer);
  }
  data.url = linkElement.getAttribute('href') || '#';

  // Extract children if submenu exists
  if (submenuContainer) {
    data.hasSubmenu = true;

    // Extract children recursively
    const childItems = submenuContainer.querySelectorAll(':scope > li');
    childItems.forEach(childItem => {
      data.children.push(extractNavItemData(childItem));
    });
  }
  return data;
}

/***/ },

/***/ "./src/events/accordion-handler.js"
/*!*****************************************!*\
  !*** ./src/events/accordion-handler.js ***!
  \*****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   closeAllAccordions: () => (/* binding */ closeAllAccordions),
/* harmony export */   toggleAccordionItem: () => (/* binding */ toggleAccordionItem)
/* harmony export */ });
/**
 * Accordion handling utilities for PriorityNav
 */

/**
 * Toggle an accordion item open/closed
 * @param {HTMLElement} button   - Accordion toggle button
 * @param {HTMLElement} submenu  - Submenu element
 * @param {Object}      instance - PriorityNav instance
 * @param {HTMLElement} dropdown - Dropdown container (for nested accordion lookup)
 */
function toggleAccordionItem(button, submenu, instance, dropdown) {
  const isExpanded = button.getAttribute('aria-expanded') === 'true';
  if (isExpanded) {
    // Close this accordion
    button.setAttribute('aria-expanded', 'false');
    submenu.style.setProperty('display', 'none', 'important');
    submenu.classList.remove('is-open');
    submenu.setAttribute('aria-hidden', 'true');

    // Remove from open accordions array
    instance.openAccordions = instance.openAccordions.filter(item => item.button !== button);

    // Close any nested accordions
    const nestedAccordions = submenu.querySelectorAll('.priority-nav-accordion-toggle[aria-expanded="true"]');
    nestedAccordions.forEach(nestedButton => {
      const nestedSubmenuId = nestedButton.getAttribute('aria-controls');
      // Use scoped lookup within this instance's dropdown to avoid cross-instance collisions
      const nestedSubmenu = dropdown.querySelector(`#${nestedSubmenuId}`);
      if (nestedSubmenu) {
        nestedButton.setAttribute('aria-expanded', 'false');
        nestedSubmenu.style.setProperty('display', 'none', 'important');
        nestedSubmenu.classList.remove('is-open');
        nestedSubmenu.setAttribute('aria-hidden', 'true');
      }
    });
  } else {
    // Open this accordion
    button.setAttribute('aria-expanded', 'true');
    // Force display block with !important via style
    submenu.style.setProperty('display', 'block', 'important');
    submenu.style.setProperty('opacity', '1', 'important');
    submenu.style.setProperty('visibility', 'visible', 'important');
    submenu.style.setProperty('position', 'static', 'important');
    submenu.classList.add('is-open');
    submenu.setAttribute('aria-hidden', 'false');

    // Add to open accordions array
    instance.openAccordions.push({
      button,
      submenu
    });
  }
}

/**
 * Close all open accordions
 * @param {Object} instance - PriorityNav instance
 */
function closeAllAccordions(instance) {
  instance.openAccordions.forEach(({
    button,
    submenu
  }) => {
    button.setAttribute('aria-expanded', 'false');
    submenu.style.setProperty('display', 'none', 'important');
    submenu.classList.remove('is-open');
    submenu.setAttribute('aria-hidden', 'true');
  });
  instance.openAccordions = [];
}

/***/ },

/***/ "./src/events/event-handlers.js"
/*!**************************************!*\
  !*** ./src/events/event-handlers.js ***!
  \**************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   setupEventListeners: () => (/* binding */ setupEventListeners)
/* harmony export */ });
/**
 * Event handling utilities for PriorityNav
 */

/**
 * Set up all event listeners
 * @param {Object} elements  - DOM elements
 * @param {Object} instance  - PriorityNav instance
 * @param {Object} callbacks - Callback functions
 * @return {Object} Object containing all handler functions for cleanup
 */
function setupEventListeners(elements, instance, callbacks) {
  const {
    moreButton,
    moreContainer,
    dropdown
  } = elements;
  const {
    toggleDropdown,
    closeDropdown,
    closeAllAccordions,
    toggleAccordionItem
  } = callbacks;

  // More button click handler
  const moreButtonClickHandler = e => {
    e.preventDefault();
    e.stopPropagation();
    toggleDropdown();
  };
  moreButton.addEventListener('click', moreButtonClickHandler);

  // Document click handler - close dropdown when clicking outside
  const documentClickHandler = e => {
    if (moreContainer && !moreContainer.contains(e.target) && instance.isOpen) {
      closeDropdown();
    }
  };
  document.addEventListener('click', documentClickHandler, true);

  // Document keydown handler - close on Escape
  const documentKeydownHandler = e => {
    if (e.key === 'Escape' && instance.isOpen) {
      // If accordions are open, close them first, otherwise close dropdown
      if (instance.openAccordions.length > 0) {
        closeAllAccordions();
        e.preventDefault();
      } else {
        closeDropdown();
      }
    }
  };
  document.addEventListener('keydown', documentKeydownHandler);

  // Event delegation for accordion toggles
  const dropdownClickHandler = e => {
    const toggle = e.target.closest('.priority-nav-accordion-toggle');
    if (toggle) {
      e.preventDefault();
      e.stopPropagation();
      const submenuId = toggle.getAttribute('aria-controls');
      // Use scoped lookup within this instance's dropdown to avoid cross-instance collisions
      const submenu = dropdown.querySelector(`#${submenuId}`);
      if (submenu) {
        toggleAccordionItem(toggle, submenu, instance);
      }
    }
  };
  dropdown.addEventListener('click', dropdownClickHandler);

  // Return handlers for cleanup
  return {
    moreButtonClickHandler,
    documentClickHandler,
    documentKeydownHandler,
    dropdownClickHandler
  };
}

/***/ },

/***/ "./src/layout/width-calculator.js"
/*!****************************************!*\
  !*** ./src/layout/width-calculator.js ***!
  \****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   cacheItemWidths: () => (/* binding */ cacheItemWidths),
/* harmony export */   cacheMoreButtonWidth: () => (/* binding */ cacheMoreButtonWidth),
/* harmony export */   getGap: () => (/* binding */ getGap),
/* harmony export */   hasValidWidthCache: () => (/* binding */ hasValidWidthCache)
/* harmony export */ });
/* harmony import */ var _utils_constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/constants.js */ "./src/utils/constants.js");
/* harmony import */ var _utils_dom_utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/dom-utils.js */ "./src/utils/dom-utils.js");
/**
 * Width calculation utilities for PriorityNav
 */



/**
 * Check if item widths cache is valid
 * @param {Array<number>} itemWidths  - Cached item widths
 * @param {number}        itemsLength - Number of items
 * @return {boolean} True if cache is valid
 */
function hasValidWidthCache(itemWidths, itemsLength) {
  return itemWidths.length === itemsLength && !itemWidths.some(width => width === 0);
}

/**
 * Cache the widths of all navigation items
 * Only measures if element is visible and cache is invalid
 * @param {HTMLElement}        list          - Navigation list container
 * @param {Array<HTMLElement>} items         - Navigation items
 * @param {Function}           scheduleRetry - Function to call if measurement fails
 * @return {Array<number>} Array of item widths
 */
function cacheItemWidths(list, items, scheduleRetry) {
  // Only cache if measurable
  if (!(0,_utils_dom_utils_js__WEBPACK_IMPORTED_MODULE_1__.isMeasurable)(list)) {
    return [];
  }

  // Show all items for accurate measurement
  items.forEach(item => {
    item.style.display = '';
  });

  // Force a reflow to ensure accurate measurements
  void list.offsetHeight;

  // Measure all items
  const itemWidths = items.map(item => {
    const width = (0,_utils_dom_utils_js__WEBPACK_IMPORTED_MODULE_1__.getElementWidth)(item);
    return width > 0 ? width : 0;
  });

  // If we got zero widths, schedule a retry (but don't retry indefinitely)
  if (itemWidths.some(width => width === 0) && scheduleRetry) {
    scheduleRetry();
  }
  return itemWidths;
}

/**
 * Cache the more button width if not already cached
 * @param {HTMLElement} moreButton    - More button element
 * @param {HTMLElement} moreContainer - More container element
 * @param {number|null} cachedWidth   - Previously cached width (null if not cached)
 * @return {number} Width of more button in pixels
 */
function cacheMoreButtonWidth(moreButton, moreContainer, cachedWidth) {
  if (cachedWidth !== null) {
    return cachedWidth;
  }

  // Temporarily show more button to measure it
  const wasHidden = moreContainer.style.display === 'none';
  if (wasHidden) {
    moreContainer.style.display = '';
  }

  // Force a reflow for accurate measurement
  void moreButton.offsetHeight;
  const width = (0,_utils_dom_utils_js__WEBPACK_IMPORTED_MODULE_1__.getElementWidth)(moreButton);

  // Restore previous state
  if (wasHidden) {
    moreContainer.style.display = 'none';
  }
  return width;
}

/**
 * Get gap value from list or nav styles
 * @param {HTMLElement} list - Navigation list container
 * @param {HTMLElement} nav  - Navigation element
 * @return {number} Gap in pixels
 */
function getGap(list, nav) {
  const listStyles = window.getComputedStyle(list);
  const navStyles = window.getComputedStyle(nav);
  return parseFloat(listStyles.gap) || parseFloat(navStyles.gap) || _utils_constants_js__WEBPACK_IMPORTED_MODULE_0__.DEFAULT_GAP;
}

/***/ },

/***/ "./src/priority-plus-nav.js"
/*!**********************************!*\
  !*** ./src/priority-plus-nav.js ***!
  \**********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _core_PriorityNav_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./core/PriorityNav.js */ "./src/core/PriorityNav.js");
/* harmony import */ var _styles_style_scss__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./styles/style.scss */ "./src/styles/style.scss");



// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const navElements = document.querySelectorAll('.wp-block-navigation.is-style-priority-nav');
  navElements.forEach(element => new _core_PriorityNav_js__WEBPACK_IMPORTED_MODULE_0__["default"](element));
});

/***/ },

/***/ "./src/styles/style.scss"
/*!*******************************!*\
  !*** ./src/styles/style.scss ***!
  \*******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ },

/***/ "./src/utils/constants.js"
/*!********************************!*\
  !*** ./src/utils/constants.js ***!
  \********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DEFAULT_GAP: () => (/* binding */ DEFAULT_GAP),
/* harmony export */   DEFAULT_MORE_ICON: () => (/* binding */ DEFAULT_MORE_ICON),
/* harmony export */   DEFAULT_MORE_LABEL: () => (/* binding */ DEFAULT_MORE_LABEL),
/* harmony export */   MAX_RETRY_ATTEMPTS: () => (/* binding */ MAX_RETRY_ATTEMPTS),
/* harmony export */   RETRY_INTERVAL: () => (/* binding */ RETRY_INTERVAL)
/* harmony export */ });
/**
 * Constants for PriorityNav
 */
const DEFAULT_MORE_LABEL = 'Browse';
const DEFAULT_MORE_ICON = 'none';
const DEFAULT_GAP = 8;
const RETRY_INTERVAL = 100;
const MAX_RETRY_ATTEMPTS = 20;

/***/ },

/***/ "./src/utils/dom-utils.js"
/*!********************************!*\
  !*** ./src/utils/dom-utils.js ***!
  \********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getElementWidth: () => (/* binding */ getElementWidth),
/* harmony export */   isElementVisible: () => (/* binding */ isElementVisible),
/* harmony export */   isInHamburgerMode: () => (/* binding */ isInHamburgerMode),
/* harmony export */   isMeasurable: () => (/* binding */ isMeasurable)
/* harmony export */ });
/**
 * DOM utility functions for PriorityNav
 */

/**
 * Check if an element is visible and has dimensions
 * @param {HTMLElement} element - Element to check
 * @return {boolean} True if element is visible
 */
function isElementVisible(element) {
  if (!element) {
    return false;
  }
  const styles = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  return styles.display !== 'none' && styles.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
}

/**
 * Get the visible width of an element
 * @param {HTMLElement} element - Element to measure
 * @return {number} Width in pixels, or 0 if not visible
 */
function getElementWidth(element) {
  if (!isElementVisible(element)) {
    return 0;
  }
  return element.getBoundingClientRect().width;
}

/**
 * Check if the navigation list is measurable (visible and has dimensions)
 * @param {HTMLElement} list - List element to check
 * @return {boolean} True if measurable
 */
function isMeasurable(list) {
  return isElementVisible(list);
}

/**
 * Check if navigation is in hamburger/responsive mode
 * Returns true if the menu container is hidden or in responsive overlay mode
 * @param {HTMLElement} responsiveContainer - Responsive container element
 * @param {HTMLElement} list                - Navigation list container
 * @return {boolean} True if in hamburger mode
 */
function isInHamburgerMode(responsiveContainer, list) {
  // Check if responsive container exists and is hidden
  if (responsiveContainer && (!isElementVisible(responsiveContainer) || responsiveContainer.getAttribute('aria-hidden') === 'true')) {
    return true;
  }

  // Check if the main list container is hidden (fallback detection)
  if (list && !isElementVisible(list)) {
    return true;
  }
  return false;
}

/***/ },

/***/ "./src/utils/html-utils.js"
/*!*********************************!*\
  !*** ./src/utils/html-utils.js ***!
  \*********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   escapeHtml: () => (/* binding */ escapeHtml),
/* harmony export */   extractLinkText: () => (/* binding */ extractLinkText),
/* harmony export */   removeChildTextFromParent: () => (/* binding */ removeChildTextFromParent)
/* harmony export */ });
/* global Node */

/**
 * HTML utility functions for PriorityNav
 */

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @return {string} Escaped HTML
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Extract text content from a link element
 * @param {HTMLElement} linkElement - Link element to extract text from
 * @return {string} Extracted text
 */
function extractLinkText(linkElement) {
  if (!linkElement) {
    return '';
  }

  // Get the label element if it exists (WordPress navigation uses this)
  const label = linkElement.querySelector('.wp-block-navigation-item__label');
  if (label) {
    return label.textContent.trim();
  }

  // No label - extract only direct text nodes, not from nested elements
  // Clone link and remove all child elements to get only text
  const linkClone = linkElement.cloneNode(true);
  const allChildren = linkClone.querySelectorAll('*');
  allChildren.forEach(child => child.remove());
  let text = linkClone.textContent.trim();

  // If that didn't work, try getting first text node only
  if (!text) {
    const textNodes = Array.from(linkElement.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
    if (textNodes.length > 0) {
      text = textNodes.map(node => node.textContent.trim()).filter(t => t).join(' ');
    }
  }
  return text;
}

/**
 * Remove child text from parent text to avoid contamination
 * @param {string}      parentText       - Parent item text
 * @param {HTMLElement} submenuContainer - Submenu container element
 * @return {string} Cleaned parent text
 */
function removeChildTextFromParent(parentText, submenuContainer) {
  if (!parentText || !submenuContainer) {
    return parentText;
  }
  const childTexts = [];
  submenuContainer.querySelectorAll('li a').forEach(childLink => {
    const childText = childLink.textContent.trim();
    if (childText && parentText.includes(childText)) {
      childTexts.push(childText);
    }
  });

  // Remove child texts from parent text if they're found
  if (childTexts.length > 0) {
    let cleanedText = parentText;
    childTexts.forEach(childText => {
      cleanedText = cleanedText.replace(childText, '').trim();
    });
    return cleanedText;
  }
  return parentText;
}

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Check if module exists (development only)
/******/ 		if (__webpack_modules__[moduleId] === undefined) {
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"priority-plus-nav": 0,
/******/ 			"./style-priority-plus-nav": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = globalThis["webpackChunkpriority_plus_nav"] = globalThis["webpackChunkpriority_plus_nav"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["./style-priority-plus-nav"], () => (__webpack_require__("./src/priority-plus-nav.js")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=priority-plus-nav.js.map