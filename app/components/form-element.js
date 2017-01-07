import Ember from 'ember';
import _ from 'lodash/lodash';

export default Ember.Component.extend({
  classNames : ['form-group'],
  displayClass: 'col-sm-2',
  inputClass: 'col-sm-10',
  visible: Ember.computed('field.type',function() {
    return this.get('field.type') !== 'hidden';
  }),
  isText: Ember.computed('field.type',function() {
    return this.get('field.type') === 'text' ||
      this.get('field.type') === 'password' ||
      this.get('field.type') === 'hidden' ||
      this.get('field.type') === 'array' ||
      _.isUndefined(this.get('field.type'));
  }),
  isSelect: Ember.computed('field.type',function() {
    return this.get('field.type') === 'select';
  }),
  actions: {
    selectChange() {
      console.log('select change');
    },
    onChange() {
      this.get('onInputChange')();
    }
  }
});
