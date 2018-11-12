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
    addThread(thread) {
      if (thread != "" && thread != undefined) {
        let threadrec = this.get('store').createRecord('thread', {
          name: thread
        });
        threadrec.save();
      }
      this.set('tname', '');
    },
    removeThread(tid) {
      this.get('store').findRecord('thread', tid).then(function (rec) {
        rec.deleteRecord();
        rec.save();
      });
    },
    clearThreads() {
      this.get('store').findAll('thread', {
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
