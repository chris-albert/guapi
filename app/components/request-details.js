import Ember from "ember";
import _ from 'lodash';

export default Ember.Component.extend({
  tagName     : 'div',
  collapsed   : true,
  showSettings: false,
  detailsClass: Ember.computed('collapsed', function () {
    if (this.get('collapsed')) {
      return 'collapse';
    }
    return 'collapse.in';
  }),
  requestBody: Ember.computed('request', 'form', 'showSettings', function() {
    if(this.get('showSettings')) {
      return JSON.stringify(this.get('settings'),null,2);
    }
    return this.get('request');
  }),
  actions     : {
    detailsClick() {
      this.set('collapsed', !this.get('collapsed'));
    },
    settingsClick() {
      this.toggleProperty('showSettings');
    }
  }
});
