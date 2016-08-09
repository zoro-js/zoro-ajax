(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("zoro-base"));
	else if(typeof define === 'function' && define.amd)
		define(["ZoroBase"], factory);
	else if(typeof exports === 'object')
		exports["ZoroAjax"] = factory(require("zoro-base"));
	else
		root["ZoroAjax"] = factory(root["ZoroBase"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_2__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	* @Author: Zhang Yingya(hzzhangyingya) <zyy>
	* @Date:   2016-08-01T14:55:04+08:00
	* @Email:  zyy7259@gmail.com
	* @Last modified by:   zyy
	* @Last modified time: 2016-08-01T15:22:04+08:00
	*/

	var obj = {
	  ajax: __webpack_require__(1),
	  json: __webpack_require__(9),
	  upload: __webpack_require__(10)
	};

	module.exports = obj;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	* @Author: Zhang Yingya(hzzhangyingya) <zyy>
	* @Date:   2016-01-06T16:44:26+08:00
	* @Email:  zyy7259@gmail.com
	* @Last modified by:   zyy
	* @Last modified time: 2016-08-01T15:04:59+08:00
	*/

	var util = __webpack_require__(2);
	var ProxyXhr = __webpack_require__(3);
	var ProxyUpload = __webpack_require__(7);
	var ProxyFrame = __webpack_require__(8);

	var cache = {};
	var doFilter = util.f;

	function getProxyByMode(options) {
	  var mode = options.mode;
	  var Constructor = ProxyXhr;
	  // 如果是 IE 8/9, 那么使用 iframe 模式
	  if (!window.FormData) {
	    mode = 'iframe';
	  }
	  if (mode === 'iframe') {
	    Constructor = options.upload ? ProxyUpload : ProxyFrame;
	  }
	  return new Constructor(options);
	}

	function getProxy(options) {
	  var upload = options.upload = (options.headers || util.o)['Content-Type'] === 'multipart/form-data';
	  var origin1 = (location.protocol + '//' + location.host).toLowerCase();
	  var origin2 = util.url2origin(options.url);
	  var cors = origin1 !== origin2;
	  if (!upload && !cors && !options.mode) {
	    return new ProxyXhr(options);
	  }
	  return getProxyByMode(options);
	}

	function clear(sn) {
	  var c = cache[sn];
	  if (!c) {
	    return;
	  }
	  c.req.destroy();
	  delete cache[sn];
	}

	function parseExtData(c, data) {
	  data = {
	    data: data
	  };
	  var keys = c.result.headers;
	  if (keys) {
	    data.headers = c.req.header(keys);
	  }
	  return data;
	}

	function callback(sn, type, data) {
	  var c = cache[sn];
	  if (!c) {
	    return;
	  }
	  if (type === 'onload' && c.result) {
	    data = parseExtData(c, data);
	  }
	  clear(sn);
	  var event = {
	    type: type,
	    result: data
	  };
	  doFilter(event);
	  if (!event.stopped) {
	    c[type](event.result);
	  }
	}

	function onLoad(sn, data) {
	  callback(sn, 'onload', data);
	}

	function onError(sn, error) {
	  callback(sn, 'onerror', error);
	}

	function mergeUrl(url, data) {
	  var sep = util.genUrlSep(url);
	  data = data || '';
	  if (util.isObject(data)) {
	    data = util.object2query(data);
	  }
	  if (data) {
	    url += sep + data;
	  }
	  return url;
	}

	/**
	 * ajax
	 * @param  {String} url     请求地址
	 * @param  {Object} options 配置参数
	 * @property {String} [options.method='GET'] 请求方法, 可选值如下
	 * - 'GET'
	 * - 'POST'
	 * @property {Boolean} [options.sync=false] 是否是同步请求
	 * @property {Object|String} [options.query] 'GET' 请求的请求参数, 会拼接到 url
	 * @property {Object|String} [options.data] 'POST' 请求要发送的数据, 如果是 'GET' 请求, 那么此参数会被拼接到 url
	 * @property {Object} [options.headers] 头信息
	 * @property {Boolean} [options.cookie=false] 是否设置`withCredentials`
	 * @property {Number} [options.timeout=6000] ms, 超时时间, 0 表示不设置超时
	 * @property {String} [options.type='text'] 请求成功时, 返回的数据格式, 可选的值如下
	 * - 'text': 文本
	 * - 'json': 对象
	 * @property {Function} [options.onbeforesend] 发送之前的回调
	 * @property {Function} [options.onload] 请求完成回调函数
	 * @property {Function} [options.onerror] 请求失败回调函数
	 * @property {String} [options.mode='auto'] 跨域或者文件上传所使用的模式
	 * - 'auto': 自动, 高版本使用 HTML5, 低版本使用 iframe
	 * - 'iframe': 全部使用 iframe
	 * @property {Object} [options.result] onload回调时需包含的额外结果, 可选如下
	 * - headers, 字符串或字符串数组, 那么会返回相应的头信息
	 * @return {String}         序列号
	 */
	function ajax(url, options) {
	  options = options || {};
	  // cache callback
	  var sn = util.uniqueID();
	  var c = {
	    result: options.result,
	    onload: options.onload || util.f,
	    onerror: options.onerror || util.f
	  };
	  cache[sn] = c;
	  options.onload = onLoad.bind(null, sn);
	  options.onerror = onError.bind(null, sn);
	  // append query
	  if (options.query) {
	    url = mergeUrl(url, options.query);
	  }
	  // append data for get
	  var method = options.method || '';
	  if ((!method || /get/i.test(method)) && options.data) {
	    url = mergeUrl(url, options.data);
	    options.data = null;
	  }
	  options.url = url;
	  c.req = getProxy(options);
	  return sn;
	}

	ajax.filter = function (filter) {
	  if (util.isFunction(filter)) {
	    doFilter = filter;
	  }
	};

	ajax.abort = function (sn) {
	  var c = cache[sn];
	  if (c) {
	    c.req.abort();
	  }
	};

	module.exports = ajax;

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	* @Author: Zhang Yingya(hzzhangyingya) <zyy>
	* @Date:   2016-01-08T16:37:15+08:00
	* @Email:  zyy7259@gmail.com
	* @Last modified by:   zyy
	* @Last modified time: 2016-08-01T14:56:19+08:00
	*/

	var util = __webpack_require__(2);
	var pu = __webpack_require__(4);
	var Proxy = __webpack_require__(5);

	function ProxyXhr(options) {
	  var self = this;
	  // addListeners
	  if (options.onuploading) {
	    self.on('uploading', options.onuploading);
	  }
	  Proxy.call(self, options);
	}

	var sp = Proxy.prototype;
	var pro = ProxyXhr.prototype = Object.create(sp);

	pro.doSend = function () {
	  var self = this;
	  var options = self.options;
	  var headers = options.headers;
	  var xhr = self.xhr = new XMLHttpRequest();
	  // add event listener
	  // upload progress
	  if (headers['Content-Type'] === 'multipart/form-data') {
	    delete headers['Content-Type'];
	    xhr.upload.onprogress = self.onProgress.bind(self);
	    xhr.upload.onload = self.onProgress.bind(self);
	    var data = options.data;
	    options.data = new FormData();
	    if (data) {
	      pu.getKeys(data, options.putFileAtEnd).forEach(function (key) {
	        var value = data[key];
	        if (value.tagName && value.tagName.toUpperCase() === 'INPUT') {
	          if (value.type === 'file') {
	            [].forEach.call(value.files, function (file) {
	              options.data.append(util.dataset(value, 'name') || value.name || file.name || 'file-' + util.uniqueID(), file);
	            });
	          }
	        } else {
	          options.data.append(key, value);
	        }
	      });
	    }
	  }
	  // state change
	  xhr.onreadystatechange = self.onStateChange.bind(self);
	  // timeout
	  if (options.timeout !== 0) {
	    self.timer = setTimeout(self.onTimeout.bind(self), options.timeout);
	  }
	  // prepare and send
	  xhr.open(options.method, options.url, !options.sync);
	  Object.keys(headers).forEach(function (key) {
	    xhr.setRequestHeader(key, headers[key]);
	  });
	  if (!!options.cookie && 'withCredentials' in xhr) {
	    xhr.withCredentials = true;
	  }
	  xhr.send(options.data);
	  self.afterSend();
	};

	pro.onProgress = function (event) {
	  // IE 10很神奇的, 在upload的load事件之后还会再触发一次progress, 并且loaded比total大。。。
	  if (event.lengthComputable && event.loaded <= event.total) {
	    this.emit('uploading', event);
	  }
	};

	pro.onStateChange = function () {
	  var self = this;
	  var xhr = self.xhr;
	  if (xhr.readyState === 4) {
	    self.onLoad({
	      status: xhr.status,
	      result: xhr.responseText || ''
	    });
	  }
	};

	pro.getResponseHeader = function (key) {
	  var xhr = this.xhr;
	  return !xhr ? '' : xhr.getResponseHeader(key);
	};

	pro.destroy = function () {
	  var self = this;
	  // clear timeout
	  clearTimeout(self.timer);
	  // clear request
	  try {
	    self.xhr.onreadystatechange = util.f;
	    self.xhr.abort();
	  } catch (e) {
	    console.error('ignore', e);
	  }
	  sp.destroy.call(self);
	};

	module.exports = ProxyXhr;

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';

	/*
	* @Author: Zhang Yingya(hzzhangyingya)
	* @Date:   2016-06-03 15:07:41
	* @Last Modified by:   Zhang Yingya(hzzhangyingya)
	* @Last Modified time: 2016-06-03 16:13:45
	*/

	var util = {};

	util.isFileInput = function (value) {
	  return value.tagName && value.tagName.toUpperCase() === 'INPUT' || window.Blob && value instanceof window.Blob;
	};

	/**
	 * 获取所有的 keys
	 * putFileAtEnd 表示将文件对应的 keys 放在最后
	 */
	util.getKeys = function (data, putFileAtEnd) {
	  var keys = Object.keys(data);
	  if (putFileAtEnd) {
	    keys.sort(function (key1, key2) {
	      var value1IsFileInput = util.isFileInput(data[key1]);
	      var value2IsFileInput = util.isFileInput(data[key2]);
	      // 如果两个值相等, 说明都是文件或者都不是文件, 那么顺序不变
	      if (value1IsFileInput === value2IsFileInput) {
	        return 0;
	      } else {
	        return value1IsFileInput ? 1 : -1;
	      }
	    });
	  }
	  return keys;
	};

	module.exports = util;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	* @Author: Zhang Yingya(hzzhangyingya) <zyy>
	* @Date:   2016-01-08T16:38:53+08:00
	* @Email:  zyy7259@gmail.com
	* @Last modified by:   zyy
	* @Last modified time: 2016-08-01T15:03:56+08:00
	*/

	var util = __webpack_require__(2);
	var f = util.f;
	var EventEmitter = __webpack_require__(6);

	function Proxy(options) {
	  var self = this;
	  // addListeners
	  if (options.onload) {
	    self.once('load', options.onload);
	  }
	  if (options.onerror) {
	    self.once('error', options.onerror);
	  }
	  if (options.onbeforesend) {
	    self.once('beforesend', options.onbeforesend);
	  }
	  if (options.onaftersend) {
	    self.once('aftersend', options.onaftersend);
	  }
	  // handle options
	  options = self.options = util.fetch({
	    method: 'GET',
	    url: '',
	    sync: false,
	    data: null,
	    headers: {},
	    cookie: false,
	    timeout: 6000,
	    type: 'text',
	    // 文件上传用到的参数
	    form: null,
	    input: null,
	    // 是否将文件放在末尾
	    putFileAtEnd: false,
	    // iframe 模式用到的代理地址
	    proxyUrl: ''
	  }, options);
	  // headers
	  var headers = options.headers;
	  var contentType = 'Content-Type';
	  if (util.notexist(headers[contentType])) {
	    headers[contentType] = 'application/x-www-form-urlencoded';
	  }
	  self.send();
	}

	var pro = Proxy.prototype = Object.create(EventEmitter.prototype);

	pro.send = function () {
	  var self = this;
	  var options = self.options;
	  setTimeout(function () {
	    try {
	      try {
	        self.emit('beforesend', options);
	      } catch (e) {
	        console.error('ignore', e);
	      }
	      self.doSend();
	    } catch (e) {
	      console.error('ignore', e);
	      self.onError('serverError', '请求失败:' + e.message);
	    }
	  }, 0);
	};

	pro.doSend = f;

	pro.afterSend = function () {
	  var self = this;
	  setTimeout(function () {
	    self.emit('aftersend', self.options);
	  }, 0);
	};

	pro.onLoad = function (event) {
	  var self = this;
	  var options = self.options;
	  var status = event.status;
	  var result = event.result;
	  // check status
	  if (('' + status).indexOf('2') !== 0) {
	    self.onError('serverError', '服务器返回异常状态', {
	      status: status,
	      result: result
	    });
	    return;
	  }
	  // parse json
	  if (options.type === 'json') {
	    try {
	      result = JSON.parse(result);
	    } catch (e) {
	      console.error('ignore', e);
	      self.onError('parseError', result);
	      return;
	    }
	  }
	  // onload
	  self.emit('load', result);
	};

	pro.onError = function (code, message, ext) {
	  var obj = util.isObject(ext) ? ext : {};
	  obj.code = code || 'error';
	  obj.message = message || '发生错误';
	  this.emit('error', obj);
	};

	pro.onTimeout = function () {
	  this.onError('timeout', '请求超时');
	};

	pro.abort = function () {
	  this.onError('abort', '客户端中止');
	};

	pro.header = function (key) {
	  var self = this;
	  if (!util.isArray(key)) {
	    return self.getResponseHeader(key || '');
	  }
	  var result = {};
	  key.forEach(function (k) {
	    result[k] = self.header(k);
	  });
	  return result;
	};

	pro.getResponseHeader = f;

	pro.destroy = f;

	module.exports = Proxy;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * EventEmitter v4.2.11 - git.io/ee
	 * Unlicense - http://unlicense.org/
	 * Oliver Caldwell - http://oli.me.uk/
	 * @preserve
	 */

	;(function () {
	    'use strict';

	    /**
	     * Class for managing events.
	     * Can be extended to provide event functionality in other classes.
	     *
	     * @class EventEmitter Manages event registering and emitting.
	     */
	    function EventEmitter() {}

	    // Shortcuts to improve speed and size
	    var proto = EventEmitter.prototype;
	    var exports = this;
	    var originalGlobalValue = exports.EventEmitter;

	    /**
	     * Finds the index of the listener for the event in its storage array.
	     *
	     * @param {Function[]} listeners Array of listeners to search through.
	     * @param {Function} listener Method to look for.
	     * @return {Number} Index of the specified listener, -1 if not found
	     * @api private
	     */
	    function indexOfListener(listeners, listener) {
	        var i = listeners.length;
	        while (i--) {
	            if (listeners[i].listener === listener) {
	                return i;
	            }
	        }

	        return -1;
	    }

	    /**
	     * Alias a method while keeping the context correct, to allow for overwriting of target method.
	     *
	     * @param {String} name The name of the target method.
	     * @return {Function} The aliased method
	     * @api private
	     */
	    function alias(name) {
	        return function aliasClosure() {
	            return this[name].apply(this, arguments);
	        };
	    }

	    /**
	     * Returns the listener array for the specified event.
	     * Will initialise the event object and listener arrays if required.
	     * Will return an object if you use a regex search. The object contains keys for each matched event. So /ba[rz]/ might return an object containing bar and baz. But only if you have either defined them with defineEvent or added some listeners to them.
	     * Each property in the object response is an array of listener functions.
	     *
	     * @param {String|RegExp} evt Name of the event to return the listeners from.
	     * @return {Function[]|Object} All listener functions for the event.
	     */
	    proto.getListeners = function getListeners(evt) {
	        var events = this._getEvents();
	        var response;
	        var key;

	        // Return a concatenated array of all matching events if
	        // the selector is a regular expression.
	        if (evt instanceof RegExp) {
	            response = {};
	            for (key in events) {
	                if (events.hasOwnProperty(key) && evt.test(key)) {
	                    response[key] = events[key];
	                }
	            }
	        }
	        else {
	            response = events[evt] || (events[evt] = []);
	        }

	        return response;
	    };

	    /**
	     * Takes a list of listener objects and flattens it into a list of listener functions.
	     *
	     * @param {Object[]} listeners Raw listener objects.
	     * @return {Function[]} Just the listener functions.
	     */
	    proto.flattenListeners = function flattenListeners(listeners) {
	        var flatListeners = [];
	        var i;

	        for (i = 0; i < listeners.length; i += 1) {
	            flatListeners.push(listeners[i].listener);
	        }

	        return flatListeners;
	    };

	    /**
	     * Fetches the requested listeners via getListeners but will always return the results inside an object. This is mainly for internal use but others may find it useful.
	     *
	     * @param {String|RegExp} evt Name of the event to return the listeners from.
	     * @return {Object} All listener functions for an event in an object.
	     */
	    proto.getListenersAsObject = function getListenersAsObject(evt) {
	        var listeners = this.getListeners(evt);
	        var response;

	        if (listeners instanceof Array) {
	            response = {};
	            response[evt] = listeners;
	        }

	        return response || listeners;
	    };

	    /**
	     * Adds a listener function to the specified event.
	     * The listener will not be added if it is a duplicate.
	     * If the listener returns true then it will be removed after it is called.
	     * If you pass a regular expression as the event name then the listener will be added to all events that match it.
	     *
	     * @param {String|RegExp} evt Name of the event to attach the listener to.
	     * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.addListener = function addListener(evt, listener) {
	        var listeners = this.getListenersAsObject(evt);
	        var listenerIsWrapped = typeof listener === 'object';
	        var key;

	        for (key in listeners) {
	            if (listeners.hasOwnProperty(key) && indexOfListener(listeners[key], listener) === -1) {
	                listeners[key].push(listenerIsWrapped ? listener : {
	                    listener: listener,
	                    once: false
	                });
	            }
	        }

	        return this;
	    };

	    /**
	     * Alias of addListener
	     */
	    proto.on = alias('addListener');

	    /**
	     * Semi-alias of addListener. It will add a listener that will be
	     * automatically removed after its first execution.
	     *
	     * @param {String|RegExp} evt Name of the event to attach the listener to.
	     * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.addOnceListener = function addOnceListener(evt, listener) {
	        return this.addListener(evt, {
	            listener: listener,
	            once: true
	        });
	    };

	    /**
	     * Alias of addOnceListener.
	     */
	    proto.once = alias('addOnceListener');

	    /**
	     * Defines an event name. This is required if you want to use a regex to add a listener to multiple events at once. If you don't do this then how do you expect it to know what event to add to? Should it just add to every possible match for a regex? No. That is scary and bad.
	     * You need to tell it what event names should be matched by a regex.
	     *
	     * @param {String} evt Name of the event to create.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.defineEvent = function defineEvent(evt) {
	        this.getListeners(evt);
	        return this;
	    };

	    /**
	     * Uses defineEvent to define multiple events.
	     *
	     * @param {String[]} evts An array of event names to define.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.defineEvents = function defineEvents(evts) {
	        for (var i = 0; i < evts.length; i += 1) {
	            this.defineEvent(evts[i]);
	        }
	        return this;
	    };

	    /**
	     * Removes a listener function from the specified event.
	     * When passed a regular expression as the event name, it will remove the listener from all events that match it.
	     *
	     * @param {String|RegExp} evt Name of the event to remove the listener from.
	     * @param {Function} listener Method to remove from the event.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.removeListener = function removeListener(evt, listener) {
	        var listeners = this.getListenersAsObject(evt);
	        var index;
	        var key;

	        for (key in listeners) {
	            if (listeners.hasOwnProperty(key)) {
	                index = indexOfListener(listeners[key], listener);

	                if (index !== -1) {
	                    listeners[key].splice(index, 1);
	                }
	            }
	        }

	        return this;
	    };

	    /**
	     * Alias of removeListener
	     */
	    proto.off = alias('removeListener');

	    /**
	     * Adds listeners in bulk using the manipulateListeners method.
	     * If you pass an object as the second argument you can add to multiple events at once. The object should contain key value pairs of events and listeners or listener arrays. You can also pass it an event name and an array of listeners to be added.
	     * You can also pass it a regular expression to add the array of listeners to all events that match it.
	     * Yeah, this function does quite a bit. That's probably a bad thing.
	     *
	     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add to multiple events at once.
	     * @param {Function[]} [listeners] An optional array of listener functions to add.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.addListeners = function addListeners(evt, listeners) {
	        // Pass through to manipulateListeners
	        return this.manipulateListeners(false, evt, listeners);
	    };

	    /**
	     * Removes listeners in bulk using the manipulateListeners method.
	     * If you pass an object as the second argument you can remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
	     * You can also pass it an event name and an array of listeners to be removed.
	     * You can also pass it a regular expression to remove the listeners from all events that match it.
	     *
	     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to remove from multiple events at once.
	     * @param {Function[]} [listeners] An optional array of listener functions to remove.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.removeListeners = function removeListeners(evt, listeners) {
	        // Pass through to manipulateListeners
	        return this.manipulateListeners(true, evt, listeners);
	    };

	    /**
	     * Edits listeners in bulk. The addListeners and removeListeners methods both use this to do their job. You should really use those instead, this is a little lower level.
	     * The first argument will determine if the listeners are removed (true) or added (false).
	     * If you pass an object as the second argument you can add/remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
	     * You can also pass it an event name and an array of listeners to be added/removed.
	     * You can also pass it a regular expression to manipulate the listeners of all events that match it.
	     *
	     * @param {Boolean} remove True if you want to remove listeners, false if you want to add.
	     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add/remove from multiple events at once.
	     * @param {Function[]} [listeners] An optional array of listener functions to add/remove.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.manipulateListeners = function manipulateListeners(remove, evt, listeners) {
	        var i;
	        var value;
	        var single = remove ? this.removeListener : this.addListener;
	        var multiple = remove ? this.removeListeners : this.addListeners;

	        // If evt is an object then pass each of its properties to this method
	        if (typeof evt === 'object' && !(evt instanceof RegExp)) {
	            for (i in evt) {
	                if (evt.hasOwnProperty(i) && (value = evt[i])) {
	                    // Pass the single listener straight through to the singular method
	                    if (typeof value === 'function') {
	                        single.call(this, i, value);
	                    }
	                    else {
	                        // Otherwise pass back to the multiple function
	                        multiple.call(this, i, value);
	                    }
	                }
	            }
	        }
	        else {
	            // So evt must be a string
	            // And listeners must be an array of listeners
	            // Loop over it and pass each one to the multiple method
	            i = listeners.length;
	            while (i--) {
	                single.call(this, evt, listeners[i]);
	            }
	        }

	        return this;
	    };

	    /**
	     * Removes all listeners from a specified event.
	     * If you do not specify an event then all listeners will be removed.
	     * That means every event will be emptied.
	     * You can also pass a regex to remove all events that match it.
	     *
	     * @param {String|RegExp} [evt] Optional name of the event to remove all listeners for. Will remove from every event if not passed.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.removeEvent = function removeEvent(evt) {
	        var type = typeof evt;
	        var events = this._getEvents();
	        var key;

	        // Remove different things depending on the state of evt
	        if (type === 'string') {
	            // Remove all listeners for the specified event
	            delete events[evt];
	        }
	        else if (evt instanceof RegExp) {
	            // Remove all events matching the regex.
	            for (key in events) {
	                if (events.hasOwnProperty(key) && evt.test(key)) {
	                    delete events[key];
	                }
	            }
	        }
	        else {
	            // Remove all listeners in all events
	            delete this._events;
	        }

	        return this;
	    };

	    /**
	     * Alias of removeEvent.
	     *
	     * Added to mirror the node API.
	     */
	    proto.removeAllListeners = alias('removeEvent');

	    /**
	     * Emits an event of your choice.
	     * When emitted, every listener attached to that event will be executed.
	     * If you pass the optional argument array then those arguments will be passed to every listener upon execution.
	     * Because it uses `apply`, your array of arguments will be passed as if you wrote them out separately.
	     * So they will not arrive within the array on the other side, they will be separate.
	     * You can also pass a regular expression to emit to all events that match it.
	     *
	     * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
	     * @param {Array} [args] Optional array of arguments to be passed to each listener.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.emitEvent = function emitEvent(evt, args) {
	        var listenersMap = this.getListenersAsObject(evt);
	        var listeners;
	        var listener;
	        var i;
	        var key;
	        var response;

	        for (key in listenersMap) {
	            if (listenersMap.hasOwnProperty(key)) {
	                listeners = listenersMap[key].slice(0);
	                i = listeners.length;

	                while (i--) {
	                    // If the listener returns true then it shall be removed from the event
	                    // The function is executed either with a basic call or an apply if there is an args array
	                    listener = listeners[i];

	                    if (listener.once === true) {
	                        this.removeListener(evt, listener.listener);
	                    }

	                    response = listener.listener.apply(this, args || []);

	                    if (response === this._getOnceReturnValue()) {
	                        this.removeListener(evt, listener.listener);
	                    }
	                }
	            }
	        }

	        return this;
	    };

	    /**
	     * Alias of emitEvent
	     */
	    proto.trigger = alias('emitEvent');

	    /**
	     * Subtly different from emitEvent in that it will pass its arguments on to the listeners, as opposed to taking a single array of arguments to pass on.
	     * As with emitEvent, you can pass a regex in place of the event name to emit to all events that match it.
	     *
	     * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
	     * @param {...*} Optional additional arguments to be passed to each listener.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.emit = function emit(evt) {
	        var args = Array.prototype.slice.call(arguments, 1);
	        return this.emitEvent(evt, args);
	    };

	    /**
	     * Sets the current value to check against when executing listeners. If a
	     * listeners return value matches the one set here then it will be removed
	     * after execution. This value defaults to true.
	     *
	     * @param {*} value The new value to check for when executing listeners.
	     * @return {Object} Current instance of EventEmitter for chaining.
	     */
	    proto.setOnceReturnValue = function setOnceReturnValue(value) {
	        this._onceReturnValue = value;
	        return this;
	    };

	    /**
	     * Fetches the current value to check against when executing listeners. If
	     * the listeners return value matches this one then it should be removed
	     * automatically. It will return true by default.
	     *
	     * @return {*|Boolean} The current value to check for or the default, true.
	     * @api private
	     */
	    proto._getOnceReturnValue = function _getOnceReturnValue() {
	        if (this.hasOwnProperty('_onceReturnValue')) {
	            return this._onceReturnValue;
	        }
	        else {
	            return true;
	        }
	    };

	    /**
	     * Fetches the events object and creates one if required.
	     *
	     * @return {Object} The events storage object.
	     * @api private
	     */
	    proto._getEvents = function _getEvents() {
	        return this._events || (this._events = {});
	    };

	    /**
	     * Reverts the global {@link EventEmitter} to its previous value and returns a reference to this version.
	     *
	     * @return {Function} Non conflicting EventEmitter class.
	     */
	    EventEmitter.noConflict = function noConflict() {
	        exports.EventEmitter = originalGlobalValue;
	        return EventEmitter;
	    };

	    // Expose the class either via AMD, CommonJS or the global object
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
	            return EventEmitter;
	        }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    }
	    else if (typeof module === 'object' && module.exports){
	        module.exports = EventEmitter;
	    }
	    else {
	        exports.EventEmitter = EventEmitter;
	    }
	}.call(this));


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	* @Author: Zhang Yingya(hzzhangyingya) <zyy>
	* @Date:   2016-01-10T17:15:58+08:00
	* @Email:  zyy7259@gmail.com
	* @Last modified by:   zyy
	* @Last modified time: 2016-08-01T14:56:23+08:00
	*/

	var util = __webpack_require__(2);
	var pu = __webpack_require__(4);
	var Proxy = __webpack_require__(5);

	var flag = 'NEJ-UPLOAD-RESULT:';
	var cache = {};

	function ProxyUpload(options) {
	  var self = this;
	  self.init();
	  Proxy.call(self, options);
	}

	var sp = Proxy.prototype;
	var pro = ProxyUpload.prototype = Object.create(sp);

	pro.init = function () {
	  var init = false;
	  function onMessage(event) {
	    var data = event.data;
	    if (data.indexOf(flag) !== 0) {
	      return;
	    }
	    data = JSON.parse(data.replace(flag, ''));
	    var key = data.key;
	    var proxy = cache[key];
	    if (!proxy) {
	      return;
	    }
	    delete cache[key];
	    data.result = decodeURIComponent(data.result || '');
	    proxy.onLoad(data.result);
	  }
	  function initMessage() {
	    if (!init) {
	      init = true;
	      util.on(window, 'message', onMessage);
	    }
	  }
	  return function () {
	    initMessage();
	  };
	}();

	pro.doSend = function () {
	  var self = this;
	  var options = self.options;
	  var key = self.key = util.uniqueID();
	  cache[key] = self;
	  // create form
	  var form = self.form = util.html2node('<form style="display:none;"></form>');
	  document.body.appendChild(form);
	  form.target = key;
	  form.method = 'POST';
	  form.enctype = 'multipart/form-data';
	  form.encoding = 'multipart/form-data';
	  var url = options.url;
	  var sep = util.genUrlSep(url);
	  form.action = url + sep + '_proxy_=form';
	  // 处理参数
	  var data = options.data;
	  var files = [];
	  var fileClones = [];
	  if (data) {
	    pu.getKeys(data, options.putFileAtEnd).forEach(function (key) {
	      var value = data[key];
	      if (value.tagName && value.tagName.toUpperCase() === 'INPUT') {
	        if (value.type === 'file') {
	          var file = value;
	          var fileClone = file.cloneNode(true);
	          file.parentNode.insertBefore(fileClone, file);
	          var name = util.dataset(file, 'name');
	          if (name) {
	            file.name = name;
	          }
	          form.appendChild(file);
	          // Remove the HTML5 form attribute from the input
	          file.setAttribute('form', '');
	          file.removeAttribute('form');
	          files.push(value);
	          fileClones.push(fileClone);
	        }
	      } else {
	        var input = util.html2node('<input type="hidden"/>');
	        input.name = key;
	        input.value = value;
	        form.appendChild(input);
	      }
	    });
	  }
	  function restoreFiles() {
	    // 将 input 放回原处
	    files.forEach(function (file, index) {
	      var fileClone = fileClones[index];
	      file.name = fileClone.name;
	      file.setAttribute('form', fileClone.getAttribute('form'));
	      fileClone.parentNode.replaceChild(file, fileClone);
	    });
	  }
	  // create iframe
	  var iframe = self.iframe = util.createIframe({
	    name: key,
	    onload: function onload() {
	      // check aborted
	      if (self.aborted) {
	        restoreFiles();
	        return;
	      }
	      util.on(iframe, 'load', self.checkResult.bind(self));
	      form.submit();
	      restoreFiles();
	      self.afterSend();
	    }
	  });
	};

	// same domain upload result check
	pro.checkResult = function () {
	  var self = this;
	  var body;
	  var text;
	  try {
	    body = self.iframe.contentWindow.document.body;
	    text = (body.innerText || body.textContent || '').trim();
	    // if same domain with upload proxy html, use post message path
	    if (text.indexOf(flag) >= 0 || body.innerHTML.indexOf(flag) >= 0) {
	      return;
	    }
	  } catch (e) {
	    // ignore if not same domain
	    console.error('ignore', e);
	    return;
	  }
	  self.onLoad(text);
	};

	pro.onLoad = function (result) {
	  var self = this;
	  sp.onLoad.call(self, {
	    status: 200,
	    result: result
	  });
	  // do the destroy work
	  util.remove(self.form);
	  util.remove(self.iframe);
	  sp.destroy.call(self);
	};

	// do nothing when destroy, this will let the iframe load, so we can restoreFiles.
	// pro.destroy = function() {
	//     var self = this
	//     util.remove(self.form)
	//     util.remove(self.iframe)
	//     sp.destroy.call(self)
	// }

	pro.abort = function () {
	  var self = this;
	  self.aborted = true;
	  delete cache[self.key];
	  sp.abort.call(self);
	};

	module.exports = ProxyUpload;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	* @Author: Zhang Yingya(hzzhangyingya) <zyy>
	* @Date:   2016-01-10T17:15:53+08:00
	* @Email:  zyy7259@gmail.com
	* @Last modified by:   zyy
	* @Last modified time: 2016-08-01T14:56:28+08:00
	*/

	var util = __webpack_require__(2);
	var Proxy = __webpack_require__(5);

	var cache = {};

	function ProxyFrame(options) {
	  var self = this;
	  self.init();
	  Proxy.call(self, options);
	}

	var sp = Proxy.prototype;
	var pro = ProxyFrame.prototype = Object.create(sp);

	pro.init = function () {
	  var flag = 'NEJ-AJAX-DATA:';
	  var init = false;
	  function onMessage(event) {
	    var data = event.data;
	    if (data.indexOf(flag) !== 0) {
	      return;
	    }
	    data = JSON.parse(data.replace(flag, ''));
	    var key = data.key;
	    var proxy = cache[key];
	    if (!proxy) {
	      return;
	    }
	    delete cache[key];
	    data.result = decodeURIComponent(data.result || '');
	    proxy.onLoad(data);
	  }
	  function initMessage() {
	    if (!init) {
	      init = true;
	      util.on(window, 'message', onMessage);
	    }
	  }
	  return function () {
	    initMessage();
	  };
	}();

	pro.doSend = function () {
	  var self = this;
	  var options = self.options;
	  var origin = util.url2origin(options.url);
	  var proxyUrl = options.proxyUrl || origin + '/res/nej_proxy_frame.html';
	  var frame = cache[proxyUrl];
	  // callback list
	  if (util.isArray(frame)) {
	    frame.push(self.doSend.bind(self, options));
	    return;
	  }
	  // build frame proxy
	  if (!frame) {
	    cache[proxyUrl] = [self.doSend.bind(self, options)];
	    util.createIframe({
	      src: proxyUrl,
	      onload: function onload(event) {
	        var cbs = cache[proxyUrl];
	        cache[proxyUrl] = util.target(event).contentWindow;
	        cbs.forEach(function (cb) {
	          try {
	            cb();
	          } catch (e) {
	            // ignore
	          }
	        });
	      }
	    });
	    return;
	  }
	  // check aborted
	  if (self.aborted) {
	    return;
	  }
	  // send message to frame
	  var key = self.key = util.uniqueID();
	  cache[key] = self;
	  var data = util.fetch({
	    method: 'GET',
	    url: '',
	    data: null,
	    headers: {},
	    timeout: 0
	  }, options);
	  data.key = key;
	  frame.postMessage(JSON.stringify(data), '*');
	  self.afterSend();
	};

	pro.abort = function () {
	  var self = this;
	  self.aborted = true;
	  delete cache[self.key];
	  sp.abort.call(self);
	};

	module.exports = ProxyFrame;

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	* @Author: Zhang Yingya(hzzhangyingya) <zyy>
	* @Date:   2016-01-06T16:44:36+08:00
	* @Email:  zyy7259@gmail.com
	* @Last modified by:   zyy
	* @Last modified time: 2016-08-01T15:04:06+08:00
	*/

	var util = __webpack_require__(2);
	var ajax = __webpack_require__(1);

	var json = function () {
	  var regJson = /json/i;
	  var regPost = /post/i;
	  return function (url, options) {
	    options = options || {};
	    var data = options.data = options.data || {};
	    // parse headers
	    var headers = options.headers = options.headers || {};
	    var accept = util.checkWithDefault(headers, 'Accept', 'application/json');
	    var contentType = util.checkWithDefault(headers, 'Content-Type', 'application/json');
	    // response data format
	    if (regJson.test(accept)) {
	      options.type = 'json';
	    }
	    // post data
	    if (regPost.test(options.method) && regJson.test(contentType)) {
	      options.data = JSON.stringify(data);
	    }
	    return ajax(url, options);
	  };
	}();

	util.mixin(json, ajax);

	ajax.json = json;

	module.exports = json;

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	* @Author: Zhang Yingya(hzzhangyingya) <zyy>
	* @Date:   2016-01-15T10:22:01+08:00
	* @Email:  zyy7259@gmail.com
	* @Last modified by:   zyy
	* @Last modified time: 2016-08-01T14:56:15+08:00
	*/

	var util = __webpack_require__(2);
	var ajax = __webpack_require__(1);

	var upload = function upload(url, options) {
	  options.method = 'POST';
	  options.headers = options.headers || {};
	  options.headers['Content-Type'] = 'multipart/form-data';
	  options.timeout = 0;
	  options.type = options.type || 'json';
	  return ajax(url, options);
	};

	util.mixin(upload, ajax);

	ajax.upload = upload;

	module.exports = upload;

/***/ }
/******/ ])
});
;