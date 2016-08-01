/**
* @Author: Zhang Yingya(hzzhangyingya) <zyy>
* @Date:   2016-01-13T16:37:36+08:00
* @Email:  zyy7259@gmail.com
* @Last modified by:   zyy
* @Last modified time: 2016-08-01T14:30:39+08:00
*/

var json = require('json')
var prepare = require('./prepare')
var url = prepare.getUrl('json')

describe('json', function () {
  it('default', function (done) {
    json(url, {
      onbeforesend: function (options) {
        expect(options.headers).toEqual(jasmine.objectContaining({
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }))
        expect(options.type).toBe('json')
      },
      onload: function (obj) {
        expect(obj).toEqual(jasmine.any(Object))
        done()
      },
      onerror: function (obj) {
        done.fail(JSON.stringify(obj))
      }
    })
  })
})
