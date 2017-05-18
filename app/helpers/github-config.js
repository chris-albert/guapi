import Ember from 'ember';
import _ from 'lodash';

export default Ember.Object.extend({
  fetchConfig(data) {
    const github = this.parseGitHubUrl(_.get(data,'githubUrl'));
    const merged = _.merge(github,data);
    return this.fetchGitHubFile(merged)
      .then(file => {
        console.debug('Got initial GitHub file', file);
        const tabPromises = Ember.RSVP.Promise.all(_.map(_.get(file,'tabs'),tab => {
          if(_.isString(tab)) {
            const tabData = _.clone(merged);
            tabData.path = tab;
            return this.fetchGitHubFile(tabData);
          } else {
            return Ember.RSVP.Promise.resolve(tab);
          }
        }));
        return tabPromises.then(tabs => {
          _.set(file,'tabs',tabs);
          console.debug('Expanded GitHub tabs', file);
          return file;
        });
      });
  },
  fetchGitHubFile(data) {
    const url = [
      'https://api.github.com/repos',
      _.get(data,'owner'),
      _.get(data,'repo'),
      'contents',
      _.get(data,'path')
    ].join('/');
    const opts = {
      url    : url,
      method : 'GET',
      headers: {
        'Authorization': this.make_base_auth(_.get(data,'username'), _.get(data,'accessKey'))
      }
    };
    return this.loadAjax(opts)
      .then(resp => {
        const downloadUrl = _.get(resp,'download_url');
        if(downloadUrl) {
          return this.loadAjax({
            url: downloadUrl,
            dataType: 'json'
          });
        } else {
          return Ember.RSVP.Promise.reject('Unable to fetch gihub content');
        }
      })
      .catch(error => {
        console.error('Got error loading ajax config', error);
      });
  },
  parseGitHubUrl(url) {
    const split = _.split(_.replace(url,'https://github.com/',''),'/');
    return {
      owner: _.get(split,0),
      repo: _.get(split,1),
      path: _.last(split),
      ref: _.get(split,3)
    }
  },
  loadAjax(opts) {
    return $.ajax(opts);
  },
  make_base_auth(user, password) {
    const tok = user + ':' + password;
    const hash = btoa(tok);
    return "Basic " + hash;
  }
}).create();
