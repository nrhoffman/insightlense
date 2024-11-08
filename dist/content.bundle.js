/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./content/sidebar/sidebar.js":
/*!************************************!*\
  !*** ./content/sidebar/sidebar.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createSidebar: () => (/* binding */ createSidebar)
/* harmony export */ });
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
// Function that creates or shows the sidebar
function createSidebar() {
  return _createSidebar.apply(this, arguments);
}

// Helper function to create sidebar element
function _createSidebar() {
  _createSidebar = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
    var sidebar;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          sidebar = document.getElementById('insightSidebar') || createSidebarElement();
          sidebar.style.display = 'block'; // Show the sidebar

          // Event listener for close button
          document.getElementById('closeSidebarBtn').addEventListener('click', function () {
            sidebar.style.display = 'none';
          });
        case 3:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return _createSidebar.apply(this, arguments);
}
function createSidebarElement() {
  var sidebar = document.createElement('div');
  sidebar.id = 'insightSidebar';
  sidebar.innerHTML = "\n        <button id=\"closeSidebarBtn\">\u2716\uFE0F</button>\n        <h3>Summary</h3>\n        <p id=\"summary\">Open the popup, optionally enter a focus, and click summarize.</p>\n        <h3>Analysis</h3>\n        <p id=\"analysis\">Highlight text, right click, and \"Analyze\".</p>\n    ";
  document.body.appendChild(sidebar);
  return sidebar;
}

/***/ })

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
/*!****************************!*\
  !*** ./content/content.js ***!
  \****************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _sidebar_sidebar_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./sidebar/sidebar.js */ "./content/sidebar/sidebar.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }

console.log("Content script loaded");
var modelInstance = null;
var pageContent = null;
var modelReady = false;
var summarizationReady = true;
var analysisReady = true;
var initializationReady = true;

// Listener for messages from popup
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  switch (request.action) {
    case "initializeModel":
      initializeModel();
    case "showSidebar":
      (0,_sidebar_sidebar_js__WEBPACK_IMPORTED_MODULE_0__.createSidebar)();
      break;
    case 'summarizeContent':
      summarizeContent(request.focusInput);
      break;
    case 'analyzeContent':
      analyzeContent(request.pageData);
      break;
    case 'getChatBotOutput':
      getChatBotOutput(request.chatInput);
      break;
    case 'displayDefineBubble':
      displayBubble(request.selectedText, 'defineBubble');
      break;
    case 'displayFactCheckBubble':
      displayBubble(request.selectedText, 'factCheckBubble');
      break;
    case 'displayAnalysisBubble':
      displayBubble(request.selectedText, 'analysisBubble');
      break;
    case 'getStatuses':
      sendResponse({
        modelStatus: modelReady ? "yes" : "no",
        summarizationStatus: summarizationReady ? "yes" : "no",
        analysisStatus: analysisReady ? "yes" : "no",
        initializationStatus: initializationReady ? "yes" : "no",
        summaryGenStatus: checkSummary() ? "yes" : "no"
      });
      break;
  }
});

// Event listeners for updating the character count
document.addEventListener("mouseup", updateCharacterCount);
document.addEventListener("keyup", updateCharacterCount);

