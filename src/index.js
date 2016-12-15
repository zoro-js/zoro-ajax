const ajax = require('./ajax')
const json = require('./json')
const upload = require('./upload')

ajax.json = json
ajax.upload = upload

module.exports = ajax
