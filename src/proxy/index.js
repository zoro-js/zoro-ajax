/**
* @Author: Zhang Yingya(hzzhangyingya) <zyy>
* @Date:   2016-01-08T16:38:53+08:00
* @Email:  zyy7259@gmail.com
* @Last modified by:   zyy
* @Last modified time: 2016-08-01T15:03:56+08:00
*/

var util = require('zoro-base')
var f = util.f
var EventEmitter = require('wolfy87-eventemitter')

function Proxy (options) {
  var self = this
  // addListeners
  if (options.onload) {
    self.once('load', options.onload)
  }
  if (options.onerror) {
    self.once('error', options.onerror)
  }
  if (options.onbeforesend) {
    self.once('beforesend', options.onbeforesend)
  }
  if (options.onaftersend) {
    self.once('aftersend', options.onaftersend)
  }
  // handle options
  options = self.options = util.fetch({
    method: 'GET',
    url: '',
    sync: false,
    data: null,
    headers: {},
    cookie: false,
    timeout: 6000,
    type: 'text',
    // 文件上传用到的参数
    form: null,
    input: null,
    // 是否将文件放在末尾
    putFileAtEnd: false,
    // iframe 模式用到的代理地址
    proxyUrl: ''
  }, options)
  // headers
  var headers = options.headers
  var contentType = 'Content-Type'
  if (util.notexist(headers[contentType])) {
    headers[contentType] = 'application/x-www-form-urlencoded'
  }
  self.send()
}

var pro = Proxy.prototype = Object.create(EventEmitter.prototype)

pro.send = function () {
  var self = this
  var options = self.options
  setTimeout(function () {
    try {
      try {
        self.emit('beforesend', options)
      } catch (error) {
        console.error('ignore error ajax beforesend,', error)
      }
      self.doSend()
    } catch (error) {
      console.error('ignore error server error,', error)
      self.onError('serverError', '请求失败:' + e.message)
    }
  }, 0)
}

pro.doSend = f

pro.afterSend = function () {
  var self = this
  setTimeout(function () {
    self.emit('aftersend', self.options)
  }, 0)
}

pro.onLoad = function (event) {
  var self = this
  var options = self.options
  var status = event.status
  var result = event.result
  // check status
  if (('' + status).indexOf('2') !== 0) {
    self.onError('serverError', '服务器返回异常状态', {
      status: status,
      result: result
    })
    return
  }
  // parse json
  if (options.type === 'json') {
    try {
      result = JSON.parse(result)
    } catch (e) {
      console.error('ignore error parse json,', e)
      self.onError('parseError', result)
      return
    }
  }
  // onload
  self.emit('load', result)
}

pro.onError = function (code, message, ext) {
  var obj = util.isObject(ext) ? ext : {}
  obj.code = code || 'error'
  obj.message = message || '发生错误'
  this.emit('error', obj)
}

pro.onTimeout = function () {
  this.onError('timeout', '请求超时')
}

pro.abort = function () {
  this.onError('abort', '客户端中止')
}

pro.header = function (key) {
  var self = this
  if (!util.isArray(key)) {
    return self.getResponseHeader(key || '')
  }
  var result = {}
  key.forEach(function (k) {
    result[k] = self.header(k)
  })
  return result
}

pro.getResponseHeader = f

pro.destroy = f

module.exports = Proxy