// Function to initialize the model
function initializeModel() {
  return _initializeModel.apply(this, arguments);
} // Helper function that initializes model with another section
function _initializeModel() {
  _initializeModel = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
    var maxChar, result, curEl, separateLines, _iterator, _step, line;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          if (modelInstance) {
            _context2.next = 57;
            break;
          }
          initializationReady = false;
          console.log("Initializing model...");

          // Request page content
          _context2.next = 6;
          return getPageContent();
        case 6:
          pageContent = _context2.sent;
          maxChar = 3800;
          result = null; // If page content exceeds maxChar, process it in chunks
          if (!(pageContent.length > maxChar)) {
            _context2.next = 47;
            break;
          }
          curEl = '';
          separateLines = pageContent.split(/\r?\n|\r|\n/g).filter(function (line) {
            return line.split(" ").length - 1 >= 3;
          });
          _iterator = _createForOfIteratorHelper(separateLines);
          _context2.prev = 13;
          _iterator.s();
        case 15:
          if ((_step = _iterator.n()).done) {
            _context2.next = 33;
            break;
          }
          line = _step.value;
          if (!((curEl + line).length < maxChar)) {
            _context2.next = 21;
            break;
          }
          curEl += line + '\n';
          _context2.next = 31;
          break;
        case 21:
          if (modelInstance) {
            _context2.next = 27;
            break;
          }
          _context2.next = 24;
          return ai.languageModel.create({
            systemPrompt: getPrompt(curEl)
          });
        case 24:
          modelInstance = _context2.sent;
          _context2.next = 30;
          break;
        case 27:
          _context2.next = 29;
          return initializeModelSection(curEl);
        case 29:
          result = _context2.sent;
        case 30:
          curEl = line + '\n';
        case 31:
          _context2.next = 15;
          break;
        case 33:
          _context2.next = 38;
          break;
        case 35:
          _context2.prev = 35;
          _context2.t0 = _context2["catch"](13);
          _iterator.e(_context2.t0);
        case 38:
          _context2.prev = 38;
          _iterator.f();
          return _context2.finish(38);
        case 41:
          if (!(curEl.trim().length > 0)) {
            _context2.next = 45;
            break;
          }
          _context2.next = 44;
          return initializeModelSection(curEl);
        case 44:
          result = _context2.sent;
        case 45:
          _context2.next = 50;
          break;
        case 47:
          _context2.next = 49;
          return ai.languageModel.create({
            systemPrompt: getPrompt(pageContent)
          });
        case 49:
          modelInstance = _context2.sent;
        case 50:
          chrome.runtime.sendMessage({
            action: "activateSendButton"
          });
          chrome.runtime.sendMessage({
            action: "activateSummaryButton"
          });
          modelReady = true;
          initializationReady = true;
          console.log("Model Initialized...");
          _context2.next = 58;
          break;
        case 57:
          console.log("Using existing model...");
        case 58:
          _context2.next = 63;
          break;
        case 60:
          _context2.prev = 60;
          _context2.t1 = _context2["catch"](0);
          console.error("Error initializing model:", _context2.t1);
        case 63:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[0, 60], [13, 35, 38, 41]]);
  }));
  return _initializeModel.apply(this, arguments);
}
function initializeModelSection(_x) {
  return _initializeModelSection.apply(this, arguments);
}
function _initializeModelSection() {
  _initializeModelSection = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee3(curEl) {
    var retries,
      delay,
      result,
      attempt,
      _args3 = arguments;
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          retries = _args3.length > 1 && _args3[1] !== undefined ? _args3[1] : 5;
          delay = _args3.length > 2 && _args3[2] !== undefined ? _args3[2] : 1000;
          result = '';
          attempt = 0;
        case 4:
          if (!(attempt < retries)) {
            _context3.next = 27;
            break;
          }
          _context3.prev = 5;
          _context3.next = 8;
          return modelInstance.prompt(getPrompt(curEl));
        case 8:
          result = _context3.sent;
          return _context3.abrupt("break", 27);
        case 12:
          _context3.prev = 12;
          _context3.t0 = _context3["catch"](5);
          console.log("Error initializing content on attempt ".concat(attempt + 1, ":"), _context3.t0);
          attempt++;
          if (!(attempt < retries)) {
            _context3.next = 23;
            break;
          }
          console.log("Retrying in ".concat(delay, "ms..."));
          _context3.next = 20;
          return new Promise(function (resolve) {
            return setTimeout(resolve, delay);
          });
        case 20:
          // Exponential backoff
          delay *= 2; // Increase delay for exponential backoff
          _context3.next = 25;
          break;
        case 23:
          console.log("Max retries reached. Returning empty result.");
          result = "Init failed after multiple attempts.";
        case 25:
          _context3.next = 4;
          break;
        case 27:
          return _context3.abrupt("return", result);
        case 28:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[5, 12]]);
  }));
  return _initializeModelSection.apply(this, arguments);
}
function getPrompt(pageContent) {
  return "You are a chatbot that will answer questions about content given.\n            Keep responses short.\n            Remember enough to answer questions later: ".concat(pageContent);
}

// Function checks if summary exists and notify popup
function checkSummary() {
  var summary = document.getElementById('summary');
  return summary.innerText !== "";
}

