/**
 * find app.template.html's path
 */

const path = require('path');
const fs = require('fs');

/**
 * 获取 app.template.html 的地址，优先当前工作目录的，其次是vgg默认模板地址。
 * @return {[type]} [description]
 */
module.exports = () => {
  let templatePath;
  try{
    templatePath = path.join(process.cwd(), 'app/web/views/app.template.html');
    fs.readFileSync(templatePath);
  }catch(e){
    templatePath = require.resolve('vgg/src/views/app.template.html');
  }
  if(!templatePath) throw new Error('没有找到app.template.html')
  return templatePath;
}
