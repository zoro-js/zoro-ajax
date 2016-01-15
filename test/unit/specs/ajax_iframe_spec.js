var json = require('json');
var prepare = require('./prepare');
var url = prepare.getUrl('json');
var httpsUrl = prepare.getHttpsUrl('json');
var httpsProxyUrl = 'https://localhost:9527/res/nej_proxy_frame.html';

xdescribe('frame', function() {
    xdescribe('tested', function() {
    });
    it('default', function(done) {
        json(url, {
            mode: 'iframe',
            onbeforesend: function(options) {
            },
            onload: function(obj) {
                expect(obj).toEqual(jasmine.any(Object));
                done();
            },
            onerror: function(obj) {
                done.fail(JSON.stringify(obj));
            }
        });
    });
    
    it('proxyUrl', function(done) {
        json(httpsUrl, {
            mode: 'iframe',
            proxyUrl: httpsProxyUrl,
            onload: function(obj) {
                expect(obj).toEqual(jasmine.any(Object));
                done();
            }
        });
    });

    it('abort immediately', function(done) {
        var sn = json(url, {
            mode: 'iframe',
            onload: function(obj) {
                done.fail('should not onload');
            },
            onerror: function(obj) {
                expect(obj).toEqual(jasmine.objectContaining({
                    code: 'abort'
                }));
                // 1s 后完成, 这样可以在代码里面检测请求是否发出 frame.js#doSend: check aborted
                // 直接完成的话, 没有机会检测
                setTimeout(done, 1000);
            }
        });
        json.abort(sn);
    });

    it('abort after send', function(done) {
        var sn = json(url, {
            mode: 'iframe',
            onaftersend: function(options) {
                json.abort(sn);
            },
            onload: function(obj) {
                done.fail('should not onload');
            },
            onerror: function(obj) {
                expect(obj).toEqual(jasmine.objectContaining({
                    code: 'abort'
                }));
                // 1s 后完成, 这样可以在代码里面检测请求完成后的情况 frame.js#init#onMessage
                // 直接完成的话, 没有机会检测
                setTimeout(done, 1000);
            }
        });
    });
});