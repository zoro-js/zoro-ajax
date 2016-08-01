/**
* @Author: Zhang Yingya(hzzhangyingya) <zyy>
* @Date:   2016-01-15T15:07:15+08:00
* @Email:  zyy7259@gmail.com
* @Last modified by:   zyy
* @Last modified time: 2016-08-01T15:02:36+08:00
*/

var util = require('zoro-base')
var upload = require('upload')
var prepare = require('./prepare')
var url = prepare.getHttpUrl('upload')
// var supportFormData = !!window.FormData
// var supportBlob = !!window.Blob

describe('upload via iframe', function () {
  var domStr
  var fileInput
  var defaultTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL

  beforeEach(function () {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 24 * 60 * 60 * 1000
    domStr = '<input type="file" name="file" id="fileInput" multiple>'
    document.body.innerHTML += domStr
    fileInput = document.getElementById('fileInput')
  })

  afterEach(function () {
    util.remove(fileInput)
    jasmine.DEFAULT_TIMEOUT_INTERVAL = defaultTimeout
  })

  it('upload input', function (done) {
    util.on(fileInput, 'change', function () {
      upload(url, {
        mode: 'iframe',
        data: {
          input: fileInput,
          bar: 'baz'
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

  it('upload input', function (done) {
    util.on(fileInput, 'change', function () {
      upload(url, {
        putFileAtEnd: true,
        mode: 'iframe',
        data: {
          input: fileInput,
          bar: 'baz'
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

  it('upload input with data-name', function (done) {
    util.dataset(fileInput, 'name', 'nameBar')
    util.on(fileInput, 'change', function () {
      upload(url, {
        mode: 'iframe',
        data: {
          input: fileInput
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

  it('abort', function (done) {
    util.on(fileInput, 'change', function () {
      var sn = upload(url, {
        mode: 'iframe',
        data: {
          input: fileInput
        },
        onload: function (obj) {
          done.fail('should not onload')
        },
        onerror: function (obj) {
          expect(obj).toEqual(jasmine.objectContaining({
            code: 'abort'
          }))
          // 1s 后完成, 这样可以在代码里面检测请求是否发出 frame.js#doSend: check aborted
          // 直接完成的话, 没有机会检测
          setTimeout(done, 1000)
        }
      })
      upload.abort(sn)
    })
  })

  it('abort after send', function (done) {
    util.on(fileInput, 'change', function () {
      var sn = upload(url, {
        mode: 'iframe',
        data: {
          input: fileInput
        },
        onaftersend: function () {
          upload.abort(sn)
        },
        onload: function (obj) {
          done.fail('should not onload')
        },
        onerror: function (obj) {
          expect(obj).toEqual(jasmine.objectContaining({
            code: 'abort'
          }))
          // 1s 后完成, 这样可以在代码里面检测请求完成后的情况 upload.js#init#onMessage
          // 直接完成的话, 没有机会检测
          setTimeout(done, 1000)
        }
      })
    })
  })
})
