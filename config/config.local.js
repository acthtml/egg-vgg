const webpackConfig = require('vgg/tools/webpack_config');
module.exports = appInfo => {
  return {
    development: {
      ignoreDirs: ['app/web']
    },
    // https://github.com/hubcarl/egg-webpack
    webpack: {
      webpackConfigList: [
        webpackConfig('client', 'local', {enableHMR: true}),
        webpackConfig('server', 'local', {enableHMR: true})
      ]
    },
    vgg: {
      enableHMR: true
    }
  }
}
