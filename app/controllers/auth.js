import Ember from 'ember';
import _ from 'lodash';
import LocalStorage from '../helpers/local-storage';

export default Ember.Controller.extend({
  init() {
    const hash = _.fromPairs(_.map(window.location.hash.split('&'),s => s.split('=')));
    const token = _.get(hash,'access_token');
    console.log(hash);
    if(!_.isNil(token)) {
      LocalStorage.setStore('token', token);
    }
    var state = _.get(hash, 'state');
    if(!_.isNil(state)) {
      this.get('router').transitionTo(state);
    }
  }
});
