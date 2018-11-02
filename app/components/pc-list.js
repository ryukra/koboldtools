import Component from '@ember/component';

export default Component.extend({
  init() {
    this._super(...arguments);
    this.set('errors', []);
  },
  tagName: 'div',
  classNames: 'listcontainer column',
  actions: {
    clearInput() {
      this.set('pcname', '');
    }
  }

});
