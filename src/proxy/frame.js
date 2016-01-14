var util = require('zoro-base/src/util');
var dom = require('zoro-base/src/dom');
var Proxy = require('./index');

var cache = {};

function ProxyFrame(options) {
    var self = this;
    self.init();
    Proxy.call(self, options);
}

var sp = Proxy.prototype;
var pro = ProxyFrame.prototype = Object.create(sp);

pro.init = (function() {
    var flag = 'NEJ-AJAX-DATA:';
    var init = false;
    function onMessage(event) {
        var data = event.data;
        if (data.indexOf(flag) !== 0) {return;}
        data = JSON.parse(data.replace(flag, ''));
        var key = data.key;
        var proxy = cache[key];
        if (!proxy) {return;}
        delete cache[key];
        data.result = decodeURIComponent(data.result || '');
        proxy.onLoad(data);
    }
    function initMessage() {
        if (!init) {
            init = true;
            dom.on(window, 'message', onMessage);
        }
    }
    return function() {
        initMessage();
    };
}());

pro.doSend = function() {
    var self = this;
    var options = self.options;
    var origin = util.url2origin(options.url);
    var proxyUrl = options.proxyUrl || (origin + '/res/nej_proxy_frame.html');
    var frame = cache[proxyUrl];
    // callback list
    if (util.isArray(frame)) {
        frame.push(self.doSend.bind(self, options));
        return;
    }
    // build frame proxy
    if (!frame) {
        cache[proxyUrl] = [
            self.doSend.bind(self, options)
        ];
        dom.createIframe({
            src: proxyUrl,
            onload: function(event) {
                var cbs = cache[proxyUrl];
                cache[proxyUrl] = dom.target(event).contentWindow;
                cbs.forEach(function(cb) {
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
    if (self.aborted) {return;}
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

pro.abort = function() {
    var self = this;
    self.aborted = true;
    delete cache[self.key];
    sp.abort.call(this);
};

module.exports = ProxyFrame;