// Function fills the sidebar with a summary
function summarizeContent(_x2) {
  return _summarizeContent.apply(this, arguments);
} // Helper function to get or create a loading spinner
function _summarizeContent() {
  _summarizeContent = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee4(focusInput) {
    var summary, loadingSpinner, combinedSummary;
    return _regeneratorRuntime().wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          summarizationReady = false;
          summary = document.getElementById('summary');
          summary.innerHTML = '';
          loadingSpinner = getOrCreateLoadingSpinner(summary);
          _context4.next = 6;
          return generateSummary(focusInput);
        case 6:
          combinedSummary = _context4.sent;
          loadingSpinner.remove();
          summary.innerHTML = "<span>".concat(combinedSummary.replace(/\*/g, ''), "</span>");
          chrome.runtime.sendMessage({
            action: "activateAnalyzeButton"
          });
          chrome.runtime.sendMessage({
            action: "activateSummaryButton"
          });
          summarizationReady = true;
        case 12:
        case "end":
          return _context4.stop();
      }
    }, _callee4);
  }));
  return _summarizeContent.apply(this, arguments);
}
function getOrCreateLoadingSpinner(parent) {
  var loadingSpinner = document.getElementById('loadingSpinner');
  if (!loadingSpinner) {
    loadingSpinner = document.createElement('div');
    loadingSpinner.id = 'loadingSpinner';
    loadingSpinner.classList.add('spinner');
    parent.parentElement.insertBefore(loadingSpinner, parent);
  }
  return loadingSpinner;
}

