import DS from "ember-data";

export default DS.Model.extend({
  name       : DS.attr('string'),
  type       : DS.attr('string', {defaultValue: 'string'}),
  display    : DS.attr('string', {
    defaultValue() {
      return this.get('display');
    }
  }),
  value      : DS.attr('string'),
  placeholder: DS.attr('string', {
    defaultValue() {
      return this.get('display');
    }
  }),
  send       : DS.attr('boolean', {defaultValue: false})
});
