import Ember from 'ember';
import _ from 'lodash';
import apiConfig from '../helpers/api-config';

export default Ember.Component.extend(Ember.Mixins.ExtendedObject, {
  isTabs: Ember.computed('', function() {
    return this.invoke('content.isTabs');
  }),
  isForm: Ember.computed('', function() {
    return this.invoke('content.isForm');
  })
});
