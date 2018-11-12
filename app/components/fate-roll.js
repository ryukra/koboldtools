import Component from '@ember/component';
import Ember from 'ember';
import {later} from '@ember/runloop';

export default Component.extend({
  store: Ember.inject.service(),
  rollManager: Ember.inject.service(),
  fate: "...",
  chaoslevel: Ember.computed('rollManager.chaoslevel', function () {
    return this.get('rollManager').chaoslevel;
  }),
  tagName: 'div',
  classNames: 'fateroll listcontainer column',
  actions: {
    roll(r) {
      let rm = this.get('rollManager');
      this.set('fate', "...");
      let r1 = rm.roll('1d10');
      let r2 = rm.roll('1d10');
      let mod = parseInt(r) + rm.get('chaosfavor');
      let component = this;
      let roll = r1 + r2 + mod;
      let chaosroll = rm.roll('1d10');
      let extra = "";
      let chaoslevel = rm.get('chaoslevel');
      later((function () {
        if (chaosroll < chaoslevel) {
          if (r1 == r2) {
            extra = "! and..";
          } else if (rm.isOdd(r1) && rm.isOdd(r2)) {
            extra = "!";
          } else if (rm.isEven(r1) && rm.isEven(r2)) {
            extra = " and..";
          }
        }
        if (roll > 10) {
          component.set('fate', "yes" + extra);
        } else {
          component.set('fate', "no" + extra);
        }
      }), 500);
    },
    changeFavor(n) {
      this.get('rollManager').set('chaosfavor', parseInt(n));
    },
    detailCheck() {
      let text;
      let rm = this.get('rollManager');
      let chaosdetail = 0;
      if (rm.get('chaoslevel') > 5) {
        chaosdetail = -2;
      }
      if (rm.get('chaoslevel') < 4) {
        chaosdetail = 2;
      }
      switch (rm.roll('2d10') + chaosdetail) {
        case 0:
          break;
        case 1:
        case 2:
        case 3:
        case 4:
          text = "ANGER";
          break;
        case 5:
          text = "SADNESS";
          break;
        case 6:
          text = "FEAR";
          break;
        case 7:
          text = "DISFAVORS THREAD";
          text = text + ': ' + rm.getRandomRecord('thread');
          break;
        case 8:
          text = "DISFAVORS PC";
          text = text + ': ' + rm.getRandomRecord('pc');
          break;
        case 9:
          text = "FOCUS NPC";
          text = text + ': ' + rm.getRandomRecord('np');
          break;
        case 10:
          text = "FAVORS NPC";
          text = text + ': ' + rm.getRandomRecord('np');
          break;
        case 11:
          text = "FOCUS PC";
          text = text + ': ' + rm.getRandomRecord('pc');
          break;
        case 12:
          text = "DISFAVORS NPC";
          text = text + ': ' + rm.getRandomRecord('np');
          break;
        case 13:
          text = "FOCUS THREAD";
          text = text + ': ' + rm.getRandomRecord('thread');
          break;
        case 14:
          text = "FAVORS PC";
          text = text + ': ' + rm.getRandomRecord('pc');
          break;
        case 15:
          text = "FAVOR THREAD";
          text = text + ': ' + rm.getRandomRecord('thread');
          break;
        case 16:
          text = "COURAGE";
          break;
        case 17:
          text = "HAPPINESS";
          break;
        case 18:
        default:
          text = "CALM";
          break;
      }
      this.createEvent('Detail: '+text);
    }
  },
  createEvent(text) {
    let store = this.get('store');
    store.findAll('scene').then(function (scenes) {
      let event = store.createRecord('event', {
        type: 'detail',
        text: text,
        chaos: false,
        scene: scenes.lastObject
      });
      event.save();
    })
  }
});