// Function that fetches the web page content
function getPageContent() {
  return _getPageContent.apply(this, arguments);
} // Function that passes page content to summarization model
function _getPageContent() {
  _getPageContent = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee5() {
    var mainContent, contentTemp, contentElements, contentClean, uniqueContent;
    return _regeneratorRuntime().wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          mainContent = document.querySelectorAll('article, main, section, div');
          contentTemp = Array.from(mainContent).filter(function (element) {
            // Exclude elements with classes typically associated with non-main content
            var className = element.className.toLowerCase();
            if (className === '') {
              return false;
            }
            var isSidebarOrNav = className.includes('sidebar') || className.includes('widget') || className.includes('related') || className.includes('nav') || className.includes('footer') || className.includes('advert') || className.includes('recirc') || className.includes('ad');
            return !isSidebarOrNav;
          });
          contentElements = contentTemp.flatMap(function (element) {
            return Array.from(element.querySelectorAll('p, a, h1, h2, h3, h4, h5, h6, li, blockquote, span, figcaption, em')).filter(function (childElement) {
              // Check if the current element or its parent contains 'sidebar' or any other unwanted class
              var currentElementClass = childElement.className.toLowerCase();
              var parentElement = childElement.parentElement;
              var parentClass = parentElement ? parentElement.className.toLowerCase() : '';
              var isCurrentElementSidebar = currentElementClass.includes('sidebar') || currentElementClass.includes('widget') || currentElementClass.includes('related') || currentElementClass.includes('nav') || currentElementClass.includes('footer') || currentElementClass.includes('advert') || currentElementClass.includes('toolbar') || currentElementClass.includes('aside') || currentElementClass.includes('ad') || currentElementClass.includes('comment') || currentElementClass.includes('card') || currentElementClass.includes('episode') || currentElementClass.includes('tag') || currentElementClass.includes('recommend');
              var isParentSidebar = parentClass.includes('sidebar') || parentClass.includes('widget') || parentClass.includes('related') || parentClass.includes('nav') || parentClass.includes('footer') || parentClass.includes('advert') || parentClass.includes('toolbar') || parentClass.includes('aside') || parentClass.includes('ad') || parentClass.includes('comment') || parentClass.includes('card') || parentClass.includes('episode') || parentClass.includes('tag') || parentClass.includes('recommend');
              return !isCurrentElementSidebar && !isParentSidebar; // Exclude if either the current element or its parent is a sidebar or similar
            });
          });
          contentClean = Array.from(contentElements).map(function (element) {
            var cleanedText = element.innerText.trim(); // Remove leading/trailing space
            cleanedText = cleanedText.replace(/\s+/g, ' ').replace(/\n+/g, ' ');
            return cleanedText.length > 0 ? cleanedText : '';
          }).filter(function (text) {
            return text.length > 0;
          }).filter(function (text) {
            return text.split(/\s+/).length >= 5;
          });
          uniqueContent = Array.from(new Set(contentClean)).join('\n');
          return _context5.abrupt("return", uniqueContent);
        case 6:
        case "end":
          return _context5.stop();
      }
    }, _callee5);
  }));
  return _getPageContent.apply(this, arguments);
}
function generateSummary(_x3) {
  return _generateSummary.apply(this, arguments);
} // Helper function to summarize the page content in one pass
function _generateSummary() {
  _generateSummary = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee6(focusInput) {
    var maxChar, separateLines;
    return _regeneratorRuntime().wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          maxChar = 3800;
          if (!(pageContent.length > maxChar)) {
            _context6.next = 8;
            break;
          }
          separateLines = pageContent.split(/\r?\n|\r|\n/g).filter(function (line) {
            return line.split(" ").length - 1 >= 3;
          });
          _context6.next = 5;
          return summarizeLargePageContent(separateLines, maxChar, focusInput);
        case 5:
          return _context6.abrupt("return", _context6.sent);
        case 8:
          _context6.next = 10;
          return summarizePageContent(focusInput);
        case 10:
          return _context6.abrupt("return", _context6.sent);
        case 11:
        case "end":
          return _context6.stop();
      }
    }, _callee6);
  }));
  return _generateSummary.apply(this, arguments);
}
function summarizePageContent(_x4) {
  return _summarizePageContent.apply(this, arguments);
} // Function that breaks web content into sections for summarization
function _summarizePageContent() {
  _summarizePageContent = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee7(focusInput) {
    var summarizer, summary;
    return _regeneratorRuntime().wrap(function _callee7$(_context7) {
      while (1) switch (_context7.prev = _context7.next) {
        case 0:
          _context7.next = 2;
          return ai.summarizer.create({
            sharedContext: getSummaryContext(focusInput)
          });
        case 2:
          summarizer = _context7.sent;
          _context7.next = 5;
          return summarizer.summarize(pageContent);
        case 5:
          summary = _context7.sent;
          summarizer.destroy();
          return _context7.abrupt("return", summary);
        case 8:
        case "end":
          return _context7.stop();
      }
    }, _callee7);
  }));
  return _summarizePageContent.apply(this, arguments);
}
function summarizeLargePageContent(_x5, _x6, _x7) {
  return _summarizeLargePageContent.apply(this, arguments);
} // Function that generates the summary
function _summarizeLargePageContent() {
  _summarizeLargePageContent = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee8(separateLines, maxChar, focusInput) {
    var pageArray, curEl, summarizer, _iterator2, _step2, line, _summary, summary, combinedSummaryInput, combinedPrompt, combinedSummary;
    return _regeneratorRuntime().wrap(function _callee8$(_context8) {
      while (1) switch (_context8.prev = _context8.next) {
        case 0:
          pageArray = [];
          curEl = '';
          _context8.next = 4;
          return ai.summarizer.create({
            sharedContext: getSummaryContext(focusInput)
          });
        case 4:
          summarizer = _context8.sent;
          _iterator2 = _createForOfIteratorHelper(separateLines);
          _context8.prev = 6;
          _iterator2.s();
        case 8:
          if ((_step2 = _iterator2.n()).done) {
            _context8.next = 21;
            break;
          }
          line = _step2.value;
          if (!((curEl + line).length < maxChar)) {
            _context8.next = 14;
            break;
          }
          curEl += line + '\n';
          _context8.next = 19;
          break;
        case 14:
          _context8.next = 16;
          return getSummary(summarizer, curEl);
        case 16:
          _summary = _context8.sent;
          pageArray.push(_summary);
          curEl = line + '\n';
        case 19:
          _context8.next = 8;
          break;
        case 21:
          _context8.next = 26;
          break;
        case 23:
          _context8.prev = 23;
          _context8.t0 = _context8["catch"](6);
          _iterator2.e(_context8.t0);
        case 26:
          _context8.prev = 26;
          _iterator2.f();
          return _context8.finish(26);
        case 29:
          if (!(curEl.trim().length > 0)) {
            _context8.next = 34;
            break;
          }
          _context8.next = 32;
          return getSummary(summarizer, prompt);
        case 32:
          summary = _context8.sent;
          pageArray.push(summary);
        case 34:
          combinedSummaryInput = pageArray.join('\n');
          combinedPrompt = "Figure out main topic and summarize into a paragraph: ".concat(combinedSummaryInput.trim());
          _context8.next = 38;
          return getSummary(summarizer, combinedPrompt);
        case 38:
          combinedSummary = _context8.sent;
          summarizer.destroy();
          return _context8.abrupt("return", combinedSummary);
        case 41:
        case "end":
          return _context8.stop();
      }
    }, _callee8, null, [[6, 23, 26, 29]]);
  }));
  return _summarizeLargePageContent.apply(this, arguments);
}
function getSummary(_x8, _x9) {
  return _getSummary.apply(this, arguments);
} // Helper function to get shared context for summarization
function _getSummary() {
  _getSummary = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee9(summarizer, prompt) {
    var retries,
      delay,
      summary,
      attempt,
      _args9 = arguments;
    return _regeneratorRuntime().wrap(function _callee9$(_context9) {
      while (1) switch (_context9.prev = _context9.next) {
        case 0:
          retries = _args9.length > 2 && _args9[2] !== undefined ? _args9[2] : 5;
          delay = _args9.length > 3 && _args9[3] !== undefined ? _args9[3] : 1000;
          summary = '';
          attempt = 0;
        case 4:
          if (!(attempt < retries)) {
            _context9.next = 27;
            break;
          }
          _context9.prev = 5;
          _context9.next = 8;
          return summarizer.summarize(prompt);
        case 8:
          summary = _context9.sent;
          return _context9.abrupt("break", 27);
        case 12:
          _context9.prev = 12;
          _context9.t0 = _context9["catch"](5);
          console.log("Error summarizing content on attempt ".concat(attempt + 1, ":"), _context9.t0);
          attempt++;
          if (!(attempt < retries)) {
            _context9.next = 23;
            break;
          }
          console.log("Retrying in ".concat(delay, "ms..."));
          _context9.next = 20;
          return new Promise(function (resolve) {
            return setTimeout(resolve, delay);
          });
        case 20:
          // Exponential backoff
          delay *= 2; // Increase delay for exponential backoff
          _context9.next = 25;
          break;
        case 23:
          console.log("Max retries reached. Returning empty summary.");
          summary = "Summary failed after multiple attempts.";
        case 25:
          _context9.next = 4;
          break;
        case 27:
          return _context9.abrupt("return", summary);
        case 28:
        case "end":
          return _context9.stop();
      }
    }, _callee9, null, [[5, 12]]);
  }));
  return _getSummary.apply(this, arguments);
}
function getSummaryContext(focusInput) {
  var domain = window.location.hostname;
  return "Domain content is coming from: ".concat(domain, ".\n            Mention where the content is coming from using domain provided.\n            Only output in English.\n            Only output in trained format and language.\n            Use paragraph form.\n            Only summarize the content.\n            Keep the summary short.\n            Focus the summary on: \"").concat(focusInput, "\" if not blank.");
}

