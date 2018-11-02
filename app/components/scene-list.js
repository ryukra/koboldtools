import Component from '@ember/component';

export default Component.extend({
  init() {
    this._super(...arguments);
    this.set('errors', []);
  },
  tagName: 'div',
  classNames: 'listcontainer column',
  editable: false,
  actions: {
    startEdit() {
      this.set('editable', true);
    },
    stopEdit() {
      this.set('editable', false);
    }
  }
});
