/**
* @Author: Zhang Yingya(hzzhangyingya) <zyy>
* @Date:   2016-01-10T17:15:58+08:00
* @Email:  zyy7259@gmail.com
* @Last modified by:   zyy
* @Last modified time: 2016-08-01T14:56:23+08:00
*/

var util = require('zoro-base')
var pu = require('./util')
var Proxy = require('./index')

var flag = 'NEJ-UPLOAD-RESULT:'
var cache = {}

function ProxyUpload (options) {
  var self = this
  self.init()
  Proxy.call(self, options)
}

var sp = Proxy.prototype
var pro = ProxyUpload.prototype = Object.create(sp)

pro.init = (function () {
  var init = false
  function onMessage (event) {
    var data = event.data
    if (data.indexOf(flag) !== 0) { return }
    data = JSON.parse(data.replace(flag, ''))
    var key = data.key
    var proxy = cache[key]
    if (!proxy) { return }
    delete cache[key]
    data.result = decodeURIComponent(data.result || '')
    proxy.onLoad(data.result)
  }
  function initMessage () {
    if (!init) {
      init = true
      util.on(window, 'message', onMessage)
    }
  }
  return function () {
    initMessage()
  }
}())

pro.doSend = function () {
  var self = this
  var options = self.options
  var key = self.key = util.uniqueID()
  cache[key] = self
  // create form
  var form = self.form = util.html2node('<form style="display:none;"></form>')
  document.body.appendChild(form)
  form.target = key
  form.method = 'POST'
  form.enctype = 'multipart/form-data'
  form.encoding = 'multipart/form-data'
  var url = options.url
  var sep = util.genUrlSep(url)
  form.action = url + sep + '_proxy_=form'
  // 处理参数
  var data = options.data
  var files = []
  var fileClones = []
  if (data) {
    pu.getKeys(data, options.putFileAtEnd).forEach(function (key) {
      var value = data[key]
      if (value.tagName && value.tagName.toUpperCase() === 'INPUT') {
        if (value.type === 'file') {
          var file = value
          var fileClone = file.cloneNode(true)
          file.parentNode.insertBefore(fileClone, file)
          var name = util.dataset(file, 'name')
          if (name) {
            file.name = name
          }
          form.appendChild(file)
          // Remove the HTML5 form attribute from the input
          file.setAttribute('form', '')
          file.removeAttribute('form')
          files.push(value)
          fileClones.push(fileClone)
        }
      } else {
        var input = util.html2node('<input type="hidden"/>')
        input.name = key
        input.value = value
        form.appendChild(input)
      }
    })
  }
  function restoreFiles () {
    // 将 input 放回原处
    files.forEach(function (file, index) {
      var fileClone = fileClones[index]
      file.name = fileClone.name
      file.setAttribute('form', fileClone.getAttribute('form'))
      fileClone.parentNode.replaceChild(file, fileClone)
    })
  }
  // create iframe
  var iframe = self.iframe = util.createIframe({
    name: key,
    onload: function () {
      // check aborted
      if (self.aborted) {
        restoreFiles()
        return
      }
      util.on(iframe, 'load', self.checkResult.bind(self))
      form.submit()
      restoreFiles()
      self.afterSend()
    }
  })
}

// same domain upload result check
pro.checkResult = function () {
  var self = this
  var body
  var text
  try {
    body = self.iframe.contentWindow.document.body
    text = (body.innerText || body.textContent || '').trim()
    // if same domain with upload proxy html, use post message path
    if (text.indexOf(flag) >= 0 ||
      body.innerHTML.indexOf(flag) >= 0) {
      return
    }
  } catch (e) {
    // ignore if not same domain
    console.error('ignore', e)
    return
  }
  self.onLoad(text)
}

pro.onLoad = function (result) {
  var self = this
  sp.onLoad.call(self, {
    status: 200,
    result: result
  })
  // do the destroy work
  util.remove(self.form)
  util.remove(self.iframe)
  sp.destroy.call(self)
}

// do nothing when destroy, this will let the iframe load, so we can restoreFiles.
// pro.destroy = function() {
//     var self = this
//     util.remove(self.form)
//     util.remove(self.iframe)
//     sp.destroy.call(self)
// }

pro.abort = function () {
  var self = this
  self.aborted = true
  delete cache[self.key]
  sp.abort.call(self)
}

module.exports = ProxyUpload
