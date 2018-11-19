const path = require('path');
const getAppTemplatePath = require('../lib/get_app_template_path');
const webpackConfig = require('vgg/tools/webpack_config');

module.exports = appInfo => {
  return {
    static: {
      prefix: '/public/',
      dir: path.join(appInfo.baseDir, 'public')
    },
    vue: {
      renderOptions: {
        // https://ssr.vuejs.org/zh/api.html#runinnewcontext
        runInNewContext: false,
        shouldPreload(file, type){
          return false;
        },
        shouldPrefetch: (file, type) => {
          return false;
        }
      }
    },
    // https://github.com/hubcarl/egg-webpack
    webpack: {
      port: (Number(process.env.PORT || 7001) + 1),
      // proxy: true
      webpackConfigList: [
        webpackConfig('client', 'local', {}),
        webpackConfig('server', 'local', {})
      ]
    },
    vgg: {
      enabled: true,
      // 站点根目录，以'/'结尾。
      siteRoot: '/app/',
      // 是否开启热更新，默认只在local环境开启热加载。
      enableHMR: false,
      // 编写上下文context。context是vue服务端渲染asyncData()的第一个参数。
      composeContext: (context, ctx) => {
        // context默认包含以下属性:
        // - url 页面url
        // - siteRoot 站点根目录
        // - cookies
        // - ctx
        return context;
      },
      // 是否开启[vconsole.log](https://github.com/WechatFE/vConsole)
      enableVConsole: false,
      // 是否开启service worker来缓存前端资源
      enableServiceWorker: false,
      // 下面是服务端渲染的相关配置：
      // vue ssr renderOptions.template's path
      // https://ssr.vuejs.org/zh/api.html#renderer-options
      template: getAppTemplatePath(),
      // vue ssr renderOptions.clientManifest's path
      // https://ssr.vuejs.org/zh/api.html#renderer-options
      clientManifest: path.join(appInfo.baseDir, 'public/static/vue-ssr-client-manifest.json'),
      // vue ssr serverBundle's path
      // https://ssr.vuejs.org/zh/api.html#webpack-plugins
      // 这地址不用设置，跟webpack server config的输出产物的地址有关，建议输出到下面这个
      // 默认地址。
      // serverBundle: path.join(appInfo.baseDir, 'app/view/vue-ssr-server-bundle.json')
    }
  }
}
