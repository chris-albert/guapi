import Ember from 'ember';
import _ from 'lodash';

export default Ember.Object.extend({
  fetchConfig(data) {
    return this.fetchGithubFile(data)
      .then(file => {
        console.debug('Got initial GitHub file', file);
        console.log(Ember);
        const tabPromises = Promise.all(_.map(_.get(file,'tabs'),tab => {
          if(_.isString(tab)) {
            const tabData = _.clone(data);
            tabData.path = tab;
            return this.fetchGithubFile(tabData);
          } else {
            return Promise.resolve(tab);
          }
        }));
        tabPromises.then(tabs => {
          delete file['tabs'];
          _.set(file, 'content', {
            'type': 'tabs',
            'tabs': tabs
          });
          console.debug('Expanded GitHub tabs', file);
          return file;
        });
      });
  },
  fetchGithubFile(data) {
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
          return Promise.reject('Unable to fetch gihub content');
        }
      })
      .catch(error => {
        console.error('Got error loading ajax config', error);
      });
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
