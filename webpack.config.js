const config = require('zoro-kit/build/webpack.config.lib.js')({
  output: {
    filename: 'zoro-ajax.js',
    library: 'ZoroAjax'
  },
  externals: [
    {
      'zoro-base': {
        root: 'ZoroBase',
        amd: 'ZoroBase',
        commonjs2: 'zoro-base',
        commonjs: 'zoro-base'
      }
    }
  ]
})

module.exports = config
