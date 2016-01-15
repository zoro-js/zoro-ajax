var ajax = require('ajax');
var prepare = require('./prepare');
var url = prepare.getUrl('ajax');
var query = {
    name: 'zyy',
    age: 26
};
var urlWithQuery = url + '?name=zyy&age=26';

xdescribe('ajax', function() {

    describe('tested', function() {
    });
    it('default', function(done) {
        var sn = ajax(urlWithQuery, {
            onbeforesend: function(options) {
                expect(options.method).toBe('GET');
                expect(options.url).toBe(urlWithQuery);
                expect(options.sync).toBe(false);
                expect(options.data).toBe(null);
                expect(options.timeout).toBe(6000);
                expect(options.headers).toEqual(jasmine.objectContaining({
                    'Content-Type': 'application/x-www-form-urlencoded'
                }));
                expect(options.cookie).toBe(false);
                expect(options.type).toBe('text');
            },
            onaftersend: function(options) {
                expect(options).toBe(jasmine.any(Object));
            },
            onload: function(result) {
                expect(result).toEqual(jasmine.any(String));
                done();
            },
            onerror: function(obj) {
                done.fail(JSON.stringify(obj));
            }
        });
        expect(sn).toEqual(jasmine.any(String));
    });
    it('get', function(done) {
        ajax(urlWithQuery, {
            method: 'get',
            onbeforesend: function(options) {
                expect(options.method).toBe('get');
            },
            onload: function(result) {
                expect(result).toEqual(jasmine.any(String));
                done();
            },
            onerror: function(obj) {
                done.fail(JSON.stringify(obj));
            }
        });
    });
    it('get with query', function(done) {
        ajax(url, {
            query: query,
            onbeforesend: function(options) {
                expect(options.url).toBe(urlWithQuery);
            },
            onload: function() {
                done();
            },
            onerror: function(obj) {
                done.fail(JSON.stringify(obj));
            }
        });
    });
    it('get with data', function(done) {
        ajax(url, {
            data: query,
            onbeforesend: function(options) {
                expect(options.url).toBe(urlWithQuery);
                expect(options.data).toBe(null);
            },
            onload: function() {
                done();
            },
            onerror: function(obj) {
                done.fail(JSON.stringify(obj));
            }
        });
    });

    it('abort', function(done) {
        var sn = ajax(urlWithQuery, {
            onload: function(obj) {
                done.fail('should not onload');
            },
            onerror: function(obj) {
                expect(obj).toEqual(jasmine.objectContaining({
                    code: 'abort'
                }));
                done();
            }
        });
        ajax.abort(sn);
    });
    it('abort after send', function(done) {
        sn = ajax(urlWithQuery, {
            onaftersend: function() {
                ajax.abort(sn);
            },
            onload: function() {
                done.fail('should not onload');
            },
            onerror: function(obj) {
                expect(obj).toEqual(jasmine.objectContaining({
                    code: 'abort'
                }));
                // 1s 后完成, 这样可以在代码里面检测异步请求的情况, 主要看有没有走到 ajax.js#callback
                // 直接完成的话, 没有机会检测
                setTimeout(done, 1000);
            }
        });
    });
});