/**
* @Author: Zhang Yingya(hzzhangyingya) <zyy>
* @Date:   2016-01-13T16:12:52+08:00
* @Email:  zyy7259@gmail.com
* @Last modified by:   zyy
* @Last modified time: 2016-08-01T15:19:31+08:00
*/

var express = require('express')
var http = require('http')
var https = require('https')
var fse = require('fs-extra')
var prettyjson = require('prettyjson')
var multer = require('multer')
var upload = multer()
var path = require('path')

var app = express()

app.use(express.static(path.resolve(__dirname, 'web')))

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, AppKey, Nonce, CurTime, CheckSum')
  // res.header('Access-Control-Max-Age', 604800)
  res.header('Access-Control-Allow-Credentials', true)
  next()
})

app.get('/', function (req, res) {
  res.send('hello')
})

app.get('/ajax', function (req, res) {
  res.send('ajax')
})

app.get('/json', function (req, res) {
  res.send({
    key: 'value'
  })
})

app.post('/upload', upload.any(), function (req, res) {
  var result
  var files = req.files.map(file => {
    delete file.buffer
    return file
  })
  var body = req.body
  var hasBody = Object.keys(body).length > 0
  if (req.query._proxy_ === 'form') {
    result = fse.readFileSync(path.resolve(__dirname, 'web/res/nej_proxy_upload.html'), 'utf8')
    var insert = files
    if (hasBody) {
      insert = {
        files: files,
        body: body
      }
    }
    result = result.replace(/window\.result\s=\s'.*?'/i, "window.result = '" + JSON.stringify(insert) + "'")
    res.setHeader('Content-Type', 'text/html')
  } else {
    result = files
    if (hasBody) {
      result = {
        files: files,
        body: body
      }
    }
  }
  res.send(result)
})

var options = {
  key: fse.readFileSync(path.resolve(__dirname, 'ssh/key.pem')),
  cert: fse.readFileSync(path.resolve(__dirname, 'ssh/cert.pem'))
}

var httpServer = http.createServer(app)
httpServer.listen(7259, function () {
  logAddress(httpServer, 'http')
})
var httpsServer = https.createServer(options, app)
httpsServer.listen(9527, function () {
  logAddress(httpsServer, 'https')
})

function logAddress (server, type) {
  var address = server.address()
  address = type + '://localhost:' + address.port
  log(address)
}

function log (obj) {
  if (typeof obj === 'string') {
    if (obj.length > 100) {
      return
    }
    obj = [obj]
  }
  console.log(prettyjson.render(obj))
}
