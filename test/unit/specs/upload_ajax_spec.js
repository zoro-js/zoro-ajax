/**
* @Author: Zhang Yingya(hzzhangyingya) <zyy>
* @Date:   2016-01-15T10:20:47+08:00
* @Email:  zyy7259@gmail.com
* @Last modified by:   zyy
* @Last modified time: 2016-08-01T15:02:50+08:00
*/

var util = require('zoro-base')
var upload = require('upload')
var prepare = require('./prepare')
var url = prepare.getHttpUrl('upload')
var supportFormData = !!window.FormData
var supportBlob = !!window.Blob

describe('upload via ajax', function () {
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
        data: {
          input: fileInput,
          foo: 'bar'
        },
        onuploading: function (obj) {
          // not null or undefined
          expect(obj.total).toEqual(jasmine.any(Number))
          expect(obj.loaded).toEqual(jasmine.any(Number))
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
    fileInput.click()
  })

  it('upload input putFileAtEnd', function (done) {
    util.on(fileInput, 'change', function () {
      upload(url, {
        putFileAtEnd: true,
        data: {
          input: fileInput,
          foo: 'bar'
        },
        onuploading: function (obj) {
          // not null or undefined
          expect(obj.total).toEqual(jasmine.any(Number))
          expect(obj.loaded).toEqual(jasmine.any(Number))
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
    fileInput.click()
  })

  it('upload input with data-name', function (done) {
    util.dataset(fileInput, 'name', 'nameFoo')
    util.on(fileInput, 'change', function () {
      upload(url, {
        data: {
          input: fileInput,
          foo: 'bar'
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

  it('upload File object', function (done) {
    if (supportFormData) {
      util.on(fileInput, 'change', function () {
        var data = {}
        var files = fileInput.files
        ;[].forEach.call(files, function (file) {
          data[file.name] = file
        })
        data.foo = 'bar'
        upload(url, {
          data: data,
          onload: function (obj) {
            expect(obj).toEqual(jasmine.any(Object))
            done()
          },
          onerror: function (obj) {
            done.fail(JSON.stringify(obj))
          }
        })
      })
    } else {
      done()
    }
  })

  it('upload File object putFileAtEnd', function (done) {
    if (supportFormData) {
      util.on(fileInput, 'change', function () {
        var data = {}
        var files = fileInput.files
        ;[].forEach.call(files, function (file) {
          data['File-' + file.name] = file
        })
        data.foo = 'bar'
        upload(url, {
          putFileAtEnd: true,
          data: data,
          onload: function (obj) {
            expect(obj).toEqual(jasmine.any(Object))
            done()
          },
          onerror: function (obj) {
            done.fail(JSON.stringify(obj))
          }
        })
      })
    } else {
      done()
    }
  })

  it('upload Blob object', function (done) {
    if (supportBlob) {
      var dataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAyADIDASIAAhEBAxEB/8QAGgABAAMBAQEAAAAAAAAAAAAAAAIEBgUDAf/EACwQAAEEAQMCBQMFAQAAAAAAAAEAAgMRBAUSISIxBhNBUWEUMnEjkaGxstH/xAAaAQACAwEBAAAAAAAAAAAAAAAAAQIDBAUG/8QAIREAAgIBAwUBAAAAAAAAAAAAAAECERIEFCExM0FxodH/2gAMAwEAAhEDEQA/ANkiKtm5gxI203fK87Y2XVnv+w7lXNpK2ebLKhHMyUuDHbtpokdr9lksjPzM187pMowYEBIfKw7TIR3ArsL4vuquJNlYenYub9TPE2U1I272lx4cGngjtYPp8rPuoWLI3SLlaTqr8pz8XLa2PNiHW1vZw9CPhdVXxkpK0MIiKQBZzXcgxZGVJz+hh20D3cTf+QtE40LDS4+gaLJXE13FfFqNSxyRvkg8qTpI2HktPNe7gVRqe2x4tqzh5OP5PhAxMaDULXHn1sElWtQo+HJdvb6cEbvwP5VbLex3hzJxnSmSXHjDJKFciq49vlT1SYjw8xrTuknYyNu1v3E1dD8WuZza9kPwSymAaRnMNzF7GFx4LmubyCtoOyxpx/q9UwtMi3mPGAllcfgU3n3WyW/SJ4EkERFrA+EWORahkxszJnS5QEz3MEZMguwBX9eq9FFzA4EEWCk0n1HbqjN5GmQyajKxkhDiwxuO8dba+1xruOVX1DCZp2JFPNlDysZrY4uN5DjxurgE178LRnToDN5vXd9r4UpNPxZQBLE14BsB3ItZ9tF3Y4OKmnNWvPNfTx0zAxsKHdj9Zl63yu5dIT6n/ivqLWNY3a0ABSWhJJUiIRETAIiIAIiIAIiIAIiIA//Z'
      var blob = util.blobFromDataURL(dataURL)
      upload(url, {
        data: {
          blobFile: blob,
          foo: 'bar'
        },
        onload: function (obj) {
          expect(obj).toEqual(jasmine.any(Object))
          done()
        },
        onerror: function (obj) {
          done.fail(JSON.stringify(obj))
        }
      })
    } else {
      done()
    }
  })

  it('upload Blob object putFileAtEnd', function (done) {
    if (supportBlob) {
      var dataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAyADIDASIAAhEBAxEB/8QAGgABAAMBAQEAAAAAAAAAAAAAAAIEBgUDAf/EACwQAAEEAQMCBQMFAQAAAAAAAAEAAgMRBAUSISIxBhNBUWEUMnEjkaGxstH/xAAaAQACAwEBAAAAAAAAAAAAAAAAAQIDBAUG/8QAIREAAgIBAwUBAAAAAAAAAAAAAAECERIEFCExM0FxodH/2gAMAwEAAhEDEQA/ANkiKtm5gxI203fK87Y2XVnv+w7lXNpK2ebLKhHMyUuDHbtpokdr9lksjPzM187pMowYEBIfKw7TIR3ArsL4vuquJNlYenYub9TPE2U1I272lx4cGngjtYPp8rPuoWLI3SLlaTqr8pz8XLa2PNiHW1vZw9CPhdVXxkpK0MIiKQBZzXcgxZGVJz+hh20D3cTf+QtE40LDS4+gaLJXE13FfFqNSxyRvkg8qTpI2HktPNe7gVRqe2x4tqzh5OP5PhAxMaDULXHn1sElWtQo+HJdvb6cEbvwP5VbLex3hzJxnSmSXHjDJKFciq49vlT1SYjw8xrTuknYyNu1v3E1dD8WuZza9kPwSymAaRnMNzF7GFx4LmubyCtoOyxpx/q9UwtMi3mPGAllcfgU3n3WyW/SJ4EkERFrA+EWORahkxszJnS5QEz3MEZMguwBX9eq9FFzA4EEWCk0n1HbqjN5GmQyajKxkhDiwxuO8dba+1xruOVX1DCZp2JFPNlDysZrY4uN5DjxurgE178LRnToDN5vXd9r4UpNPxZQBLE14BsB3ItZ9tF3Y4OKmnNWvPNfTx0zAxsKHdj9Zl63yu5dIT6n/ivqLWNY3a0ABSWhJJUiIRETAIiIAIiIAIiIAIiIA//Z'
      var blob = util.blobFromDataURL(dataURL)
      upload(url, {
        putFileAtEnd: true,
        data: {
          blobFile: blob,
          foo: 'bar'
        },
        onload: function (obj) {
          expect(obj).toEqual(jasmine.any(Object))
          done()
        },
        onerror: function (obj) {
          done.fail(JSON.stringify(obj))
        }
      })
    } else {
      done()
    }
  })

  it('abort', function (done) {
    util.on(fileInput, 'change', function () {
      var sn = upload(url, {
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
          done()
        }
      })
      upload.abort(sn)
    })
  })

  it('abort after send', function (done) {
    util.on(fileInput, 'change', function () {
      var sn = upload(url, {
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
          // 1s 后完成, 这样可以在代码里面检测异步请求的情况, 主要看有没有走到 ajax.js#callback
          // 直接完成的话, 没有机会检测
          setTimeout(done, 1000)
        }
      })
    })
  })
})
