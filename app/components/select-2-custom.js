import Ember from "ember";
import _ from 'lodash/lodash';

export default Ember.Component.extend({
  tagName          : "input",
  classNames       : ["form-control"],
  attributeBindings: ['type'],
  type             : 'hidden',
  value            : null,
  valueWatcher     : Ember.computed('value', function () {
    if (this.$()) {
      var val = this.get('value');
      if (!_.isArray(val)) {
        if (val) {
          val = val.split(',');
        } else {
          val = [];
        }
      }
      this.$().select2('val', val);
    }
  }),
  didInsertElement : function () {
    var self = this,
        el   = this.$();
    el.select2({
      data                   : this.buildData(),
      multiple               : this.get('multiple'),
      tags                   : this.get('tags'),
      minimumResultsForSearch: Infinity,
      initSelection(el, cb) {
        var val = el.val();
        if (val) {
          val = val.split(',');
        } else {
          val = [];
        }
        var selections = _.map(val, v => {
          var found = _.find(self.buildData(), item => {
            return item.id === v;
          });
          if (found) {
            return found;
          } else {
            return {
              id  : v,
              text: v
            };
          }
        });
        if (!self.get('multiple')) {
          selections = _.first(selections);
        }
        cb(selections);
      },
      createSearchChoice(term) {
        if (self.get('tags')) {
          return {
            id  : term,
            text: term
          };
        }
      }
    });
    el.select2('val', this.get('value'));
    el.on('change', function (e) {
      var value = e.val;
      if (!_.isArray(value)) {
        value = [value];
      }
      self.set('value', value);
    });
  },
  buildData() {
    return _.map(this.get('content'), item => {
      var text = item.name;
      if (item.display) {
        text = item.display;
      }
      return {
        id         : item.name,
        text       : text,
        description: item.description
      };
    });
  }
});
