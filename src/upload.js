/**
* @Author: Zhang Yingya(hzzhangyingya) <zyy>
* @Date:   2016-01-15T10:22:01+08:00
* @Email:  zyy7259@gmail.com
* @Last modified by:   zyy
* @Last modified time: 2016-08-01T14:56:15+08:00
*/

var util = require('zoro-base')
var ajax = require('./ajax')

var upload = function (url, options) {
  options.method = 'POST'
  options.headers = options.headers || {}
  options.headers['Content-Type'] = 'multipart/form-data'
  options.timeout = 0
  options.type = options.type || 'json'
  return ajax(url, options)
}

util.mixin(upload, ajax)

ajax.upload = upload

module.exports = upload
