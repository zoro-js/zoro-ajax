/*
* @Author: Zhang Yingya(hzzhangyingya)
* @Date:   2016-06-03 15:07:41
* @Last Modified by:   Zhang Yingya(hzzhangyingya)
* @Last Modified time: 2016-06-03 15:40:41
*/

var util = {}

util.isFileInput = function (value) {
  return value.tagName && value.tagName.toUpperCase() === 'INPUT'
}

/**
 * 获取所有的 keys
 * putFileAtEnd 表示将文件对应的 keys 放在最后
 */
util.getKeys = function (data, putFileAtEnd) {
  var keys = Object.keys(data)
  if (putFileAtEnd) {
    keys.sort(function (key1, key2) {
      var value1IsFileInput = util.isFileInput(data[key1])
      var value2IsFileInput = util.isFileInput(data[key2])
      // 如果两个值相等, 说明都是文件或者都不是文件, 那么顺序不变
      if (value1IsFileInput === value2IsFileInput) {
        return 0
      } else {
        return value1IsFileInput ? 1 : -1
      }
    })
  }
  return keys
}

module.exports = util
