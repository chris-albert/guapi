import DS from "ember-data";

export default DS.Model.extend({
  routes: DS.hasMany('route')
});
