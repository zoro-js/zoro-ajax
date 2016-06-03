var util = require('zoro-base/src/util');
var pu = require('./util');
var dom = require('zoro-base/src/dom');
var Proxy = require('./index');

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

pro.doSend = function() {
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
            pu.getKeys(data, options.putFileAtEnd).forEach(function(key) {
                var value = data[key];
                if (value.tagName && value.tagName.toUpperCase() === 'INPUT') {
                    if (value.type === 'file') {
                        [].forEach.call(value.files, function(file) {
                            options.data.append(
                                dom.dataset(value, 'name') ||
                                value.name || 
                                file.name ||
                                ('file-'+util.uniqueID()), file);
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
    Object.keys(headers).forEach(function(key) {
        xhr.setRequestHeader(key, headers[key]);
    });
    if (!!options.cookie && ('withCredentials' in xhr)) {
        xhr.withCredentials = true;
    }
    xhr.send(options.data);
    self.afterSend();
};

pro.onProgress = function(event) {
    // IE 10很神奇的, 在upload的load事件之后还会再触发一次progress, 并且loaded比total大。。。
    if (event.lengthComputable && event.loaded <= event.total) {
        this.emit('uploading', event);
    }
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
        console.error('ignore', e);
    }
    sp.destroy.call(self);
};

module.exports = ProxyXhr;