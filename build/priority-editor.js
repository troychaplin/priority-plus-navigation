/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@wordpress/icons/build-module/library/plus-circle.js"
/*!***************************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/plus-circle.js ***!
  \***************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ plus_circle_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__);
// packages/icons/src/library/plus-circle.tsx


var plus_circle_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(
  _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path,
  {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M7.404 16.596a6.5 6.5 0 1 0 9.192-9.192 6.5 6.5 0 0 0-9.192 9.192ZM6.344 6.343a8 8 0 1 0 11.313 11.314A8 8 0 0 0 6.343 6.343Zm4.906 9.407v-3h-3v-1.5h3v-3h1.5v3h3v1.5h-3v3h-1.5Z"
  }
) });

//# sourceMappingURL=plus-circle.js.map


/***/ },

/***/ "./src/variation/block.js"
/*!********************************!*\
  !*** ./src/variation/block.js ***!
  \********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/blocks */ "@wordpress/blocks");
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_blocks__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/plus-circle.js");
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/hooks */ "@wordpress/hooks");
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_hooks__WEBPACK_IMPORTED_MODULE_3__);
/**
 * WordPress dependencies
 */





/**
 * Register Priority+ Nav block variation
 */
(0,_wordpress_blocks__WEBPACK_IMPORTED_MODULE_1__.registerBlockVariation)('core/navigation', {
  name: 'priority-nav',
  title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Priority Plus Nav', 'priority-nav'),
  description: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('A responsive navigation that automatically moves overflow items to a "More" dropdown.', 'priority-nav'),
  icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_2__["default"],
  scope: ['inserter', 'transform'],
  attributes: {
    className: 'is-style-priority-nav',
    overlayMenu: 'never',
    priorityNavEnabled: true,
    priorityNavMoreLabel: 'Browse',
    priorityNavMoreIcon: 'none',
    priorityNavMoreBackgroundColor: undefined,
    priorityNavMoreTextColor: undefined
  },
  isActive: (blockAttributes, variationAttributes) => {
    return blockAttributes.className?.includes(variationAttributes.className);
  }
});

/**
 * Add Priority+ attributes to core/navigation block
 */
(0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_3__.addFilter)('blocks.registerBlockType', 'priority-nav/extend-core-navigation', (settings, name) => {
  if (name !== 'core/navigation') {
    return settings;
  }
  return {
    ...settings,
    attributes: {
      ...settings.attributes,
      priorityNavEnabled: {
        type: 'boolean',
        default: false
      },
      priorityNavMoreLabel: {
        type: 'string',
        default: 'Browse'
      },
      priorityNavMoreIcon: {
        type: 'string',
        default: 'none'
      },
      priorityNavMoreBackgroundColor: {
        type: 'string'
      },
      priorityNavMoreTextColor: {
        type: 'string'
      },
      priorityNavMorePadding: {
        type: 'object',
        default: undefined
      }
    }
  };
});

/***/ },

/***/ "./src/variation/controls.js"
/*!***********************************!*\
  !*** ./src/variation/controls.js ***!
  \***********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/hooks */ "@wordpress/hooks");
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_hooks__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/compose */ "@wordpress/compose");
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_compose__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__);
/**
 * WordPress dependencies
 */






/**
 * Add Inspector Controls to core/navigation block
 */

