import Component from '@ember/component';
import $ from 'jquery';

export default Component.extend({
  init() {
    this._super(...arguments);
    this.set('errors', []);
    this.meanings = [{text:"",images:[]}];
  },
  meanings: null,
  tagName: 'div',
  classNames: 'meaningtool listcontainer column',
  actions: {
    addMeaning() {
      let tis = this;
      let meaning = "";
      $.getJSON("meanings.json", function (data) {
        $.each(data, function (key, val) {
          const rand = Math.floor(Math.random() * val.length);
          meaning = meaning + ' - ' + val[rand];
        });
        tis.get('meanings').pushObject({
          text: meaning,
          img: ""
        });
      });
    },
    addStoryDice() {
      let component = this;
      let identity = "";
      $.getJSON("storydice.json", function (data) {
        let rolls = 5;
        let alreadyrolled = [];
        let storydice = data.storydice;
        let finalstory = [];
        for (let i = 0; i < rolls; i++){
          const rand = Math.floor(Math.random() * storydice.length);
          
          if (!alreadyrolled.includes(rand)) {
            finalstory.push(storydice[rand]);
            alreadyrolled.push(rand);
          } else {
          }
        }
        console.log(finalstory);
        component.get('meanings').pushObject({ text: "", images: finalstory });
      });
    },
    clearMeanings() {
      this.set('meanings', []);
    }
  }
});
