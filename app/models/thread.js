import Model from 'ember-pouch/model';
import DS from 'ember-data';

export default Model.extend({
  name: DS.attr('string')
});