// Function that gets
function getChatBotOutput(_x10) {
  return _getChatBotOutput.apply(this, arguments);
} // Function that displays fact check bubble
function _getChatBotOutput() {
  _getChatBotOutput = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee10(input) {
    var result;
    return _regeneratorRuntime().wrap(function _callee10$(_context10) {
      while (1) switch (_context10.prev = _context10.next) {
        case 0:
          _context10.next = 2;
          return modelInstance.prompt(input);
        case 2:
          result = _context10.sent;
          chrome.runtime.sendMessage({
            action: "setChatBotOutput",
            output: result
          });
        case 4:
        case "end":
          return _context10.stop();
      }
    }, _callee10);
  }));
  return _getChatBotOutput.apply(this, arguments);
}
function displayBubble(_x11, _x12) {
  return _displayBubble.apply(this, arguments);
} // Function to make the bubble draggable
function _displayBubble() {
  _displayBubble = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee11(selectedText, type) {
    var bubble, selection, range, summaryEl, summary;
    return _regeneratorRuntime().wrap(function _callee11$(_context11) {
      while (1) switch (_context11.prev = _context11.next) {
        case 0:
          bubble = document.querySelector(".".concat(type));
          if (!bubble) {
            bubble = document.createElement("div");
            bubble.id = "".concat(type);
            bubble.classList.add("".concat(type));
            document.body.appendChild(bubble);
          }

          // Get selection position to place bubble
          selection = window.getSelection();
          range = selection.getRangeAt(0).getBoundingClientRect();
          bubble.style.top = "".concat(window.scrollY + range.top - bubble.offsetHeight - 8, "px");
          bubble.style.left = "".concat(window.scrollX + range.left, "px");
          summaryEl = document.getElementById('summary');
          summary = summaryEl.textContent; // Close bubble on click
          bubble.addEventListener("dblclick", function () {
            return bubble.remove();
          });
          makeBubbleDraggable(bubble);
          if (!(type !== "defineBubble")) {
            _context11.next = 17;
            break;
          }
          if (!(summaryEl.innerText === "")) {
            _context11.next = 16;
            break;
          }
          displayErrorMessage(bubble);
          return _context11.abrupt("return");
        case 16:
          bubble.style.color = '#ffffff';
        case 17:
          if (!(type === 'factCheckBubble' || type === 'defineBubble')) {
            _context11.next = 22;
            break;
          }
          _context11.next = 20;
          return fillInBubble(bubble, type, summary, selectedText);
        case 20:
          _context11.next = 23;
          break;
        case 22:
          if (type === 'analysisBubble') {
            fillInAnalysisBubble(bubble, summary, selectedText);
          }
        case 23:
        case "end":
          return _context11.stop();
      }
    }, _callee11);
  }));
  return _displayBubble.apply(this, arguments);
}
function makeBubbleDraggable(bubble) {
  var offsetX, offsetY;
  bubble.addEventListener("mousedown", function (e) {
    e.preventDefault();
    isDragging = true;

    // Calculate the offset
    offsetX = e.clientX - bubble.getBoundingClientRect().left;
    offsetY = e.clientY - bubble.getBoundingClientRect().top;
    var onMouseMove = function onMouseMove(e) {
      if (isDragging) {
        // Update bubble's position based on mouse movement
        bubble.style.left = "".concat(e.pageX - offsetX, "px");
        bubble.style.top = "".concat(e.pageY - offsetY, "px");
      }
    };
    var _onMouseUp = function onMouseUp() {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", _onMouseUp);
      isDragging = false;
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", _onMouseUp);
  });
}
function displayErrorMessage(bubble) {
  bubble.style.color = 'red';
  bubble.innerHTML = "\n    <div class=\"bubble-title\">Error</div>\n    <div class=\"bubble-content\">Wait until summary generation completes.</div>\n    <footer class=\"bubble-footer\">\n        <small>Click And Hold To Drag<br>Double Click Bubble To Close</small>\n    </footer>\n    ";
}
function fillInBubble(_x13, _x14, _x15, _x16) {
  return _fillInBubble.apply(this, arguments);
}
function _fillInBubble() {
  _fillInBubble = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee12(bubble, type, summary, selectedText) {
    var result, _yield$ai$languageMod, available, defaultTemperature, defaultTopK, maxTopK, session;
    return _regeneratorRuntime().wrap(function _callee12$(_context12) {
      while (1) switch (_context12.prev = _context12.next) {
        case 0:
          // Placeholder text while loading fact check result
          if (type === 'factCheckBubble') {
            bubble.innerHTML = "\n        <div class=\"bubble-title\">Fact Checker</div>\n        <div class=\"bubble-content\">Checking facts...</div>\n        <footer class=\"bubble-footer\">\n            <small>Click And Hold To Drag<br>Double Click Bubble To Close</small>\n        </footer>\n        ";
          }

          // Placeholder text while loading definition result
          else {
            bubble.innerHTML = "\n        <div class=\"bubble-title\">Define</div>\n        <div class=\"bubble-content\">Fetching definition...</div>\n        <footer class=\"bubble-footer\">\n            <small>Click And Hold To Drag<br>Double Click Bubble To Close</small>\n        </footer>\n        ";
          }
          result = '';
          _context12.prev = 2;
          _context12.next = 5;
          return ai.languageModel.capabilities();
        case 5:
          _yield$ai$languageMod = _context12.sent;
          available = _yield$ai$languageMod.available;
          defaultTemperature = _yield$ai$languageMod.defaultTemperature;
          defaultTopK = _yield$ai$languageMod.defaultTopK;
          maxTopK = _yield$ai$languageMod.maxTopK;
          if (!(available !== "no")) {
            _context12.next = 29;
            break;
          }
          session = null; // Fetch result - Further lines format the result properly
          if (!(type === 'factCheckBubble')) {
            _context12.next = 21;
            break;
          }
          _context12.next = 15;
          return ai.languageModel.create({
            systemPrompt: getFactCheckPrompt(summary)
          });
        case 15:
          session = _context12.sent;
          _context12.next = 18;
          return session.prompt("Analyze: \"".concat(selectedText, "\""));
        case 18:
          result = _context12.sent;
          _context12.next = 27;
          break;
        case 21:
          _context12.next = 23;
          return ai.languageModel.create({
            systemPrompt: "Give the definition"
          });
        case 23:
          session = _context12.sent;
          _context12.next = 26;
          return session.prompt("Define: \"".concat(selectedText, "\""));
        case 26:
          result = _context12.sent;
        case 27:
          result = formatTextResponse(result);
          session.destroy();
        case 29:
          _context12.next = 35;
          break;
        case 31:
          _context12.prev = 31;
          _context12.t0 = _context12["catch"](2);
          if (_context12.t0.message === "Other generic failures occurred.") {
            result = "Other generic failures occurred. Retrying...";
          } else {
            result = _context12.t0.message;
          }
          console.error("Error generating content:", _context12.t0);
        case 35:
          bubble.innerHTML = '';
          if (type === 'factCheckBubble') {
            bubble.innerHTML = "\n        <div class=\"bubble-title\">Fact Checker</div>\n        <div class=\"bubble-content\">".concat(result || "Error fetching result.", "</div>\n        <footer class=\"bubble-footer\">\n            <small>Click And Hold To Drag<br>Double Click Bubble To Close</small>\n        </footer>\n        ");
          } else {
            bubble.innerHTML = "\n        <div class=\"bubble-title\">Define</div>\n        <div class=\"bubble-content\">".concat(result || "Error fetching result.", "</div>\n        <footer class=\"bubble-footer\">\n            <small>Click And Hold To Drag<br>Double Click Bubble To Close</small>\n        </footer>\n        ");
          }
        case 37:
        case "end":
          return _context12.stop();
      }
    }, _callee12, null, [[2, 31]]);
  }));
  return _fillInBubble.apply(this, arguments);
}
function getFactCheckPrompt(summary) {
  return "You will be given text to fact-check with the given context: ".concat(summary, "\n\n            Only use English.\n            Ignore text you're not trained on.\n            Don't output language you're not trained on.\n            Bold Titles.\n            Fact check the text and output in this exact format without including what's in parantheses:\n                Fact Check Result: (True, Partially True, False, Unverified, Opinion)\n\n                Explanation: (Give an explanation of the fact check)\n            \n            Again: Do NOT include what is in parantheses in the format.\n        ");
}
function fillInAnalysisBubble(bubble, summary, selectedText) {
  bubble.innerHTML = '';
  bubble.innerHTML = "\n    <div class=\"bubble-title\">Analyze</div>\n    <div class=\"bubble-content\">\n        <div id=\"bubbleText\">Max Character Count: 4000</div>\n        <div id=\"currentCharCount\">Current Characters Selected: 0</div>\n        <button id=\"analyzeButton\">Analyze</button>\n    </div>\n    <footer class=\"bubble-footer\">\n        <small>Click And Hold To Drag<br>Double Click Bubble To Close</small>\n    </footer>\n    ";

  // Analyze button is pressed
  bubble.querySelector('#analyzeButton').addEventListener('click', /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
    var analysisText, loadingSpinner, filteredText, errorText;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          analysisText = document.getElementById('analysis');
          analysisText.innerHTML = '';
          loadingSpinner = getOrCreateLoadingSpinner(analysisText);
          filteredText = selectedText.split('\n').filter(function (line) {
            return (line.match(/ /g) || []).length >= 8;
          }).join('\n');
          if (!(filteredText.length === 0 || filteredText.length > 4000)) {
            _context.next = 8;
            break;
          }
          errorText = filteredText.length === 0 ? "Text must be highlighted." : "Selected characters must be under 4000.";
          displayError(errorText);
          return _context.abrupt("return");
        case 8:
          bubble.remove();
          _context.next = 11;
          return analyzeContent(filteredText);
        case 11:
          loadingSpinner.remove();
        case 12:
        case "end":
          return _context.stop();
      }
    }, _callee);
  })));
}

