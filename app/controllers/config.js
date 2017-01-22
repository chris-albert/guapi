import Ember from 'ember';
import _ from 'lodash';
import localStorage from '../helpers/local-storage';

export default Ember.Controller.extend({
  settings: localStorage,
  actions: {
    submit() {
      console.log(this.get('fields'));
      this.get('settings').setStore('configFile',this.get('fields.value'));
    },
    actionClick(){

    },
    formChange(){

    }
  },
  fields: {
    "name": "configFile",
    "display": "Config File",
    "type": "text"
  },
  configFile: Ember.computed('', function() {
    return this.get('settings').getStore('configFile');
  }),
  button: Ember.computed('', function() {
    return {
      "display": "Submit",
      "type": "default",
      "size": "xs"
    };
  }),
  form: Ember.computed('', function() {
    this.set('fields.value',this.get('settings').getStore('configFile'));
    const fields = this.get('fields');
    return [fields];
  })
});
