const path = require('path');
const fs = require('fs-extra');
const _ = require('lodash');

// 页面需要注入的vconsole脚本
const vconsoleScript = `<script src="https://res.wx.qq.com/mmbizwap/zh_CN/htmledition/js/vconsole/3.0.0/vconsole.min.js"></script>
  <script>var vConsole = new VConsole()</script>`;

module.exports = options => {
  return async function vuessr(ctx, next){
    // 只处理GET和HTML请求。
    if(ctx.method != 'GET' || !ctx.accepts('html')) {
      return next();
    }

    // 保证同路由的其他中间件，controller能处理请求。
    await next();

    // 已有中间件处理。
    if(ctx.body || ctx.status != 404) return;

    // 只处理匹配路由的请求。
    const config = ctx.app.config.vgg;
    const siteRoot = endWithSlash(config.siteRoot || '/app/');
    if(endWithSlash(ctx.path).indexOf(siteRoot) != 0) return;

    // 页面上下文。
    let context = {
      // 页面url
      url: endWithSlash(ctx.path).replace(siteRoot, '/'),
      // 站点根目录
      siteRoot: siteRoot,
      // cookies
      cookies: ctx.cookies,
      // koa ctx
      ctx: ctx,
      // 注入wechat vconsole
      vconsole: config.enableVConsole ? vconsoleScript : '',
    }
    let composeContext = config.composeContext;
    if(!composeContext){
      composeContext = (context, ctx) => context
    }
    if(!_.isFunction(composeContext)){
      throw new Error('egg-vgg的配置项composeContext需要是个函数。');
    }
    context = _.extend({}, context, composeContext(context, ctx));

    // 服务端输出。
    try{
      await ctx.render('vue-ssr-server-bundle.json',
        // local context
        context,
        // render options
        // 也可在egg-view-vue中配置。
        {
          renderOptions: {
            // https://ssr.vuejs.org/zh/api.html#runinnewcontext
            runInNewContext: false,
          }
        }
      )
    }catch(e){
      if(_.isNumber(e)){
        ctx.throw(e);
      }else if(_.isError(e)){
        throw e;
      }else{
        throw new Error(e);
      }
    }
  }
}


function endWithSlash(str = ''){
  if(str.charAt(str.length - 1) != '/'){
    str += '/';
  }
  return str;
}

function startWithSlash(str = ''){
  if(str.indexOf('/') != 0){
    str = '/' + str;
  }
  return str;
}
