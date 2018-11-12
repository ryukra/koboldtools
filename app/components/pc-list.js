import Component from '@ember/component';
import Ember from 'ember';

export default Component.extend({
  store: Ember.inject.service(),
  init() {
    this._super(...arguments);
    this.set('errors', []);
  },
  tagName: 'div',
  classNames: 'listcontainer column',
  actions: {
    addPC(pc) {
      if (pc != "" && pc != undefined) {
        let pcrec = this.get('store').createRecord('pc', {
          name: pc
        });
        pcrec.save();
      }
      this.set('pcname', '');
    },
    removePC(pid) {
      this.get('store').findRecord('pc', pid).then(function (rec) {
        rec.deleteRecord();
        rec.save();
      });
    },
    clearPC() {
      this.get('store').findAll('pc', {
        reload: true
      }).then(function (record) {
        record.forEach(function (rec) {
          rec.deleteRecord();
          rec.save();
        })
      });
    }
  }

});
