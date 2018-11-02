import Model from 'ember-pouch/model';
import DS from 'ember-data';


export default Model.extend({
  type: DS.attr('string'),
  text: DS.attr('string'),
  chaos: DS.attr('boolean'),
  scene: DS.belongsTo('scene')
});
