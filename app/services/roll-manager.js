import Service from '@ember/service';
import Ember from 'ember';

export default Service.extend({
  store: Ember.inject.service(),
  chaoslevel: 4,
  chaosfavor:0,
  init() {
    this._super(...arguments);

  },
  initTables() {
    
  },
  roll(formula) {
    var pieces = this.parse(formula);
    if (pieces === null) {
      return null;
    }

    var results = [];
    results.rolls = [];
    results.modifier = 0;
    results.total = 0;

    // rolls
    for (let i = 0; i < pieces.rolls; i++) {
      results.rolls[i] = (1 + Math.floor(Math.random() * pieces.sides));
    }

    // modifier
    results.modifier = pieces.modifier;

    // total
    for (let i = 0; i < results.rolls.length; i++) {
      results.total += results.rolls[i];
    }
    results.total += pieces.modifier;

    return results.total;
  },
  parse(formula) {
    var matches = formula.match(/^(\d+)?d(\d+)([+-]\d+)?$/i);
    if (matches === null || matches[2] == 0) {
      return null;
    }

    var rolls = (matches[1] !== undefined) ? (matches[1] - 0) : 1;
    var sides = (matches[2] !== undefined) ? (matches[2] - 0) : 0;
    var modifier = (matches[3] !== undefined) ? (matches[3] - 0) : 0;

    return {
      rolls: rolls,
      sides: sides,
      modifier: modifier
    };
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
  isEven(n) {
    return n % 2 == 0;
  },
  isOdd(n) {
    return Math.abs(n % 2) == 1;
  }

});
