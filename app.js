module.exports = app => {
  app.config.appMiddleware.unshift('vuessr');
}
