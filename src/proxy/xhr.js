var util = require('zoro-base/src/util');
var Proxy = require('./index');

function ProxyXhr(options) {
    Proxy.call(this, options);
}

var sp = Proxy.prototype;
var pro = ProxyXhr.prototype = Object.create(sp);

pro.doSend = function() {
    var self = this;
    var options = self.options;
    var xhr = self.xhr = new XMLHttpRequest();
    // add event listener
    // upload progress
    if (options.upload) {
        xhr.upload.onprogress = self.onProgress.bind(self);
        // append input to form data
    }
    // state change
    xhr.onreadystatechange = self.onStateChange.bind(self);
    // timeout
    if (options.timeout !== 0) {
        self.timer = setTimeout(self.onTimeout.bind(self), options.timeout);
    }
    // prepare and send
    xhr.open(options.method, options.url, !options.sync);
    if (options.headers) {
        Object.keys(options.headers).forEach(function(key) {
            xhr.setRequestHeader(key, options.headers[key]);
        });
    }
    if (!!options.cookie && ('withCredentials' in xhr)) {
        xhr.withCredentials = true;
    }
    xhr.send(options.data);
    self.afterSend();
};

pro.onProgress = function(event) {
    this.emit('onuploading', event);
};

pro.onStateChange = function() {
    var self = this;
    var xhr = self.xhr;
    if (xhr.readyState===4) {
        self.onLoad({
            status: xhr.status,
            result: xhr.responseText || ''
        });
    }
};

pro.getResponseHeader = function(key) {
    var xhr = this.xhr;
    return !xhr ? '' : xhr.getResponseHeader(key);
};

pro.destroy = function() {
    var self = this;
    // clear timeout
    clearTimeout(self.timer);
    // clear request
    try {
        self.xhr.onreadystatechange = util.f;
        self.xhr.abort();
    } catch (e) {
        // ignore
    }
    sp.destroy.call(self);
};

module.exports = ProxyXhr;