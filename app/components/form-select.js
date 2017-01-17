import Ember from 'ember';
import _ from 'lodash/lodash';

export default Ember.Component.extend(Ember.Mixins.ExtendedObject, {
  namesArr: Ember.computed('options',function() {
    return _.map(this.get('options'),'name');
  }),
  options: Ember.computed('field.values',function() {
    const values = this.get('field.values');
    const out = _.map(values, value => {
      return Ember.Object.extend().create(value);
    });
    return out;
  }),
  hashValues: Ember.computed('options',function() {
    var hash = {};
    _.map(this.get('options'),value => {
      hash[value.get('name')] = value;
    });
    return hash;
  }),
  selected: Ember.computed('field.values','field.value',function() {
    var hashValues = this.get('hashValues');
    //this is only if this is multi select, so the values are an array
    if(this.get('isMulti')) {
      var selected = [];
      _.map(this.get('field.value'), value => {
        selected.push(hashValues[value]);
      });
      return selected;
    }
    return _.get(hashValues,this.get('field.value'));
  }),
  isMulti: Ember.computed('field.multi', function() {
     return this.get('field.multi');
  }),
  addable: Ember.computed('field.addable',function() {
    return this.get('field.addable');
  }),
  setValue(selected) {
    if(this.get('isMulti')) {
      var values = [];
      _.each(selected, selectedOption => {
        values.push(selectedOption.get('name'));
      });
      this.set('field.value', values.join(','));
    } else {
      this.set('field.value', selected.get('name'));
    }
  },
  setSelected(selected) {
    this.set('selected', selected);
    this.setValue(selected);
    this.invoke('change');
  },
  actions: {
    onChange(selected) {
      this.setSelected(selected);
    },
    handleKeydown(dropdown, e) {
      if(this.get('addable')) {
        if (e.keyCode !== 13) {
          return;
        }
        let text = e.target.value;
        if (text.length > 0 && this.get('namesArr').indexOf(text) === -1) {
          this.setSelected(this.get('selected').concat([Ember.Object.extend({
            display: text,
            name   : text
          }).create()]));
        }
      }
    }
  }
});
