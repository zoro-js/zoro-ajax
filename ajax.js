var util = require('zoro-base/src/util');

var cache = {};
var doFilter = util.f;

function getProxy(options) {
    var isUpload = (options.headers||{})['Content-Type'] === 'multipart/form-data';
    var origin1 = (location.protocol + '//' + location.host).toLowerCase();
    var origin2 = util.url2origin(options.url);
    var isXDomain = origin1 === origin2;
    if (!isUpload && !isXDomain) {}
};

function parseExtData(c, data) {
    data = {
        data: data
    };
    var keys = c.result.headers;
    if (!!keys) {
        data.headers = c.req.header(keys);
    }
    return data;
};

function clear(sn) {
    var c = cache[sn];
    if (!c) {
        return;
    }
    c.req.destroy();
    delete c[sn];
};

function callback(sn, type, data) {
    var c = cache[sn];
    if (!c) {
        return;
    }
    if (type === 'onload' && !!c.result) {
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
};

function onLoad(sn, data) {
    callback(sn, 'onload', data);
};

function onError(sn, error) {
    callback(sn, 'onerror', error);
};

function mergeUrl(url, data) {
    var sep = util.genUrlSep(url);
    data = data || '';
    if (util.isObject(data)) {
        data = u.object2query(data);
    }
    if (!!data) {
        url += sep+data;
    }
    return url
};

function ajax(url, options) {
    options = options || {};
    // cache callback
    var sn = util.uniqueID();
    var c = {
        result: options.result,
        onload: options.onload || util.emptyFunc,
        onerror: options.onerror || util.emptyFunc
    };
    cache[sn] = c;
    options.onload = onLoad.bind(null, sn);
    options.onerror = onError.bind(null, sn);
    // append query
    if (!!options.query) {
        url = mergeUrl(url, options.query);
    }
    // append get data
    options.method = (options.method || 'GET').toUpperCase();
    if (options.method === 'GET') {
        url = mergeUrl(url, options.data);
        options.data = null;
    }
    options.url = url;
    c.req = getProxy(options);
    return sn;
};

ajax.filter = function(filter) {
    doFilter = filter;
};

ajax.abort = function(sn) {
    var c = cache[sn];
    if (!!c) {
        c.req.abort();
    }
};

module.exports = ajax;