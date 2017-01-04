import DS from "ember-data";

export default DS.Model.extend({
  baseUrl     : DS.attr('string'),
  clientId    : DS.attr('string'),
  clientSecret: DS.attr('string'),
  token       : DS.attr('string')
});
