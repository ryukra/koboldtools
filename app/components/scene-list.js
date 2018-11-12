import Component from '@ember/component';
import Ember from 'ember';

export default Component.extend({
  store: Ember.inject.service(),
  rollManager: Ember.inject.service(),
  init() {
    this._super(...arguments);
    this.set('errors', []);
  },
  scenetext: '',
  tagName: 'div',
  classNames: 'listcontainer column',
  editable: false,
  actions: {
    newEvent() {
      let r = this.get('rollManager').roll('1d100');
      let table = [{
          name: 'REMOTE EVENT',
          till: 7
        },
        {
          name: 'NPC ACTION',
          till: 28
        },
        {
          name: 'INTRODUCE A NEW NPC',
          till: 35
        },
        {
          name: 'MOVE TOWARD A THREAD',
          till: 45
        },
        {
          name: 'MOVE AWAY FROM A THREAD',
          till: 52
        },
        {
          name: 'CLOSE A THREAD',
          till: 55
        },
        {
          name: 'PC NEGATIVE',
          till: 67
        },
        {
          name: 'PC POSITIVE',
          till: 75
        },
        {
          name: 'AMBIGUOUS EVENT',
          till: 83
        },
        {
          name: 'NPC NEGATIVE',
          till: 92
        },
        {
          name: 'NPC POSITIVE',
          till: 100
        }
      ];
      let event;
      $.each(table, function (index, value) {
        if (r < value.till) {
          event = value.name;
          return false;
        }
      });
      switch (event) {
        case 'PC NEGATIVE':
        case 'PC POSITIVE':
          event = event + ': ' + this.get('rollManager').getRandomRecord('pc');
          break;
        case 'NPC NEGATIVE':
        case 'NPC ACTION':
        case 'NPC POSITIVE':
          event = event + ': ' + this.get('rollManager').getRandomRecord('np');
          break;
        case 'MOVE TOWARD A THREAD':
        case 'MOVE AWAY FROM A THREAD':
        case 'CLOSE A THREAD':
          event = event + ': ' + this.get('rollManager').getRandomRecord('thread');
          break;
      }
      this.createEvent("event", event, false);
    },
    startEdit() {
      this.set('editable', true);
    },
    stopEdit() {
      this.set('editable', false);
    },
    updateText(sid) {
      this.store.peekRecord('scene', sid).save();
    },
    newScene(chaos) {
      let rm = this.get('rollManager');
      let scene;
      let text = this.get('scenetext');
      if (chaos && rm.chaoslevel < 6) {
        this.get('rollManager').incrementProperty('chaoslevel');
      } else if (!chaos && rm.chaoslevel > 3) {
        this.get('rollManager').decrementProperty('chaoslevel');
      }
      let chaosroll = rm.roll('1d10');
      if (chaosroll < rm.chaoslevel) {
        if (rm.isEven(chaosroll)) {
          scene = this.get('store').createRecord('scene', {
            text: text,
            type: 'altered',
            chaos: chaos

          });
        } else {
          scene = this.get('store').createRecord('scene', {
            text: text,
            type: 'interupted',
            chaos: chaos
          });
        }
      } else {
        scene = this.get('store').createRecord('scene', {
          text: text,
          chaos: chaos
        });
      }
      scene.save();
    },
    removeScenes() {
      let component = this;
      this.get('store').findAll('scene', {
        reload: true
      }).then(function (record) {
        record.forEach(function (rec) {
          rec.deleteRecord();
          rec.save();
        })
      }).then(function () {
        let scene = component.get('store').createRecord('scene', {
          text: component.get('scenetext'),
          chaos: false
        });
        scene.save();
      });
      this.get('store').findAll('event', {
        reload: true
      }).then(function (record) {
        record.forEach(function (rec) {
          rec.deleteRecord();
          rec.save();
        })
      });
      this.get('rollManager').set('chaoslevel', 4);
    },
  },
  createEvent(type, text, chaos) {
    let store = this.get('store');
    store.findAll('scene').then(function (scenes) {
      let event = store.createRecord('event', {
        type: type,
        text: text,
        chaos: chaos,
        scene: scenes.lastObject
      });
      event.save();
    })
  }
});
