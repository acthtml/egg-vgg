module.exports = agent => {
  if(agent.config.vgg && agent.config.vgg.enabled){
    const vggTool = require('vgg/tools/plugin');
    vggTool.run(agent.config.vgg.enableHMR);
  }
}
