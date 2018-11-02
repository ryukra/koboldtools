import Model from 'ember-pouch/model';
import DS from 'ember-data';



export default Model.extend({
  text: DS.attr('string'),
  events: DS.hasMany('event'),
  type: DS.attr('string'),
  chaos: DS.attr('boolean')
});
