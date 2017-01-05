import Ember from 'ember';
import _ from 'lodash/lodash';

export default Ember.Component.extend({
  namesArr: Ember.computed('names',function() {
    return _.map(this.get('names'),'name');
  }),
  names: Ember.computed('field.values',function() {
    return this.get('field.values');
  }),
  hashValues: Ember.computed('field.values',function() {
    var hash = {};
    _.map(this.get('field.values'),value => {
      hash[value.name] = value;
    });
    return hash;
  }),
  selected: Ember.computed('field.values','field.value',function() {
    var selected = [];
    var hashValues = this.get('hashValues');
    //this is only if this is mulit select, so the values are an array
    _.map(this.get('field.value'),value => {
      selected.push(hashValues[value]);
    });
    return selected;
  }),
  actions: {
    onChange(selected) {
      console.log(selected);
      this.set('selected',selected);
      this.set('field.value', _.map(selected,'name'));
    },
    onInput(text) {
    },
    handleKeydown(dropdown, e) {
      if(e.keyCode !== 13) { return; }
      let text = e.target.value;
      if (text.length > 0 && this.get('namesArr').indexOf(text) === -1) {
        this.set('selected', this.get('selected').concat([{
          display: text,
          name   : text
        }]));
        this.set('field.value', this.get('field.value').concat([text]));
      }
    }
  }
});