const withPriorityNavControls = (0,_wordpress_compose__WEBPACK_IMPORTED_MODULE_4__.createHigherOrderComponent)(BlockEdit => {
  return props => {
    const {
      name,
      attributes,
      setAttributes
    } = props;
    if (name !== 'core/navigation') {
      return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(BlockEdit, {
        ...props
      });
    }
    const {
      priorityNavEnabled,
      priorityNavMoreLabel,
      priorityNavMoreIcon,
      priorityNavMoreBackgroundColor,
      priorityNavMoreTextColor,
      priorityNavMorePadding
    } = attributes;

    // Get spacing sizes from theme.
    const spacingSizes = (0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.useSetting)('spacing.spacingSizes') || [];

    // Helper to check if padding has values.
    const hasPaddingValue = () => {
      if (!priorityNavMorePadding) {
        return false;
      }
      return Object.keys(priorityNavMorePadding).length > 0;
    };
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.Fragment, {
      children: [priorityNavEnabled ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
        className: "priority-nav-editor-wrapper",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(BlockEdit, {
          ...props
        })
      }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(BlockEdit, {
        ...props
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.InspectorControls, {
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.__experimentalToolsPanel, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Priority Plus Settings', 'priority-nav'),
          resetAll: () => setAttributes({
            priorityNavMoreLabel: 'Browse',
            priorityNavMoreIcon: 'none',
            priorityNavMoreBackgroundColor: undefined,
            priorityNavMoreTextColor: undefined
          }),
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.__experimentalToolsPanelItem, {
            hasValue: () => !!priorityNavMoreLabel,
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('More Button Label', 'priority-nav'),
            onDeselect: () => setAttributes({
              priorityNavMoreLabel: 'Browse'
            }),
            isShownByDefault: true,
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.TextControl, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('More Button Label', 'priority-nav'),
              value: priorityNavMoreLabel,
              onChange: value => setAttributes({
                priorityNavMoreLabel: value
              }),
              help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Text displayed on the "More" button', 'priority-nav')
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.__experimentalToolsPanelItem, {
            hasValue: () => !!priorityNavMoreIcon,
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('More Button Icon', 'priority-nav'),
            onDeselect: () => setAttributes({
              priorityNavMoreIcon: 'none'
            }),
            isShownByDefault: true,
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.SelectControl, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('More Button Icon', 'priority-nav'),
              value: priorityNavMoreIcon,
              options: [{
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('None', 'priority-nav'),
                value: 'none'
              }, {
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Chevron Down (▼)', 'priority-nav'),
                value: 'chevron'
              }, {
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Plus (+)', 'priority-nav'),
                value: 'plus'
              }, {
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Menu (≡)', 'priority-nav'),
                value: 'menu'
              }],
              onChange: value => setAttributes({
                priorityNavMoreIcon: value
              })
            })
          })]
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.InspectorControls, {
        group: "styles",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.PanelColorSettings, {
          title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Priority Plus Colors', 'priority-nav'),
          colorSettings: [{
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Button Text Color', 'priority-nav'),
            value: priorityNavMoreTextColor,
            onChange: color => setAttributes({
              priorityNavMoreTextColor: color || undefined
            }),
            clearable: true
          }, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Button Background Color', 'priority-nav'),
            value: priorityNavMoreBackgroundColor,
            onChange: color => setAttributes({
              priorityNavMoreBackgroundColor: color || undefined
            }),
            clearable: true
          }]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.__experimentalToolsPanel, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Priority Plus Button', 'priority-nav'),
          resetAll: () => setAttributes({
            priorityNavMorePadding: undefined
          }),
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.__experimentalToolsPanelItem, {
            hasValue: hasPaddingValue,
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Padding', 'priority-nav'),
            onDeselect: () => setAttributes({
              priorityNavMorePadding: undefined
            }),
            isShownByDefault: true,
            children: spacingSizes.length > 0 ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.__experimentalSpacingSizesControl, {
              values: priorityNavMorePadding,
              onChange: value => setAttributes({
                priorityNavMorePadding: value
              }),
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Button Padding', 'priority-nav'),
              sides: ['top', 'right', 'bottom', 'left'],
              units: ['px', 'em', 'rem', 'vh', 'vw']
            }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.BoxControl, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Button Padding', 'priority-nav'),
              values: priorityNavMorePadding,
              onChange: value => setAttributes({
                priorityNavMorePadding: value
              }),
              sides: ['top', 'right', 'bottom', 'left'],
              units: ['px', 'em', 'rem', 'vh', 'vw'],
              allowReset: true
            })
          })
        })]
      })]
    });
  };
}, 'withPriorityNavControls');
(0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_1__.addFilter)('editor.BlockEdit', 'priority-nav/add-priority-nav-controls', withPriorityNavControls);

/***/ },

/***/ "@wordpress/block-editor"
/*!*************************************!*\
  !*** external ["wp","blockEditor"] ***!
  \*************************************/
(module) {

module.exports = window["wp"]["blockEditor"];

/***/ },

/***/ "@wordpress/blocks"
/*!********************************!*\
  !*** external ["wp","blocks"] ***!
  \********************************/
(module) {

module.exports = window["wp"]["blocks"];

/***/ },

/***/ "@wordpress/components"
/*!************************************!*\
  !*** external ["wp","components"] ***!
  \************************************/
(module) {

module.exports = window["wp"]["components"];

/***/ },

/***/ "@wordpress/compose"
/*!*********************************!*\
  !*** external ["wp","compose"] ***!
  \*********************************/
(module) {

module.exports = window["wp"]["compose"];

/***/ },

/***/ "@wordpress/hooks"
/*!*******************************!*\
  !*** external ["wp","hooks"] ***!
  \*******************************/
(module) {

module.exports = window["wp"]["hooks"];

/***/ },

/***/ "@wordpress/i18n"
/*!******************************!*\
  !*** external ["wp","i18n"] ***!
  \******************************/
(module) {

module.exports = window["wp"]["i18n"];

/***/ },

/***/ "@wordpress/primitives"
/*!************************************!*\
  !*** external ["wp","primitives"] ***!
  \************************************/
(module) {

module.exports = window["wp"]["primitives"];

/***/ },

/***/ "react/jsx-runtime"
/*!**********************************!*\
  !*** external "ReactJSXRuntime" ***!
  \**********************************/
(module) {

module.exports = window["ReactJSXRuntime"];

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
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
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
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!********************************!*\
  !*** ./src/priority-editor.js ***!
  \********************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _variation_block__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./variation/block */ "./src/variation/block.js");
/* harmony import */ var _variation_controls__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./variation/controls */ "./src/variation/controls.js");
/**
 * Internal dependencies
 */


// import './styles/editor.scss';
})();

/******/ })()
;
//# sourceMappingURL=priority-editor.js.map