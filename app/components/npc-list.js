import Component from '@ember/component';
import Ember from 'ember';

export default Component.extend({
  store: Ember.inject.service(),
  rollManager: Ember.inject.service(),
  traitdeleting: false,
  init() {
    this._super(...arguments);
    this.set('errors', []);
  },
  tagName: 'div',
  classNames: 'listcontainer column',
  actions: {
    addNPC(npc) {
      if (npc != "" && npc != undefined) {
        let d = this.get('rollManager').roll('2d10');
        let npcrec = this.get('store').createRecord('np', {
          name: npc,
          basedisposition: d,
          disposition: d
        });
        npcrec.save();
      }
      this.set('npname', '');
    },
    addTrait(id, trait) {
      let t = trait;
      let store = this.get('store');
      store.findRecord('np', id).then(function (np) {
        let traitrec = store.createRecord('identity', {
          name: t,
          state: 0,
          npc: np
        });
        traitrec.save();
      })
      this.set('traitinput', '');
    },
    removeTrait(id) {
      this.get('store').findRecord('identity', id).then(function (rec) {
        rec.deleteRecord();
        rec.save();
      });
    },
    changeTraitState(tid, nid) {
      let trait = this.get('store').peekRecord('identity', tid);
      let state = trait.get('state') + 1;
      if (state > 2) {
        state = 0;
      }
      trait.set('state', state);
      trait.save();
      this.calcDisposition(nid);
    },
    clearNPC() {
      this.get('store').findAll('np', {
        reload: true
      }).then(function (record) {
        record.forEach(function (rec) {
          rec.deleteRecord();
          rec.save();
        })
      });
    },
    removeNPC(nid) {
      let rec = this.get('store').peekRecord('np', nid)
      rec.get('identities').then((identities) => {
        identities.forEach((i) => {
          i.deleteRecord();
          i.save();
        })
      })
      rec.deleteRecord();
      rec.save();
    },
    changeDisposition(id,change) {
      this.changeNPCDisposition(id, change);
    },
    behaviorCheck(id) {
      let np = this.get('store').peekRecord("np", id);
      let d;
      let npname;
      if (np.get('name')) {
        npname = np.get('name');
        d = np.get('disposition');
      }
      let behaviortext = npname + ": " + this.actionCheck(id, d);
      this.createEvent(behaviortext);
    }
  },
  actionCheck(id, d) {
    let tis = this;
    let action1;
    let action2;
    let roll = this.get('rollManager').roll('2d20');
    let action = function () {return ' '};

    switch (this.get('rollManager').roll('1d10')) {
      case 1:
      case 2:
      case 3:
        action1 = "THEME ACTION";
        break;
      case 4:
      case 5:
        action1 = "NPC CONTINUES";
        break;
      case 6:
        action1 = "NPC CONTINUES +2";
        this.changeNPCDisposition(id, "add");
        break;
      case 7:
        action1 = "NPC CONTINUES -2";
        this.changeNPCDisposition(id, "sub");
        break;
      case 8:
        action1 = "NPC ACTION:";
        action = function () {
          return tis.detailAction(id, roll, d);
        }
        break;
      case 9:
        action1 = "NPC ACTION -4:";
        action = function () {
          return tis.detailAction(id, roll - 4, d);
        }
        break;
      case 10:
        action1 = "NPC ACTION +4:";
        action = function () {
          return tis.detailAction(id, roll + 4, d);
        };
        break;
      default:
        action1 = "THEME ACTION";
        break;
  }
  action2 = action();
  return action1 + ' ' + action2;
    
  },
  detailAction(id, r, d) {
    let action;
    if (d > 15) {
      r = r + 4;
    } else if (d > 10) {
      r = r + 2;
    } else if (d < 6) {
      r = r - 2;
    }
    switch (r) {
      case 6:
        action = "TALKS, EXPOSITION";
        break;
      case 7:
      case 8:
        action = "PERFORMS AND AMBIGUOUS ACTION";
        break;
      case 9:
      case 10:
        action = "ACTS OUT OF PC INTEREST";
        break;
      case 11:
        action = "GIVES SOMETHING";
        break;
      case 12:
        action = "SEEKS TO END THE ENCOUNTER";
        break;
      case 13:
        action = "CHANGES THE THEME";
        break;
      case 14:
        action = "CHANGES DESCRIPTOR";
        break;
      case 15:
      case 16:
      case 17:
        action = "ACTS OUT OF SELF INTEREST";
        break;
      case 18:
        action = "TAKES SOMETHING";
        break;
      case 19:
      default:
        if (r > 19) {
          action = "CAUSES HARM";
        } else {
          action = "TALKS, EXPOSITION";
        }
        break;
    }

    return action;
  },
  changeNPCDisposition(id, change) {
    let component = this;
    this.store.findRecord('np', id).then(function (np) {
      let d = np.get('basedisposition');

      switch (change) {
        case "add":
          d = d + 2;
          break;
        case "sub":
          d = d - 2;
          break;
      }

      np.set('basedisposition', d);
      component.calcDisposition(id);
    })
  },
  calcDisposition(id) {
    this.store.findRecord('np', id).then(function (np) {
      let traits = np.get('identities');
      let dispo = np.get('basedisposition');
      traits.forEach((t) => {
        let state = t.get('state');
        if (state == 1) {
          dispo = dispo + 2;
        } else if (state == 2) {
          dispo = dispo - 2;
        }
      });
      np.set('disposition', dispo);
      np.save();
    });
  },
  createEvent(text) {
    let store = this.get('store');
     store.findAll('scene').then(function (scenes) {
       let event = store.createRecord('event', {
         type: 'npc',
         text: text,
         chaos: false,
         scene: scenes.lastObject
       });
       event.save();
     })
  }
});
