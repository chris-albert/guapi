import Ember from "ember";
import _ from 'lodash/lodash';

export default Ember.Component.extend({
  tagName     : 'div',
  collapsed   : true,
  detailsClass: Ember.computed('collapsed', function () {
    if (this.get('collapsed')) {
      return 'collapse';
    }
    return 'collapse.in';
  }),
  requestSet  : Ember.computed('request', function () {
    return this.get('request');
  }),
  actions     : {
    detailsClick() {
      this.set('collapsed', !this.get('collapsed'));
    },
    refresh() {
      console.log('refresh');
    }
  }
});