// Function that populates the analysis portion of the sidebar
function analyzeContent(_x17) {
  return _analyzeContent.apply(this, arguments);
} // Function that analyzes web page content
function _analyzeContent() {
  _analyzeContent = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee13(pageData) {
    var analysisContent;
    return _regeneratorRuntime().wrap(function _callee13$(_context13) {
      while (1) switch (_context13.prev = _context13.next) {
        case 0:
          analysisReady = false;
          analysisContent = document.getElementById('analysis');
          _context13.t0 = "<span>";
          _context13.next = 5;
          return analyzePageText(pageData);
        case 5:
          _context13.t1 = _context13.sent;
          analysisContent.innerHTML = _context13.t0.concat.call(_context13.t0, _context13.t1, "</span>");
          analysisReady = true;
        case 8:
        case "end":
          return _context13.stop();
      }
    }, _callee13);
  }));
  return _analyzeContent.apply(this, arguments);
}
function analyzePageText(_x18) {
  return _analyzePageText.apply(this, arguments);
} // Helper function to get the analysis prompt
function _analyzePageText() {
  _analyzePageText = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee14(pageData) {
    var retries,
      delay,
      result,
      summary,
      session,
      attempt,
      _args14 = arguments;
    return _regeneratorRuntime().wrap(function _callee14$(_context14) {
      while (1) switch (_context14.prev = _context14.next) {
        case 0:
          retries = _args14.length > 1 && _args14[1] !== undefined ? _args14[1] : 5;
          delay = _args14.length > 2 && _args14[2] !== undefined ? _args14[2] : 1000;
          result = '';
          summary = document.getElementById('summary').textContent;
          _context14.next = 6;
          return ai.languageModel.create({
            systemPrompt: getAnalysisPrompt(summary)
          });
        case 6:
          session = _context14.sent;
          attempt = 0;
        case 8:
          if (!(attempt < retries)) {
            _context14.next = 31;
            break;
          }
          _context14.prev = 9;
          _context14.next = 12;
          return session.prompt("Analyze: \"".concat(pageData, "\""));
        case 12:
          result = _context14.sent;
          return _context14.abrupt("break", 31);
        case 16:
          _context14.prev = 16;
          _context14.t0 = _context14["catch"](9);
          console.log("Error analyzing content on attempt ".concat(attempt + 1, ":"), _context14.t0);
          attempt++;
          if (!(attempt < retries)) {
            _context14.next = 27;
            break;
          }
          console.log("Retrying in ".concat(delay, "ms..."));
          _context14.next = 24;
          return new Promise(function (resolve) {
            return setTimeout(resolve, delay);
          });
        case 24:
          delay *= 2;
          _context14.next = 29;
          break;
        case 27:
          console.log("Max retries reached. Returning empty analysis.");
          result = "Analysis failed after multiple attempts.";
        case 29:
          _context14.next = 8;
          break;
        case 31:
          session.destroy();
          return _context14.abrupt("return", formatTextResponse(result));
        case 33:
        case "end":
          return _context14.stop();
      }
    }, _callee14, null, [[9, 16]]);
  }));
  return _analyzePageText.apply(this, arguments);
}
function getAnalysisPrompt(summary) {
  return "You will be given text to analyze with the given context: ".concat(summary, "\n\n            Only use English.\n            Ignore text you're not trained on.\n            Don't output language you're not trained on.\n            Bold Titles.\n            Analyze the text and output in this exact format without including what's in parantheses:\n                1. Attributes:\n                - Sentiment(e.g., Positive, Negative, Neutral): Explanation\n                - Emotion(What emotion can be interpreted from the text): Explanation\n                - Toxicity(e.g., High, Moderate, Low, None): Explanation\n                - Truthfulness(e.g., High, Moderate, Low, Uncertain): Explanation\n                - Bias(e.g., High, Moderate, Low, None): Explanation\n                \n                2. Logical Falacies: (Identify any logical fallacies present and provide a brief explanation for each)\n                - [List of logical fallacies and explanations]\n                \n                3. Ulterior Motives: (Assess if there are any ulterior motives behind the text and explain)\n                - [List of potential ulterior motives]\n\n                4. Overall Analysis: (Provide an overall analysis of the text)\n                - [Detailed analysis of the implications and context of the text]\n            \n            Again: Do NOT include what is in parantheses in the format.\n        ");
}

