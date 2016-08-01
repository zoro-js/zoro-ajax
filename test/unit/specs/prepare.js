var obj = {}

var httpPort = 7259
obj.getUrl = obj.getHttpUrl = function get (path) {
  return 'http://localhost:' + httpPort + '/' + path
}

var httpsPort = 9527
obj.getHttpsUrl = function get (path) {
  return 'https://localhost:' + httpsPort + '/' + path
}

module.exports = obj
