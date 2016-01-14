var obj = {};

var port = 7259;
obj.getUrl = function get(path) {
    return 'http://localhost:' + port + '/' + path;
};

module.exports = obj;