import Ember from 'ember';
import _ from 'lodash';

export default Ember.Component.extend(Ember.Mixins.ExtendedObject, {
  isTabs: Ember.computed('', function() {
    return this.invoke('content.isTabs');
  }),
  isForm: Ember.computed('', function() {
    return this.invoke('content.isForm');
  }),
  isText: Ember.computed('', function() {
    return this.invoke('content.isText');
  })
});
