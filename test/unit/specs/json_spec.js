var json = require('json');
var prepare = require('./prepare');
var url = prepare.getUrl('json');

xdescribe('json', function() {

    it('default', function(done) {
        json(url, {
            onbeforesend: function(options) {
                expect(options.headers).toEqual(jasmine.objectContaining({
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }));
                expect(options.type).toBe('json');
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

});