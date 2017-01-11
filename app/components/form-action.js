import Ember from "ember";
import _ from 'lodash/lodash';

export default Ember.Component.extend({
  actions: {
    actionClicked(action) {
      this.get('router').transitionTo(action.link, {queryParams: action.queryParams});
    }
  },
  isButton: Ember.computed('action.type', function() {
    return this.get('action.type') === 'button';
  }),
  isIcon: Ember.computed('action.type', function() {
    return this.get('action.type') === 'icon';
  })
});
