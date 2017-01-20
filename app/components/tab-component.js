import Ember from 'ember';
import _ from 'lodash';

export default Ember.Component.extend({
  init() {
    this._super();
  },
  tabsWithRoute: Ember.computed('route','model', function() {
    const routeArr = _.filter(this.get('route.full').split('.'),a => !_.isEmpty(a));
    return _.map(this.get('model'), tab => {
      const addedRoute = _.concat(routeArr, _.get(tab,'name'));
      _.set(tab, 'route', addedRoute.join('.'));
      return tab;
    });
  })
});
