var util = require('zoro-base/src/util');
var f = util.f;
var EventEmitter = require('wolfy87-eventemitter');

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
    // handle options
    options = self.options = util.fetch({
        method: 'GET',
        url: '',
        sync: false,
        data: null,
        headers: {},
        cookie: false,
        timeout: 6000,
        type: 'text'
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

pro.send = function() {
    var self = this;
    var options = self.options;
    try {
        try {
            self.emit('beforesend', options);
        } catch (e) {
            console.error(e);
        }
        self.doSend();
    } catch (e) {
        console.error(e);
        self.onError('serverError', '请求失败:' + e.message);
    }
};

pro.doSend = f;

pro.onLoad = function(event) {
    var self = this;
    var options = self.options;
    var status = event.status;
    var result = event.result;
    // check status
    if ((''+status).indexOf('2') !== 0) {
        self.onError('serverError', '服务器返回异常状态', {
            status: status,
            result: result
        });
        return;
    }
    // onload
    if (options.type === 'json') {
        try {
            result = JSON.parse(result);
        } catch(e) {
            console.error(e);
            result = null;
        }
    }
    self.emit('load', result);
};

pro.onError = function(code, message, ext) {
    var obj = util.isObject(ext) ? ext : {};
    obj.code = code || 'error';
    obj.message = message || '发生错误';
    this.emit('error', obj);
};

pro.onTimeout = function() {
    this.onError('timeout', '请求超时');
};

pro.abort = function() {
    this.onError('abort', '客户端中止');
};

pro.header = function(key) {
    var self = this;
    if (!util.isArray(key)) {
        return self.getResponseHeader(key || '');
    }
    var result = {};
    key.forEach(function(k) {
        result[k] = self.header(k);
    });
    return result;
};

pro.getResponseHeader = f;

pro.destroy = f;

module.exports = Proxy;