const path = require('path');
const getAppTemplatePath = require('../../lib/get_app_template_path');

module.exports = {
  /**
   * render vue bundle
   * @param  {String} name    filename
   * @param  {Object} [locals]  template data
   * @param  {Object} options options
   * @return {Object}         Promise
   */
  render(name, locals, options){
    return render.bind(this)(this.app, name, locals, options).then(html => {
      this.body = html;
    });
  }
}

// 用于server render 的template和clientManifest。
let template,
    clientManifest;
async function render(app, name, locals, options = {}){
  locals = Object.assign({}, app.locals, this.locals, locals);
  const config = app.config.vgg;
  let filepath = path.join(app.config.view.root[0], name);
  // vue server render bundle。可以是bundle对象，也可以绝对地址。
  // - 热更新时，传递bundle对象
  // - 其余情况，传递绝对地址。
  let serverBundle = filepath;
  let passCacheTemplate = false,
      passCacheManifest = false;

  // 开发阶段或热更新模式，需要实时获取创建bundleRenderer
  // bundleRender需要3要素，这些都在这里实时获取并重置。
  // - serverBundle
  // - template
  // - clientManifest
  if(app.config.env == 'local' || app.vue.enableHMR){
    // 清除历史缓存
    app.vue.bundleCache && app.vue.bundleCache.reset();

    // 获取serverBundle, clientManifest, template
    // 1. template
    passCacheTemplate = true;

    // 1. HMR模式 serverBundle/clientManifest
    if(config.enableHMR && app.webpack){
      serverBundle = await app.webpack.fileSystem.readWebpackMemoryFile(filepath).then(filecontent => {
        if(path.extname(filepath) == '.json') filecontent = JSON.parse(filecontent)
        return filecontent;
      });
      clientManifest = await app.webpack.fileSystem.readWebpackMemoryFile(config.clientManifest).then(filecontent => {
        if(path.extname(filepath) == '.json') filecontent = JSON.parse(filecontent)
        return filecontent;
      });
    }
    // 2. 非HMR模式 clientManifest
    else{
      passCacheManifest = true;
    }
  }

  // 3. 重置renderOptioins中的template/clientManifest
  let renderOptions = Object.assign({}, options.renderOptions, getTemplateAndClientManifest(config, passCacheTemplate, passCacheManifest));
  options.renderOptions = renderOptions
  return app.vue.renderBundle(serverBundle, locals, options);
}


/**
 * 获取template和clientManifest
 * @param  {[type]}  config            [description]
 * @param  {Boolean} passCacheTemplate [description]
 * @param  {Boolean} passCacheManifest [description]
 * @return {[type]}                    [description]
 */
function getTemplateAndClientManifest(config, passCacheTemplate = false, passCacheManifest = false){
  if(typeof template == 'undefined' || passCacheTemplate){
    template = require('fs').readFileSync(getAppTemplatePath(), 'utf-8');
  }

  if(typeof clientManifest == 'undefined' || passCacheManifest){
    // clientManifest
    if(path.extname(config.clientManifest) == '.json'){
      delete require.cache[config.clientManifest];
      clientManifest = require(config.clientManifest);
    }else{
      clientManifest = require('fs').readFileSync(config.clientManifest, 'utf-8');
    }
  }
  return {template, clientManifest}
}
