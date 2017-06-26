import Ember from 'ember';
import _ from 'lodash';

export default Ember.Object.extend({
  fetchConfig(url) {
    return this.loadAjax({
      url: url,
      method: 'GET'
    }).then(file => {
      const tabPromises = Ember.RSVP.Promise.all(_.map(_.get(file,'tabs'),tab => {
        if(_.isString(tab)) {
          const baseUrl = _.initial(url.split('/')).join('/') + '/';
          return this.loadAjax(baseUrl + tab);
        } else {
          return Ember.RSVP.Promise.resolve(tab);
        }
      }));
      return tabPromises.then(tabs => {
        _.set(file,'tabs',tabs);
        return file;
      });
    });
  },
  loadAjax(opts) {
    return $.ajax(opts);
  }

}).create();
