'use strict';

class View {
  constructor(ctx) {
    this.app = ctx.app;
  }

  render(name, locals, options) {
    return this.app.vue.renderBundle(name, locals, options || /* istanbul ignore next */ {});
  }

  renderString(tpl, locals) {
    return this.app.vue.renderString(tpl, locals);
  }
}

module.exports = View;
