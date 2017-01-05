import Ember from 'ember';
import _ from 'lodash/lodash';
import apiConfig from '../helpers/api-config';

export default Ember.Controller.extend({
  routes: null,
  init() {
    this.set('tabs', this.getRoutes());
    this._super();
  },
  getRoutes() {
    return _.map(apiConfig.defaultConfig().get('projects'), project => {
      const e = _.map(project.endpoints, endpoint => {
        const routeDef = apiConfig.defaultConfig().get('endpoints.' + endpoint);
        const route = project.name + '.' + endpoint;
        return {
          display: routeDef.display,
          name   : endpoint,
          route  : route,
          project: project.name
        };
      });
      return {
        display: project.display,
        name   : project.name,
        route  : project.name,
        tabs   : e
      };
    });
  }
});
