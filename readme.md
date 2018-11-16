# egg-vgg

使[eggjs](https://eggjs.org/zh-cn/)支持前端[vgg框架](https://github.com/acthtml/vgg)。

特性：

- 服务端渲染。
- 静态资源构建和部署。
- 开发时的热更新支持。

依赖：

- [vgg](https://github.com/acthtml/vgg)
- [webpack3](https://webpack.docschina.org/)
- [babel7](https://www.babeljs.cn/)
- [egg-webpack](https://github.com/easy-team/egg-webpack)
- [egg-view-vue](https://github.com/eggjs/egg-view-vue)

## 1. 快速开始

1. 安装依赖
2. 建立目录
3. 启用插件
4. 运行
5. 写个hello world
6. 构建和部署

### 1.1 安装依赖

```bash
  npm i egg egg-bin egg-scripts vgg egg-vgg
```

### 1.2 建立目录

```
  - app
    - web           // 前端工程目录，例如vgg工程 https://github.com/acthtml/vgg
  - config          // egg配置目录。
  - babel.config.js // babel配置（必须）
  - package.json
```

完善``package.json``和``babel.config.js``：

```json
  // 在package.json中添加dev指令：
  {
    "scripts": {
      "dev": "egg-bin dev"
    }
  }
```

```
  // 添加 /babel.config.js
  module.exports = api => {
    api.cache(true);
    return {
      "presets": [
        [
          "@babel/preset-env",
          {
            "modules": false,
            "useBuiltIns": "usage",
            "targets": {
              "browsers": [
                "> 1%",
                "last 2 versions",
                "not ie <= 8"
              ],
              "node": "current"
            }
          }
        ]
      ],
      "plugins": [
        "@babel/plugin-proposal-object-rest-spread",
        "@babel/plugin-syntax-dynamic-import",
        "@babel/plugin-transform-async-to-generator",
        "@babel/plugin-transform-runtime"
      ]
    }
  }
```

### 1.3 eggjs启用插件

```js
  // ${app.baseDir}/config/plugin.js
  module.exports = {
    vgg: {
      enable: true,
      package: 'egg-vgg'
    },
    // egg-view-vue https://github.com/eggjs/egg-view-vue
    vue: {
      enable: true,
      package: 'egg-view-vue'
    },
    // egg-webpack https://github.com/easy-team/egg-webpack
    webpack: {
      enable: true,
      package: 'egg-webpack'
    }
  }
```

### 1.4 运行

```bash
  # 开启本地开发模式，具有热加载功能。
  # 编译完成后访问 http://localhost:7001/app/
  npm run dev
```

### 1.5 hello world

写个案例练个手，需要新建以下文件：

```
  在/app/web目录下：

  - app
    - web
      - router
        - routes.js    // 新增路由文件
      - views
        - hello.vue    // 新增页面组件
  - ...其他文件
```

注册页面路由：

```js
  // router/routes.js
  export default [{
    path: '/',
    component: () => import('../views/hello.vue')
  }]
```

```html
  <template>
    <p>你好，现在时间是：{{time}}</p>
  </template>
  <script>
    export default {
      data(){
        return {
          time: ''
        }
      },
      created(){
        this.time = new Date().toString();
      }
    }
  </script>
```

刷新``http://localhost:7001/app/``看看有什么变化。

### 1.6 构建和部署

添加构建命令和生产环境运行命名。

```json
  // package.json
  {
    "scripts": {
      "dev": "egg-bin dev",
      "build": "vgg-build",
      "start": "eggctl start"
    }
  }
```

```bash
  # 设置生产环境
  export EGG_SERVER_ENV=prod

  # 构建静态资源，产物在public/static里。
  npm run build

  # 生产环境运行，关闭热加载。
  npm start
```


## 2. 进阶

### 2.1 webpack配置和cdn设置

```js
  // 开本地开发是，我们一般需要开启热加载：
  // /config/config.local.js
  exports.webpack = {
    webpackConfigList: [
      webpackConfig('client', 'local', {enableHMR: true}),
      webpackConfig('server', 'local', {enableHMR: true})
    ]
  }

  // 在生产环境，我们需要关闭热加载，并将静态资源我们是会放到cdn上的：
  // /config/config.prod.js
  exports.webpack = {
    webpackConfigList: [
      webpackConfig('client', 'prod', {
        client: {
          publicPath:'//cdn.example.com/'
        }
      }),
      webpackConfig('server', 'prod', {
        client: {
          publicPath:'//cdn.example.com'
        }
      })
    ]
  }
  // 更多配置查看： https://github.com/easy-team/egg-webpack

```

### 2.2 vue服务端渲染设置

```js
  // 参考： https://github.com/eggjs/egg-view-vue
  // {app_root}/config/config.default.js
  exports.vue = {
     // renderOptions config, please @see https://ssr.vuejs.org/en/api.html#renderer-options
     renderOptions: {
       // template: '<!DOCTYPE html><html lang="en"><body><!--vue-ssr-outlet--></body></html>',

       // webpack vue ssr plugin build manifest file
       // clientManifest: require(path.join(app.baseDir,'public/vue-ssr-client-manifest.json')),
     }
  };
```

### 2.3 vgg插件配置

```js
  exports.vgg = {
    // 站点根目录，以'/'结尾。
    siteRoot: '/app/',
    // 是否开启热更新，默认只在local环境开启热加载。
    enableHMR: false,
    // 编写上下文，
    composeContext: (context, ctx) => {
      // 默认包含以下属性
      return {
        // 页面url
        url: ctx.url.replace(app.config.vgg.siteRoot, ''),
        // 站点根目录
        siteRoot: app.config.vgg.siteRoot,
        // cookies
        cookies: ctx.cookies,
        // koa ctx
        ctx: ctx
      }
    },
    // 是否开启[vconsole.log](https://github.com/WechatFE/vConsole)
    enableVConsole: false,
    // 是否开启service worker来缓存前端资源
    enableServiceWorker: false
  }
```
