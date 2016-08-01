/**
* @Author: Zhang Yingya(hzzhangyingya) <zyy>
* @Date:   2016-01-06T16:44:36+08:00
* @Email:  zyy7259@gmail.com
* @Last modified by:   zyy
* @Last modified time: 2016-08-01T15:04:06+08:00
*/

var util = require('zoro-base')
var ajax = require('./ajax')

var json = (function () {
  var regJson = /json/i
  var regPost = /post/i
  return function (url, options) {
    options = options || {}
    var data = options.data = options.data || {}
    // parse headers
    var headers = options.headers = options.headers || {}
    var accept = util.checkWithDefault(headers, 'Accept', 'application/json')
    var contentType = util.checkWithDefault(headers, 'Content-Type', 'application/json')
    // response data format
    if (regJson.test(accept)) {
      options.type = 'json'
    }
    // post data
    if (regPost.test(options.method) && regJson.test(contentType)) {
      options.data = JSON.stringify(data)
    }
    return ajax(url, options)
  }
}())

util.mixin(json, ajax)

ajax.json = json

module.exports = json
