import DS from "ember-data";

export default DS.Model.extend({
  "display": DS.attr('string'),
  "path"   : DS.attr('string'),
  "method" : DS.attr('string', {defaultValue: 'GET'}),
  "auth"   : DS.attr(),
  'fields' : DS.hasMany('route')
});