// Function to update the character count
function updateCharacterCount() {
  currentElementClass = document.getElementById("currentCharCount");
  if (currentElementClass) {
    var selectedText = window.getSelection().toString();
    var characterCount = 0;
    try {
      characterCount = selectedText.length;
    } catch (error) {
      return;
    }
    if (characterCount > 0) {
      currentElementClass.innerText = "Current Characters Selected: ".concat(characterCount);
      if (characterCount > 4000) {
        currentElementClass.style.color = 'red';
      } else {
        currentElementClass.style.color = 'white';
      }
    }
  }
}

// Function to fetch the selected content of the webpage
function getSelectionContent() {
  var contentElements = window.getSelection();
  return contentElements.toString();
}

// Function to display error when analyze button is pressed and conditions are met
function displayError(message) {
  var analyzeBoxContainer = document.querySelector('bubble-content');
  var errorMessage = document.querySelector('.error-message');
  if (!errorMessage) {
    errorMessage = document.createElement('div');
    errorMessage.classList.add('error-message');
    errorMessage.style.color = 'red';
    errorMessage.style.marginBottom = '10px';
    errorMessage.style.textAlign = 'center';
    errorMessage.style.fontSize = '1em';
    errorMessage.style.fontWeight = '500';
    analyzeBoxContainer.insertBefore(errorMessage, analyzeButton);
  }
  errorMessage.innerText = message;
}

// Function that formats response from model
function formatTextResponse(response) {
  // Replace `##text` with ``
  var htmlData = response.replace(/## (.*?)(?=\n|$)/g, "");

  // Replace `**text**` with `<strong>text</strong>`
  htmlData = htmlData.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Replace single `*` at the start of a line with a bullet point
  htmlData = htmlData.replace(/^\s*\*\s+/gm, "• ");

  // Replace remaining single `*text*` with `<em>text</em>` (italic)
  htmlData = htmlData.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Convert line breaks to HTML <br> tags
  htmlData = htmlData.replace(/\n/g, "<br>");
  return htmlData;
}
})();

/******/ })()
;
//# sourceMappingURL=content.bundle.js.map