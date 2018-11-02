import Controller from '@ember/controller';
import $ from 'jquery';
import { later } from '@ember/runloop';


export default Controller.extend({
  chaoslevel: 4,
  chaosfavor: 0,
  traitdeleting: false,
  fate: "...",
  actions: {
    newScene(chaos) {
      let scene;
      if (chaos && this.get('chaoslevel') < 6) {
        this.incrementProperty('chaoslevel');
      } else if(!chaos && this.get('chaoslevel')> 3){
        this.decrementProperty('chaoslevel');
      }
      let chaosroll = this.r1d10(0);
      if ( chaosroll < this.get('chaoslevel')) {
        if (this.isEven(chaosroll)) {
          scene = this.store.createRecord('scene', {
            text: 'New Scene',
            type: 'altered',
            chaos: chaos
            
          });
        } else {
          scene = this.store.createRecord('scene', {
            text: 'New Scene',
            type: 'interupted',
            chaos: chaos
          });
        }
      } else {
        scene = this.store.createRecord('scene', {
          text: 'New Scene',
          chaos: chaos
        });
      }
      scene.save();
    },
    changeChaos(fid) {
      this.store.findRecord('scene', fid).then(function (record){
        record.toggleProperty('chaos');
        record.save();
      });
    },
    changeFavor(n) {
      this.set('chaosfavor', parseInt(n));
    },
    removeScenes() {
      let stor = this.store;
      this.store.findAll('scene', {
        reload: true
      }).then(function (record) {
        record.forEach(function (rec) {
          rec.deleteRecord();
          rec.save();
        })
      }).then(function () {
        let scene = stor.createRecord('scene', {
          text: 'New Scene',
          chaos: false
        });
        scene.save();
      });
      this.store.findAll('event', {
        reload: true
      }).then(function (record) {
        record.forEach(function (rec) {
          rec.deleteRecord();
          rec.save();
        })
      });
      this.set('chaoslevel', 4);
    },
    updateText(sid) {
      this.store.peekRecord('scene', sid).save();
    },
    addNPC(npc) {
      if (npc != "" && npc != undefined) {
        let d = this.r2d10(0)
        let npcrec = this.store.createRecord('np', {
          name: npc,
          basedisposition: d,
          disposition: d
        });
        npcrec.save();
      }

    },
    addTrait(id, trait) {
      let t = trait;
      let store = this.store;
      store.findRecord('np',id).then(function (np) {
        let traitrec = store.createRecord('identity',{
          name: t,
          state: 0,
          npc: np
        });
        traitrec.save();
      })
    },
    removeTrait(id) {
      this.store.findRecord('identity', id).then(function (rec) {
        rec.deleteRecord();
        rec.save();
      });
    },
    changeTraitState(tid,nid) {
      let trait = this.store.peekRecord('identity', tid);
      let state = trait.get('state') + 1;
      if (state > 2) {
        state = 0;
      }
      trait.set('state', state);
      trait.save();
      this.calcDisposition(nid);
    },
    changeDisposition(id, change) {
      this.changeNPCDispo(id, change);
    },
    clearNPC() {
      this.store.findAll('np', {
        reload: true
      }).then(function (record) {
        record.forEach(function (rec) {
          rec.deleteRecord();
          rec.save();
        })
      });
    },
    removeNPC(nid) {
      let rec = this.store.peekRecord('np', nid)
      rec.get('identities').then((identities) => {
        identities.forEach((i) => {
          i.deleteRecord();
          i.save();
        })
      })
      rec.deleteRecord();
      rec.save();
    },
    addThread(thread) {
      if (thread != "" && thread != undefined) {
        let threadrec = this.store.createRecord('thread', {
          name: thread
        });
        threadrec.save();
      }
    },
    removeThread(tid) {
      this.store.findRecord('thread', tid).then(function (rec) {
        rec.deleteRecord();
        rec.save();
      });
    },
    clearThreads() {
      this.store.findAll('thread', {
        reload: true
      }).then(function (record) {
        record.forEach(function (rec) {
          rec.deleteRecord();
          rec.save();
        })
      });
    },
    addPC(pc) {
        if (pc != "" && pc != undefined) {
          let pcrec = this.store.createRecord('pc', {
            name: pc
          });
          pcrec.save();
        }
    },
    removePC(pid) {
      this.store.findRecord('pc', pid).then(function (rec) {
        rec.deleteRecord();
        rec.save();
      });
    },
    clearPC() {
      this.store.findAll('pc', {
        reload: true
      }).then(function (record) {
        record.forEach(function (rec) {
          rec.deleteRecord();
          rec.save();
        })
      });
    },
    roll(n, r, id) {
      switch (n) {
        case 'fate':
          this.set('fate', "...");
          let r1 = this.r1d10(0);
          let r2 = this.r1d10(0);
          let mod = parseInt(r) + this.get('chaosfavor');
          let roll = r1 + r2 + mod;
          let tis = this;
          let chaosroll = this.r1d10(0);
          let extra = "";
          let chaoslevel = this.get('chaoslevel');
          later((function () {
            if (chaosroll < chaoslevel) {
              if (r1 == r2) {
                extra = "! and..";
              } else if (tis.isOdd(r1) && tis.isOdd(r2)) {
                extra = "!";
              } else if (tis.isEven(r1) && tis.isEven(r2)) {
                extra = " and..";
              }
            }
            if (roll > 10) {
              tis.set('fate', "yes" + extra);
            } else {
              tis.set('fate', "no" + extra);
            }
          }), 500);
          break;
        case 'check':
          this.detailCheck(this.r2d10(r));
          break;  
        case 'behavior':
          this.actionCheck(id, this.r1d10(0));
          break;
        case 'event':
          this.eventCheck(this.r1d100(0));
          break;
        default:
          break;
      }
    }
  },
  r1d100(m) {
    let roll = Math.floor(Math.random() * 99 + 1) + parseInt(m);
    return roll;
  },
  r2d10(m) {
    let r1 = this.r1d10(0);
    let r2 = this.r1d10(0);
    let roll = r1 + r2 + parseInt(m);
    return roll;
  },
  r1d10(m) {
    let roll = Math.floor(Math.random() * 9 + 1) + parseInt(m);
    return roll;
  },
  detailCheck(r) {
    let type;
    let chaosdetail = 0;
    if (this.get('chaoslevel') > 5) {
      chaosdetail = -2;
    }
    if (this.get('chaoslevel') < 4) {
      chaosdetail = 2;
    }
    switch (r+chaosdetail) {
      case 0:
        break;
      case 1:
      case 2:
      case 3:
      case 4:
        type = "ANGER";
        break;
      case 5:
        type = "SADNESS";
        break;
      case 6:
        type = "FEAR";
        break;
      case 7:
        type = "DISFAVORS THREAD";
        type = type + ': ' + this.getRandomRecord('thread');
        break;
      case 8:
        type = "DISFAVORS PC";
        type = type + ': ' + this.getRandomRecord('pc');
        break;
      case 9:
        type = "FOCUS NPC";
        type = type + ': ' + this.getRandomRecord('np');
        break;
      case 10:
        type = "FAVORS NPC";
        type = type + ': ' + this.getRandomRecord('np');
        break;
      case 11:
        type = "FOCUS PC";
        type = type + ': ' + this.getRandomRecord('pc');
        break;
      case 12:
        type = "DISFAVORS NPC";
        type = type + ': ' + this.getRandomRecord('np');
        break;
      case 13:
        type = "FOCUS THREAD";
        type = type + ': ' + this.getRandomRecord('thread');
        break;
      case 14:
        type = "FAVORS PC";
        type = type + ': ' + this.getRandomRecord('pc');
        break;
      case 15:
        type = "FAVOR THREAD";
        type = type + ': ' + this.getRandomRecord('thread');
        break;
      case 16:
        type = "COURAGE";
        break;
      case 17:
        type = "HAPPINESS";
        break;
      case 18:
      default:
        type = "CALM";
        break;
    }
    this.createEvent(type);
  },
  rollIdentity() {
    
  },
  eventCheck(r) {
    let table = [
      {
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
        event = event + ': ' + this.getRandomRecord('pc');
        break;
      case 'NPC NEGATIVE':
      case 'NPC ACTION':
      case 'NPC POSITIVE':
        event = event + ': ' + this.getRandomRecord('np');
        break;
      case 'MOVE TOWARD A THREAD':
      case 'MOVE AWAY FROM A THREAD':
      case 'CLOSE A THREAD':
        event = event + ': ' + this.getRandomRecord('thread');
        break;
    }
    this.createEvent(event, "", false);
  },
  actionCheck(id, r) {
    let tis = this;
    let event;
    let np = this.store.peekRecord("np", id);
    let name;
    let d;
    let action = function(){};
    if (np.get('length') > 0) {
      name = np.get('name');
      d = np.get('disposition');
    }
    
    switch (r) {
      case 1:
      case 2:
      case 3:
        event = "THEME ACTION";
        break;
      case 4:
      case 5:
        event = "NPC CONTINUES";
        break;
      case 6:
        event = "NPC CONTINUES +2";
        this.changeNPCDispo(id,"add");
        break;
      case 7:
        event = "NPC CONTINUES -2";
        this.changeNPCDispo(id, "sub");
        break;
      case 8:
        event = "NPC ACTION:";
        action = function () {
          tis.detailAction(id, tis.r2d10(0), d);
        }
        break;
      case 9:
        event = "NPC ACTION -4:";
        action = function () {
          tis.detailAction(id, tis.r2d10(-4), d);
        }
        break;
      case 10:
        event = "NPC ACTION +4:";
        action = function () {
          tis.detailAction(id, tis.r2d10(+4), d);
        };
        break;
      default:
         event = "THEME ACTION";
         break;
    }
    this.createEvent(name + ": " + event);
    action();
  },
  detailAction(id,r,d) {
    let action;
    if (d > 15) {
      r = r +4;
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
    this.createEvent(action);
  },
  getRandomRecord(m) {
    let recordname = "from PC lists";
    let records = this.store.peekAll(m);
    if (records.get('length') > 0) {
      let rand = Math.floor(Math.random() * records.get('length'));
      recordname = records.objectAt(rand).get('name');
    }
    return recordname;
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
  changeNPCDispo(id,change){
    let tis = this;
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
      tis.calcDisposition(id);
    })
  },
  createEvent(type,text,chaos) {
    let store = this.store;
    store.findAll('scene').then(function (scenes) {
      let event = store.createRecord('event', {
        type: type,
        text: text,
        chaos: chaos,
        scene: scenes.lastObject
      });
      event.save();
    })
  },
  isEven(n) {
    return n % 2 == 0;
  },
  isOdd(n) {
    return Math.abs(n % 2) == 1;
  }
});

